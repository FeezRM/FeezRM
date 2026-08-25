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

  // `current: true` announces the role as current ahead of its start date. The
  // past transition stays automatic, so it still stops saying "currently" on its
  // own once the term ends.
  if (toEnd < 0) return { phase: 'past', role: exp.role, range };
  if (toStart > 0 && !exp.current) {
    return { phase: 'upcoming', role: `Incoming ${exp.role}`, range, toStart };
  }
  return { phase: 'current', role: exp.role, range };
}

/** The `cat now.md` line about the nearest role. */
export function nowLine(exp, now = new Date(), where = null) {
  const s = roleState(exp, now);
  const at = where ? ` · ${where}` : '';
  if (s.phase === 'upcoming') {
    const d = s.toStart;
    if (d === 1) return `starting @ ${exp.org} tomorrow`;
    if (d <= 21) return `starting @ ${exp.org} in ${d} days`;
    return `incoming @ ${exp.org} · ${s.range}`;
  }
  if (s.phase === 'current') return `currently @ ${exp.org}${at}`;
  return `most recently @ ${exp.org} · ${s.range}`;
}
