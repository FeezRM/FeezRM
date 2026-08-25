// The hero terminal: whoami -> ps aux -> cat now.md.
//
// Column layout is fixed in character cells so every row lines up exactly:
//   PID 0 | PROJECT 7 | STATUS 21 | SIGNAL 34

import { renderTerminal, seg, dot } from './lib/term.mjs';
import { nowLine } from './live.mjs';

const COL_PID = 0;
const COL_PROJECT = 7;
const COL_STATUS = 21;
const COL_SIGNAL = 34;

const STATUS_COLOR = { building: 'amber', shipped: 'green' };

export const HERO_WIDTH = 900;

/** The `cat now.md` body: derived role line first, then hand-written lines. */
export function nowLines(cfg, now = new Date()) {
  return [
    nowLine(cfg.experience[0], now, cfg.identity.location),
    ...(cfg.now || [])
  ];
}

export function heroLines(cfg, now = new Date()) {
  const { identity, projects } = cfg;
  const lines = [];

  lines.push({ k: 'cmd', text: 'whoami' });
  lines.push({
    k: 'out',
    segs: [
      seg(0, identity.name, 'text', true),
      seg(identity.name.length, ' · ', 'faint'),
      seg(identity.name.length + 3, identity.title, 'dim')
    ]
  });
  lines.push({ k: 'gap' });

  lines.push({ k: 'cmd', text: 'ps aux | grep -i building' });
  lines.push({
    k: 'out',
    segs: [
      seg(COL_PID, 'PID', 'faint'),
      seg(COL_PROJECT, 'PROJECT', 'faint'),
      seg(COL_STATUS, 'STATUS', 'faint'),
      seg(COL_SIGNAL, 'SIGNAL', 'faint')
    ]
  });

  for (const p of projects) {
    const color = STATUS_COLOR[p.status] || 'dim';
    lines.push({
      k: 'out',
      segs: [
        seg(COL_PID, p.pid, 'dim'),
        seg(COL_PROJECT, p.slug, 'path', true),
        dot(COL_STATUS, color),
        seg(COL_STATUS + 2, p.status, color),
        seg(COL_SIGNAL, p.signal, 'text')
      ]
    });
  }
  lines.push({ k: 'gap' });

  lines.push({ k: 'cmd', text: 'cat now.md' });
  for (const text of nowLines(cfg, now)) {
    lines.push({ k: 'out', segs: [seg(0, '»', 'cyan'), seg(2, text, 'text')] });
  }
  lines.push({ k: 'gap' });

  lines.push({ k: 'prompt' });

  return lines;
}

export function renderHero(cfg, theme, now = new Date(), motion = true) {
  return renderTerminal({
    id: cfg.identity,
    theme,
    title: `${cfg.identity.user}@${cfg.identity.host} — zsh`,
    width: HERO_WIDTH,
    lines: heroLines(cfg, now),
    hold: 3.0,
    motion
  });
}

/** Alt text, so the hero is not a black box to a screen reader or to search. */
export function heroAlt(cfg, now = new Date()) {
  const { identity, projects } = cfg;
  const ps = projects.map((p) => `${p.slug} (${p.status}) — ${p.signal}`).join('; ');
  return (
    `Terminal: ${identity.user}@${identity.host}. whoami → ${identity.name}, ${identity.title}. ` +
    `ps aux → ${ps}. cat now.md → ${nowLines(cfg, now).join('; ')}.`
  );
}
