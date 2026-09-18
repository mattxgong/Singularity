---
title: Singularity Content Engine Selection
description: Measured comparison and owner decision record for replacing Contentlayer2 with Content Collections or Velite
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: reference
keywords:
  - content engine
  - content collections
  - velite
  - mdx
estimated_reading_time: 8
---

## Decision status

Matthew Gong approved Content Collections on 2026-09-03. Contentlayer2
retention and migration deferral are excluded. `SINGULARITY-003` must use the exact
package versions recorded below unless the owner amends this decision.

## Recommendation

Select Content Collections with these exact versions:

- `@content-collections/core@0.15.2`
- `@content-collections/next@0.2.11`
- `@content-collections/mdx@0.2.2`

Both candidates passed Singularity's local behavioral contract. Content Collections
is recommended because the official Next.js adapter owns generation and watch
integration, invalid frontmatter produced file and field diagnostics without a
custom schema workaround, and compiled MDX uses the package's documented React
renderer rather than direct `new Function` evaluation in Singularity code.

Content Collections is slower and installs a larger dependency tree in the
isolated spike. Its generated `index.js` barrel also embeds a wall-clock
timestamp. Collection payloads, declarations, tag counts, and search data were
byte-identical across clean generations, so the timestamp does not affect the
artifacts Singularity publishes. The migration should still treat reproducible engine
output as a known implementation concern.

Velite remains a valid alternative. It generated and rebuilt faster, produced a
smaller installed tree, and made every generated file byte-identical. Select it
only if those properties outweigh the missing first-party Next.js adapter, the
custom invalid-date diagnostic transform, and the function-body MDX rendering
model.

## Shared spike contract

Both isolated applications used Node.js 24.15.0, Yarn 3.6.1, Next.js 15.5.12,
and React 19.2.4. Each candidate processed equivalent synthetic Blog and Authors
collections without reading resume data or changing the production application.

The Blog fixture exercised all current frontmatter fields, GFM, math, a local
image, a titled code fence, nested headings, and a custom MDX component. Both
engines generated typed ISO dates, slug and path fields, source paths, reading
metadata, a nested table of contents, `BlogPosting` data, deterministic tag
counts, and a deterministic search index.

Each spike also verified an invalid document, generated type imports, a live
watch update without restart, a normal Next.js build, and the
`EXPORT=1 UNOPTIMIZED=1` static-export profile. Disposable applications and
generated files were removed after their evidence was recorded.

## Measured comparison

| Measure                      | Velite 0.4.0                 | Content Collections pinned set    |
| ---------------------------- | ---------------------------- | --------------------------------- |
| Cold direct generation       | 1.824 seconds                | 3.033 seconds                     |
| Invalid document result      | 1.659 seconds, expected fail | 3.422 seconds, expected fail      |
| Invalid diagnostics          | Custom guarded transform     | Native file and field diagnostics |
| Generated import typecheck   | 3.311 seconds                | 4.207 seconds                     |
| Watch regeneration           | 166.78 milliseconds          | 591.97 milliseconds               |
| Normal Next.js build         | 19.632 seconds               | 31.252 seconds                    |
| Degraded static-export build | 20.868 seconds               | 25.266 seconds                    |
| Candidate configuration      | 157 physical lines           | 147 physical lines                |
| Direct spike dependencies    | 12                           | 22                                |
| Installed package manifests  | 438                          | 520                               |
| Engine plus artifact files   | 7                            | 6                                 |
| Required published artifacts | Byte-identical               | Byte-identical                    |
| Complete engine output       | Byte-identical               | Timestamped barrel differs        |
| Next.js ownership            | Explicit scripts or startup  | First-party adapter               |
| MDX rendering concern        | Function-body evaluation     | Bundled package renderer          |
| Normal and degraded builds   | Pass                         | Pass                              |
| Vercel preview               | Not run                      | Not run                           |

Timing values are wall-clock measurements from isolated local runs. They are
useful for relative comparison but are not performance service-level objectives.

## Compatibility and maintenance

| Candidate package           | Stable version | Published  | Licence | Declared compatibility          |
| --------------------------- | -------------- | ---------- | ------- | ------------------------------- |
| `velite`                    | 0.4.0          | 2026-06-17 | MIT     | Node 18.20 or later, ESM-only   |
| `@content-collections/core` | 0.15.2         | 2026-06-16 | MIT     | TypeScript 5, 6, or 7           |
| `@content-collections/next` | 0.2.11         | 2026-02-14 | MIT     | Next.js 12 through 16           |
| `@content-collections/mdx`  | 0.2.2          | 2025-03-10 | MIT     | React and React DOM 18 or later |

Velite had substantive Vite 8 and schema-context maintenance in 2026. Content
Collections had substantive dependency, frontmatter, watch, and generated-type
maintenance in 2026. Neither candidate is abandoned at the decision date.

The Content Collections packages publish independently. The selected versions
satisfy declared peer ranges but were developed against different core versions.
The spike proved that this exact set installs, generates, watches, typechecks,
and builds together under Singularity's recorded runtime.

## Build and preview evidence

Both normal builds statically prerendered the representative route. Both degraded
builds generated `out/index.html`. Each candidate reported 102 KB of shared
first-load JavaScript in its isolated application.

A Vercel preview was not run. The workspace has no Vercel CLI installation,
`.vercel/project.json` link, or Vercel environment variable names. No credentials
were requested or transmitted. The selected production migration must pass a
Vercel preview before the P0 exit gate closes.

Both nested spike applications initially inherited Singularity's parent ESLint and
Prettier configuration, which rejected their Windows line endings during the
Next.js build hook. The successful isolated builds disabled that inherited hook
and retained explicit strict TypeScript checks. This disposable-app issue does
not prescribe a production lint change.

## Primary sources

- [Velite package manifest](https://unpkg.com/velite@0.4.0/package.json)
- [Velite Next.js integration](https://velite.js.org/guide/with-nextjs)
- [Velite MDX support](https://velite.js.org/guide/using-mdx)
- [Velite releases](https://github.com/zce/velite/releases)
- [Content Collections core manifest](https://unpkg.com/@content-collections/core@0.15.2/package.json)
- [Content Collections Next.js manifest](https://unpkg.com/@content-collections/next@0.2.11/package.json)
- [Content Collections MDX manifest](https://unpkg.com/@content-collections/mdx@0.2.2/package.json)
- [Content Collections releases](https://github.com/sdorra/content-collections/releases)

Detailed commands, diagnostics, generated hashes, and cleanup evidence are in:

- `.copilot-tracking/research/subagents/2026-09-03/velite-spike-results.md`
- `.copilot-tracking/research/subagents/2026-09-03/content-collections-spike-results.md`

## Owner decision

Decision owner: Matthew Gong

Decision date: 2026-09-03

Selected engine: Content Collections

Reason: The first-party Next.js adapter and native file-and-field schema
diagnostics reduce migration and maintenance risk. The measured generation and
build speed difference is acceptable for this repository. The timestamped
generated barrel is a known reproducibility concern, but required content,
type, tag, and search artifacts were byte-identical across clean generations.
