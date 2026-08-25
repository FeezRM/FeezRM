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
import { latestPush, roleState } from './live.mjs';

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

function projectsBlock(cfg) {
  return cfg.projects
    .map((p) => {
      const badge = p.badge ? ` &nbsp;·&nbsp; <code>${h(p.badge)}</code>` : '';
      const stack = p.stack.map((s) => `\`${s}\``).join(' ');
      const link = p.url
        ? `\n**Repo →** [${p.url.replace('https://github.com/', '')}](${p.url})\n`
        : '\nSource is private while the beta runs.\n';
      return [
        '<details>',
        `<summary><b>${h(p.slug)}</b> — ${h(p.tagline)}${badge}<br/><sub>${h(p.signal)}</sub></summary>`,
        '',
        h(p.detail),
        link,
        stack,
        '',
        '</details>'
      ].join('\n');
    })
    .join('\n\n');
}

function experienceBlock(cfg, now) {
  return cfg.experience
    .map((e) => {
      const s = roleState(e, now);
      const role = s.phase === 'current' ? `**${s.role}**` : `_${s.role}_`;
      const head = `**${e.org}** · ${role} · ${s.range}`;
      if (!e.bullets.length) return head;
      return `${head}\n\n${e.bullets.map((b) => `- ${b}`).join('\n')}`;
    })
    .join('\n\n');
}

async function main() {
  const now = new Date();
  const cfg = JSON.parse(await readFile(join(ROOT, 'profile.config.json'), 'utf8'));

  const push = await latestPush(cfg.identity.github, { skipRepo: cfg.identity.github });
  const live = { push };

  await mkdir(join(ROOT, 'assets'), { recursive: true });

  const svgs = {
    'hero-dark': renderHero(cfg, THEMES.dark, live, now, true),
    'hero-light': renderHero(cfg, THEMES.light, live, now, true),
    'hero-dark-still': renderHero(cfg, THEMES.dark, live, now, false),
    'hero-light-still': renderHero(cfg, THEMES.light, live, now, false),
    'stack-dark': renderStack(cfg, THEMES.dark),
    'stack-light': renderStack(cfg, THEMES.light)
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
    alt: heroAlt(cfg, live, now),
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

  md = inject(md, 'projects', projectsBlock(cfg));
  md = inject(md, 'experience', experienceBlock(cfg, now));

  await writeFile(join(ROOT, 'README.md'), md, 'utf8');
  console.log(`  README.md          ${(Buffer.byteLength(md) / 1024).toFixed(1)} KB`);
  console.log(push ? `  live: ${push.repo}@${push.sha}` : '  live: no push data (offline or rate-limited)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
