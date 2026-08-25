// `git log --graph` -- experience as a commit history.
//
// The graph gutter is drawn as real circles and lines rather than the usual
// `*` and `│` characters, for the same reason the status dots are: box-drawing
// coverage is the one thing monospace fonts genuinely differ on.

import { renderTerminal, seg, colX, rowTop, CH, LH, FS } from './lib/term.mjs';
import { roleState } from './live.mjs';

export const TIMELINE_WIDTH = 900;

const COL_BODY = 3;   // everything sits right of the graph gutter
const COL_TAG = 26;   // the "current" marker on the newest commit

export function timelineLines(cfg, now = new Date()) {
  const lines = [{ k: 'cmd', text: 'git log --graph --oneline' }, { k: 'gap' }];
  const nodes = [];

  cfg.experience.forEach((exp, i) => {
    const s = roleState(exp, now);

    nodes.push(lines.length);
    const head = [seg(COL_BODY, exp.slug || exp.org, 'path', true)];
    if (s.phase === 'current') head.push(seg(COL_TAG, '(HEAD) current', 'green'));
    lines.push({ k: 'out', segs: head });

    lines.push({
      k: 'out',
      segs: [seg(COL_BODY, `${s.role} · ${s.range}`, 'dim')]
    });

    for (const hl of exp.highlights || []) {
      lines.push({
        k: 'out',
        segs: [seg(COL_BODY, '•', 'faint'), seg(COL_BODY + 2, hl, 'text')]
      });
    }

    if (i < cfg.experience.length - 1) lines.push({ k: 'gap' });
  });

  return { lines, nodes };
}

/** The gutter: a node per role, a spine between them, a fading tail below. */
function graphSvg(theme, nodes, lastRow) {
  const x = colX(0) + CH / 2;
  const centre = (row) => rowTop(row) + FS - 5;
  const first = centre(nodes[0]);
  const last = centre(nodes.at(-1));
  const tail = rowTop(lastRow) + LH;

  return [
    `<line x1="${x}" y1="${first}" x2="${x}" y2="${last}" stroke="${theme.faint}" stroke-width="2"/>`,
    // The tail runs past the oldest commit and fades -- there is more history
    // than the two roles listed here.
    `<line x1="${x}" y1="${last}" x2="${x}" y2="${tail}" stroke="${theme.faint}"` +
      ` stroke-width="2" stroke-dasharray="2 4" opacity="0.55"/>`,
    ...nodes.map((row, i) =>
      `<circle cx="${x}" cy="${centre(row)}" r="4.5" fill="${i === 0 ? theme.green : theme.card}"` +
      ` stroke="${i === 0 ? theme.green : theme.faint}" stroke-width="2"/>`
    )
  ].join('');
}

export function renderTimeline(cfg, theme, now = new Date()) {
  const { lines, nodes } = timelineLines(cfg, now);
  return renderTerminal({
    id: cfg.identity,
    theme,
    title: `${cfg.identity.user}@${cfg.identity.host} — git`,
    width: TIMELINE_WIDTH,
    lines,
    overlay: { row: nodes[0], svg: graphSvg(theme, nodes, lines.length - 1) },
    motion: false
  });
}

export function timelineAlt(cfg, now = new Date()) {
  const rows = cfg.experience
    .map((e) => {
      const s = roleState(e, now);
      const hl = (e.highlights || []).join('; ');
      return `${e.org} — ${s.role}, ${s.range}${hl ? `. ${hl}` : ''}`;
    })
    .join(' ');
  return `Experience as a git log. ${rows}`;
}
