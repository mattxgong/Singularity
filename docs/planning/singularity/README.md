---
title: Singularity Planning Index
description: Executive summary, goals, scope, and document status for transforming the Tailwind Next.js starter blog into the Singularity personal portfolio and technical blog
author: Matthew Gong
ms.date: 2026-09-19
ms.topic: overview
keywords:
  - singularity
  - portfolio
  - nextjs
  - planning
estimated_reading_time: 9
---

## Overview

Singularity is the personal portfolio and technical blog of Matthew Gong, built by transforming the existing `tailwind-nextjs-starter-blog` v2.4.0 checkout in this repository. The visual identity draws on stars, deep space, and observatory instrumentation: precise, quiet, data-dense, and content-first.

This planning set is the single source of truth for the transformation.

## Current implementation stage

Phases P0 through P5 are implemented. `SINGULARITY-001` captured the baseline, `SINGULARITY-002` selected Content Collections, `SINGULARITY-003` replaced Contentlayer2, and `SINGULARITY-069` replaced Pliny with focused first-party components and maintained packages. The design foundations, application shell, portfolio surfaces, blog experience, and all five optional integrations followed. Phase P6 implementation is complete: unit, journey, accessibility, client-boundary, content-integrity, image, Lighthouse, security-policy, and continuous integration gates are in place. Phase P7 has not started.

A remediation pass on 2026-09-19 reviewed P0 through P5 against this planning set and closed the gaps it found. The degraded static-export build had regressed, because `SINGULARITY-048` shipped `/og/[...slug]` as an edge route; that route is now prerendered and both build profiles pass. `SINGULARITY-026` had shipped the Canvas starfield in contradiction of the `SINGULARITY-005` verdict and was reduced to the layer the measurement called for, then amended later the same day to drift on the compositor, which that verdict does not govern. The post layout and the tags index, both of which had been left on starter markup, are on the design system. Per-task corrections are recorded in [tasks.md](tasks.md), and [architecture.md](architecture.md) now lists the client components that actually exist.

External gates remain owner- or platform-dependent: the deferred Vercel preview check inherited from P0, the first continuous integration pull-request run, deployed Content Security Policy verification, and social-preview and Rich Results validation against a real deployment.

## Document index

| Document                                         | Purpose                                                                    | Status   |
| ------------------------------------------------ | -------------------------------------------------------------------------- | -------- |
| [README.md](README.md)                           | Index, executive summary, goals, scope                                     | Complete |
| [research.md](research.md)                       | Repository baseline, capability classification, reference matrix, evidence | Complete |
| [product-and-design.md](product-and-design.md)   | Audiences, journeys, information architecture, route map, visual direction | Complete |
| [architecture.md](architecture.md)               | Decisions, alternatives, target file tree, data flows, rendering strategy  | Complete |
| [roadmap.md](roadmap.md)                         | Phases, entry and exit gates, dependency graph, validation strategy        | Complete |
| [tasks.md](tasks.md)                             | Implementation-ready task backlog with acceptance criteria                 | Complete |
| [risks-and-decisions.md](risks-and-decisions.md) | Assumptions, risks, open questions, decision log                           | Complete |

Read them in the order listed. An agent executing a single task needs only [tasks.md](tasks.md) plus the referenced sections of [architecture.md](architecture.md) and [product-and-design.md](product-and-design.md).

## Executive summary

The existing repository runs Next.js 15.5.12 on the App Router with React 19.2.4 and Tailwind CSS 4.1.18. Its server and client component boundary is unusually clean: only seven files carry `'use client'`. Blog listing, tag pagination, RSS, sitemap, structured data, theming, and local search all work. Its two central content dependencies, Contentlayer2 and Pliny, are legacy risks that must be removed before feature work begins.

The gap is not technical infrastructure. The gap is that this is a _blog_ template wearing generic sample content, and Singularity needs to be a _portfolio_ that survives a sixty-second recruiter skim, with a blog attached.

The plan preserves the content contract and server-rendering architecture while replacing their unmaintained implementation. It concentrates effort on five things:

1. A mandatory P0 migration from Contentlayer2 to owner-selected Content Collections or Velite, followed by Pliny removal through focused replacements.
2. A real content model for projects, experience, and skills, replacing the four-field `projectsData.ts` stub.
3. A distinctive observatory design system built on Tailwind v4 theme tokens, replacing the starter's pink accent and Space Grotesk defaults.
4. New portfolio surfaces: a home page that leads with identity, project detail pages, a resume page, and a `/uses` page.
5. The quality floor the starter lacks entirely: TypeScript strict mode, unit and end-to-end tests, accessibility assertions, performance budgets, and continuous integration.

Decorative motion is deliberately constrained. A Canvas 2D starfield was the ceiling for v1, and it did not clear its measured budget, so the shipped decoration runs entirely on the compositor: a layered SVG animating nothing but `transform` and `opacity`, costing zero kilobytes of JavaScript and zero main-thread time per frame. WebGL, Three.js, and video backgrounds were always out of scope, because two of the studied reference projects demonstrate precisely where that path leads: a Lighthouse performance score of 64 in one, and roughly 200 KB gzipped of rendering dependencies in the other.

## Goals

Singularity succeeds if it does four jobs well.

### Primary goals

- A recruiter or hiring manager can identify who Matthew is, what he builds, and whether to advance him, within sixty seconds of landing on the home page, without scrolling past a decorative hero.
- Every claim on the resume has a corresponding, verifiable artifact on the site: a project page, a post, or a repository link.
- Technical writing renders beautifully, including code, mathematics, citations, and diagrams, because the blog is the credibility engine.
- The site remains cheap to maintain. Adding a project or a post is a Markdown or TypeScript edit, not a redesign.

### Measurable targets

These are the acceptance thresholds referenced throughout [tasks.md](tasks.md). They are commitments, not aspirations.

| Metric                                            | Target                                 | Measured by                                               |
| ------------------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| Lighthouse Performance, mobile, home page         | >= 95                                  | Lighthouse CI, throttled mobile preset                    |
| Lighthouse Accessibility, all routes              | 100                                    | Lighthouse CI plus Playwright axe assertions              |
| Largest Contentful Paint, home, mobile            | < 1.8s                                 | Lighthouse CI                                             |
| Total Blocking Time, representative routes        | < 200ms                                | Lighthouse CI, median of three mobile runs                |
| Interaction to Next Paint, 75th percentile        | < 200ms                                | Vercel Speed Insights after sufficient production traffic |
| Cumulative Layout Shift                           | < 0.05                                 | Lighthouse CI                                             |
| First-load JavaScript, home route                 | <= 110 KB gzipped                      | `yarn analyze`                                            |
| First-load JavaScript, blog post route            | <= 130 KB gzipped                      | `yarn analyze`                                            |
| Total starfield cost                              | 0 KB gzipped; no main-thread animation | Bundle analyzer, manual check                             |
| Axe violations, serious or critical               | 0                                      | Playwright plus `@axe-core/playwright`                    |
| TypeScript errors under `strict: true`            | 0                                      | `yarn typecheck`                                          |
| Keyboard-only completion of every primary journey | 100%                                   | Manual checklist in [roadmap.md](roadmap.md)              |

## Scope

### In scope

- Rebranding and content replacement across metadata, navigation, authorship, and copy.
- Mandatory migration to owner-selected Content Collections or Velite, with Content Collections recommended, plus complete Pliny removal.
- A typed portfolio content model for projects, experience, skills, education, and awards.
- New routes: `/projects/[slug]`, `/resume`, `/uses`.
- A consolidated post layout replacing the three current variants.
- An observatory design system: color tokens, type scale, iconography, spacing, elevation, and motion primitives.
- Dynamic Open Graph image generation.
- TypeScript strict mode, Vitest, Playwright, axe, Lighthouse CI, and a continuous integration workflow.
- Privacy hardening of published personal data.

### Delivery classification

The classification controls launch decisions across the planning set.

| Class       | Meaning                                                | Capabilities                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required    | Must pass before launch                                | Contentlayer and Pliny migration, rebranding, typed portfolio data, home, projects, about, resume, blog, tags, feeds, accessibility, privacy checks, quality scripts, continuous integration, decorative artwork |
| Conditional | Ships only after its P0 spike passes the stated budget | Dynamic Open Graph images. The Canvas starfield failed its spike and was withdrawn in favour of a compositor-driven layer                                                                                        |
| Optional    | May be withdrawn without delaying launch               | `/uses`, configured Giscus and Umami, project search indexing beyond posts, expanded JSON-LD beyond existing blog markup                                                                                         |

Conditional and optional capabilities must preserve a tested core experience when absent. A task cannot become a launch dependency merely because it appears in the target file tree.

### Out of scope for v1

Each of these is deferred with a documented reason in [risks-and-decisions.md](risks-and-decisions.md).

- WebGL, Three.js, shader effects, and video backgrounds.
- Any database, authentication, or headless CMS.
- Post view counters, like buttons, and comment reactions beyond what Giscus provides natively.
- Internationalization and locale routing.
- A server-backed contact form. Version 1 uses an accessible `mailto:` link to a dedicated public contact address.
- The newsletter subsystem, which is removed rather than migrated.
- Broad visual regression coverage. Playwright keeps at most four reviewed screenshots for stable, journey-critical regions; the rest of the suite uses semantic and geometric assertions.

## Proposed locked decisions

These decisions form the proposed implementation baseline. Owner confirmation is the P0 entry gate; until then, their status is proposed rather than confirmed. Full rationale, provenance, and confirmation status live in [risks-and-decisions.md](risks-and-decisions.md).

| ID  | Decision                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Deploy to Vercel on the Node runtime. Retain the static export path as a documented fallback only.                                                                 |
| D2  | The subject is Matthew Gong, University of Waterloo Computing and Financial Management, class of 2027. Sourced from `ResumeLatex3.pdf`.                            |
| D3  | Real portfolio content exists and is seeded from the resume. Content entry is a distinct phase from build work.                                                    |
| D4  | Motion ceiling is compositor-only CSS. `SINGULARITY-005` measured Canvas 2D over budget, so v1 animates `transform` and nothing else.                              |
| D5  | Before P1, the owner selects Content Collections or Velite and the team removes Contentlayer2. Content Collections is recommended, but not selected automatically. |
| D6  | Remove Pliny. Use `cmdk` plus MiniSearch for local search, official `@giscus/react`, direct Umami integration, and focused first-party helpers. Remove newsletter. |
| D7  | Contact is an accessible `mailto:` link plus social links. The address is intentionally public; no form ships in v1.                                               |
| D8  | Delete all eleven starter posts. Keep one authoring template and one real seed post.                                                                               |
| D9  | Testing is Vitest for units, Playwright for end-to-end, axe for accessibility, and a maximum of four critical-state screenshots. No broad visual regression suite. |
| D10 | English only. No internationalization.                                                                                                                             |
| D11 | Replace Space Grotesk. Pair a humanist serif body face with a technical monospace. Self-host under SIL Open Font License.                                          |
| D12 | Deep indigo and void base with a cyan-white starlight accent, replacing the starter's pink primary ramp.                                                           |
| D13 | Add `/uses`. Defer `/now` and `/bookmarks`.                                                                                                                        |
| D14 | Stay on Yarn 3.6.1.                                                                                                                                                |
| D15 | No view counts and no like buttons. Both require a database.                                                                                                       |
| D16 | Enable TypeScript `strict: true` early, before substantial new code lands.                                                                                         |
| D17 | Keep KaTeX and citations. Consolidate the three post layouts into one configurable layout.                                                                         |
| D18 | Publish the resume at `/resume` as both rendered HTML and a downloadable PDF. The published PDF is a redacted variant.                                             |

## Critical path

The shortest sequence from the current state to a launchable site. Details in [roadmap.md](roadmap.md).

```text
P0 Discovery and de-risking
  -> P1 Design foundations
    -> P2 Application shell
      -> P3 Portfolio content
        -> P4 Blog experience
          -> P6 Quality hardening
            -> P7 Launch readiness
```

Phase P5, optional integrations, may overlap P4 where task dependencies permit and is not on the critical path. Any P5 task can be cut without blocking launch.

## Highest-risk assumptions

Validated first, in phase P0, before any substantial visual or content work. See [risks-and-decisions.md](risks-and-decisions.md) for the full register.

1. At least one owner-approved engine preserves Singularity's schema, MDX, derived fields, artifacts, watch mode, clean builds, degraded export, and Vercel deployment. Content Collections is recommended; Velite is the approved alternative.
2. Focused replacements can preserve every Pliny-owned behavior without expanding client JavaScript or introducing another umbrella dependency.
3. A Canvas 2D starfield can hold the performance budget on a mid-tier mobile device without harming Interaction to Next Paint. `Falsified` by `SINGULARITY-005`; a compositor-only CSS layer ships instead.
4. Turning on TypeScript `strict: true` is a bounded change after the legacy content stack is removed.
5. Dynamic Open Graph image generation works with self-hosted fonts under the Vercel Node runtime.

## Conventions used in these documents

Statements carrying planning weight are labelled.

- `Evidence` is a verified fact traceable to a repository file or a cited external source.
- `Recommendation` is a proposed course of action with stated rationale.
- `Assumption` is an unverified belief that would change the plan if false.
- `Decision needed` is an unresolved question that blocks a specific task.

Task identifiers follow the form `SINGULARITY-NNN` and are stable. Never renumber them. If a task is dropped, mark it withdrawn and leave the identifier retired.

## Change log

| Date       | Change                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| 2026-09-01 | Initial planning set authored following repository inspection and reference research |
| 2026-09-03 | Made Contentlayer and Pliny removal mandatory before P1                              |
| 2026-09-19 | Recorded the P0 through P5 remediation pass and reconciled the client-boundary list  |
