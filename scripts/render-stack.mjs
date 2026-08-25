// `neofetch --stack` -- one SVG replacing the twenty-five shields.io badges.
//
// The monogram is drawn as rects on a pixel grid rather than as block-drawing
// characters (U+2580..U+259F). Block coverage is the one thing monospace fonts
// genuinely differ on, and a missing glyph would shred the art.

import { renderTerminal, seg, colX, rowTop, CH, LH } from './lib/term.mjs';

export const STACK_WIDTH = 900;

const COL_LABEL = 17;
const COL_ITEMS = 28;
const MARK_ROW = 2;          // grid rows 2..7 sit beside the six stack rows

// # primary · + accent (top bar)
const MARK = [
  '++++++++++',
  '++++++++++',
  '###.......',
  '###.......',
  '###.......',
  '#######...',
  '#######...',
  '###.......',
  '###.......',
  '###.......',
  '###.......',
  '###.......'
];

const MARK_FILL = { '#': 'mark', '+': 'markAlt' };

function markSvg(theme) {
  const cw = CH;
  const chh = LH / 2;
  const x0 = colX(2);
  const y0 = rowTop(MARK_ROW);
  const out = [];

  // Contiguous cells of one colour merge into a single rect, and every edge is
  // snapped to a whole pixel by rounding the row boundaries rather than the
  // height. Per-cell rects on fractional rows leave antialiasing seams that read
  // as grid lines straight through the monogram.
  for (let r = 0; r < MARK.length; r++) {
    const top = Math.round(y0 + r * chh);
    const h = Math.round(y0 + (r + 1) * chh) - top;
    let c = 0;
    while (c < MARK[r].length) {
      const key = MARK[r][c];
      const fill = MARK_FILL[key];
      if (!fill) { c++; continue; }
      let end = c;
      while (end + 1 < MARK[r].length && MARK[r][end + 1] === key) end++;
      out.push(
        `<rect x="${x0 + c * cw}" y="${top}" width="${(end - c + 1) * cw}"` +
        ` height="${h}" fill="${theme[fill]}"/>`
      );
      c = end + 1;
    }
  }
  return out.join('');
}

export function stackLines(cfg) {
  const lines = [{ k: 'cmd', text: 'neofetch --stack' }, { k: 'gap' }];

  for (const row of cfg.stack) {
    lines.push({
      k: 'out',
      segs: [
        seg(COL_LABEL, row.label, 'cyan', true),
        seg(COL_ITEMS, row.items.join(' · '), 'text')
      ]
    });
  }
  return lines;
}

export function renderStack(cfg, theme) {
  return renderTerminal({
    id: cfg.identity,
    theme,
    title: `${cfg.identity.user}@${cfg.identity.host} — neofetch`,
    width: STACK_WIDTH,
    lines: stackLines(cfg),
    hold: 1.6,
    overlay: { row: MARK_ROW, svg: markSvg(theme) },
    // The stack is reference material, not a performance -- it reads as output
    // that has already printed, which also keeps it out of the motion story.
    motion: false
  });
}

export function stackAlt(cfg) {
  const rows = cfg.stack.map((r) => `${r.label}: ${r.items.join(', ')}`).join('. ');
  return `Tech stack, neofetch style. ${rows}.`;
}
