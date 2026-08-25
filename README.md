<!-- gen:hero -->
<div align="center">
<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="./assets/hero-dark-still.svg?v=7bf67bc8">
  <source media="(prefers-reduced-motion: reduce)" srcset="./assets/hero-light-still.svg?v=5588efe5">
  <source media="(prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg?v=077386e9">
  <img alt="Terminal: faiz@github. whoami → Faiz Kerawala, CS Honours Co-op @ Ontario Tech. ps aux → contentspy (building) — 10-user private beta · 6 creator workflows; vibe-editor (shipped) — 0.85 confidence gate on AI cuts; focusflow (shipped) — 10 FPS · &lt;100ms inference · 50+ participants. cat now.md → starting @ Northbridge Insurance in 7 days." src="./assets/hero-light.svg?v=e3657144" width="900">
</picture>
</div>
<!-- /gen:hero -->

<div align="center">

**Faiz Kerawala** — CS Honours Co-op @ Ontario Tech

<a href="https://linkedin.com/in/faizkerawala">LinkedIn</a> ·
<a href="mailto:faiz.kera@gmail.com">Email</a>

</div>

## `$ cat ~/projects/*`

<!-- gen:projects -->
<details>
<summary><b>contentspy</b> — AI Competitor Intelligence Platform &nbsp;·&nbsp; <code>private beta</code><br/><sub>10-user private beta · 6 creator workflows</sub></summary>

Transcript ingestion → AI video analysis → content-gap detection → script generation. Currently powering 6+ creator workflows across a 10-user private beta.

Source is private while the beta runs.

`Next.js` `FastAPI` `PostgreSQL` `Supabase`

</details>

<details>
<summary><b>vibe-editor</b> — Agentic Video Pipeline<br/><sub>0.85 confidence gate on AI cuts</sub></summary>

Turns raw video into edited output through word-level transcription, LLM-generated edit decisions, and FFmpeg rendering. A 0.85 confidence gate filters unreliable AI cuts before they reach the render pipeline.

**Repo →** [FeezRM/vibe-editing](https://github.com/FeezRM/vibe-editing)

`Python` `faster-whisper` `OpenCV` `LLM Agents`

</details>

<details>
<summary><b>focusflow</b> — AI Attention Monitor<br/><sub>10 FPS · &lt;100ms inference · 50+ participants</sub></summary>

Computer-vision pipeline running at 10 FPS with &lt;100ms inference, backed by a 6-state attention FSM. In a 50+ participant study: ~50% less distracted time and ~40% faster refocus.

**Repo →** [FeezRM/FocusFlow](https://github.com/FeezRM/FocusFlow)

`Python` `FastAPI` `MediaPipe` `Electron`

</details>
<!-- /gen:projects -->

## `$ history | grep work`

<!-- gen:experience -->
**Northbridge Insurance** · _Incoming Software Developer Intern_ · Sep – Dec 2026

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

Best way to reach me is [faiz.kera@gmail.com](mailto:faiz.kera@gmail.com).

---

<sub>
This page renders itself. <code>profile.config.json</code> is the source of truth;
<code>scripts/build.mjs</code> emits the terminals as animated SVG and rewrites the
generated blocks above. A GitHub Action reruns it daily and commits only when
something real has changed — the process table, the countdown, the last push.
</sub>
