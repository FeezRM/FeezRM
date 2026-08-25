<!-- gen:hero -->
<div align="center">
<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="./assets/hero-dark-still.svg?v=4bcb9f9e">
  <source media="(prefers-reduced-motion: reduce)" srcset="./assets/hero-light-still.svg?v=980c45fc">
  <source media="(prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg?v=d5e84d59">
  <img alt="Terminal: faiz@github. whoami → Faiz Kerawala, CS Honours Co-op @ Ontario Tech. ps aux → contentspy (building) — generated 10M+ views · private beta; vibe-editor (shipped) — editing workflow for viral videos; focusflow (shipped) — improving focus by 50%. cat now.md → currently @ Northbridge Insurance · Toronto, ON; open to Winter &amp; Summer 2027 internships." src="./assets/hero-light.svg?v=5dc9296b" width="900">
</picture>
</div>
<!-- /gen:hero -->

<div align="center">

**Faiz Kerawala** — CS Honours Co-op @ Ontario Tech · Toronto, ON

<a href="https://linkedin.com/in/faizkerawala">LinkedIn</a> ·
<a href="mailto:faiz.kera@gmail.com">Email</a>

</div>

## `$ cat ~/projects/*`

<!-- gen:projects -->
<details>
<summary><b>contentspy</b> — AI Competitor Intelligence Platform<br/><sub>generated 10M+ views · private beta</sub></summary>

Transcript ingestion → AI video analysis → content-gap detection → script generation. Currently powering 6+ creator workflows across a 10-user private beta.

Source is private while the beta runs.

`Next.js` `FastAPI` `PostgreSQL` `Supabase`

</details>

<details>
<summary><b>vibe-editor</b> — Agentic Video Pipeline<br/><sub>editing workflow for viral videos</sub></summary>

Turns raw video into edited output through word-level transcription, LLM-generated edit decisions, and FFmpeg rendering. A 0.85 confidence gate filters unreliable AI cuts before they reach the render pipeline.

**Repo →** [FeezRM/vibe-editing](https://github.com/FeezRM/vibe-editing)

`Python` `faster-whisper` `OpenCV` `LLM Agents`

</details>

<details>
<summary><b>focusflow</b> — AI Attention Monitor<br/><sub>improving focus by 50%</sub></summary>

Computer-vision pipeline running at 10 FPS with &lt;100ms inference, backed by a 6-state attention FSM. In a 50+ participant study: ~50% less distracted time and ~40% faster refocus.

**Repo →** [FeezRM/FocusFlow](https://github.com/FeezRM/FocusFlow)

`Python` `FastAPI` `MediaPipe` `Electron`

</details>
<!-- /gen:projects -->

## `$ history | grep work`

<!-- gen:experience -->
**Northbridge Insurance** · **Software Developer Intern** · Sep – Dec 2026

**MekTek Software Solutions & Engineering** · _Frontend Developer Intern_ · Sep – Dec 2025

- Audited AI-driven platform: identified and resolved **10+ critical security findings** before production
- Built headless CMS with Next.js + WordPress REST APIs → **65% faster** content publishing
<!-- /gen:experience -->

## `$ neofetch`

<!-- gen:stack -->
<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/stack-dark.svg?v=14fbb1ed">
  <img alt="Tech stack, neofetch style. languages: python, typescript, java, sql, c++. backend: fastapi, flask, spring boot, node. frontend: react, next.js, electron. ml / cv: opencv, mediapipe, scikit-learn. llm: claude api, faster-whisper. infra: aws, docker, postgres, supabase, git." src="./assets/stack-light.svg?v=4adba6e7" width="900">
</picture>
</div>
<!-- /gen:stack -->

## `$ man faiz`

I build systems where the AI is a component, not the product — which mostly means
deciding what to do when the model is wrong. A confidence gate in front of a render
pipeline, a deterministic FSM behind a vision model, schema constraints on generated
output. The interesting engineering is in the guardrails.

Open to **Winter and Summer 2027 internships**. Reach me at
[faiz.kera@gmail.com](mailto:faiz.kera@gmail.com).

---

<sub>
This page renders itself. <code>profile.config.json</code> is the source of truth;
<code>scripts/build.mjs</code> emits the terminals as animated SVG and rewrites the
generated blocks above, deriving the experience tense from the date so nothing
goes stale. A GitHub Action reruns it and commits only on a real change.
</sub>
