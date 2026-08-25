// Terminal-window SVG primitives shared by the hero and the stack renders.
//
// Two rules keep the output identical across every OS, whatever `monospace`
// resolves to locally:
//
//   1. Nothing is ever space-padded for alignment. Every column is its own
//      <text> at an absolute x = PAD_X + col * CH.
//   2. Every <text> carries textLength + lengthAdjust="spacing", so a string's
//      advance is pinned to charCount * CH regardless of the font's own
//      metrics. Glyph shapes are untouched; only inter-letter gaps flex.
//
// Motion is SMIL, not CSS. Chrome does not run CSS animations inside an SVG
// referenced by <img>, which is exactly how GitHub embeds README images -- SMIL
// is the only thing that actually animates there. (Verified against the output
// of readme-typing-svg, the animated SVG in widest use on GitHub profiles: it
// is <animate>-based for the same reason.)
//
// Since a media query cannot switch SMIL off, reduced motion is served by
// rendering a second, fully-settled copy of the terminal (`motion: false`) and
// selecting it with a <picture> source. See scripts/build.mjs.
//
// Every <animate> runs for exactly one cycle length with its schedule encoded
// as keyTimes, so the whole terminal loops in lockstep with no drift.

import { LIGHTS } from './theme.mjs';

export const FS = 15;          // font size
export const CH = 9;           // pinned character advance (FS * 0.6)
export const LH = 25;          // line height
export const PAD_X = 26;       // left padding inside the card
export const PAD_TOP = 16;
export const PAD_BOTTOM = 24;
export const TITLEBAR = 38;
export const MARGIN = 10;      // outer breathing room, also shadow headroom

export const FONT_STACK =
  'ui-monospace,SFMono-Regular,&quot;SF Mono&quot;,&quot;Cascadia Mono&quot;,Menlo,Consolas,&quot;Liberation Mono&quot;,monospace';

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Times are rounded hard so repeated builds are byte-identical.
const kt = (n) => Math.min(1, Math.max(0, Math.round(n * 10000) / 10000)).toString();

/** One text run at an absolute character column. */
export function seg(col, text, c = 'text', bold = false) {
  return { col, text: String(text), c, bold };
}

/** Absolute pixel position of a character cell, for overlay art. */
export const colX = (c) => PAD_X + MARGIN + c * CH;
export const rowTop = (r) => MARGIN + TITLEBAR + PAD_TOP + r * LH;

/** A filled status dot occupying one character cell. */
export function dot(col, c) {
  return { col, dot: true, c, text: '' };
}

function textEl(s, y, theme) {
  // Status dots are drawn as real circles rather than a glyph -- box-drawing and
  // geometric-shape coverage is the one thing monospace fonts genuinely differ on.
  if (s.dot) {
    const cx = colX(s.col) + CH / 2;
    return `<circle cx="${cx}" cy="${y - 5}" r="3.6" fill="${theme[s.c] || theme.text}"/>`;
  }
  const chars = [...s.text].length;
  return (
    `<text x="${colX(s.col)}" y="${y}" textLength="${chars * CH}" lengthAdjust="spacing"` +
    ` fill="${theme[s.c] || theme.text}"` +
    (s.bold ? ' font-weight="600"' : '') +
    `>${esc(s.text)}</text>`
  );
}

/** A looping <animate>, scheduled as fractions of one cycle. */
function animate(attr, values, times, cycle, discrete = false) {
  return (
    `<animate attributeName="${attr}" dur="${cycle}s" repeatCount="indefinite"` +
    (discrete ? ' calcMode="discrete"' : ' calcMode="linear"') +
    ` keyTimes="${times.map(kt).join(';')}" values="${values.join(';')}"/>`
  );
}

/** Hold at `from`, switch to `to` between t0 and t1, hold to the end. */
function ramp(attr, from, to, t0, t1, cycle) {
  return animate(attr, [from, from, to, to], [0, t0 / cycle, t1 / cycle, 1], cycle);
}

/**
 * The `faiz@github:~$ ` prompt, as segments starting at `col`.
 * Returns { segs, width } where width is the character count consumed,
 * including the single trailing space before the command.
 */
export function promptSegs(id, col = 0) {
  const who = `${id.user}@${id.host}`;
  const segs = [
    seg(col, who, 'user', true),
    seg(col + who.length, ':', 'faint'),
    seg(col + who.length + 1, '~', 'path'),
    seg(col + who.length + 2, '$', 'dim')
  ];
  return { segs, width: who.length + 4 };
}

/**
 * Render a terminal window.
 *
 * lines: array of
 *   { k:'cmd',    text }   -> prompt, then the command types in
 *   { k:'out',    segs }   -> output row, prints instantly
 *   { k:'gap' }            -> blank row
 *   { k:'prompt' }         -> trailing prompt + blinking cursor
 *
 * motion:false renders the settled end state with no <animate> at all -- the
 * reduced-motion variant, and the static fallback if anything ever refuses SMIL.
 */
export function renderTerminal({
  id, theme, title, width, lines, hold = 2.6, typeRate = 0.045, overlay = null, motion = true
}) {
  const rows = lines.length;
  const cardW = width - MARGIN * 2;
  const cardH = TITLEBAR + PAD_TOP + rows * LH + PAD_BOTTOM;
  const height = cardH + MARGIN * 2;
  const baseY = (r) => MARGIN + TITLEBAR + PAD_TOP + FS + r * LH;

  // ---- pass 1: schedule ----------------------------------------------------
  let t = 0.3;
  const plan = [];
  for (const ln of lines) {
    if (ln.k === 'gap') { plan.push({ ...ln, t0: t }); continue; }
    if (ln.k === 'cmd') {
      const n = [...ln.text].length;
      const dur = Math.min(1.5, Math.max(0.32, n * typeRate));
      plan.push({ ...ln, t0: t, t1: t + dur });
      t += dur + 0.28;
      continue;
    }
    if (ln.k === 'out') { plan.push({ ...ln, t0: t }); t += 0.085; continue; }
    if (ln.k === 'prompt') { plan.push({ ...ln, t0: t + 0.15 }); t += 0.15; }
  }
  const cycle = Math.round((t + hold) * 100) / 100;

  // ---- pass 2: emit --------------------------------------------------------
  const defs = [];
  const body = [];

  /** A group that fades in at t0 (or is simply present when motion is off). */
  const appear = (t0, inner) =>
    motion
      ? `<g opacity="0">${animate('opacity', [0, 0, 1, 1], [0, t0 / cycle, t0 / cycle + 0.004, 1], cycle)}${inner}</g>`
      : `<g>${inner}</g>`;

  for (let r = 0; r < plan.length; r++) {
    const ln = plan[r];
    const y = baseY(r);
    if (ln.k === 'gap') continue;

    if (ln.k === 'out') {
      body.push(appear(ln.t0, ln.segs.map((s) => textEl(s, y, theme)).join('')));
      continue;
    }

    // Both 'cmd' and 'prompt' start with the prompt itself, printed instantly.
    const p = promptSegs(id, 0);
    body.push(appear(ln.t0, p.segs.map((s) => textEl(s, y, theme)).join('')));

    const cmdCol = p.width;
    const cmdX = colX(cmdCol);
    const cursorY = y - FS + 2;
    const cursorH = FS + 3;

    if (ln.k === 'prompt') {
      // Trailing cursor: hidden until t0, then blinks out the rest of the cycle.
      if (!motion) {
        body.push(
          `<rect x="${cmdX}" y="${cursorY}" width="${CH}" height="${cursorH}" rx="1" fill="${theme.cursor}"/>`
        );
        continue;
      }
      const times = [0];
      const values = [0];
      let bt = ln.t0;
      let on = 1;
      while (bt < cycle) {
        times.push(bt / cycle);
        values.push(on);
        on = on ? 0 : 1;
        bt += 0.55;
      }
      times.push(1);
      values.push(values.at(-1));
      body.push(
        `<rect x="${cmdX}" y="${cursorY}" width="${CH}" height="${cursorH}" rx="1"` +
        ` fill="${theme.cursor}" opacity="0">${animate('opacity', values, times, cycle, true)}</rect>`
      );
      continue;
    }

    // Typed command: the clip rect widens left-to-right, which is the typing.
    const chars = [...ln.text].length;
    const w = chars * CH;
    const cid = `c${r}`;
    const textNode = textEl(seg(cmdCol, ln.text, 'text'), y, theme);

    if (!motion) {
      body.push(textNode);
      continue;
    }

    defs.push(
      `<clipPath id="${cid}"><rect x="${cmdX}" y="${y - LH + 4}" width="0" height="${LH}">` +
      `${ramp('width', 0, w + 2, ln.t0, ln.t1, cycle)}</rect></clipPath>`
    );
    body.push(`<g clip-path="url(#${cid})">${textNode}</g>`);

    // The cursor rides the same schedule as the clip edge, so the two cannot
    // desync no matter how the font resolves.
    body.push(
      `<rect x="${cmdX}" y="${cursorY}" width="${CH}" height="${cursorH}" rx="1"` +
      ` fill="${theme.cursor}" opacity="0">` +
      ramp('x', cmdX, cmdX + w, ln.t0, ln.t1, cycle) +
      animate(
        'opacity',
        [0, 0, 1, 1, 0, 0],
        [0, ln.t0 / cycle, ln.t0 / cycle + 0.002, ln.t1 / cycle, ln.t1 / cycle + 0.03, 1],
        cycle
      ) +
      `</rect>`
    );
  }

  // An overlay (the neofetch mark) fades in on the same beat as one of the rows.
  if (overlay) body.push(appear(plan[overlay.row]?.t0 ?? 0.3, overlay.svg));

  const dots = LIGHTS.map(
    (c, i) => `<circle cx="${MARGIN + 24 + i * 20}" cy="${MARGIN + 19}" r="6" fill="${c}"/>`
  ).join('');

  const titleEl = title
    ? `<text x="${width / 2}" y="${MARGIN + 24}" text-anchor="middle" fill="${theme.dim}"` +
      ` font-size="12">${esc(title)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" font-family="${FONT_STACK}" font-size="${FS}">
<style>text{white-space:pre}</style>
<defs>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${theme.shadow}" flood-opacity="0.28"/></filter>
${defs.join('\n')}
</defs>
<g filter="url(#sh)">
<rect x="${MARGIN}" y="${MARGIN}" width="${cardW}" height="${cardH}" rx="12" fill="${theme.card}" stroke="${theme.border}"/>
<path d="M${MARGIN} ${MARGIN + 12}a12 12 0 0 1 12-12h${cardW - 24}a12 12 0 0 1 12 12v${TITLEBAR - 12}H${MARGIN}z" fill="${theme.titlebar}"/>
<line x1="${MARGIN}" y1="${MARGIN + TITLEBAR}" x2="${MARGIN + cardW}" y2="${MARGIN + TITLEBAR}" stroke="${theme.border}"/>
${dots}
${titleEl}
</g>
${body.join('\n')}
</svg>
`;
}
