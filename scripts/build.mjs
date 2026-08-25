// Renders every asset and rewrites the generated blocks of README.md.
//
// Deterministic by design: given the same config, the same day, and the same
// latest push, a rerun produces byte-identical output. That is what lets the
// Action commit only on a real change instead of farming the contribution graph.

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { THEMES } from './lib/theme.mjs';
import { renderHero, heroAlt, HERO_WIDTH } from './render-hero.mjs';
import { renderStack, stackAlt, STACK_WIDTH } from './render-stack.mjs';
import { renderTimeline, timelineAlt, TIMELINE_WIDTH } from './render-timeline.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hash8 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);

// Config copy contains "<100ms", which has to be escaped anywhere it lands inside
// an HTML tag (a <summary>, an alt attribute) rather than in plain markdown.
const h = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the body between <!-- gen:name --> and <!-- /gen:name -->. */
function inject(md, name, content) {
  const open = `<!-- gen:${name} -->`;
  const close = `<!-- /gen:${name} -->`;
  const re = new RegExp(`${open}[\\s\\S]*?${close}`);
  if (!re.test(md)) throw new Error(`README is missing the ${name} block markers`);
  return md.replace(re, `${open}\n${content.trim()}\n${close}`);
}

/**
 * Theme-aware <picture>, cache-busted so camo cannot serve a stale render.
 *
 * `motion` adds two reduced-motion sources first. SMIL cannot be switched off by
 * a media query, so the still variants are selected at the <picture> level
 * instead -- ordinary HTML, no GitHub-specific tricks.
 */
function picture({ base, alt, width, hashes, motion = false }) {
  const src = (name) => `./assets/${name}.svg?v=${hashes[name]}`;
  const sources = [];

  if (motion) {
    sources.push(
      `  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="${src(`${base}-dark-still`)}">`,
      `  <source media="(prefers-reduced-motion: reduce)" srcset="${src(`${base}-light-still`)}">`
    );
  }
  sources.push(`  <source media="(prefers-color-scheme: dark)" srcset="${src(`${base}-dark`)}">`);

  return [
    '<div align="center">',
    '<picture>',
    ...sources,
    `  <img alt="${h(alt)}" src="${src(`${base}-light`)}" width="${width}">`,
    '</picture>',
    '</div>'
  ].join('\n');
}

// Status pills reuse the terminal's colour language. Emoji rather than coloured
// text because GitHub markdown has no way to colour a word inline.
const STATUS_PILL = { building: '🟡 building', shipped: '🟢 shipped' };

/**
 * One project card. Blank lines around the markdown are load-bearing: without
 * them GitHub renders the cell contents as literal text instead of markdown.
 */
function projectCard(p) {
  const title = p.url ? `[${p.name}](${p.url})` : p.name;
  const status = STATUS_PILL[p.status] || p.status;
  // No repo chip when there is no repo -- the signal line already says why.
  const repo = p.url
    ? ` &nbsp;·&nbsp; [\`${p.url.replace('https://github.com/', '')}\`](${p.url})`
    : '';

  return [
    '',
    `#### ${p.icon} ${title}`,
    '',
    `> ${p.tagline}`,
    '',
    h(p.detail),
    '',
    `**${status}** &nbsp;·&nbsp; ${h(p.signal)}`,
    '',
    `${p.stack.map((s) => `\`${s}\``).join(' ')}${repo}`,
    ''
  ].join('\n');
}

function projectsBlock(cfg) {
  const featured = cfg.projects.filter((p) => p.featured);
  const rest = cfg.projects.filter((p) => !p.featured);
  const rows = [];

  // The flagship spans the full width; everything else pairs up two to a row.
  for (const p of featured) {
    rows.push(`<tr>\n<td colspan="2" valign="top">\n${projectCard(p)}\n</td>\n</tr>`);
  }
  for (let i = 0; i < rest.length; i += 2) {
    const cells = rest.slice(i, i + 2).map(
      (p) => `<td width="50%" valign="top">\n${projectCard(p)}\n</td>`
    );
    rows.push(`<tr>\n${cells.join('\n')}\n</tr>`);
  }

  return `<table>\n${rows.join('\n')}\n</table>`;
}

async function main() {
  const now = new Date();
  const cfg = JSON.parse(await readFile(join(ROOT, 'profile.config.json'), 'utf8'));

  await mkdir(join(ROOT, 'assets'), { recursive: true });

  const svgs = {
    'hero-dark': renderHero(cfg, THEMES.dark, now, true),
    'hero-light': renderHero(cfg, THEMES.light, now, true),
    'hero-dark-still': renderHero(cfg, THEMES.dark, now, false),
    'hero-light-still': renderHero(cfg, THEMES.light, now, false),
    'stack-dark': renderStack(cfg, THEMES.dark),
    'stack-light': renderStack(cfg, THEMES.light),
    'timeline-dark': renderTimeline(cfg, THEMES.dark, now),
    'timeline-light': renderTimeline(cfg, THEMES.light, now)
  };

  const hashes = {};
  for (const [name, svg] of Object.entries(svgs)) {
    hashes[name] = hash8(svg);
    await writeFile(join(ROOT, 'assets', `${name}.svg`), svg, 'utf8');
    console.log(`  assets/${name}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }

  let md = await readFile(join(ROOT, 'README.md'), 'utf8');

  md = inject(md, 'hero', picture({
    base: 'hero',
    alt: heroAlt(cfg, now),
    width: HERO_WIDTH,
    hashes,
    motion: true
  }));

  md = inject(md, 'stack', picture({
    base: 'stack',
    alt: stackAlt(cfg),
    width: STACK_WIDTH,
    hashes
  }));

  md = inject(md, 'timeline', picture({
    base: 'timeline',
    alt: timelineAlt(cfg, now),
    width: TIMELINE_WIDTH,
    hashes
  }));

  md = inject(md, 'projects', projectsBlock(cfg));

  await writeFile(join(ROOT, 'README.md'), md, 'utf8');
  console.log(`  README.md          ${(Buffer.byteLength(md) / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
