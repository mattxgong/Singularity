---
title: Singularity Risks and Decisions
description: Assumption register, risk register with mitigations, open questions, and the full decision log for the Singularity transformation
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: reference
keywords:
  - risks
  - assumptions
  - decisions
  - open questions
estimated_reading_time: 17
---

## Assumption register

Each assumption would change the plan if it proved false. Every one is tied to the task that validates it, and none is left to be discovered during implementation.

| ID    | Assumption                                                                    | If false                                                                                | Validated by                     |
| ----- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| AS-1  | At least one approved content engine preserves the full content contract      | Try the other owner-approved candidate; if both fail, block P1 and reassess candidates  | SINGULARITY-002, SINGULARITY-003 |
| AS-2  | Focused replacements preserve all Pliny-owned behavior within current budgets | Block P1 and repair the failing surface without restoring Pliny or another umbrella     | SINGULARITY-069                  |
| AS-3  | TypeScript strict mode is a bounded change                                    | Strict mode is deferred, and the plan loses its main defence against type debt          | SINGULARITY-006                  |
| AS-4  | A Canvas 2D starfield holds 2ms per frame on a mid-tier device                | Ship only the static SVG. The design does not depend on animation                       | SINGULARITY-005                  |
| AS-5  | `next/og` renders with self-hosted fonts at the edge                          | Fall back to a small set of static section banners                                      | SINGULARITY-004                  |
| AS-6  | `unsafe-eval` can be removed from the production policy                       | Document the acceptance and keep it, as Next.js may require it                          | SINGULARITY-060                  |
| AS-7  | The chosen body typeface provides genuine old-style numerals                  | Accept lining numerals, or choose a different face                                      | SINGULARITY-010                  |
| AS-8  | At least one further project can be added beyond the two on the resume        | The index must be designed to read as deliberate at two entries                         | SINGULARITY-031                  |
| AS-9  | The MPBSDP role has publishable technical detail                              | The strongest current material is reduced to a generic summary, weakening the home page | OQ-1                             |
| AS-10 | Competition media from the Robotics Challenge is usable                       | Substitute diagrams for photographs in the case study                                   | SINGULARITY-037                  |
| AS-11 | `scripts/rss.mjs` can consume the migrated TypeScript site data               | Duplicate three values into the script with an explaining comment                       | SINGULARITY-020                  |
| AS-12 | Consolidating three post layouts needs no more than two conditional branches  | Keep the layouts split and record why                                                   | SINGULARITY-041                  |
| AS-13 | Headless UI's `Dialog` makes `body-scroll-lock` redundant on iOS Safari       | Keep the dependency                                                                     | SINGULARITY-024                  |
| AS-14 | Lighthouse CI runner variance permits the stated budgets without flakiness    | Tune thresholds against observed variance, recording any weakening                      | SINGULARITY-058                  |

Two assumptions deserve emphasis. AS-1 and AS-2 form the mandatory P0 migration gate, which is why `SINGULARITY-002`, `SINGULARITY-003`, and `SINGULARITY-069` run before design work. AS-9 is the largest content risk, because the MPBSDP work is both the most current and the most differentiated material available, and losing it would leave the home page positioned on a 2025 internship and a robotics competition.

## Risk register

Scored on likelihood and impact, both low, medium, or high. Ordered by the product of the two.

### R-1 The replacement content stack fails compatibility or deployment checks

Likelihood medium, impact high.

Contentlayer2 and Pliny own a broad behavior surface in the baseline: schemas, MDX transforms, generated types, search, comments, analytics, UI helpers, date formatting, and RSS escaping. A migration can appear successful while silently changing generated routes, rendered HTML, keyboard behavior, or feed validity.

Mitigation: `SINGULARITY-002` compares Content Collections and Velite on a representative corpus and records the owner's selection. `SINGULARITY-003` preserves the content contract with fixtures and clean local, watch-mode, degraded-export, and Vercel checks. `SINGULARITY-069` migrates each remaining Pliny responsibility behind focused tests. Content Collections is recommended and has a worked MIT-licensed migration from this starter lineage; Velite remains the approved owner-selectable alternative.

Early warning: schema errors without file locations, transformed HTML differences, stale generated artifacts, watch mode requiring restarts, search focus regressions, feed parse failures, or a build that succeeds locally and fails on Vercel.

### R-2 Decorative motion degrades the primary journey

Likelihood medium, impact high.

The observatory concept invites elaborate motion, and the reference project `prakhau143/Portfolio` quantifies where that leads: a self-reported Lighthouse performance score of 64, attributed by its own README to HD video and Three.js scenes.

Mitigation: D4 caps the ceiling at Canvas 2D. `SINGULARITY-005` measures before committing. `SINGULARITY-026` carries eight hard acceptance criteria including a bundle budget, a frame budget, and a requirement that the module not load at all under reduced motion. `SINGULARITY-058` enforces the performance budget in continuous integration so a later regression fails the build.

Early warning: any proposal to add an animation library, a video, or a WebGL scene.

### R-3 The client component boundary erodes

Likelihood high, impact medium.

The starter's seven-file client boundary is its most valuable architectural asset, and it is easy to destroy accidentally. Adding `usePathname` to the header for a current-page indicator, or wrapping content in the starfield rather than mounting it as a sibling, would each do it.

Mitigation: [architecture.md](architecture.md) enumerates exactly eleven permitted client components. `SINGULARITY-057` makes that list executable and fails continuous integration on violation, with an allowlist that requires a comment per entry so adding one is deliberate. `SINGULARITY-023` explicitly instructs omitting the current-page indicator rather than crossing the boundary.

Early warning: bundle analyzer showing first-load JavaScript creeping toward the budget.

### R-4 Scope expands during content phases

Likelihood high, impact medium.

Portfolio work invites polish without end, and there is no external deadline forcing closure.

Mitigation: every task states explicit non-goals. Content entry, visual refinement, integrations, and infrastructure are separated into different tasks and different phases so that a stalled decision on one never blocks the others. Phase P5 is entirely cuttable by construction.

Early warning: a task that grows past `L`, or a phase whose exit criteria keep moving.

### R-5 Personal data is published unintentionally

Likelihood medium, impact high.

`Evidence`: `ResumeLatex3.pdf` sits at the repository root and contains the phone number `[REDACTED PHONE]` in extractable text. The literal value must not be copied into source, tests, documentation, logs, or issue trackers.

Mitigation: `SINGULARITY-032` regenerates the PDF from source with the phone line removed rather than drawing a redaction box, because a drawn box leaves the text extractable underneath. It also strips document metadata, which routinely leaks a local username and file path. `SINGULARITY-055` adds a standing end-to-end assertion that no route's rendered HTML contains the number. `SINGULARITY-066` searches the built output before launch.

> [!IMPORTANT]
> `Evidence`: this workspace is not currently a Git repository, so the unredacted PDF exists only in the working tree with no history behind it. Completing `SINGULARITY-032` before running `git init` keeps the phone number out of history permanently, at zero cost. If initialization happens first, the remediation becomes a destructive history rewrite. Sequence accordingly.

Early warning: any task that copies resume content verbatim without reviewing it.

### R-6 Two sources of truth for the resume drift apart

Likelihood high, impact low.

The HTML resume at `/resume` and the downloadable PDF will diverge the first time one is updated without the other.

Mitigation: `SINGULARITY-033` establishes that `data/` is authoritative and the PDF is regenerated from it. `SINGULARITY-066` re-verifies both against each other before launch.

Early warning: a data edit that does not trigger a PDF regeneration.

### R-7 Typography choices fail contrast or licensing

Likelihood low, impact medium.

The starlight accent is bright by design, which makes it likely to pass on the void surface and fail on the plate surface. Separately, a chosen typeface may not permit self-hosting.

Mitigation: `SINGULARITY-010` makes licence verification an explicit acceptance criterion before any file is downloaded. `SINGULARITY-012` measures every pairing in both themes with recorded numbers, and the design already permits a different accent stop per theme rather than one compromised value.

Early warning: a contrast measurement between 4.0 and 4.5.

### R-8 Lighthouse CI is flaky and gets weakened

Likelihood medium, impact medium.

Continuous integration runners are noisy, and the standard response to a flaky gate is to lower the threshold until it stops failing, which converts a budget into decoration.

Mitigation: `SINGULARITY-058` uses three runs with median aggregation. It also requires that any weakening below the stated budgets in [README.md](README.md) be recorded with a reason rather than done silently.

Early warning: a threshold changed in the same commit as an unrelated feature.

### R-9 Portfolio content is too thin to justify the structure

Likelihood medium, impact medium.

Two projects and three roles is a modest amount of material for a site with a project index, detail pages, a resume page, and a uses page.

Mitigation: `SINGULARITY-035` explicitly requires that the index read as deliberate at three entries rather than sparse, verified by inspection. `SINGULARITY-037` invests fully in one deep case study rather than spreading effort thinly, because depth on one project serves journey J2 better than shallow coverage of four.

Early warning: pages that need padding to look complete.

### R-10 Accidental reuse across reference licence boundaries

Likelihood low, impact high.

The reference projects have materially different licence boundaries. `jktrn/enscribe.dev` reserves its site-specific code and visual design. `aarabii/An` permits personal-portfolio modification and publication but prohibits template redistribution, paid client delivery, sublicensing, and removal of its licence.

Mitigation: [research.md](research.md) records each licence at a full commit SHA. Singularity chooses inspiration-only treatment for both projects even where `aarabii/An` would permit personal use. Only `nelsonlaidev/nelsonlai.dev`, which declares MIT in its package metadata and repository, is an approved source for adapted code, with its licence notice preserved. `SINGULARITY-066` requires written confirmation before launch that no code, design, content, or asset was copied from the restricted references.

Early warning: any task referencing a specific implementation detail of either project.

### R-11 The upstream MIT attribution is dropped during rebranding

Likelihood medium, impact medium.

`Evidence`: `LICENSE` is MIT, copyright Timothy Lin, 2021 to 2025. Rebranding to Singularity does not remove the obligation, and the footer credit is exactly the kind of thing a redesign deletes.

Mitigation: `SINGULARITY-025` makes the attribution line an acceptance criterion of the footer rebuild. `SINGULARITY-066` re-verifies it.

Early warning: a footer redesign that removes links without checking why they were there.

### R-12 Analytics configuration creates an undisclosed privacy obligation

Likelihood medium, impact medium.

Cookieless analytics can still process request metadata and server logs. Hosting mode, retention, jurisdiction, and configuration determine whether a privacy notice or consent mechanism is required; the package name does not.

Mitigation: Umami is optional and limited to page views. `SINGULARITY-050` records the deployment-specific data flow and notice or consent decision before enablement. Vercel Speed Insights receives the same review in `SINGULARITY-058` before it becomes the field source for Interaction to Next Paint.

Early warning: enabling a telemetry environment variable before the privacy record exists.

## Open questions

Three questions remain unresolved. None blocks starting work, but each blocks a specific task.

### OQ-1 How much MPBSDP detail is publishable

Blocks `SINGULARITY-030` fully and `SINGULARITY-045` partially. Needed before Phase P3 exits.

The Technical Analyst role describes multi-agent system architecture, an Angular 4 to Angular 20 migration, automation against Azure DevOps and Figma, and Karpathy-style LLM wikis with hybrid retrieval. This is the most current and most differentiated material available, and [product-and-design.md](product-and-design.md) recommends it anchor both the home page positioning and the seed blog post. Employer confidentiality may constrain what can be said.

`Recommendation` as a default: describe techniques and architecture patterns generically, without naming internal systems, specific client work, or proprietary tooling. A post about orchestrating multi-agent workflows can be written entirely from general principles and still demonstrate the expertise. If even that is constrained, fall back to the Robotics Challenge as the anchor and treat the role as a resume line only.

### OQ-2 What is the production domain

Blocks `SINGULARITY-065`. Needed before Phase P7.

`Evidence`: `siteUrl` currently points at the starter's demo Vercel URL, and it feeds canonical URLs, Open Graph URLs, the sitemap, the feeds, and the structured data. A wrong value breaks all of them simultaneously.

`Recommendation` as a default: register a personal domain rather than shipping on a `vercel.app` subdomain. A custom domain is a small annual cost and it is the difference between a portfolio that looks owned and one that looks provisional. Until it is decided, all planning uses a placeholder that `SINGULARITY-065` must replace, and `SINGULARITY-066` checks for placeholder values in the built output.

### OQ-3 Does the uses page earn a top-level navigation slot

Blocks nothing. Reviewed three months after launch.

The five-item navigation in [product-and-design.md](product-and-design.md) is at its stated ceiling, and `/uses` is the weakest of the five against the primary journeys. It serves the secondary technical audience, not the recruiter.

`Recommendation` as a default: ship it in the header, and demote it to the footer if Umami shows negligible engagement after three months. `SINGULARITY-068` sets the review reminder. If `/uses` feels like filler when written, `SINGULARITY-040` may be withdrawn entirely at no cost to anything else.

## Decision log

### Proposed implementation baseline

These decisions were synthesized during planning on 2026-09-01. They become locked only after the owner confirms them at the P0 entry gate. A pending confirmation has no confirmation date; record the owner and ISO date in the final two columns when accepted.

| ID  | Decision                                                                                      | Provenance                                                                             | Rationale                                                                                                                                                            | Reversal cost                                                          | Confirmed by | Confirmed on |
| --- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------ | ------------ |
| D1  | Deploy on Vercel, Node runtime; keep a tested degraded export profile                         | Repository deployment inspection and A1 analysis                                       | The primary runtime preserves image optimization and headers; the export profile preserves required content routes without dynamic Open Graph images                 | Low                                                                    | Pending      | Pending      |
| D2  | Subject is Matthew Gong, Waterloo CFM 2027                                                    | `ResumeLatex3.pdf` extraction                                                          | Portfolio identity and education source                                                                                                                              | Not applicable                                                         | Pending      | Pending      |
| D3  | Content entry is a distinct phase from build work                                             | Planning dependency analysis                                                           | A stalled content decision must not block a build task                                                                                                               | Not applicable                                                         | Pending      | Pending      |
| D4  | Motion ceiling is Canvas 2D                                                                   | Product brief, P0 risk analysis, and self-reported `prakhau143/Portfolio` measurements | The reference reports a performance score of 64 and a 33.5-second Largest Contentful Paint for its heavy-media alternative                                           | Low. Static SVG fallback exists by design                              | Pending      | Pending      |
| D5  | Require owner selection of Content Collections or Velite, then remove Contentlayer2 before P1 | Repository pipeline inspection, candidate research, and Nelson Lai source comparison   | Both candidates preserve typed local content without retaining the unmaintained architecture; Content Collections is recommended but owner approval remains explicit | Medium. The owner may amend the choice to the other approved candidate | Pending      | Pending      |
| D6  | Remove Pliny through focused replacements; remove newsletter without replacement              | Repository-wide Pliny usage inventory and privacy analysis                             | `cmdk`, MiniSearch, official Giscus, direct Umami, platform APIs, and first-party helpers give each behavior a maintained owner without another monolith             | Medium. Each surface has an independent rollback during P0             | Pending      | Pending      |
| D7  | Accessible public `mailto:`, no contact form in v1                                            | J1 journey and privacy analysis                                                        | A form requires a server runtime, spam protection, rate limiting, and a privacy notice; obfuscation would not create a meaningful privacy boundary                   | Low. A form can be added later                                         | Pending      | Pending      |
| D8  | Delete all eleven starter posts                                                               | Repository content inventory                                                           | They are template artifacts and reference demo images being deleted                                                                                                  | Low                                                                    | Pending      | Pending      |
| D9  | Vitest, Playwright, axe, and at most four critical-state screenshots                          | Quality-gap inventory and regression-risk analysis                                     | Semantic tests cover behavior; a small reviewed image set protects stable, journey-critical visuals without broad snapshot churn                                     | Low                                                                    | Pending      | Pending      |
| D10 | English only                                                                                  | Audience analysis                                                                      | No identified audience requires another language                                                                                                                     | Medium                                                                 | Pending      | Pending      |
| D11 | Replace Space Grotesk with a serif, grotesque, and monospace trio                             | Typography analysis                                                                    | A single geometric sans is the wrong tool for long-form essays                                                                                                       | Low                                                                    | Pending      | Pending      |
| D12 | Void and plate surfaces with a starlight accent                                               | Product visual-direction analysis                                                      | Replaces the starter's pink ramp and gives light mode an authentic identity                                                                                          | Low. Tokens are centralized                                            | Pending      | Pending      |
| D13 | Make `/uses` optional; defer `/now` and `/bookmarks`                                          | Information-architecture and maintenance-cost analysis                                 | These routes are secondary to recruiter and reader journeys and require ongoing maintenance                                                                          | Low                                                                    | Pending      | Pending      |
| D14 | Stay on Yarn 3.6.1                                                                            | Repository toolchain inventory                                                         | No functional benefit to migrating within this transformation                                                                                                        | Not applicable                                                         | Pending      | Pending      |
| D15 | No view counts and no likes                                                                   | Stateless architecture decision A7                                                     | Both require persistent state and operational ownership                                                                                                              | Low                                                                    | Pending      | Pending      |
| D16 | Enable `strict: true` early                                                                   | TypeScript baseline inspection                                                         | Enabling it late means revisiting every module written under loose settings                                                                                          | Medium once code exists                                                | Pending      | Pending      |
| D17 | Keep KaTeX and citations; consolidate three post layouts into one                             | MDX pipeline and layout duplication inspection                                         | Mathematics supports the subject's content; duplicate layouts multiply future changes                                                                                | Low                                                                    | Pending      | Pending      |
| D18 | Publish the resume as HTML and a redacted PDF                                                 | J4 journey and source-PDF privacy review                                               | HTML is indexable and phone-readable; the PDF serves applicant tracking systems                                                                                      | Low                                                                    | Pending      | Pending      |

### Architectural decisions from planning

| ID  | Decision                                               | Alternative rejected                              | Reversal trigger                                                        |
| --- | ------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------- |
| A1  | Vercel Node runtime, export as fallback                | GitHub Pages static export                        | Vercel cost becomes a problem                                           |
| A2  | Owner-selected Content Collections or Velite before P1 | Contentlayer2 retention or automatic owner choice | Selected engine fails P0; owner may select the other approved candidate |
| A3  | Replace Pliny by responsibility                        | Selective retention or another umbrella package   | A focused replacement cannot preserve required behavior within budget   |
| A4  | One variant-driven post layout                         | Three separate layout files                       | More than two conditional branches needed                               |
| A5  | Starfield as an isolated client leaf                   | Client wrapper, or CSS-only background            | Frame budget cannot be held                                             |
| A6  | Projects as typed data plus optional MDX               | Pure MDX, or pure TypeScript                      | None foreseen                                                           |
| A7  | No database, authentication, or CMS                    | Drizzle and Postgres engagement layer, or Notion  | A documented requirement static generation cannot meet                  |
| A8  | Strict mode before new code                            | Strict mode at the end                            | Blast radius proves unbounded in `SINGULARITY-006`                      |
| A9  | `app/(site)/` route group                              | Everything at the `app/` root                     | None foreseen                                                           |
| A10 | Dynamic Open Graph images                              | Static site-wide banner                           | Edge font loading proves intractable                                    |

### Deferred, with the reason

Recording these prevents them being relitigated, and gives a clear list of what a second version could add.

| Deferred                        | Reason                                                                                                                    | Revisit when                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| WebGL and Three.js              | D4. The performance cost is quantified by a reference project                                                             | Never, absent a documented requirement                                           |
| Video backgrounds               | 97 MB of media in the reference project is indefensible                                                                   | Never                                                                            |
| Motion or GSAP                  | CSS transitions plus the Canvas starfield cover the need                                                                  | A specific interaction requires physics                                          |
| Contact form                    | D7. Requires a runtime, spam protection, and a privacy notice                                                             | Volume of `mailto:` contact proves insufficient                                  |
| Post views and likes            | D15. Requires a database                                                                                                  | Never, absent a requirement                                                      |
| Internationalization            | D10                                                                                                                       | An audience requires it                                                          |
| Reader mode                     | Interesting in `enscribe.dev`, unproven value at this scale                                                               | Blog reaches meaningful readership                                               |
| Knuth-Plass line breaking       | Its own author gates it behind a toggle and calls it fragile                                                              | Never                                                                            |
| Shiki syntax highlighting       | Prism already works and is retuned in `SINGULARITY-016`                                                                   | Theme-aware highlighting becomes a blocker                                       |
| Live third-party widgets        | Each is a request, a privacy disclosure, and a failure mode                                                               | Never for a portfolio                                                            |
| Client-side project filtering   | Theatre at three entries, and it costs a client component                                                                 | Past eight projects                                                              |
| Series index pages              | The `series` field ships in `SINGULARITY-042`; the pages do not                                                           | A second multi-part series exists                                                |
| `/now` and `/bookmarks`         | D13. Ongoing maintenance burden                                                                                           | A publishing rhythm is established                                               |
| Broad visual regression testing | D9. High maintenance and low signal at this scale; four critical-state screenshots already protect stable journey regions | The design system has multiple independent consumers that justify wider coverage |
| Algolia search                  | kbar works and costs nothing                                                                                              | The local index exceeds a practical size                                         |

## Review cadence

This planning set is a living document for the duration of the transformation.

Update it at every phase gate: record spike verdicts against their assumptions, close open questions with the answer and the date, and add any new risk discovered during implementation. When a task is withdrawn, mark it withdrawn in [tasks.md](tasks.md) with the reason and retire the identifier rather than renumbering.

The three-month post-launch review set by `SINGULARITY-068` should revisit the deferred table above, resolve `OQ-3`, and compare the real-user Core Web Vitals against the laboratory budgets in [README.md](README.md).
