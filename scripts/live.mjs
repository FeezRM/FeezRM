// Live data for the render. Everything here degrades to a sane static value so
// a local build with no network (and no token) still produces a valid profile.

const DAY = 86400000;

const utcDay = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Whole days from `now` to `iso`, negative once the date has passed. */
export function daysUntil(iso, now = new Date()) {
  return Math.round((utcDay(new Date(iso)) - utcDay(now)) / DAY);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const mon = (iso) => MONTHS[new Date(iso).getUTCMonth()];
const yr = (iso) => new Date(iso).getUTCFullYear();

/**
 * Classify a role against today so nothing in the README can go stale.
 * Returns { phase, role, range } where phase is upcoming | current | past.
 */
export function roleState(exp, now = new Date()) {
  const toStart = daysUntil(exp.start, now);
  const toEnd = daysUntil(exp.end, now);
  const range = `${mon(exp.start)} – ${mon(exp.end)} ${yr(exp.end)}`;

  if (toStart > 0) return { phase: 'upcoming', role: `Incoming ${exp.role}`, range, toStart };
  if (toEnd >= 0) {
    const weeks = Math.floor((daysUntil(exp.start, now) * -1) / 7) + 1;
    const total = Math.max(1, Math.round((utcDay(new Date(exp.end)) - utcDay(new Date(exp.start))) / DAY / 7));
    return { phase: 'current', role: exp.role, range, weeks, total };
  }
  return { phase: 'past', role: exp.role, range };
}

/** The `cat now.md` line about the nearest role. */
export function nowLine(exp, now = new Date()) {
  const s = roleState(exp, now);
  if (s.phase === 'upcoming') {
    const d = s.toStart;
    if (d === 1) return `starting @ ${exp.org} tomorrow`;
    if (d <= 21) return `starting @ ${exp.org} in ${d} days`;
    return `incoming @ ${exp.org} · ${s.range}`;
  }
  if (s.phase === 'current') return `currently @ ${exp.org} · week ${s.weeks} of ${s.total}`;
  return `most recently @ ${exp.org} · ${s.range}`;
}

/**
 * Most recent public push to a project repo, via the events API.
 *
 * Two wrinkles this has to handle:
 *   - Unauthenticated responses carry payload.head but drop payload.commits, so
 *     the message needs a second call to the commits endpoint.
 *   - The profile repo is skipped. Once the Action is live its own render commit
 *     would otherwise always be the newest push, and "last push: my README bot"
 *     is not a signal worth printing.
 */
export async function latestPush(user, { skipRepo } = {}) {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': `${user}-profile-render`
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const get = async (url) => {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`${url.replace('https://api.github.com', '')} → ${res.status}`);
    return res.json();
  };

  try {
    const events = await get(`https://api.github.com/users/${user}/events/public?per_page=100`);

    for (const ev of events) {
      if (ev.type !== 'PushEvent') continue;
      const full = String(ev.repo?.name || '');
      const short = full.split('/').pop();
      if (!short || (skipRepo && short.toLowerCase() === skipRepo.toLowerCase())) continue;

      const inline = (ev.payload?.commits || []).at(-1);
      const sha = String(inline?.sha || ev.payload?.head || '');
      if (!sha) continue;

      let message = inline?.message;
      if (!message) {
        try {
          const commit = await get(`https://api.github.com/repos/${full}/commits/${sha}`);
          message = commit?.commit?.message;
        } catch (err) {
          console.warn(`[live] commit message unavailable: ${err.message}`);
        }
      }

      return {
        repo: short,
        sha: sha.slice(0, 7),
        message: message ? String(message).split('\n')[0].trim() : null
      };
    }
    return null;
  } catch (err) {
    console.warn(`[live] latestPush unavailable: ${err.message}`);
    return null;
  }
}

/** Squeeze a push into one terminal line, budget-limited by column count. */
export function pushLine(push, budget = 62) {
  if (!push) return 'last push: building in private';
  if (!push.message) return `last push: ${push.repo}@${push.sha}`;
  const head = `last push: ${push.repo}@${push.sha} — `;
  const room = Math.max(12, budget - head.length);
  const msg = push.message.length > room
    ? `${push.message.slice(0, room - 1).trimEnd()}…`
    : push.message;
  return head + msg;
}
