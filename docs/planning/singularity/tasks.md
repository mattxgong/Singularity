---
title: Singularity Task Backlog
description: Implementation-ready, dependency-ordered task backlog with objectives, scope, acceptance criteria, validation, and risk for the Singularity transformation
author: Matthew Gong
ms.date: 2026-09-19
ms.topic: reference
keywords:
  - tasks
  - backlog
  - acceptance criteria
estimated_reading_time: 55
---

## How to use this backlog

Each task is designed to be executed and reviewed in a single agent run without re-researching the project. Read the task, then the sections of [architecture.md](architecture.md) and [product-and-design.md](product-and-design.md) it references. Do not expand scope beyond what the task states.

Task identifiers are stable. Never renumber. If a task is withdrawn, mark it withdrawn and retire the identifier.

Sizes: `S` is a focused change to one to three files. `M` is a coherent unit of work across a handful of files. `L` is the ceiling and must still be reviewable in one sitting. Nothing larger than `L` exists here; anything that grew past it was split.

## Phase P0: Discovery and de-risking

### SINGULARITY-001 Capture baseline metrics and build health

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P0                               |
| Size       | S                                |
| Depends on | none                             |
| Unlocks    | SINGULARITY-002, SINGULARITY-058 |

Objective. Record the current state numerically so that every later performance and bundle claim has something to compare against. User-visible outcome: none.

Scope. Run the existing build, record Lighthouse scores and first-load JavaScript for the home page and one post, and record the installed dependency tree. Non-goals: fixing anything found, changing any configuration, adding tooling.

Files. A new `docs/planning/singularity/baseline-metrics.md` only. No source files change.

Implementation notes. Use `yarn build` followed by `yarn serve` and run Lighthouse against `http://localhost:3000` on the mobile preset with throttling. Use `yarn analyze` for bundle composition. Record Node and Yarn versions so the later content-engine spikes and migrated build use the same baseline.

Acceptance criteria.

- Lighthouse performance, accessibility, best practices, and SEO scores recorded for `/` and one blog post.
- First-load JavaScript in kilobytes gzipped recorded per route.
- Total build duration recorded.
- Node, Yarn, and operating system versions recorded.
- Any build warnings transcribed verbatim.

Validation.

```bash
yarn build
yarn analyze
```

Risks and rollback. No risk. Nothing is modified. If the build fails, that failure is the deliverable and it escalates directly into `SINGULARITY-002`.

### SINGULARITY-002 Select Velite or Content Collections

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P0              |
| Size       | M               |
| Depends on | SINGULARITY-001 |
| Unlocks    | SINGULARITY-003 |

Objective. Make an explicit owner-approved choice between Velite and Content Collections before migration begins. Keeping Contentlayer2 is not an option.

Scope. Compare both candidates against Singularity's real MDX pipeline, run a disposable proof of the riskiest integration for each, and record the selected engine. Non-goals: changing production configuration or preserving Contentlayer2 as a fallback.

Files. A new `docs/planning/singularity/content-engine-selection.md`. Throwaway spike files must be deleted before the task closes.

Implementation notes. Evaluate the current releases and maintenance activity at execution time rather than relying on package popularity alone. Use one representative post containing KaTeX, a citation, an image, a titled code block, and enough headings to produce a table of contents. Both candidates are MIT licensed, schema-driven, and support Markdown or MDX transforms through Unified plugins.

| Candidate           | Pros                                                                                                                                                                                                                                                                                 | Cons                                                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Content Collections | First-party `@content-collections/next` adapter; modular `@content-collections/mdx` compiler; Zod validation and typed generated imports; transforms can join collections or derive fields; active multi-contributor repository; worked migration in the pinned Nelson Lai reference | More packages and concepts to configure; MDX is an explicit add-on rather than built in; asset handling and derived artifacts require deliberate transforms or scripts; smaller dependent ecosystem than Velite                                                                                              |
| Velite              | One package with built-in MDX, Markdown, asset copying, image processing, schemas, hooks, and generated types; framework-agnostic output; larger dependent ecosystem; concise configuration for a content-heavy site                                                                 | No first-party Next.js adapter package; Next.js startup uses custom config or parallel-script wiring; documentation warns that it is incomplete and significant changes remain possible; its roadmap still lists a Next.js plugin and incremental builds; built-in breadth increases coupling to one package |

`Recommendation`: select Content Collections. Singularity already has explicit image handling and postbuild scripts, so Velite's broader built-ins save less here. Content Collections has the cleaner Next.js ownership boundary, more recent multi-contributor maintenance, modular MDX adoption, and an implementation reference from the same starter lineage. The owner may select Velite if the disposable spike shows materially simpler asset or MDX behavior for this corpus.

Decision procedure.

1. Record the latest stable version, release date, latest substantive commit, Node requirement, licence, and open compatibility issues for each candidate.
2. Run each candidate against the representative post on the repository's selected Node version.
3. Compare cold build, watch-mode update, Vercel preview, degraded static export, generated type quality, error location quality, and implementation complexity.
4. Present the evidence and recommendation to the owner.
5. Record one selected engine, the owner's name, the ISO decision date, and the reason. A tie defaults to Content Collections.

Acceptance criteria.

- The decision record contains the completed comparison and links to primary sources.
- Both spikes validate schema errors, MDX rendering, computed fields, and watch-mode updates.
- The owner selects either Velite or Content Collections; no automatic selection is recorded as owner approval.
- Contentlayer2 retention and deferring migration are explicitly excluded.
- The selected package versions are pinned for `SINGULARITY-003`.
- All throwaway spike files are removed.

Validation.

```bash
yarn npm info velite
yarn npm info @content-collections/core
yarn npm info @content-collections/next
yarn npm info @content-collections/mdx
```

Risks and rollback. The decision can stall if both spikes are allowed to expand. Time-box each spike to the representative corpus and choose on the recorded evidence. Rollback: not applicable because this task changes no production code.

### SINGULARITY-003 Migrate to the selected content engine

| Field      | Value                                       |
| ---------- | ------------------------------------------- |
| Phase      | P0                                          |
| Size       | L                                           |
| Depends on | SINGULARITY-002                             |
| Unlocks    | SINGULARITY-069                             |
| Status     | Implementation complete; exit gates pending |

Objective. Replace Contentlayer2 with the owner-selected Velite or Content Collections implementation while preserving the current content contract. User-visible output must remain equivalent.

Scope. Port the Blog and Authors collections, MDX compilation, frontmatter validation, computed fields, generated types, and the tag and search artifacts. Replace Pliny's content-pipeline plugins and content utilities in the same pass so the new engine does not retain an adapter back to the old stack. Non-goals: replacing Pliny's search dialog, comments wrapper, analytics wrapper, or UI components, which belong to `SINGULARITY-069`.

Files. [contentlayer.config.ts](../../../contentlayer.config.ts) deleted; either `content-collections.ts` or `velite.config.ts` created; [next.config.js](../../../next.config.js), [package.json](../../../package.json), `tsconfig.json`, explicit artifact-generation scripts, first-party content helpers under `lib/content/`, and every file importing from `contentlayer/generated` or `pliny/utils/contentlayer`.

Implementation notes. For Content Collections, install `@content-collections/core`, `@content-collections/next`, and `@content-collections/mdx` and compose the first-party Next.js adapter. For Velite, use explicit `content:dev` and `content:build` scripts rather than a Webpack-only plugin so Turbopack, Vercel, and static export share one path. Set strict schema validation in either engine.

Use native frontmatter parsing from the selected engine. Replace `remarkCodeTitles` and `rehype-prism-plus` with `rehype-pretty-code`, which handles titled code blocks and maintained Shiki-based highlighting. Replace `remarkImgToJsx` by mapping Markdown `img` elements through the MDX component map and preserving explicit image dimensions. Replace `extractTocHeadings`, `sortPosts`, `coreContent`, and `allCoreContent` with small typed first-party helpers tested against the current behavior. Keep the remaining Unified plugins only where the representative corpus proves they are needed.

The Nelson Lai source is the worked Content Collections reference for this starter lineage. It may be adapted under MIT with the required notice. It is evidence for feasibility, not a reason to bypass Singularity's acceptance tests.

Acceptance criteria.

- The selected engine is the one recorded by `SINGULARITY-002`; changing it requires an amended owner decision.
- `contentlayer2`, `next-contentlayer2`, the exact first-party `esbuild` pin, `.contentlayer`, `INIT_CWD` workarounds, and the `contentlayer/generated` alias are removed.
- No source file imports `contentlayer/generated`, `pliny/utils/contentlayer`, or `pliny/mdx-plugins`.
- Blog and Authors schemas reject invalid frontmatter with a file and field location.
- Every existing post renders equivalent HTML for headings, links, tables, math, citations, images, code titles, and highlighting.
- Reading time, slug, path, file path, table of contents, and `BlogPosting` data remain typed derived fields.
- `app/tag-data.json` and `public/search.json` are generated by explicit deterministic steps.
- Development watch mode refreshes a changed post without restarting Next.js.
- Primary and degraded builds succeed on a clean install and on a Vercel preview.

Validation.

```bash
rm -rf node_modules .next .contentlayer .velite .content-collections
yarn install
yarn typecheck
yarn test
yarn build
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Implementation evidence, 2026-09-17.

- Content Collections generated two collections and 13 documents with the owner-approved pinned versions.
- `yarn install --immutable`, direct TypeScript validation, the production build, and the degraded static-export build passed. The export produced `out/index.html`.
- A live development process detected a temporary post addition and deletion, rebuilding from 13 to 14 documents and back to 13 without restarting Next.js.
- An invalid `date` fixture produced a diagnostic containing both `data\\blog\\__invalid-frontmatter-test.mdx` and the `date` field. The fixture was removed and clean generation was restored.
- Exported HTML contains heading anchors, links, GFM tables, KaTeX output, citations and footnotes, images, titled code blocks, highlighted lines, and Shiki syntax colors.
- The repository source scan found no Contentlayer-generated imports, Pliny content utilities, or Pliny MDX plugins. `SINGULARITY-069` subsequently removed Pliny and its transitive `contentlayer2` and `next-contentlayer2` lockfile entries.
- The owner deferred Vercel preview validation. Local implementation is complete, but the preview remains an external P0 exit gate.

Risks and rollback. This is a large compatibility migration, so compare generated data and rendered HTML before deleting the old configuration. Do not ship dual engines or retain Contentlayer2 as a runtime fallback. Rollback is a branch revert during implementation; P1 remains blocked until one replacement passes.

### SINGULARITY-069 Replace Pliny and remove the package

| Field      | Value                                      |
| ---------- | ------------------------------------------ |
| Phase      | P0                                         |
| Size       | L                                          |
| Depends on | SINGULARITY-003                            |
| Unlocks    | SINGULARITY-006, SINGULARITY-007, and P1   |
| Status     | Implementation complete; exit gate pending |

Objective. Replace every remaining Pliny feature with a focused maintained package, a platform API, or a small first-party component, then remove `pliny` from the dependency graph.

Scope. Migrate runtime MDX rendering, UI components, search, comments, analytics, date formatting, RSS escaping, newsletter remnants, configuration types, and Tailwind source scanning. Non-goals: redesigning these features or enabling optional Giscus and Umami configuration, which remain in `SINGULARITY-049` and `SINGULARITY-050`.

Files. Every file returned by a repository-wide search for `pliny`, including [app/layout.tsx](../../../app/layout.tsx), [components/MDXComponents.tsx](../../../components/MDXComponents.tsx), [components/Comments.tsx](../../../components/Comments.tsx), [components/SearchButton.tsx](../../../components/SearchButton.tsx), [layouts/PostBanner.tsx](../../../layouts/PostBanner.tsx), [scripts/rss.mjs](../../../scripts/rss.mjs), [css/tailwind.css](../../../css/tailwind.css), and [package.json](../../../package.json).

Replacement map.

| Pliny surface                              | Replacement                                                                                                        | Reason                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `SearchProvider`, kbar and Algolia buttons | `cmdk` for the accessible command dialog plus MiniSearch for local full-text ranking over the generated JSON index | Preserves keyboard and button entry, avoids a hosted service, and separates UI from search semantics |
| `Comments` and Giscus loader               | Official `@giscus/react`, wrapped by Singularity's existing click-to-load boundary                                 | Removes an intermediary while retaining theme updates and no-request-before-consent behavior         |
| `Analytics` and Umami wrapper              | A first-party production-only component using Next.js `Script` and Umami's documented tracker attributes           | The integration is one conditional script and does not justify an abstraction package                |
| `MDXLayoutRenderer`                        | The selected content engine's compiled MDX output and documented React renderer                                    | Keeps rendering aligned with the chosen engine                                                       |
| `TOCInline`, `Pre`, and `Bleed`            | Typed first-party `TableOfContents`, `CodeBlock`, and CSS full-bleed components                                    | These are small design-system surfaces that require Singularity-specific styling and tests           |
| `formatDate`                               | `Intl.DateTimeFormat` behind `lib/format.ts`                                                                       | Uses the platform API and centralizes locale and time-zone behavior                                  |
| `htmlEscaper`                              | `encodeXML` from the maintained `entities` package                                                                 | RSS requires XML-safe output, not an application framework helper                                    |
| Content sorting and projection helpers     | Typed first-party functions under `lib/content/` from `SINGULARITY-003`                                            | The behavior is small, domain-specific, and already covered by unit tests                            |
| Newsletter API and components              | Delete without replacement                                                                                         | D6 explicitly removes newsletter collection                                                          |
| `PlinyConfig`                              | First-party `SiteConfig` interface from `SINGULARITY-020`, with a temporary local type until that task lands       | Prevents site data from depending on a retired package                                               |

Implementation notes. Keep the command dialog as a leaf client component. Load the search index only when the dialog first opens, initialize MiniSearch once per open session, and cap the result set. Preserve the existing click-to-load Giscus behavior. The Umami component renders nothing without production configuration and receives a focused privacy review in `SINGULARITY-050`. Map Markdown images through the first-party MDX component map established in `SINGULARITY-003`.

The local components must implement only behavior Singularity uses. Do not copy Pliny source wholesale. Preserve keyboard behavior, focus restoration, reduced-motion handling, no-JavaScript content rendering, and current route output.

Acceptance criteria.

- A repository-wide search across source, styles, configuration, and scripts returns zero `pliny` imports, aliases, comments, and Tailwind source directives.
- `pliny` is absent from [package.json](../../../package.json), the lockfile, and `yarn why pliny`.
- The command dialog opens from the button and `Ctrl+K` or `Cmd+K`, traps and restores focus, closes with Escape, and returns ranked post and project results from MiniSearch.
- Search index loading is deferred until first open and no Algolia stylesheet or configuration remains.
- Giscus makes no network request before activation, follows the current theme, and disappears cleanly when unconfigured.
- Umami loads only in configured production builds and uses no Pliny wrapper.
- MDX rendering, table of contents, code copy, full-bleed content, date formatting, and RSS escaping have focused tests.
- Newsletter routes, components, environment variables, and MDX registrations are deleted.
- Tailwind no longer scans `node_modules/pliny`.
- A clean primary build, degraded export build, and Vercel preview succeed.

Validation.

```bash
rg -n "pliny|contentlayer" --glob "*.{ts,tsx,js,mjs,css,md,mdx,json}" .
yarn why pliny
yarn typecheck
yarn test
yarn build
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Implementation evidence, 2026-09-17.

- First-party components now own local search, Giscus loading, Umami loading, table of contents, code copying, full-bleed layout, date formatting, and site configuration.
- Content generation writes post and project records to `public/search.json`. Browser validation confirmed deferred loading, query results, input focus, Escape handling, and trigger-focus restoration.
- The newsletter route, home-page form, MDX registration, live historical MDX instance, environment-backed configuration, Algolia stylesheet, and Tailwind package scan were removed.
- `yarn test` passed five focused suites with seven tests. `yarn typecheck`, the primary production build, and the degraded static-export build passed; both builds generated all 59 routes.
- `pliny`, `contentlayer2`, and `next-contentlayer2` are absent from [package.json](../../../package.json) and the lockfile. `yarn why pliny` returns no dependency tree.
- Historical posts retain prose about the retired libraries because it is article content, not executable integration code.
- The owner-deferred Vercel preview remains the external P0 exit gate.

Risks and rollback. Search and MDX rendering carry the widest behavior surface. Preserve fixtures before replacement and migrate one surface at a time within the task. Rollback is a branch revert; P1 remains blocked while either Pliny or Contentlayer is installed.

### SINGULARITY-004 Prove dynamic Open Graph generation with self-hosted fonts

| Field      | Value                        |
| ---------- | ---------------------------- |
| Phase      | P0                           |
| Size       | M                            |
| Depends on | SINGULARITY-001              |
| Unlocks    | SINGULARITY-048              |
| Status     | Assessment complete; proceed |

Objective. Determine whether `next/og` can render a card using the typefaces Singularity will actually ship, before the design commits to it.

Scope. A throwaway route producing one image with real text in a self-hosted font. Non-goals: final visual design, wiring into metadata, handling every content type.

Files. A temporary `app/og-spike/route.tsx`, deleted at the end of the task. A note recording the outcome.

Implementation notes. `next/og` requires font data as an `ArrayBuffer` at the edge runtime and does not accept variable fonts in all cases. Test a static subset of the interface face at one weight. Measure cold-start duration and the resulting file size. Confirm the edge runtime does not conflict with the `trailingSlash: true` setting in [next.config.js](../../../next.config.js), which has historically produced surprising route matching.

Acceptance criteria.

- An image renders at 1200 by 630 with correct glyphs, including any non-ASCII characters used in project titles.
- Font loading approach documented: variable, static subset, or fallback to a system face.
- Cold-start duration and output size recorded.
- Verdict recorded: proceed with dynamic generation, or retain a static banner.
- The spike route is deleted before the task closes.

Validation.

```bash
yarn build
yarn serve
```

Then request the spike route and inspect the returned image.

Implementation evidence, 2026-09-17.

- A temporary `next/og` edge route rendered a 1200 by 630 PNG with a self-hosted static Space Grotesk Latin subset at weight 500.
- Visual inspection confirmed correct accented Latin characters and the delta glyph. The generated PNG was 15,662 bytes.
- Both `/og-spike` and `/og-spike/` returned the image successfully. With `trailingSlash: true`, the no-slash request resolved to the slash form.
- The first measured request completed in 56 milliseconds. Warm requests completed in 27 to 28 milliseconds.
- The production build passed and classified the spike as a dynamic, server-rendered-on-demand route.
- Verdict: proceed with dynamic Open Graph generation. Revalidate glyph coverage and edge loading with the final self-hosted interface font in `SINGULARITY-048`.
- The temporary route and font were deleted after measurement.

Risks and rollback. If edge font loading is intractable, the fallback is a small set of static per-section banners, which is still better than the current single site-wide image. Withdraw `SINGULARITY-048` and record the reason.

### SINGULARITY-005 Measure Canvas starfield frame cost

| Field      | Value                                         |
| ---------- | --------------------------------------------- |
| Phase      | P0                                            |
| Size       | M                                             |
| Depends on | SINGULARITY-001                               |
| Unlocks    | SINGULARITY-026                               |
| Status     | Assessment complete; static fallback selected |

Objective. Establish whether the decorative starfield can hold the 2 millisecond per-frame budget defined in [product-and-design.md](product-and-design.md) before the design direction depends on it.

Scope. A standalone prototype measured under throttling. Non-goals: production code, visual polish, integration into the layout.

Files. A temporary prototype page, deleted at the end of the task. A note recording measurements.

Implementation notes. Cap device pixel ratio at 2 and star count at 240, as specified. Measure with the browser performance profiler under 4 times and 6 times CPU throttling. Measure main-thread time per frame, memory over a five-minute run to detect leaks, Lighthouse Total Blocking Time, and long tasks while the canvas is active. Test both a single canvas with all stars and a layered parallax variant, and record which is cheaper. Do not report lab interaction latency as Interaction to Next Paint, which is a field metric.

Acceptance criteria.

- Main-thread time per frame recorded at both throttling levels.
- Lighthouse Total Blocking Time stays under 200 milliseconds with the canvas running.
- No canvas task exceeds the 50-millisecond long-task threshold during the interaction trace.
- No memory growth over five minutes.
- Estimated gzipped module size recorded against the 8 KB budget.
- Verdict recorded: proceed with Canvas, or fall back to the static SVG for all viewports.
- The prototype is deleted before the task closes.

Implementation evidence, 2026-09-17.

The standalone prototype used 240 deterministic stars and capped device pixel ratio at 2. Chromium measurements used DevTools CPU throttling.

| Variant       | CPU throttle | Run length | Mean draw | p95 draw | Maximum draw | Long tasks | Maximum long task |
| ------------- | ------------ | ---------- | --------- | -------- | ------------ | ---------- | ----------------- |
| Single canvas | 4 times      | 10 seconds | 1.062 ms  | 2.0 ms   | 4.5 ms       | 0          | None              |
| Single canvas | 6 times      | 10 seconds | 1.823 ms  | 2.8 ms   | 7.5 ms       | 1          | 81 ms             |
| Layered       | 4 times      | 10 seconds | 2.000 ms  | 4.1 ms   | 7.8 ms       | 0          | None              |
| Layered       | 6 times      | 10 seconds | 2.354 ms  | 3.9 ms   | 8.6 ms       | 1          | 98 ms             |
| Single canvas | 6 times      | 5 minutes  | 5.289 ms  | 14.3 ms  | 64.6 ms      | 40         | 87 ms             |

- Five-minute collected heap samples were 2,561,716, 3,133,676, 2,897,400, 3,804,484, 3,627,764, and 4,695,028 bytes at minutes zero through five. A final collection measured 3,542,220 bytes. The fluctuation did not establish a monotonic leak, but it also did not provide a clean no-growth result.
- The complete prototype page was 3,620 bytes raw and 1,430 bytes gzipped. This conservative upper bound is below the 8 KB module budget.
- Lighthouse 12.8.2 could not connect to either installed Chrome or cached Playwright Chromium through the local DevTools socket, matching the limitation recorded in [baseline-metrics.md](baseline-metrics.md). No Total Blocking Time result is available.
- Verdict: use the static fallback on every viewport. The single-canvas design is cheaper than the layered design, but the 6-times traces exceed both the 2-millisecond frame budget and the 50-millisecond long-task threshold.
- The temporary prototype was deleted after measurement.

Risks and rollback. If the budget cannot be held, `SINGULARITY-026` ships only the static SVG. The design does not depend on animation, by deliberate construction, so this is a graceful loss rather than a redesign.

### SINGULARITY-006 Assess the TypeScript strict-mode blast radius

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P0                               |
| Size       | S                                |
| Depends on | SINGULARITY-001, SINGULARITY-069 |
| Unlocks    | SINGULARITY-007                  |
| Status     | Assessment complete              |

Objective. Count and categorize the errors that appear when `strict: true` is enabled, so `SINGULARITY-007` is a known quantity rather than an open-ended excavation.

Scope. Flip the flag, compile, categorize, revert. Non-goals: fixing anything.

Files. `tsconfig.json`, reverted before the task closes. A note recording the findings.

Implementation notes. `strictNullChecks` is already on, so the new errors will concentrate in `noImplicitAny`, `strictFunctionTypes`, and `strictPropertyInitialization`. Run this assessment after the content and Pliny migrations so it measures the target architecture rather than third-party types scheduled for deletion. Generated content types and first-party replacement components are in scope for categorization.

Acceptance criteria.

- Total error count recorded.
- Errors grouped by rule and by file.
- Errors originating in third-party or generated code identified separately from errors in first-party code.
- A remediation approach chosen for each third-party group.
- `tsconfig.json` is restored to its original state before the task closes.

Validation.

```bash
npx tsc --noEmit
```

Implementation evidence, 2026-09-17.

Running `yarn tsc --noEmit --strict true --pretty false --noErrorTruncation` after clearing stale `.next` output produced 21 diagnostics: 20 in first-party code, one missing third-party declaration, and none in generated code.

| TypeScript code | Count | Category                            |
| --------------- | ----- | ----------------------------------- |
| `TS7006`        | 12    | Implicit parameter types            |
| `TS7031`        | 6     | Implicit destructured binding types |
| `TS7053`        | 2     | Unsafe indexed access               |
| `TS7016`        | 1     | Missing third-party declaration     |

| File                          | Count | Codes              |
| ----------------------------- | ----- | ------------------ |
| `app/blog/[...slug]/page.tsx` | 2     | `TS7053`           |
| `app/Main.tsx`                | 3     | `TS7031`, `TS7006` |
| `components/Card.tsx`         | 4     | `TS7031`           |
| `components/MobileNav.tsx`    | 1     | `TS7016`           |
| `components/TableWrapper.tsx` | 1     | `TS7031`           |
| `content-collections.ts`      | 6     | `TS7006`           |
| `layouts/PostLayout.tsx`      | 2     | `TS7006`           |
| `lib/content/toc.ts`          | 2     | `TS7006`           |

- First-party remediation will add explicit component props, callback parameter types, and narrowed keys in `SINGULARITY-007`.
- The `body-scroll-lock` gap should use `@types/body-scroll-lock` when available, otherwise a focused declaration under `types/`.
- `tsconfig.json` remains at `strict: false` with `strictNullChecks: true`; no configuration change persisted from this assessment.

Risks and rollback. None. The change is reverted within the task.

## Phase P1: Design foundations

### SINGULARITY-007 Enable TypeScript strict mode

| Field      | Value                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Phase      | P1                                                                    |
| Size       | M                                                                     |
| Depends on | SINGULARITY-006, SINGULARITY-069                                      |
| Unlocks    | SINGULARITY-008, SINGULARITY-020, SINGULARITY-028, and all typed work |

Objective. Make `strict: true` the permanent baseline so that all subsequent code is written correctly the first time. User-visible outcome: none, though latent null-handling bugs may surface.

Scope. Enable strict mode and fix every resulting first-party error. Non-goals: refactoring beyond what the compiler demands, upgrading the ES target, changing runtime behaviour.

Files. `tsconfig.json`, plus whichever first-party files the assessment in `SINGULARITY-006` identified. Likely candidates include [components/social-icons/index.tsx](../../../components/social-icons/index.tsx), [layouts/ListLayoutWithTags.tsx](../../../layouts/ListLayoutWithTags.tsx), and the page components that consume generated content output.

Implementation notes. Fix by narrowing types, not by adding `any` or `@ts-ignore`. `Evidence`: `eslint.config.mjs` currently disables `@typescript-eslint/ban-ts-comment`, which makes suppression too easy; leave that rule alone for now but do not exploit it. For third-party gaps, prefer a declaration file in `types/` over modifying imports. Leave the `target` setting unchanged; a runtime-target upgrade needs its own compatibility rationale and is not required to enable strict mode.

Acceptance criteria.

- `strict: true` is set in `tsconfig.json`.
- `npx tsc --noEmit` reports zero errors.
- No new `any`, `as unknown as`, or `@ts-ignore` is introduced in first-party code.
- `yarn build` still succeeds.
- Every existing route still renders identically.

Validation.

```bash
npx tsc --noEmit
yarn build
yarn serve
```

Correction, 2026-09-19. Two suppressions survived the migration and have now been removed. `components/SearchProvider.tsx` cast MiniSearch results with `as unknown as SearchDocument[]`; the dialog now resolves match identifiers against a typed document map, so no cast is needed. [app/seo.tsx](../../../app/seo.tsx) carried `[key: string]: any` behind an `eslint-disable` for `no-explicit-any`; its props now extend `Metadata`, which is both narrower and more useful to callers.

`"composite": true` was also removed from `tsconfig.json`. There are no project references in this repository, and the flag made every build emit `TypeScript project references are not fully supported` while writing a stray `tsconfig.tsbuildinfo` into version control.

Risks and rollback. If a third-party type gap proves unfixable without suppression, document the single exception with a comment naming the package and the reason. Rollback: revert `tsconfig.json` and the fixes together.

### SINGULARITY-008 Add the missing quality scripts

| Field      | Value                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Phase      | P1                                                                                                   |
| Size       | S                                                                                                    |
| Depends on | SINGULARITY-007                                                                                      |
| Unlocks    | SINGULARITY-014, SINGULARITY-015, SINGULARITY-020, SINGULARITY-028, SINGULARITY-053, SINGULARITY-059 |

Objective. Install the unit-test foundation and make the validation commands used by P1 tasks real before those tasks depend on them.

Scope. Install and configure Vitest with the DOM and React testing dependencies, add `typecheck`, `format`, `format:check`, `test`, and `test:watch` scripts, add one meaningful runner smoke test, and correct the `lint` script. Non-goals: Playwright and `test:e2e`, which belong to `SINGULARITY-054`, and changing lint rules.

Files. [package.json](../../../package.json), `eslint.config.mjs`, `vitest.config.ts`, `tests/unit/setup.ts`, `tests/unit/config-smoke.test.ts`.

Implementation notes. `Evidence`: the existing `lint` script passes `--dir pages`, which does not exist in this checkout, and omits `lib`, which is being created. Correct it to `app`, `components`, `layouts`, `lib`, `scripts`. Note that `next lint` is deprecated in recent Next.js versions; prefer invoking `eslint` directly with the flat config. The smoke test must import a real local configuration value and assert an invariant, so `yarn test` proves collection, transforms, aliases, and assertions work. Do not use an `exit 0` placeholder or `--passWithNoTests`.

Acceptance criteria.

- All five P1 scripts exist and run their real tools without placeholders.
- `yarn lint` covers the correct directories and reports zero errors.
- `yarn typecheck` runs `tsc --noEmit` and reports zero errors.
- `yarn format:check` reports no diffs after a `yarn format` run.
- `yarn test` collects and passes the smoke test, and fails when its assertion is deliberately inverted.
- The `prepare` and Husky pre-commit behaviour is unchanged.

Validation.

```bash
yarn lint
yarn typecheck
yarn format:check
yarn test
```

Risks and rollback. Minimal. Rollback: revert [package.json](../../../package.json).

### SINGULARITY-009 Define observatory colour tokens

| Field      | Value                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Phase      | P1                                                                                  |
| Size       | M                                                                                   |
| Depends on | SINGULARITY-007                                                                     |
| Unlocks    | SINGULARITY-012, SINGULARITY-013, SINGULARITY-015, SINGULARITY-016, SINGULARITY-017 |

Objective. Replace the starter's pink accent ramp with the void, plate, and starlight ramps described in [product-and-design.md](product-and-design.md). User-visible outcome: the entire site changes colour.

Scope. Token definitions in the `@theme` block only. Non-goals: restyling components, changing layout, touching `prism.css`.

Files. [css/tailwind.css](../../../css/tailwind.css).

Implementation notes. `Evidence`: the existing file already uses OKLCH and already defines `--color-primary-*` across eleven stops; match that structure exactly so that existing utility classes keep resolving. Keep `--color-primary-*` as an alias of the starlight ramp rather than renaming it, because [css/tailwind.css](../../../css/tailwind.css) already references `--color-primary-500` in the focus-visible base rule and migrated components may still reference primary utilities. Introduce `--color-void-*` and `--color-plate-*` as new ramps. Do not delete the gray ramp yet; components still reference it and it is removed only once they are migrated.

Acceptance criteria.

- Three ramps defined across eleven stops each, in OKLCH.
- `--color-primary-*` resolves to the starlight ramp, so no existing class breaks.
- Both themes render every existing page without an illegible pairing.
- The focus-visible outline is visible in both themes.
- No component file is modified by this task.

Validation.

```bash
yarn dev
```

Then walk every existing route in both themes.

Correction, 2026-09-19. The default border colour in [css/tailwind.css](../../../css/tailwind.css) still resolved to `--color-gray-200` in both themes, so any border that did not name a token rendered near-white against the dark surface. It now resolves to `--color-boundary`. The `--color-focus` token was defined for both themes but never referenced, because the focus-visible rules still used `--color-primary-500`; they now use `--color-focus`. The `.footnotes` rule hardcoded `border-gray-200 dark:border-gray-700` and now uses the boundary token.

[app/layout.tsx](../../../app/layout.tsx) also carried `bg-white text-black dark:bg-gray-950 dark:text-white` on `<body>`. Tailwind v4 orders the utilities layer after the base layer, so those utilities beat the `body { background-color: var(--color-surface) }` base rule and the plate and void surfaces never rendered. The utilities are removed and the base rule now owns the document surface.

Risks and rollback. Colour choices are subjective and will be revisited after `SINGULARITY-012` measures contrast. Expect one revision. Rollback: revert the single file.

### SINGULARITY-010 Select and licence-verify typefaces

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P1              |
| Size       | S               |
| Depends on | none            |
| Unlocks    | SINGULARITY-011 |

Objective. Choose three typefaces and prove each may be self-hosted and redistributed.

Scope. Selection and licence verification, recorded as a decision. Non-goals: downloading, subsetting, or wiring anything up.

Files. A new `docs/planning/singularity/typography-decision.md`.

Implementation notes. Requirements from [product-and-design.md](product-and-design.md): a humanist or transitional serif with true italics and old-style numerals for body copy, a neutral grotesque for interface text, and a monospace with a disambiguated zero for code. All three must be variable, must have mature Latin subsetting, and must be under the SIL Open Font License or an equivalently permissive licence. Candidates are Source Serif 4, Inter, and JetBrains Mono, all of which meet these criteria, but confirm rather than assume.

Acceptance criteria.

- Three faces named, with the specific version or release.
- Licence identified for each, with a link to the licence text.
- Redistribution and self-hosting explicitly confirmed as permitted.
- Availability of old-style numerals in the body face confirmed, since the design depends on it.
- Estimated total payload against the 120 KB budget.

Risks and rollback. If the body face lacks old-style numerals, either accept lining numerals or choose a different face. Do not attempt to synthesize them.

### SINGULARITY-011 Self-host fonts with metric-compatible fallbacks

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P1                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-010                                   |
| Unlocks    | SINGULARITY-013, SINGULARITY-016, SINGULARITY-048 |

Objective. Serve all three typefaces from the origin, subsetted and within budget, with zero layout shift on swap. User-visible outcome: the site's voice changes entirely.

Scope. Font files, `@font-face` declarations, fallback metric adjustment, and the removal of the Google Fonts dependency. Non-goals: the type scale, which is `SINGULARITY-013`.

Files. `public/fonts/`, a new `css/fonts.css`, [css/tailwind.css](../../../css/tailwind.css) for the `--font-*` tokens, [app/layout.tsx](../../../app/layout.tsx) to remove `Space_Grotesk`.

Implementation notes. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) currently imports `Space_Grotesk` from `next/font/google` and binds `--font-space-grotesk`, which [css/tailwind.css](../../../css/tailwind.css) consumes in `--font-sans`. Replace with `next/font/local` so that Next.js still handles preloading and the `size-adjust` fallback generation, rather than hand-writing `@font-face`. Subset to `latin` and `latin-ext` only. Preload only the body regular and interface regular faces. Declare the monospace without preload, since code blocks are below the fold on almost every page.

Acceptance criteria.

- No request to `fonts.googleapis.com` or `fonts.gstatic.com` in the network panel.
- Total font payload at or under 120 KB across all faces and weights.
- Cumulative Layout Shift attributable to font swap measures 0.
- `font-display: swap` on every face.
- Old-style numerals render in body prose.
- The `font-src 'self'` directive in [next.config.js](../../../next.config.js) still holds.

Validation.

```bash
yarn build
yarn serve
```

Then inspect the network panel and run Lighthouse.

Risks and rollback. Subsetting can drop glyphs used in project titles or names. Verify with the actual content strings. Rollback: revert to `next/font/google` with a single face.

### SINGULARITY-012 Verify contrast across both themes

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P1                               |
| Size       | S                                |
| Depends on | SINGULARITY-009                  |
| Unlocks    | SINGULARITY-015, SINGULARITY-016 |

Objective. Prove every colour pairing meets the thresholds in [product-and-design.md](product-and-design.md), with recorded numbers rather than an assurance.

Scope. Measurement and, where a pairing fails, adjustment of the offending token. Non-goals: changing components.

Files. [css/tailwind.css](../../../css/tailwind.css) if adjustments are needed. A contrast table appended to `docs/planning/singularity/typography-decision.md`.

Implementation notes. The stated thresholds are 7.0:1 for body text, 4.5:1 for large text and links, and 3.0:1 for focus rings and non-text boundaries. The known risk is the starlight accent, which may pass on the void surface and fail on the plate surface. The design already permits using a different stop per theme; use that rather than compromising to one mediocre value.

Acceptance criteria.

- Every pairing in the [product-and-design.md](product-and-design.md) contrast table measured and recorded for both themes.
- All thresholds met.
- Any token adjusted is noted with its before and after value.
- Muted or secondary text is measured too, not only primary body text, since that is where these failures usually hide.

Risks and rollback. A starlight accent that satisfies both themes may read as less distinctive. Prefer the per-theme stop. Rollback: revert token adjustments.

### SINGULARITY-013 Fluid type scale and spacing tokens

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P1                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-009, SINGULARITY-011                  |
| Unlocks    | SINGULARITY-014, SINGULARITY-015, SINGULARITY-016 |

Objective. Define a fluid, `clamp()`-based type scale and a matching spacing scale as theme tokens.

Scope. Token definitions only. Non-goals: applying them to components.

Files. [css/tailwind.css](../../../css/tailwind.css).

Implementation notes. Body copy must land between 17 and 19 pixels across the viewport range, and the prose measure must stay between 60 and 75 characters, which is what the 68ch prose container in [architecture.md](architecture.md) targets. `Evidence`: the existing file already defines `--line-height-11` through `--line-height-14` as extended values; keep them, since [app/Main.tsx](../../../app/Main.tsx) and the layouts reference them, and remove them only when those consumers are rewritten. Spacing should be a single geometric scale rather than Tailwind's default, so that vertical rhythm is consistent between prose and interface regions.

Acceptance criteria.

- A type scale from caption to display, each stop a `clamp()` expression.
- Body copy measures between 17 and 19 pixels at 375px, 768px, and 1440px viewport widths.
- Prose measure between 60 and 75 characters at all three widths.
- A spacing scale defined as tokens.
- No existing page breaks visually beyond the intended type change.

Validation.

```bash
yarn dev
```

Then measure rendered font size and characters per line at all three widths.

Risks and rollback. Fluid scales can produce awkward intermediate sizes. Check the midpoints, not just the endpoints. Rollback: revert to fixed steps at breakpoints.

### SINGULARITY-014 Container and Section primitives

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P1                                                |
| Size       | S                                                 |
| Depends on | SINGULARITY-008, SINGULARITY-013                  |
| Unlocks    | SINGULARITY-018, SINGULARITY-023, SINGULARITY-035 |

Objective. Provide the three container widths and the annotated section wrapper that every page will use.

Scope. Two primitives plus unit tests. Non-goals: deleting `SectionContainer`, which happens in `SINGULARITY-019` once consumers migrate.

Files. `components/ui/container.tsx`, `components/ui/section.tsx`, `tests/unit/`.

Implementation notes. `Container` takes a `width` of `prose`, `content`, or `wide`, mapping to 68ch, 1024px, and 1280px. `Section` renders a semantic region with an optional heading and the observatory tick annotation described in [product-and-design.md](product-and-design.md), which is a hairline rule with a short perpendicular tick rather than a heavy divider. Both are Server Components. Neither may import anything client-side.

Acceptance criteria.

- `Container` renders all three widths correctly at 375px, 768px, and 1440px.
- `Section` renders a correct heading level, passed as a prop, never hardcoded.
- Neither file contains `'use client'`.
- Unit tests cover width mapping and heading level rendering.
- The tick annotation is decorative and marked `aria-hidden`.

Validation.

```bash
yarn test
yarn typecheck
```

Risks and rollback. Low. Rollback: delete the two files.

### SINGULARITY-015 Button, Badge, and Card primitives

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P1                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-008, SINGULARITY-012, SINGULARITY-013 |
| Unlocks    | SINGULARITY-023, SINGULARITY-034, SINGULARITY-035 |

Objective. Provide the interactive and container primitives that portfolio surfaces need, with accessibility built in rather than bolted on.

Scope. Three primitives plus a class-merge helper plus unit tests. Non-goals: any domain-specific component.

Files. `components/ui/button.tsx`, `components/ui/badge.tsx`, `components/ui/card.tsx`, `lib/cn.ts`, `tests/unit/`.

Implementation notes. `Button` must be polymorphic so it can render as an anchor for navigation and as a button for actions, and it must compose with the existing [components/Link.tsx](../../../components/Link.tsx) rather than duplicating its internal, external, and anchor handling. Minimum target size is 24 by 24 CSS pixels per [product-and-design.md](product-and-design.md). `Card` is composable, exposing Root, Header, Body, and Footer, rather than taking a dozen props, because the four-prop [components/Card.tsx](../../../components/Card.tsx) is exactly the design that failed. All three are Server Components; `Button` accepts an `onClick` only when consumed from a client component.

Acceptance criteria.

- `Button` renders as `a` when given `href` and as `button` otherwise, with correct semantics in both cases.
- Every variant meets the 3.0:1 non-text contrast requirement against its surface.
- Focus-visible styling is present on all interactive variants and is never removed.
- Minimum target size verified at 24 by 24 pixels.
- `Card` composes without prop drilling.
- No primitive contains `'use client'`.
- Unit tests cover variant rendering, polymorphic element choice, and merged class precedence.

Validation.

```bash
yarn test
yarn typecheck
yarn lint
```

Correction, 2026-09-19. `lib/cn.ts` called `twMerge` with stock configuration. `tailwind-merge` can only deduplicate utilities it can classify, and it has no knowledge of the scales `SINGULARITY-009` and `SINGULARITY-013` introduced, so `text-heading-3`, `text-small`, `py-rhythm-7`, `duration-fast`, `ease-standard`, and every semantic colour were unclassified. Conflicting overrides passed through `className` could both survive, and font-size and colour utilities risked landing in one group. The helper now uses `extendTailwindMerge` with the project's colour, text, spacing, easing, and duration scales declared, and `tests/unit/ui-primitives.test.tsx` asserts the resolution for each group so a future token addition that is not registered fails a test rather than silently mis-merging.

Risks and rollback. Over-abstraction is the risk. If a variant is used once, inline it instead. Rollback: delete the files.

### SINGULARITY-016 Prose primitive and Prism retune

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P1                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-011, SINGULARITY-012, SINGULARITY-013 |
| Unlocks    | SINGULARITY-041, SINGULARITY-046                  |

Objective. Make long-form content the best thing on the site, and give typography a single owner instead of scattered `prose` classes. This is the P4 gating task.

Scope. A `Prose` primitive consolidating all typographic styling, plus retuning [css/prism.css](../../../css/prism.css) to the new palette. Non-goals: changing the MDX pipeline, changing post layouts.

Files. `components/ui/prose.tsx`, [css/tailwind.css](../../../css/tailwind.css) for the typography plugin overrides, [css/prism.css](../../../css/prism.css).

Implementation notes. `Evidence`: [css/tailwind.css](../../../css/tailwind.css) currently carries `.prose` and `.prose-invert` overrides in a `@layer utilities` block, and the `@tailwindcss/typography` plugin is already loaded. Consolidate those overrides rather than adding a third location. Cover headings, paragraphs, lists, blockquotes, inline code, code blocks, tables, figures, footnotes, the KaTeX display and inline cases, and the citation entries styled by `.csl-entry`. `Evidence`: [css/prism.css](../../../css/prism.css) is a Night Owl derivative supporting code titles, line numbers, and highlighted lines; preserve all three behaviours and change only the colours. Code block colours must meet 4.5:1 against the code surface in both themes, which most syntax themes fail.

Acceptance criteria.

- Every element listed above renders correctly in both themes.
- The existing mathematics post renders with correct KaTeX display and inline behaviour.
- The existing citation post renders its bibliography correctly.
- Every syntax token colour meets 4.5:1 against the code background in both themes.
- Code titles, line numbers, and line highlighting still work.
- Long code lines scroll horizontally without breaking the page layout.
- Typography rules exist in exactly one place.

Validation.

```bash
yarn dev
```

Then open the mathematics post, the citation post, and the code sample post in both themes, at 375px and 1440px.

Risks and rollback. Retuning a syntax theme for contrast usually flattens its distinctiveness. Accept some flattening; legibility wins. Rollback: revert both CSS files.

### SINGULARITY-017 Global motion rules and reduced-motion policy

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P1              |
| Size       | S               |
| Depends on | SINGULARITY-009 |
| Unlocks    | SINGULARITY-026 |

Objective. Establish motion tokens and a site-wide reduced-motion guarantee before any animated element exists.

Scope. Duration and easing tokens, the global reduced-motion rule, and making smooth scrolling conditional. Non-goals: the starfield itself.

Files. [css/tailwind.css](../../../css/tailwind.css), [app/layout.tsx](../../../app/layout.tsx).

Implementation notes. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) applies `scroll-smooth` unconditionally to the `html` element. Smooth scrolling is itself vestibular motion and must be suppressed under reduced motion; move it into CSS guarded by the media query rather than leaving it as a class. The global rule should set animation and transition durations to 0.01 milliseconds rather than to zero, since a true zero can break transition-end event handlers. Cap all interface transitions at 200 milliseconds per [product-and-design.md](product-and-design.md).

Acceptance criteria.

- Duration and easing tokens defined in the theme block.
- A global reduced-motion rule suppresses animations, transitions, and smooth scrolling.
- `scroll-smooth` no longer applies unconditionally.
- Verified by toggling the operating system reduced-motion setting, not only by browser emulation.
- No transition anywhere exceeds 200 milliseconds.

Risks and rollback. Low. Rollback: revert both files.

## Phase P2: Application shell

### SINGULARITY-018 Introduce the site route group

| Field      | Value             |
| ---------- | ----------------- |
| Phase      | P2                |
| Size       | M                 |
| Depends on | SINGULARITY-014   |
| Unlocks    | all of P2, P3, P4 |

Objective. Separate the document layout from the site shell so that non-page routes do not inherit chrome. This is a structural gate; nothing else in P2 should be in flight during it.

Scope. Create `app/(site)/`, move every user-facing page into it, and split [app/layout.tsx](../../../app/layout.tsx). Non-goals: restyling anything, changing page content, adding routes.

Files. [app/layout.tsx](../../../app/layout.tsx), a new `app/(site)/layout.tsx`, and every page under [app/](../../../app/) except `robots.ts`, `sitemap.ts`, and `seo.tsx`.

Implementation notes. `Evidence`: the root layout currently composes `SectionContainer`, `SearchProvider`, `Header`, `main`, and `Footer` directly. After the split, the root retains the `html` and `body` elements, font variables, `ThemeProviders`, `Analytics`, and the metadata export. The shell layout takes the skip link, `SearchProvider`, `Header`, `main`, `Footer`, and the starfield mount. Route paths do not change, because a parenthesized segment is not part of the URL. Verify that `generateStaticParams` still resolves for all four dynamic routes after the move.

Acceptance criteria.

- Every existing URL resolves exactly as before, including the four dynamic routes and both pagination routes.
- `app/(site)/layout.tsx` owns the shell; the root layout owns only the document.
- `yarn build` produces the same route list as the baseline from `SINGULARITY-001`.
- No page component's content changed.
- No new client component was introduced.

Validation.

```bash
yarn build
yarn serve
```

Then request every route from the baseline route list and confirm a 200 response.

Risks and rollback. File moves in the App Router are easy to get subtly wrong, especially with `trailingSlash: true` set in [next.config.js](../../../next.config.js). Compare the build's route manifest against the baseline. Rollback: revert the branch.

### SINGULARITY-019 Remove dead components

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P2              |
| Size       | S               |
| Depends on | SINGULARITY-018 |
| Unlocks    | none            |

Objective. Delete code with no importers, so that later refactors do not maintain it.

Scope. Remove `components/LayoutWrapper.tsx`, `layouts/ListLayout.tsx`, and `components/PageTitle.tsx` and `components/SectionContainer.tsx` once their consumers migrate. Non-goals: removing anything still referenced.

Files. The four files above, plus any import sites found.

Implementation notes. Verification is the whole task. Search for each component name across the entire repository, including MDX content, before deleting. `Evidence`: [layouts/ListLayout.tsx](../../../layouts/ListLayout.tsx) appears unused because [app/blog/page.tsx](../../../app/blog/page.tsx) and the tag routes use `ListLayoutWithTags`; confirm this rather than trusting it. If `SectionContainer` or `PageTitle` still has consumers, migrate them to `Container` and `Section` from `SINGULARITY-014` within this task, or defer the deletion and say so.

Acceptance criteria.

- A recorded search result showing zero importers for each deleted file, including MDX.
- `yarn build` succeeds.
- `yarn typecheck` reports zero errors.
- Every route still renders.
- Nothing was deleted that had a consumer.

Validation.

```bash
yarn typecheck
yarn build
```

Correction, 2026-09-19. Three files with zero importers survived the sweep and have now been deleted. [components/Card.tsx](../../../components/Card.tsx) was the four-prop card that `SINGULARITY-015` cites as the design it replaces. `lib/site-config.ts` was the temporary `SiteConfig` interface introduced by `SINGULARITY-069` and superseded by `data/site.ts` in `SINGULARITY-020`. `public/static/images/sparrowhawk-avatar.jpg` and `public/static/images/avatar.png` were starter author portraits with no consumer.

The same pass removed the starter gray ramp from [css/tailwind.css](../../../css/tailwind.css). `SINGULARITY-009` deliberately retained it until every consumer migrated; that condition is now met, and a repository scan returns no `gray-*` utility in first-party source.

Risks and rollback. A component referenced only from MDX would not be caught by a TypeScript check. Search content files explicitly. Rollback: restore from Git.

### SINGULARITY-020 Migrate site metadata to typed TypeScript

| Field      | Value                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Phase      | P2                                                                                  |
| Size       | M                                                                                   |
| Depends on | SINGULARITY-007, SINGULARITY-008                                                    |
| Unlocks    | SINGULARITY-021, SINGULARITY-023, SINGULARITY-025, SINGULARITY-050, SINGULARITY-052 |

Objective. Replace the untyped `siteMetadata.js` with typed `data/site.ts` carrying real values, and create the typed data barrel.

Scope. Conversion, real values, newsletter block removal, and a `data/index.ts` barrel. Non-goals: portfolio data, which is `SINGULARITY-028` onward.

Files. `data/site.ts` new, [data/siteMetadata.js](../../../data/siteMetadata.js) deleted, `data/navigation.ts` new, [data/headerNavLinks.ts](../../../data/headerNavLinks.ts) deleted, `data/index.ts` new, and every importer.

Implementation notes. `Evidence`: [data/siteMetadata.js](../../../data/siteMetadata.js) is CommonJS, uses `module.exports`, and is typed only by a JSDoc reference to `pliny/config`. It is imported by [app/layout.tsx](../../../app/layout.tsx), [contentlayer.config.ts](../../../contentlayer.config.ts), [scripts/rss.mjs](../../../scripts/rss.mjs), and several components. The `.mjs` script is the constraint: an ESM script cannot import a `.ts` module directly, so either the script imports from the built output or the shared values are duplicated deliberately with a comment. Prefer the former. Replace every placeholder: `Next.js Starter Blog`, `Tails Azimuth`, `TailwindBlog`, the `tailwind-nextjs-starter-blog.vercel.app` URL, and all ten placeholder social links. Remove the entire `newsletter` block. Navigation becomes the five items in [product-and-design.md](product-and-design.md).

Acceptance criteria.

- `data/site.ts` is TypeScript with an exported interface and no `any`.
- Zero placeholder values remain; every social link is real or removed.
- The `newsletter` key is gone.
- [scripts/rss.mjs](../../../scripts/rss.mjs) still runs during `yarn build`.
- Navigation renders the five specified items.
- `yarn typecheck` reports zero errors.

Validation.

```bash
yarn typecheck
yarn build
```

Then confirm `public/feed.xml` is generated and contains the correct site title.

Risks and rollback. The `.mjs` interoperability is the likely snag. If the script cannot import the TypeScript module, duplicate the three values it needs with a comment explaining why. Rollback: revert the branch.

### SINGULARITY-021 Remove the newsletter subsystem

| Field      | Value                                   |
| ---------- | --------------------------------------- |
| Phase      | P2                                      |
| Size       | S                                       |
| Depends on | SINGULARITY-069                         |
| Unlocks    | none                                    |
| Status     | Withdrawn. Delivered by SINGULARITY-069 |

Objective. Retired. The mandatory Pliny migration in `SINGULARITY-069` deletes the inert newsletter feature so the package can leave before P1.

Scope. No implementation remains. Verify `SINGULARITY-069` recorded the route, component, MDX registration, and environment-variable deletion.

Files. [app/api/newsletter/route.ts](../../../app/api/newsletter/route.ts) deleted, [app/Main.tsx](../../../app/Main.tsx), [components/MDXComponents.tsx](../../../components/MDXComponents.tsx), `.env.example`.

Implementation notes. `Evidence`: the route is `force-static` and therefore already does nothing. `NewsletterForm` is rendered in [app/Main.tsx](../../../app/Main.tsx) behind a `siteMetadata.newsletter?.provider` check, and `BlogNewsletterForm` is registered in [components/MDXComponents.tsx](../../../components/MDXComponents.tsx). Remove both. `.env.example` carries variables for seven newsletter providers; remove all of them.

Acceptance criteria.

- `app/api/newsletter/` no longer exists.
- No import of `NewsletterForm` or `BlogNewsletterForm` remains.
- `.env.example` contains no newsletter variables.
- `yarn build` succeeds and the route list no longer includes the API route.
- No MDX content references the newsletter component.

Validation.

```bash
yarn build
```

Risks and rollback. None. Reopening this task would duplicate `SINGULARITY-069`.

### SINGULARITY-022 Skip link and landmark structure

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P2              |
| Size       | S               |
| Depends on | SINGULARITY-018 |
| Unlocks    | SINGULARITY-056 |

Objective. Give keyboard users a way past the navigation, and make the document's landmark structure explicit.

Scope. A skip link and landmark verification. Non-goals: fixing individual page heading structures, which belongs to each page's task.

Files. `components/layout/skip-link.tsx` new, `app/(site)/layout.tsx`.

Implementation notes. The skip link must be the first focusable element in the DOM, visually hidden until focused, and then clearly visible against both theme surfaces. It targets the `<main>` element, which needs an `id` and `tabIndex={-1}` so that focus actually moves rather than only the scroll position. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) currently renders `<main className="mb-auto">` with no `id`. Confirm `<header>`, `<nav>`, `<main>`, and `<footer>` each appear exactly once per page.

Acceptance criteria.

- Tab from a fresh page load reveals the skip link as the first stop.
- Activating it moves keyboard focus into `<main>`, verified by checking `document.activeElement`, not only by scroll position.
- The link is visible against both theme surfaces at 3.0:1 or better.
- Each landmark appears exactly once per page.
- The skip link is not a client component.

Validation.

```bash
yarn dev
```

Then tab from a fresh load on three different routes.

Risks and rollback. A skip link that scrolls without moving focus is the standard bug and passes casual inspection. Verify `document.activeElement` explicitly. Rollback: revert the two files.

### SINGULARITY-023 Rebuild the header and navigation

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P2                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-014, SINGULARITY-015, SINGULARITY-020 |
| Unlocks    | SINGULARITY-024                                   |

Objective. Rebuild the header against the observatory design system, with the five-item navigation and a current-page indicator.

Scope. The desktop header. Non-goals: the mobile sheet, which is `SINGULARITY-024`.

Files. `components/layout/header.tsx`, `components/layout/search-button.tsx`, `components/layout/theme-switch.tsx` moved, `app/(site)/layout.tsx`.

Implementation notes. `Evidence`: [components/Header.tsx](../../../components/Header.tsx) is a Server Component that filters the home link out of the nav list and reads `siteMetadata.stickyNav`. Keep it a Server Component. The current-page indicator is the interesting constraint: `usePathname` would force a client component, so instead pass the current path down from the page or use a CSS-only approach with `aria-current` set at render time from the route segment. `Evidence`: [components/ThemeSwitch.tsx](../../../components/ThemeSwitch.tsx) is already an accessible Headless UI menu; move it without modifying its logic.

Acceptance criteria.

- Header remains a Server Component.
- Five navigation items render, with the current page marked by `aria-current="page"`.
- The wordmark links home and has an accessible name.
- Search and theme controls are keyboard reachable in a logical order.
- Sticky behaviour respects the site setting and does not obscure focused elements when scrolled.
- Renders correctly at 375px, 768px, and 1440px.

Validation.

```bash
yarn typecheck
yarn dev
```

Risks and rollback. The current-page indicator is the trap that turns the header into a client component. If no server-side approach works cleanly, omit the indicator rather than crossing the boundary. Rollback: revert the branch.

### SINGULARITY-024 Audit and restyle mobile navigation

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P2              |
| Size       | M               |
| Depends on | SINGULARITY-023 |
| Unlocks    | none            |

Objective. Verify the mobile sheet's focus management and restyle it, since the recruiter journey J1 happens on a phone.

Scope. Focus trap verification, scroll lock verification, and restyling. Non-goals: replacing Headless UI.

Files. `components/layout/mobile-nav.tsx`.

Implementation notes. `Evidence`: [components/MobileNav.tsx](../../../components/MobileNav.tsx) uses the Headless UI `Dialog` together with `body-scroll-lock`. Headless UI's `Dialog` already provides a focus trap and focus restoration, which may make the separate `body-scroll-lock` dependency redundant. Test whether removing it changes behaviour on iOS Safari specifically, since that is the platform the package exists for. If it is redundant, removing it drops a dependency.

Acceptance criteria.

- Opening the sheet moves focus into it.
- Tab and Shift-Tab cycle within the sheet and never escape it.
- Escape closes the sheet and returns focus to the trigger button.
- Background content does not scroll while open, verified on iOS Safari.
- Every link is at least 24 by 24 CSS pixels.
- A verdict recorded on whether `body-scroll-lock` is still required.

Validation.

```bash
yarn dev
```

Then test on a real iOS device or an accurate simulator.

Correction, 2026-09-19. The sheet is now split into a plain trigger button and `components/layout/mobile-nav-panel.tsx`, which is imported through `React.lazy`. Headless UI and `body-scroll-lock` previously loaded on every route for a control that only exists below the medium breakpoint; measured against the built output, that chunk was about 40 KB gzipped. The panel is prefetched on pointer enter and on focus, so the sheet still opens without a perceptible delay.

Because the dialog no longer exists in the tree before first open, Headless UI can no longer capture the previously focused element. Focus restoration is therefore performed explicitly against a trigger ref, which is the behaviour this task's acceptance criteria require and is covered by the existing Escape test.

Risks and rollback. iOS Safari scroll locking is genuinely difficult and the reason the dependency exists. Do not remove it without device testing. Rollback: revert the file.

### SINGULARITY-025 Rebuild the footer with colophon and attribution

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P2              |
| Size       | S               |
| Depends on | SINGULARITY-020 |
| Unlocks    | SINGULARITY-066 |

Objective. Rebuild the footer and discharge the upstream MIT attribution obligation.

Scope. Footer markup, social links, secondary navigation, and a colophon. Non-goals: a separate colophon page.

Files. `components/layout/footer.tsx`.

Implementation notes. `Evidence`: `LICENSE` is MIT, copyright Timothy Lin. The obligation survives rebranding. `Evidence`: [components/Footer.tsx](../../../components/Footer.tsx) already links the theme repository, which satisfies the spirit; keep an equivalent credit. Secondary destinations that were cut from the header go here: `/tags` and the RSS feed. The colophon states the typefaces and the stack, which is both an attribution mechanism and a signal to the technical audience.

Acceptance criteria.

- Social links render from `data/social.ts` with accessible names, reusing the existing icon set.
- An attribution line credits the upstream starter and links its repository.
- The colophon names the typefaces with their licences.
- Links to `/tags` and `/feed.xml` are present.
- Copyright year is computed, not hardcoded.
- The footer is a Server Component.

Validation.

```bash
yarn typecheck
yarn dev
```

Risks and rollback. Low. Rollback: revert the file.

### SINGULARITY-026 Starfield implementation and mount

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Phase      | P2                                                         |
| Size       | M                                                          |
| Depends on | SINGULARITY-005, SINGULARITY-017, SINGULARITY-018          |
| Unlocks    | none                                                       |
| Status     | Complete. Canvas withdrawn per the SINGULARITY-005 verdict |

Objective. Ship the decorative starfield within its hard budgets. `SINGULARITY-005` recorded a negative verdict for the Canvas prototype, so the rollback path in this task is the delivered path: the static SVG on every viewport.

Scope. One component, the static SVG, rendered by the shell layout. Non-goals: the canvas implementation, the reduced-motion mount that chose between them, and any other animation.

Files. `components/decorative/starfield-static.tsx`, `app/(site)/layout.tsx`.

Implementation notes. Render as a sibling of `{children}`, never as a wrapper, or the entire page subtree becomes client-rendered. The SVG uses the semantic colour tokens, so it follows both themes without JavaScript and needs no reduced-motion branch.

Acceptance criteria.

- `aria-hidden="true"` and `pointer-events: none` on the artwork, and a `z-index` below all interactive content.
- The artwork renders on every viewport and in both themes.
- No canvas or animation-frame module is shipped.
- The decorative layer contributes zero kilobytes of client JavaScript.
- No page component became a client component as a result.
- Home page Lighthouse performance does not regress from the `SINGULARITY-001` baseline.

Validation.

```bash
yarn build
yarn analyze
yarn serve
```

Implementation evidence, 2026-09-19.

- `SINGULARITY-005` measured the single-canvas prototype at 1.823 milliseconds mean and 2.8 milliseconds p95 under 6 times throttling, with one 81 millisecond long task, and 5.289 milliseconds mean with forty long tasks over five minutes. Both the 2 millisecond frame budget and the 50 millisecond long-task threshold failed.
- An earlier implementation shipped the canvas above the medium breakpoint regardless. That contradicted the recorded verdict and has been withdrawn.
- `components/decorative/starfield.tsx` and `components/decorative/star-field-mount.tsx` are deleted. The shell renders `StarfieldStatic` directly, which removed two client components from every route.

Risks and rollback. Reintroducing motion requires an amended `SINGULARITY-005` with measurements that clear both thresholds. Rollback: none needed; the static layer is the design's intended floor.

### SINGULARITY-027 Rebuild the not-found page

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P2              |
| Size       | S               |
| Depends on | SINGULARITY-018 |
| Unlocks    | none            |

Objective. Turn the 404 into a useful recovery point rather than a dead end.

Scope. The not-found page only. Non-goals: custom error boundaries for thrown errors.

Files. `app/(site)/not-found.tsx`.

Implementation notes. `Evidence`: [app/not-found.tsx](../../../app/not-found.tsx) currently offers only a link back to the homepage. Add links to the main sections, since an arriving visitor most often has a stale or mistyped content URL. The observatory framing is available and cheap here, but the links matter more than the joke.

Acceptance criteria.

- Returns HTTP 404, verified in the network panel, not merely rendering 404 text.
- Links to home, work, writing, and resume.
- Correct heading structure with a single `h1`.
- Renders in both themes.
- Not a client component.

Validation.

```bash
yarn build
yarn serve
```

Then request a nonexistent path and confirm the status code.

Risks and rollback. Low. Rollback: revert the file.

## Phase P3: Portfolio content

### SINGULARITY-028 Define portfolio type definitions

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | SINGULARITY-007, SINGULARITY-008 |
| Unlocks    | all of P3                        |

Objective. Define the typed shapes for every portfolio entity, so that data entry and component work can proceed in parallel. This is the P3 gate.

Scope. Types and runtime validation only. Non-goals: any data, any component.

Files. `data/types.ts`, `tests/unit/data-validation.test.ts`.

Implementation notes. The `Project` interface is specified in full in [product-and-design.md](product-and-design.md); implement it exactly. Also define `Experience`, `SkillGroup`, `Education`, `Award`, `SocialLink`, and `UsesEntry`. Every field must justify itself against a journey; do not add speculative fields. Add lightweight runtime validation so that a malformed entry fails the build rather than rendering blank, since these are hand-authored files. Slugs must be unique, dates must parse, image dimensions must be present when a cover is supplied, and project-to-case-study references must be validated once Contentlayer exposes the MDX collection.

Acceptance criteria.

- All seven types exported and compiling under `strict: true`.
- `Project.cover.alt` is required, not optional, so images cannot ship without alternative text.
- Dates are ISO `YYYY-MM` strings with a documented format.
- Runtime validation rejects duplicate slugs, unparseable dates, and covers missing dimensions.
- Unit tests cover each validation rule with a failing case.
- The validator exposes a content-integrity check that rejects a missing referenced case study and an orphan case-study slug; `SINGULARITY-036` wires it to the generated MDX collection.
- No `any` anywhere.

Validation.

```bash
yarn typecheck
yarn test
```

Risks and rollback. Getting the `Project` shape wrong is expensive later. Validate it against both resume projects before closing the task. Rollback: revert the file.

### SINGULARITY-029 Populate profile, skills, education, and awards

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | SINGULARITY-028, SINGULARITY-032 |
| Unlocks    | SINGULARITY-038, SINGULARITY-039 |

Objective. Enter the identity, skills, education, and awards data from the resume.

Scope. Data entry into four typed modules. Non-goals: presentation.

Files. `data/profile.ts`, `data/skills.ts`, `data/education.ts`, `data/social.ts`, `data/index.ts`.

Implementation notes. Source is the resume extraction in [research.md](research.md). Skills come in three groups. Programming languages: Python, C++, SQL, JavaScript, TypeScript, Java, Swift, CSS, HTML, C, R. Libraries and frameworks: PyTorch, Google Agent Development Kit, multi-agent systems, Hugging Face, TensorFlow, Node.js, Puppeteer, React, pandas. Tools and platforms: Git, Linux, ROS, Google AI Studio, iOS, Power BI, Power Apps, Power Automate, AWS, Docker, SAP, Anaconda, Jupyter, .NET, Xcode, Unity. Education is a Bachelor of Computing and Financial Management at the University of Waterloo, 2023 to 2027 expected. Four awards, listed in [research.md](research.md).

The positioning statement is the highest-stakes string on the site, because J1 depends on it. It must be one line, concrete, and specific to the multi-agent systems and applied machine learning work rather than a generic descriptor.

> [!CAUTION]
> Do not enter the phone number into any file. See `SINGULARITY-032`.

Acceptance criteria.

- All four modules populated and type-checking.
- No phone number anywhere in `data/`.
- A dedicated public contact address is stored once in typed profile data and rendered through a normal accessible `mailto:` link.
- Skills grouped as three categories with the exact entries above.
- Every award includes its year.
- The positioning statement is one line and names something specific.
- Barrel export updated.

Validation.

```bash
yarn typecheck
yarn test
```

Risks and rollback. A long, undifferentiated skills list reads as padding. Consider marking a primary subset for display and keeping the remainder for the resume page. Rollback: revert the files.

### SINGULARITY-030 Experience data and timeline component

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | SINGULARITY-028                  |
| Unlocks    | SINGULARITY-038, SINGULARITY-039 |

Objective. Enter the three roles and build the timeline that renders them.

Scope. Data plus one component. Non-goals: the pages that consume it.

Files. `data/experience.ts`, `components/portfolio/experience-timeline.tsx`, `lib/format.ts`.

Implementation notes. Three roles from the resume: Technical Analyst at MPBSDP from April 2026 to October 2026, Data Analyst at the Ontario Financing Authority from January 2025 to August 2025, and Finance Intern at Trench Group, Siemens Energy, from May 2024 to August 2024. Achievement bullets are transcribed from the resume, then rewritten for the web: shorter, leading with the outcome. Resume prose is optimized for a different medium and reads as dense on screen.

The timeline is a semantic ordered list, not a div stack, and its visual gutter rule is decorative and `aria-hidden`. Date formatting lives in `lib/format.ts` so it is unit-testable.

Acceptance criteria.

- Three roles with organization, title, dates, and bullets.
- Renders as an ordered list in reverse chronological order.
- Date ranges format consistently, and an absent end date renders as "Present".
- The decorative rule is `aria-hidden` and the layout does not depend on it.
- Readable at 375px without horizontal scroll.
- Server Component.
- Unit tests cover date formatting including the open-ended case.

Validation.

```bash
yarn test
yarn typecheck
yarn dev
```

Risks and rollback. `Decision needed`: how much MPBSDP detail is publishable. Tracked as `OQ-1`. If unresolved, enter a conservative summary and mark it for revision. Rollback: revert the files.

### SINGULARITY-031 Populate projects data

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P3                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-028                                   |
| Unlocks    | SINGULARITY-034, SINGULARITY-035, SINGULARITY-038 |

Objective. Replace the two placeholder entries with real projects.

Scope. Data entry and the deletion of the old module. Non-goals: case study prose, which is `SINGULARITY-037`.

Files. `data/projects.ts`, [data/projectsData.ts](../../../data/projectsData.ts) deleted, [app/projects/page.tsx](../../../app/projects/page.tsx) updated to the new import.

Implementation notes. Two projects come from the resume. Robotics Challenge, July to August 2025, featured, with YOLO retraining, real-time segmentation, ROS autonomous navigation with stair climbing and object manipulation on a humanoid robot, and a third-place finish among hundreds of university teams in China. ROS Mobile Controller, September 2023 to April 2024, an iOS application controlling a ROS robot with a simulated joystick and real-time SLAM mapping in C++.

The `outcome` field must be verifiable, not descriptive. "Third place among hundreds of university teams" qualifies. "Improved performance" does not.

`Assumption`: at least one further project is added during this task, since two is thin for a portfolio index. If none is available, the index must be designed to look deliberate with two entries rather than sparse.

Acceptance criteria.

- Placeholder entries for Google and The Time Machine are gone.
- Every project has a non-empty `outcome`, `role`, `stack`, and `status`.
- Exactly one project is marked featured, or a documented reason for more.
- Slugs are unique, lowercase, and hyphenated.
- Every `links` entry resolves; no placeholder URLs.
- Runtime validation from `SINGULARITY-028` passes.
- `/projects` still renders after the import change.

Validation.

```bash
yarn typecheck
yarn test
yarn build
```

Risks and rollback. Rollback: revert the files.

### SINGULARITY-032 Redact, relocate, and assess the resume PDF

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | none                             |
| Unlocks    | SINGULARITY-029, SINGULARITY-033 |

Objective. Publish a resume PDF that carries no phone number and no leaking document metadata, and resolve whether the already-committed original requires history remediation. This is a pre-implementation privacy gate: execute it before P0 and before any `git init`, regardless of its numeric identifier.

Scope. Redaction, relocation, metadata stripping, and a history assessment with a recommendation. Non-goals: rewriting history without approval.

Files. `public/resume/matthew-gong-resume.pdf` new, `ResumeLatex3.pdf` moved out of the repository root, `.gitignore`.

Implementation notes. `Evidence`: the source PDF contains `[REDACTED PHONE]`. The published variant must omit it. Regenerate from the LaTeX source with the phone line removed rather than drawing a black box over it, because a drawn redaction leaves the text extractable underneath, which is the classic redaction failure. Never copy the literal value into a source file, test fixture, command, log, or planning artifact.

Strip document metadata. PDF producers routinely embed a local username, a full file path, and the toolchain version.

> [!IMPORTANT]
> `Evidence`: as of 2026-09-01 this workspace is not a Git repository, so the unredacted file has no history behind it. Complete this task **before** running `git init` and the phone number never enters history. If the repository has already been initialized by the time this task runs, assess and recommend, but do not rewrite history without explicit approval, since that is destructive and breaks every existing clone.

Acceptance criteria.

- The published PDF contains no phone number, verified by text extraction rather than visual inspection.
- Document metadata contains no local username or file path.
- File size at or under 400 KB.
- Filename is descriptive: `matthew-gong-resume.pdf`.
- The unredacted original is no longer in the repository tree, and `.gitignore` prevents its return.
- A written statement of whether Git was initialized before this task ran, and if so, a history assessment with a recommendation and its cost.

Validation.

```bash
python scripts/check-sensitive-data.py public/resume/matthew-gong-resume.pdf
```

The checker extracts PDF text and rejects North American phone-number patterns, including formatted and unformatted variants. It must not embed the known number as a fixture.

Risks and rollback. A visual-only redaction that leaves extractable text is the failure mode this task exists to prevent. The validation command above is the check. Rollback: not applicable; do not publish an unredacted file.

### SINGULARITY-033 Build the resume page

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P3              |
| Size       | M               |
| Depends on | SINGULARITY-032 |
| Unlocks    | none            |

Objective. Serve the resume as indexable HTML with a prominent PDF download, satisfying journey J4.

Scope. One route composing existing data modules. Non-goals: a PDF generator, a print stylesheet beyond basic sanity.

Files. `app/(site)/resume/page.tsx`.

Implementation notes. Compose from `data/experience.ts`, `data/skills.ts`, `data/education.ts`, and `data/profile.ts`. Do not duplicate the content into this page. The HTML version is the primary artifact because it is indexable, linkable, readable on a phone, and does not require a download. The PDF is the secondary artifact for applicant tracking systems.

The download control uses the `download` attribute so the browser saves rather than navigates. Add `Person` JSON-LD here.

Acceptance criteria.

- All resume content renders as semantic HTML, no image of text and no embedded PDF viewer.
- The download control is above the fold on mobile.
- The served PDF is the redacted variant from `SINGULARITY-032`.
- No phone number appears anywhere on the page.
- `Person` JSON-LD validates.
- Statically generated.
- Readable at 375px and at 200 percent zoom.
- Server Component.

Validation.

```bash
yarn build
yarn serve
```

Then validate the structured data and confirm the download serves the redacted file.

Risks and rollback. Two sources of truth is the risk: the HTML and the PDF will drift. Document that `data/` is authoritative and the PDF is regenerated from it. Rollback: revert the file.

### SINGULARITY-034 Project card and grid components

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | SINGULARITY-015, SINGULARITY-031 |
| Unlocks    | SINGULARITY-035, SINGULARITY-038 |

Objective. Build the card that carries a project's evidence in a scannable form.

Scope. Two components plus the metadata block. Non-goals: the pages that use them.

Files. `components/portfolio/project-card.tsx`, `components/portfolio/project-grid.tsx`, `components/portfolio/project-meta.tsx`.

Implementation notes. The card must surface title, tagline, role, period, stack, and outcome. The outcome is the field that distinguishes this from the four-field [components/Card.tsx](../../../components/Card.tsx) it replaces, and it must be visually prominent rather than buried in body text.

The entire card is one link target, not a card containing a separate "learn more" link, because two nested link targets is both an accessibility problem and an extra tab stop. Cover images use the existing [components/Image.tsx](../../../components/Image.tsx) wrapper with explicit width and height to prevent layout shift.

Acceptance criteria.

- One link per card, with an accessible name that includes the project title.
- Outcome is visually prominent.
- Stack renders as badges using the `Badge` primitive.
- Explicit dimensions on every image; measured Cumulative Layout Shift of 0.
- Grid is one column below 640px, two to 1024px, three above.
- Cards in a row have equal height without a fixed height.
- Server Components.

Validation.

```bash
yarn typecheck
yarn dev
```

Then tab through the grid and confirm one stop per card.

Risks and rollback. Rollback: revert the files.

### SINGULARITY-035 Rebuild the projects index

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P3              |
| Size       | M               |
| Depends on | SINGULARITY-034 |
| Unlocks    | SINGULARITY-036 |

Objective. Turn `/projects` into a browsable index that reads as intentional at small counts.

Scope. One route. Non-goals: client-side filtering, which is deferred.

Files. `app/(site)/projects/page.tsx`.

Implementation notes. `Evidence`: the current page maps `projectsData` onto `Card` with no ordering logic. Order by featured, then by `order`, then by period descending. Group by status so that archived work is clearly separated from current work; a 2023 project presented alongside 2026 work implies staleness.

`Recommendation`: no client-side filter at this scale. A filter over three or four items is theatre, and it would add a client component for no benefit. Revisit past eight projects.

Acceptance criteria.

- All projects render with correct ordering.
- Active and archived work are visually distinguished.
- The page has a single `h1` and a correct heading hierarchy.
- Statically generated.
- No client component introduced.
- Reads as deliberate at three entries, verified by inspection.

Validation.

```bash
yarn build
yarn serve
```

Risks and rollback. Rollback: revert the file.

### SINGULARITY-036 Project detail route and project content collection

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P3              |
| Size       | L               |
| Depends on | SINGULARITY-035 |
| Unlocks    | SINGULARITY-037 |

Objective. Add case-study pages, joining typed metadata to optional MDX prose per decision A6.

Scope. A project collection in the selected content engine, the dynamic route, and static parameter generation. Non-goals: writing case study content.

Files. The selected `content-collections.ts` or `velite.config.ts`, `app/(site)/projects/[slug]/page.tsx`, `data/projects/`.

Implementation notes. Add a `Project` document type matching `projects/**/*.mdx`, reusing the existing `computedFields` for slug, path, and reading time. The join is by slug: `data/projects.ts` holds the metadata, `data/projects/[slug].mdx` holds the optional prose, and the `caseStudy` field links them. Projects without an MDX file must still render a full detail page from metadata alone, so that content can ship incrementally.

Also remove the migrated Authors collection in this task, since the site is single-author and `SINGULARITY-029` moved that data into `data/profile.ts`. That means deleting `data/authors/` and updating [app/about/page.tsx](../../../app/about/page.tsx), which reads the legacy default author in the baseline.

Acceptance criteria.

- `generateStaticParams` produces one page per project.
- A project without a case study renders a complete page.
- A project with a case study renders its MDX through the `Prose` primitive.
- Every non-empty `caseStudy` value resolves to exactly one generated MDX document, and every project MDX document is referenced by exactly one project record.
- The build fails with the offending slug when either side of that relationship is missing or duplicated.
- `generateMetadata` produces a per-project title, description, and Open Graph image.
- The `Authors` type is removed and no code imports `allAuthors`.
- `data/authors/` is deleted.
- `yarn build` succeeds and the route list includes every project.

Validation.

```bash
yarn build
yarn serve
```

Then request every project URL and confirm a 200 response.

Risks and rollback. Removing `Authors` touches [app/about/page.tsx](../../../app/about/page.tsx), [layouts/PostLayout.tsx](../../../layouts/PostLayout.tsx), and the post route, which all read author details. If that expands the task past `L`, split the `Authors` removal into a separate task and note it. Rollback: revert the branch.

### SINGULARITY-037 Write the Robotics Challenge case study

| Field      | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| Phase      | P3                                                                 |
| Size       | M                                                                  |
| Depends on | SINGULARITY-029, SINGULARITY-031, SINGULARITY-032, SINGULARITY-036 |
| Unlocks    | none                                                               |

Objective. Produce one complete case study, proving the format and giving journey J2 something to land on. This is the P3 exit gate.

Scope. One MDX file plus its images. Non-goals: case studies for other projects.

Files. `data/projects/robotics-challenge.mdx`, `public/static/images/projects/`.

Implementation notes. Structure for scanning, not for narrative: the problem, the role, the approach, the technical detail, the outcome, and what would be done differently. That last section is what separates a case study from a brochure, and technical readers weight it heavily.

Source material from the resume: an embodied artificial intelligence and robotics team challenge in China, a retrained YOLO network for real-time segmentation and object detection, ROS-based autonomous navigation including stair climbing and object manipulation for a humanoid robot in simulation, and third place among hundreds of university teams.

Every image needs meaningful alternative text. Diagrams should be authored for both themes per [product-and-design.md](product-and-design.md).

Acceptance criteria.

- All six sections present.
- Role clearly distinguishes personal contribution from team contribution.
- The outcome is stated with its verifiable result.
- Every image has meaningful alternative text and explicit dimensions.
- Any diagram renders legibly in both themes.
- Code samples, if present, are syntax-highlighted and contrast-verified.
- Renders through the `Prose` primitive with no styling exceptions.
- Total image payload for the page at or under 400 KB.

Validation.

```bash
yarn build
yarn serve
```

Then read the page at 375px and 1440px in both themes.

Risks and rollback. If competition media cannot be used for licensing reasons, use diagrams instead. Verify rights before publishing any photograph. Rollback: mark the file draft.

### SINGULARITY-038 Rebuild the home page

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P3                                                |
| Size       | L                                                 |
| Depends on | SINGULARITY-029, SINGULARITY-030, SINGULARITY-034 |
| Unlocks    | none                                              |

Objective. Replace the five-post list with a portfolio home that satisfies journey J1. This is the highest-stakes page on the site.

Scope. One route composing existing components. Non-goals: new components, new data.

Files. `app/(site)/page.tsx`, `components/portfolio/hero.tsx`, `components/portfolio/contact-block.tsx`, [app/Main.tsx](../../../app/Main.tsx) deleted.

Implementation notes. `Evidence`: [app/Main.tsx](../../../app/Main.tsx) currently renders a "Latest" heading over five posts with a newsletter form. Delete it entirely.

The order is fixed by J1: identity block, then featured work, then recent writing, then contact. The identity block must render name, positioning statement, current status, and primary actions within the initial viewport on a 375 by 667 device without scrolling. This is a measurable acceptance criterion, not a stylistic preference.

The contact block renders the dedicated public address from typed profile data as a normal `mailto:` link. Do not add CSS-reordered text, base64 reconstruction, or a JavaScript-only address; those techniques do not create a meaningful privacy boundary and can damage accessibility or no-JavaScript behavior.

Acceptance criteria.

- Name, positioning statement, status, and primary actions are all visible without scrolling at 375 by 667.
- The positioning statement is present in the server-rendered HTML, verified by viewing source.
- At most three featured projects, and at most three recent posts.
- Largest Contentful Paint under 1.8 seconds on a throttled mobile profile.
- First-load JavaScript at or under 110 KB gzipped.
- Cumulative Layout Shift under 0.05.
- The public contact address has an accessible name, can be copied, and the `mailto:` link works with JavaScript disabled.
- No phone number.
- `Main.tsx` deleted.
- Server Component, apart from the starfield sibling.

Validation.

```bash
yarn build
yarn analyze
yarn serve
```

Then run Lighthouse on the mobile preset and view source to confirm the positioning statement.

Risks and rollback. This page is where the temptation to add a decorative hero is strongest, and where it would do the most damage to J1. The acceptance criteria are the defence. Rollback: revert the branch.

### SINGULARITY-039 Rebuild the about page

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P3                               |
| Size       | M                                |
| Depends on | SINGULARITY-029, SINGULARITY-030 |
| Unlocks    | none                             |

Objective. Turn `/about` from a rendered author MDX file into a real biography with skills, education, awards, and interests.

Scope. One route. Non-goals: the resume page, which is separate and more formal.

Files. `app/(site)/about/page.tsx`, [layouts/AuthorLayout.tsx](../../../layouts/AuthorLayout.tsx) deleted.

Implementation notes. `Evidence`: the current page reads the `default` author document from Contentlayer and renders it through `AuthorLayout`. Since `SINGULARITY-036` removes the `Authors` type, this page must be rewritten to compose from `data/`.

`/about` and `/resume` serve different readers and must not be duplicates. `/about` is written in first person and explains motivation and interests. `/resume` is formal, chronological, and scannable. The awards and the interests belong here; the role bullets belong there.

Acceptance criteria.

- Biography renders from `data/profile.ts` in first person.
- Skills render grouped by the three categories.
- Education, awards, and interests all present.
- `AuthorLayout` deleted with a verified zero-importer check.
- No content is duplicated verbatim from `/resume`.
- `Person` JSON-LD present.
- Server Component.
- Correct heading hierarchy with a single `h1`.

Validation.

```bash
yarn typecheck
yarn build
```

Risks and rollback. Rollback: revert the branch.

### SINGULARITY-040 Build the uses page

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P3              |
| Size       | S               |
| Depends on | SINGULARITY-018 |
| Unlocks    | none            |

Objective. Add a `/uses` page listing hardware, editor, and tooling.

Scope. One data module and one route. Non-goals: affiliate links, product images.

Files. `data/uses.ts`, `app/(site)/uses/page.tsx`.

Implementation notes. Group by category: hardware, editor and terminal, languages and runtimes, services. Keep entries to a name, an optional link, and one line on why. The value is the "why", not the list.

`Recommendation`: no affiliate links. They are a trust cost that a portfolio cannot afford, and they require disclosure.

Acceptance criteria.

- Renders grouped entries from typed data.
- Every external link opens safely, reusing [components/Link.tsx](../../../components/Link.tsx).
- No affiliate links.
- Statically generated, Server Component.
- Correct heading hierarchy.

Validation.

```bash
yarn typecheck
yarn build
```

Risks and rollback. Low. If it feels like filler, withdraw the task and move the navigation item to the footer. Rollback: delete both files.

## Phase P4: Blog experience

### SINGULARITY-041 Consolidate the post layouts

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P4              |
| Size       | L               |
| Depends on | SINGULARITY-016 |
| Unlocks    | all of P4       |
| Status     | Complete        |

Objective. Replace three near-duplicate layouts with one variant-driven layout, per decision A4. This is the P4 gate.

Scope. One consolidated layout and the deletion of three files. Non-goals: the table of contents, which is `SINGULARITY-043`.

Files. `layouts/post-layout.tsx` new, [layouts/PostLayout.tsx](../../../layouts/PostLayout.tsx), [layouts/PostSimple.tsx](../../../layouts/PostSimple.tsx), [layouts/PostBanner.tsx](../../../layouts/PostBanner.tsx) deleted, `app/(site)/blog/[...slug]/page.tsx`.

Implementation notes. `Evidence`: the three files share a header, prose body, tag list, comment mount, and previous-next navigation, and differ mainly in the author sidebar and the banner image. Map the existing `layout` frontmatter value onto a `variant` prop so that no existing post breaks: absent or `PostLayout` becomes `default`, `PostSimple` becomes `minimal`, `PostBanner` becomes `banner`.

The author sidebar is removed entirely, since `SINGULARITY-036` removed the Authors collection and the site is single-author. `Evidence`: [layouts/PostBanner.tsx](../../../layouts/PostBanner.tsx) used Pliny's `Bleed` component in the baseline. Use the tested first-party CSS full-bleed component from `SINGULARITY-069`.

If the consolidated component needs more than two conditional branches, the consolidation has failed and the layouts should stay split. Record that outcome rather than forcing it.

Acceptance criteria.

- One layout file handles all three variants.
- Every existing post renders correctly under its current frontmatter value.
- The banner variant renders a full-bleed image with explicit dimensions and no layout shift.
- The minimal variant omits the author region.
- No more than two conditional branches on `variant`.
- Three layout files deleted with verified zero importers.
- `yarn build` succeeds and every post route resolves.

Validation.

```bash
yarn build
yarn serve
```

Then open one post of each variant in both themes.

Implementation evidence, 2026-09-18.

- `layouts/post-layout.tsx` now maps the legacy values to typed `default`, `minimal`, and `banner` variants through the blog route.
- The shared layout owns the post header, prose body, edit and discussion links, comments, tags, previous and next navigation, and blog return link without an author region.
- The banner is the only structural variant branch. It uses the first-party full-bleed component and reserves a 1600 by 800 image area before loading.
- The three legacy layout files were deleted, and a repository scan found no stale importers.
- Browser checks covered one existing post for each variant in light and dark themes. All six cases rendered the expected heading and navigation without horizontal overflow; only the banner fixture rendered a header image.
- `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build` passed. The production build generated all 64 static pages, including all 11 blog post routes.

Correction, 2026-09-19. The consolidation was structurally complete but never restyled. The layout still carried the starter gray ramp, `text-base`, `text-sm`, and `text-xs` in place of the fluid scale, and `text-primary-500` link colours, and it applied `prose dark:prose-invert max-w-none` inline instead of consuming the `Prose` primitive, which broke the single-owner rule in `SINGULARITY-016` and discarded the prose measure. All of that now uses the observatory tokens and the `Prose` primitive.

Two further leftovers were removed in the same pass. The banner variant fell back to `https://picsum.photos/seed/picsum/1600/800` when a post declared no image, which is why [next.config.js](../../../next.config.js) still allowlisted `picsum.photos` in `images.remotePatterns`; the banner now renders only when the post supplies an image, and the allowlist entry is gone. The "Discuss on Twitter" link pointed at `mobile.twitter.com`, a domain that no longer resolves, and has been dropped in favour of the GitHub source link.

An inner `Container` was also removed, because the shell layout already wraps every route in one and the nesting doubled the horizontal padding on post routes.

Risks and rollback. Do this before deleting the starter posts in `SINGULARITY-045`, so there is real content of all three variants to verify against. Rollback: revert the branch.

### SINGULARITY-042 Extend blog frontmatter with series and featured

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P4                               |
| Size       | S                                |
| Depends on | SINGULARITY-041                  |
| Unlocks    | SINGULARITY-043, SINGULARITY-047 |
| Status     | Complete                         |

Objective. Add the two fields the home page and series navigation need.

Scope. Two optional fields in the selected content-engine schema. Non-goals: series index pages.

Files. The selected `content-collections.ts` or `velite.config.ts`.

Implementation notes. Both fields are optional so no existing post breaks. `series` is a string that groups posts, pairing with the catch-all route that already supports nested paths. `featured` is a boolean the home page reads.

Acceptance criteria.

- Both fields defined as optional.
- Generated types include them.
- Every existing post still builds.
- Posts without the fields behave exactly as before.

Validation.

```bash
yarn build
yarn typecheck
```

Implementation evidence, 2026-09-18.

- The Blog schema defines optional `series` strings and optional `featured` booleans.
- Content generation and TypeScript validation pass with all existing posts omitting both fields.
- The production build generated both collections and all 12 current documents without schema errors.

Risks and rollback. Low. Rollback: revert the file.

### SINGULARITY-043 Table of contents sidebar

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P4              |
| Size       | M               |
| Depends on | SINGULARITY-041 |
| Unlocks    | none            |
| Status     | Complete        |

Objective. Add a sticky table of contents above the large breakpoint and a disclosure below it, using the typed `toc` field from `SINGULARITY-003`.

Scope. One component plus its layout integration. Non-goals: sidenotes.

Files. `components/blog/table-of-contents.tsx`, `components/ui/disclosure.tsx`, `layouts/post-layout.tsx`.

Implementation notes. `SINGULARITY-003` preserves table-of-contents extraction as a tested first-party transform in the selected engine, so no extraction work is needed here. Render nothing at all when a post has fewer than three headings; a two-item table of contents is noise.

The active-heading scroll spy is the only reason this component is client-side. Use `IntersectionObserver`, not a scroll event listener. Below the large breakpoint, use a native `<details>` element, which needs no JavaScript at all and is accessible for free.

Acceptance criteria.

- Omitted entirely for posts with fewer than three headings.
- Sticky sidebar above 1024px, `<details>` disclosure below.
- Active heading updates on scroll via `IntersectionObserver`.
- Links move keyboard focus to the target heading, not only the scroll position.
- Rendered as a `<nav>` with an accessible name.
- Long headings truncate without breaking the layout.
- Only the scroll-spy portion is a client component.

Validation.

```bash
yarn dev
yarn analyze
```

Implementation evidence, 2026-09-18.

- The server component omits tables of contents with fewer than three level-two through level-four headings.
- Mobile rendering uses a native disclosure. Desktop rendering uses a sticky, truncated navigation list above the large breakpoint.
- A focused client component observes headings with `IntersectionObserver`, marks the active link, and transfers keyboard focus to linked headings.
- Component tests cover the omission threshold and focus behavior. Production browser checks confirmed one visible table of contents at each breakpoint, sticky desktop positioning, native mobile disclosure, dark-theme rendering, and no horizontal overflow.

Risks and rollback. Scroll spy is a common source of jank. If `IntersectionObserver` proves fiddly, ship the static list without active-state tracking, which removes the client dependency entirely. Rollback: remove the component from the layout.

### SINGULARITY-044 Restyle the blog list and add a results live region

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P4                               |
| Size       | M                                |
| Depends on | SINGULARITY-015, SINGULARITY-041 |
| Unlocks    | none                             |
| Status     | Complete                         |

Objective. Restyle the blog list to the new design system and fix its accessibility gap.

Scope. The list layout and a post card. Non-goals: changing pagination logic.

Files. `layouts/list-layout-with-tags.tsx`, `components/blog/post-card.tsx`, `components/blog/tag.tsx` moved.

Implementation notes. `Evidence`: [layouts/ListLayoutWithTags.tsx](../../../layouts/ListLayoutWithTags.tsx) is a client component holding search filter state, and it does not announce result counts to assistive technology. Add a polite live region reporting the filtered count.

Narrow the client boundary: only the search input and the filtered list need to be client-side. The tag sidebar and pagination are static and should be Server Components passed as children.

Acceptance criteria.

- Result count announced through an `aria-live="polite"` region on filter change.
- An empty result set shows a clear message, not a blank area.
- The tag sidebar and pagination are not client components.
- Pagination links are real anchors, crawlable and keyboard operable.
- Post cards have one link target each.
- Renders correctly at 375px, 768px, and 1440px.
- Client-side JavaScript for this route does not increase from the baseline.

Validation.

```bash
yarn analyze
yarn dev
```

Then test the filter with a screen reader.

Implementation evidence, 2026-09-18.

- The lowercase list layout is a Server Component that owns static tag navigation and crawlable pagination links.
- The filter island searches titles, summaries, and tags, announces singular and plural result counts through a polite live region, and renders a clear empty state.
- Post cards expose one article link target. Their tag labels remain descriptive text rather than competing links.
- Browser checks at 375, 768, and 1440 pixels confirmed responsive topic navigation and no horizontal overflow. A known query returned and announced one result, and the empty query state retained a real `/blog/page/2/` pagination anchor.
- The production blog route decreased from 113 KB to 109 KB first-load JavaScript after the client boundary was narrowed.

Correction, 2026-09-19. The topic sidebar was `hidden md:block`, so there was no way to browse tags from the blog list on a phone. That is the device the recruiter journey assumes. The same list now renders inside a disclosure below the medium breakpoint and as the sticky sidebar above it, matching the pattern the table of contents already uses. The filter input also had `outline-none` with only a border change on focus, which is not a sufficient focus indicator; it now carries a visible focus-visible outline.

Risks and rollback. Passing Server Components as children into a client component is correct but easy to get wrong. Verify with the bundle analyzer that the sidebar did not get pulled into the client bundle. Rollback: revert the branch.

### SINGULARITY-045 Replace starter content with a template and a seed post

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P4                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-041, SINGULARITY-042, SINGULARITY-046 |
| Unlocks    | SINGULARITY-051, SINGULARITY-061                  |
| Status     | Complete                                          |

Objective. Delete the eleven starter posts and publish one real post, per D8.

Scope. Content deletion, an authoring template, and one post. Non-goals: writing more than one post.

Files. All of `data/blog/`, `data/blog/_template.mdx` new, one seed post, `public/static/images/`, [app/tag-data.json](../../../app/tag-data.json) regenerated.

Implementation notes. Delete all eleven posts including the nested-route example, and delete the demo images they reference: `google.png`, `time-machine.jpg`, `ocean.jpeg`, `github-traffic.png`, `twitter-card.png`, and the `canada/` directory.

The template carries `draft: true` so the existing draft mechanism excludes it from production, and it documents every frontmatter field with a comment.

`Recommendation` from [product-and-design.md](product-and-design.md): the seed post should draw on the MPBSDP work, on multi-agent workflow orchestration or on building a Karpathy-style LLM wiki without a vector store. It must clear `OQ-1` on publishable detail first.

The tag vocabulary is reset to the seven proposed tags. `Evidence`: [app/tag-data.json](../../../app/tag-data.json) is generated by the `onSuccess` hook, so it regenerates on build; do not hand-edit it.

Acceptance criteria.

- All eleven starter posts deleted.
- All starter demo images deleted.
- The template exists, is `draft: true`, and documents every field.
- One real post published with a real title, summary, date, and tags.
- Tags come from the agreed vocabulary.
- Regenerated `tag-data.json` and `search.json` contain only real tags and the real post.
- RSS contains one item.
- No broken image references anywhere.
- `yarn build` succeeds.

Validation.

```bash
yarn build
yarn serve
```

Then inspect `public/feed.xml`, `public/search.json`, and `app/tag-data.json`.

Implementation evidence, 2026-09-18.

- All eleven starter posts and their demo images were removed. The replacement template is draft-only and documents every supported frontmatter field.
- One confidentiality-safe seed post exercises code, mathematics, citations, figures, callouts, and the responsive table of contents. Its bibliography is resolved through the document's validated frontmatter rather than implicit file metadata.
- Generated tag, search, and feed artifacts contain the seed post and its real tags without template or starter-content residue. RSS contains one blog item.
- The production build generated one blog route and all three existing project case studies. Browser checks in both themes confirmed transformed citation and bibliography output, two code blocks, four KaTeX nodes, figures, a callout, and no horizontal overflow.
- The desktop and mobile reader journey passed with a sticky table of contents, an `On this page` disclosure, and cumulative layout shift of zero in both themes.

Risks and rollback. Deleting the posts removes the fixtures that layout work depended on, which is why this runs after `SINGULARITY-041`. Rollback: restore from Git.

### SINGULARITY-046 MDX component set

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P4                               |
| Size       | M                                |
| Depends on | SINGULARITY-016, SINGULARITY-041 |
| Unlocks    | SINGULARITY-045                  |
| Status     | Complete                         |

Objective. Give authored content the components it needs: figures with captions, callouts, and tabbed code groups.

Scope. Three components plus the component map. Non-goals: new remark or rehype plugins.

Files. `components/mdx/mdx-components.tsx` moved, `components/mdx/figure.tsx`, `components/mdx/callout.tsx`, `components/mdx/code-group.tsx`.

Implementation notes. `Evidence`: [components/MDXComponents.tsx](../../../components/MDXComponents.tsx) currently maps `Image`, `TOCInline`, `Link`, `Pre`, `table`, and `BlogNewsletterForm`. Remove the newsletter entry per `SINGULARITY-021`.

`Figure` wraps an image with a caption and supports the dual-theme source rule from [product-and-design.md](product-and-design.md), taking optional light and dark sources. `Callout` should reuse the existing `remark-github-blockquote-alert` styling already loaded in [app/layout.tsx](../../../app/layout.tsx) rather than introducing a parallel system. `CodeGroup` is the only client component here, holding tab state, and its tabs must be keyboard operable with arrow keys per the tab pattern.

Acceptance criteria.

- `Figure` renders a semantic `<figure>` and `<figcaption>` with explicit dimensions.
- Dual-theme sources switch with the theme and cause no flash on load.
- `Callout` reuses the existing alert styling.
- `CodeGroup` tabs are keyboard operable with arrow keys and have correct ARIA roles.
- Only `CodeGroup` is a client component.
- The newsletter entry is removed from the map.
- Every component works in both themes.

Validation.

```bash
yarn build
yarn dev
```

Then exercise each component in a scratch MDX file.

Implementation evidence, 2026-09-18.

- The MDX component map moved under `components/mdx/` and is shared by blog posts and project case studies.
- `Figure` emits semantic figure and caption elements, requires explicit dimensions, and uses CSS-only light and dark image switching.
- `Callout` emits the same `markdown-alert` and variant classes as the existing GitHub alert transform.
- `CodeGroup` is the only new client component. It implements tab, tablist, and tabpanel semantics with roving focus and Arrow Left, Arrow Right, Home, and End controls.
- Focused tests cover semantic output, dimensions, alert classes, tab selection, and keyboard focus. All 34 repository tests and the production build pass.

Risks and rollback. Dual-theme images can flash on load if switched with JavaScript. Use the CSS-only picture technique. Rollback: revert the files.

### SINGULARITY-047 Post navigation and related posts

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P4              |
| Size       | S               |
| Depends on | SINGULARITY-042 |
| Unlocks    | none            |
| Status     | Complete        |

Objective. Give readers a next step at the end of a post, satisfying the final step of journey J3.

Scope. Previous and next navigation, plus series awareness. Non-goals: a recommendation algorithm.

Files. `components/blog/post-nav.tsx`, `lib/content.ts`, `layouts/post-layout.tsx`.

Implementation notes. `Evidence`: previous and next navigation already exists inside the current post layouts; extract it into a component during the consolidation rather than rewriting it. When a post has a `series` value, previous and next should traverse within the series first, then fall back to chronological order. Related-post selection is tag overlap, computed at build time in `lib/content.ts` so it is unit-testable.

Acceptance criteria.

- Previous and next render with post titles, not just arrows.
- Series-aware ordering when `series` is present.
- Correct handling of the first and last post, with no empty link rendered.
- Related posts selected by tag overlap, capped at three.
- A post with no related posts renders nothing rather than an empty region.
- Unit tests cover the ordering logic including boundary cases.
- Server Component.

Validation.

```bash
yarn test
yarn build
```

Implementation evidence, 2026-09-18.

- The post layout delegates previous, next, and related links to a Server Component that renders post titles and returns nothing when no destinations exist.
- Pure content helpers prefer neighbors in the same series, fall back to chronological neighbors, and rank at most three related posts by tag overlap with a date tie-break.
- Focused unit tests cover series-first ordering, first and last boundaries, missing posts, related-post ranking, current-post exclusion, and the three-post cap.
- The one-post production route renders no empty navigation or related-post region.

Risks and rollback. With one post, most of this is untestable against real content. Unit-test the logic with fixtures instead. Rollback: revert the files.

### SINGULARITY-070 Rebuild the tags index

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P4                                                |
| Size       | S                                                 |
| Depends on | SINGULARITY-009, SINGULARITY-013, SINGULARITY-044 |
| Unlocks    | none                                              |
| Status     | Complete                                          |

Objective. Bring `/tags` onto the design system. The route was never assigned to a task, so it survived the transformation as untouched starter markup while every other surface moved.

Scope. The tags index page only. Non-goals: tag detail pages, which `SINGULARITY-044` already covers.

Files. `app/(site)/tags/page.tsx`.

Implementation notes. `Evidence`: the page carried `divide-gray-200`, `text-3xl font-extrabold`, and `md:leading-14`, none of which exist in the observatory scales, and it rendered each tag twice, once through the `Tag` component and once as a separate count link pointing at the same URL. Two adjacent links to one destination are a duplicate-link defect for screen-reader and keyboard users. Render one link per tag carrying both the name and the count.

Acceptance criteria.

- A single `h1` and a short description of the page's purpose.
- One link per tag, carrying the tag name and its post count.
- Tags ordered by count, with an alphabetical tie-break so ordering is stable between builds.
- Every link is at least 24 by 24 CSS pixels and shows a visible focus indicator.
- Empty state handled.
- No gray-ramp or default Tailwind type utility remains.

Validation.

```bash
yarn typecheck
yarn build
```

Implementation evidence, 2026-09-19.

- The page renders a display heading, a serif lead paragraph, and one bordered link per tag using the boundary, ink, and accent tokens.
- Ordering falls back to `localeCompare` when two tags share a count, which removes the previous build-to-build instability.
- The duplicate count link is gone; the count now sits inside the single tag link as muted tabular numerals.

Risks and rollback. Low. Rollback: revert the file.

## Phase P5: Optional integrations

Every task here is independently cuttable and none blocks launch.

### SINGULARITY-048 Dynamic Open Graph image generation

| Field      | Value                                                   |
| ---------- | ------------------------------------------------------- |
| Phase      | P5                                                      |
| Size       | M                                                       |
| Depends on | SINGULARITY-004, SINGULARITY-011                        |
| Unlocks    | none                                                    |
| Status     | Implementation complete; external preview check pending |

Objective. Generate a distinct social card per post and per project, replacing the single site-wide banner.

Scope. One prerendered route and the metadata wiring. Non-goals: per-page custom artwork.

Files. `app/og/[...slug]/route.tsx`, `app/seo.tsx`, `app/(site)/blog/[...slug]/page.tsx`, `app/(site)/projects/[slug]/page.tsx`.

Implementation notes. Follow whatever font-loading approach `SINGULARITY-004` proved. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) points every Open Graph and Twitter image at `siteMetadata.socialBanner`. Replace that per route while keeping a static default for pages with no dynamic card. The route declares `dynamic = 'force-static'` with `generateStaticParams`, so the cards are emitted at build time and the degraded export profile keeps working. Design the card to the observatory identity: title, a type label, and a wordmark. Titles must truncate gracefully rather than overflow.

Acceptance criteria.

- A distinct image renders for each post and project.
- Correct dimensions at 1200 by 630.
- Long titles truncate without overflow.
- The route is prerendered, so both the primary and degraded export builds emit every card.
- Metadata references the dynamic URL for posts and projects, and a static default elsewhere.
- The static default is a raster format that social platforms render.
- Verified in a social preview debugger for at least two URLs.

Validation.

```bash
yarn build
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Implementation evidence, 2026-09-19.

- One route resolves published posts and projects to distinct 1200 by 630 PNG cards. `dynamicParams` is disabled, so unknown slugs return a 404.
- Blog and project metadata reference canonical dynamic image URLs for Open Graph and Twitter. Other routes retain the static banner.
- The shipped Inter asset is WOFF2-only, which Satori rejects with `Unsupported OpenType signature wOF2`. The route therefore uses Satori's bundled sans face rather than adding a second font binary. A compatible static Inter TTF or WOFF subset remains a visual follow-up.
- Card colours now match the plate surface and the starlight accent rather than approximations of the starter palette.

Correction, 2026-09-19. The first implementation declared `runtime = 'edge'`, which made the route dynamic and broke `EXPORT=1 UNOPTIMIZED=1 yarn build` with `Failed to collect page data for /og/[...slug]`. That regressed a `SINGULARITY-003` and `SINGULARITY-069` exit criterion without either task being reopened. The route is now prerendered on the Node runtime and both build profiles pass, emitting four cards into `out/og/`.

Correction, 2026-09-19. `siteMetadata.socialBanner` pointed at an SVG. X, Facebook, LinkedIn, and Slack all reject SVG for Open Graph, so every route without a dynamic card had no preview image. The banner is now a 1200 by 630 PNG rasterised from the same artwork.

Risks and rollback. If `SINGULARITY-004` returned a negative verdict, withdraw this task and keep a small set of static section banners. Rollback: revert to the static banner.

### SINGULARITY-049 Scope and theme Giscus comments

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Phase      | P5                                                        |
| Size       | S                                                         |
| Depends on | SINGULARITY-041, SINGULARITY-069                          |
| Unlocks    | none                                                      |
| Status     | Implementation complete; deployment configuration pending |

Objective. Keep comments on blog posts only, preserve the click-to-load gate, and match the site theme.

Scope. Configuration and theming. Non-goals: a custom comment system.

Files. `components/blog/comments.tsx` moved, `data/site.ts`, `.env.example`.

Implementation notes. `Evidence`: `SINGULARITY-069` replaces the Pliny wrapper with official `@giscus/react` while preserving the existing button gate, which is both a performance and a privacy win. Do not auto-load. The legacy configuration in [data/siteMetadata.js](../../../data/siteMetadata.js) used `theme: 'light'` and `darkTheme: 'transparent_dark'`, which would clash with the observatory palette. Select closer built-in themes or host a custom Giscus theme stylesheet.

Comments must not appear on project pages, the resume, about, or uses.

Acceptance criteria.

- Comments render only on blog post routes.
- No iframe request occurs before the load button is clicked, verified in the network panel.
- Theme matches the site in both modes, and switches when the theme switches.
- Required environment variables documented in `.env.example`.
- Absent configuration degrades to no comments rather than an error.
- `frame-src giscus.app` still present in the policy.

Validation.

```bash
yarn build
yarn serve
```

Then check the network panel before and after clicking load.

Implementation evidence, 2026-09-19.

- The first-party wrapper now lives under `components/blog/` and is imported only by the blog post layout.
- Giscus remains unmounted until the visitor selects **Load comments**. Missing repository or category configuration renders no comment surface.
- The built-in `noborder_light` and `dark_dimmed` themes follow the resolved site theme without a separately hosted stylesheet.
- Focused tests cover the pre-click boundary, light and dark theme updates, and absent configuration.
- The four required deployment variables are documented in `.env.example`; the owner has not configured them yet. `frame-src giscus.app` remains in the policy.

Risks and rollback. Rollback: revert the file. Comments are non-essential.

### SINGULARITY-050 Wire Umami analytics

| Field      | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Phase      | P5                                                    |
| Size       | S                                                     |
| Depends on | SINGULARITY-020, SINGULARITY-069                      |
| Unlocks    | none                                                  |
| Status     | Implementation complete; enablement deferred by owner |

Objective. Enable page-view analytics with no custom events only after recording the deployment-specific privacy decision.

Scope. Configuration only. Non-goals: event tracking, a dashboard, any other provider.

Files. `data/site.ts`, `.env.example`, [next.config.js](../../../next.config.js).

Implementation notes. `Evidence`: [data/siteMetadata.js](../../../data/siteMetadata.js) currently configures Umami through `NEXT_UMAMI_ID`. `SINGULARITY-069` replaces Pliny's analytics wrapper with a first-party production-only Next.js `Script` component. This task supplies and validates the final deployment configuration. The policy in [next.config.js](../../../next.config.js) already allowlists `analytics.umami.is` in `script-src`, but `connect-src` is being narrowed in `SINGULARITY-060`, so the beacon origin must be added there explicitly. Before enablement, record whether Umami is self-hosted or hosted, the request data processed, retention, applicable jurisdiction, and whether a notice or consent mechanism is required. Cookieless does not mean anonymous.

`Recommendation` from [architecture.md](architecture.md): page views only. Adding custom events changes the privacy analysis and would require revisiting the no-consent-banner conclusion.

Acceptance criteria.

- Page views recorded on a deployed preview.
- No cookies set, verified in browser storage.
- No custom events.
- Hosting mode, processed request fields, retention, jurisdiction, and the resulting notice or consent decision are recorded.
- Absent environment variable results in no script being loaded and no console error.
- The policy permits both the script and the beacon origin.
- Analytics adds no more than 2 KB gzipped.

Validation.

```bash
yarn build
```

Then deploy a preview and confirm both the beacon and the absence of cookies.

Implementation evidence and privacy decision, 2026-09-19.

- The owner deferred Umami for this release. No hosting mode, retention period, or processing jurisdiction is selected, and no notice or consent determination is required while the website ID remains unset.
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is the explicit enablement gate. Without it, production renders no analytics script and emits no console error.
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` supports Umami Cloud or a future self-hosted deployment. The configured script origin is included explicitly in both `script-src` and `connect-src`.
- The integration enables automatic page views only and declares no custom events. Focused tests cover disabled, development, and configured-production states.
- The retired analytics, comment-provider, and newsletter variables were removed from `.env.example`.
- Preview beacon, cookie, retention, jurisdiction, and transfer checks remain mandatory before setting the website ID.

Risks and rollback. Rollback: unset the environment variable. Nothing else depends on it.

### SINGULARITY-051 Verify and restyle local search

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P5                                                |
| Size       | S                                                 |
| Depends on | SINGULARITY-015, SINGULARITY-045, SINGULARITY-069 |
| Unlocks    | none                                              |
| Status     | Complete                                          |

Objective. Verify the `cmdk` and MiniSearch replacement from `SINGULARITY-069` against the final content index and restyle it to the observatory tokens.

Scope. Styling, result tuning, and verification. Non-goals: adding a hosted search service.

Files. `components/layout/search-button.tsx` moved, `data/site.ts`, [css/tailwind.css](../../../css/tailwind.css).

Implementation notes. `SINGULARITY-003` generates `public/search.json` as an explicit engine-independent artifact, and `SINGULARITY-069` supplies the first-party dialog and MiniSearch adapter. Tune field boosts so title and project name rank above body text. Keep the result payload bounded and load it only when search first opens. All styling belongs to Singularity; no third-party Tailwind source directive remains.

`Recommendation`: add project entries to the palette alongside posts, since a visitor searching for a project name should find it. This may require extending the generated index.

Acceptance criteria.

- The palette opens by keyboard shortcut and by button click.
- Results return from the regenerated index.
- Styled to the new tokens in both themes.
- Focus is trapped while open and restored on close.
- Escape closes it.
- Contrast within the palette meets the thresholds.
- No Pliny or Algolia import, stylesheet, configuration, or Tailwind source directive exists.

Validation.

```bash
yarn build
yarn serve
```

Implementation evidence, 2026-09-19.

- The generated local index contains both posts and projects, title matches receive the highest boost, and result sets remain capped at eight.
- The dialog retains deferred loading, keyboard and button entry, Escape handling, focus restoration, and project lookup under focused unit coverage.
- Dialog surfaces, boundaries, text, selection, and focus styling now use observatory semantic tokens in both themes.
- Desktop and 390-pixel browser checks confirmed that the responsive dialog remains within the viewport without text overlap.

Correction, 2026-09-19. The dialog was deferred in data but not in code. `SearchProvider` sat in the shell layout and imported `cmdk` and MiniSearch statically, so their JavaScript shipped on every route even though the index fetch waited for first open. The provider is now a small client shell that owns the shortcut, open state, and focus restoration, and `components/search/command-menu.tsx` holds the dialog behind `React.lazy`. The libraries land in a chunk that no route loads on first paint.

Risks and rollback. Extending the index to include projects may require changes to the selected engine's transform or the explicit artifact script from `SINGULARITY-003`. If that grows, ship posts-only search and record the project-search gap. Rollback: revert styling and ranking changes, not the P0 replacement.

### SINGULARITY-052 Extend structured data

| Field      | Value                                                |
| ---------- | ---------------------------------------------------- |
| Phase      | P5                                                   |
| Size       | M                                                    |
| Depends on | SINGULARITY-020, SINGULARITY-028                     |
| Unlocks    | none                                                 |
| Status     | Implementation complete; external validation pending |

Objective. Extend JSON-LD beyond blog posts so that a search for Matthew's name resolves to the correct entity.

Scope. Four schema types. Non-goals: speculative schema types with no search benefit.

Files. `lib/seo.ts`, `app/(site)/layout.tsx`, `app/(site)/about/page.tsx`, `app/(site)/resume/page.tsx`, `app/(site)/projects/[slug]/page.tsx`.

Implementation notes. `Evidence`: the baseline [contentlayer.config.ts](../../../contentlayer.config.ts) computes `structuredData` as `BlogPosting` for posts only, and `SINGULARITY-003` preserves that derived field in the selected engine. Add `WebSite` in the site layout, `Person` on about and resume, and `BreadcrumbList` on nested routes. `Person` is the one that matters most, because it is what links the name, the role, the education, and the social profiles into a single entity for a name query.

Do not add `Organization` or `JobPosting`. They do not apply and speculative markup is a liability.

Acceptance criteria.

- All four types emitted on their correct routes.
- Every graph validates in the Rich Results Test with zero errors.
- `Person` includes name, job title, education, and `sameAs` social profiles.
- No phone number in any structured data.
- `BreadcrumbList` matches the actual navigation hierarchy.
- No duplicate `WebSite` graph on any page.

Validation.

```bash
yarn build
yarn serve
```

Then validate each route in the Rich Results Test.

Implementation evidence, 2026-09-19.

- Typed first-party builders now produce `WebSite`, `Person`, and `BreadcrumbList` graphs with canonical absolute URLs. Existing content generation continues to own `BlogPosting`.
- The site layout emits one `WebSite` graph. About and resume emit `Person`; blog posts and project details emit navigation-accurate breadcrumbs.
- `Person.sameAs` publishes the owner-approved GitHub and LinkedIn profiles, includes job title and education, and contains no telephone field.
- Focused tests cover canonical website identity, breadcrumb order, approved person fields, dynamic image URLs, and absence of telephone data.
- Production HTML contains the expected `WebSite` and `BreadcrumbList` graphs. Rich Results Test validation remains deployment-dependent.

Risks and rollback. `sameAs` on `Person` publishes social profiles as machine-readable links, which is intended but should be a conscious choice. Rollback: revert `lib/seo.ts`.

## Phase P6: Quality hardening

### SINGULARITY-053 Expand unit-test coverage

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P6              |
| Size       | M               |
| Depends on | SINGULARITY-008 |
| Unlocks    | SINGULARITY-059 |

Objective. Expand the real Vitest foundation from `SINGULARITY-008` to cover the pure logic that the finished site depends on.

Scope. Tests for `lib/`, data validators, and primitive behavior, plus narrow configuration refinements if a new module needs them. Non-goals: component snapshot tests, which are low value and high churn.

Files. `tests/unit/`, and `vitest.config.ts` only if an alias or environment refinement is required.

Implementation notes. Target the pure functions: date and period formatting in `lib/format.ts`, related-post and series ordering in `lib/content.ts`, the class merge helper, the data validators from `SINGULARITY-028`, and the primitive variant logic.

`Recommendation`: no snapshot tests. They pass until someone changes whitespace, then everyone updates them without reading. Assert behaviour.

Acceptance criteria.

- `yarn test` runs and passes.
- Every function in `lib/` has at least one test covering a boundary case.
- Data validators are tested with both valid and invalid input.
- No snapshot tests.
- Test run completes in under 10 seconds.
- Path aliases resolve inside tests.

Validation.

```bash
yarn test
yarn typecheck
```

Risks and rollback. Vitest needs the same path aliases as `tsconfig.json`, which is the usual first failure. Rollback: revert the config.

### SINGULARITY-054 Playwright setup

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P6                               |
| Size       | M                                |
| Depends on | all routes existing              |
| Unlocks    | SINGULARITY-055, SINGULARITY-056 |

Objective. Install end-to-end testing against a production build.

Scope. Configuration and one smoke test. Non-goals: the journey specs, which are `SINGULARITY-055`.

Files. `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, [package.json](../../../package.json), `.gitignore`.

Implementation notes. Test against `yarn build` output served by `yarn serve`, never against the development server, because development-mode behaviour differs in ways that matter, particularly around the policy and font loading. Configure a desktop Chromium project and a mobile Safari project, since journey J1 is explicitly a phone journey. `Evidence`: `trailingSlash: true` in [next.config.js](../../../next.config.js) means every URL in a test must carry a trailing slash or the navigation will redirect and confuse assertions.

Acceptance criteria.

- `yarn test:e2e` builds, serves, runs, and tears down cleanly.
- Two projects configured: desktop Chromium and mobile Safari.
- A smoke test loads every top-level route and asserts a 200 and an `h1`.
- Trailing-slash behaviour handled consistently.
- Artifacts are git-ignored.
- Runs headless in continuous integration and headed locally.

Validation.

```bash
yarn test:e2e
```

Risks and rollback. Browser downloads make the first continuous integration run slow; cache them. Rollback: revert the config.

### SINGULARITY-055 Journey end-to-end specs

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P6              |
| Size       | L               |
| Depends on | SINGULARITY-054 |
| Unlocks    | SINGULARITY-059 |

Objective. Encode journeys J1 through J5 as executable specifications, so that a regression in the site's purpose fails the build.

Scope. Five specs, one per journey. Non-goals: exhaustive coverage of every page.

Files. `tests/e2e/j1-screen.spec.ts` through `tests/e2e/j5-authoring.spec.ts`.

Implementation notes. Journey definitions are in [product-and-design.md](product-and-design.md). J1 asserts that name, positioning statement, status, and actions are all within the initial viewport at 375 by 667 without scrolling, which is checked with a bounding-box assertion, not a screenshot. J2 asserts that a project page states role, timeframe, stack, and outcome above the case study body. J3 asserts a post renders code, mathematics, and figures, and that no comment iframe loads before a click. J4 asserts the resume is reachable in two clicks from any page and that the download attribute is present. J5 is a build-level assertion that a new MDX fixture appears in the list, the feed, and the search index after a build.

Also assert the negative: no North American phone-number pattern appears in the rendered HTML of any route. Use a generic detector rather than embedding the known number in the test. That is a privacy regression test and it is cheap.

Keep at most four reviewed visual baselines for stable, journey-critical regions: the J1 initial mobile viewport, the project metadata block, a representative prose block in light mode, and the same prose block in dark mode. Mask dates or other volatile content. All other layout assertions use roles, text, and bounding boxes. Baseline updates require human review of the rendered difference.

Acceptance criteria.

- One spec per journey, named for the journey.
- J1 asserts above-the-fold placement with bounding boxes at 375 by 667.
- J3 asserts no comment iframe request before a click.
- J4 asserts the download attribute and the two-click path.
- A privacy assertion confirms no phone number in any rendered route.
- No more than four named screenshot baselines exist, each scoped to a stable region rather than a full scrolling page.
- A deliberate visual change fails the relevant screenshot assertion, and baseline updates are reviewed rather than generated automatically in continuous integration.
- All specs pass against a production build.
- Total end-to-end run under 3 minutes.

Validation.

```bash
yarn build
yarn test:e2e
```

Risks and rollback. Above-the-fold assertions are brittle against copy changes. Assert visibility within the viewport, not exact pixel positions. Rollback: mark a failing spec skipped with a linked issue rather than deleting it.

### SINGULARITY-056 Accessibility test suite

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P6                               |
| Size       | M                                |
| Depends on | SINGULARITY-022, SINGULARITY-054 |
| Unlocks    | SINGULARITY-059                  |

Objective. Assert zero serious or critical accessibility violations on every route, in both themes.

Scope. Automated axe scanning plus targeted keyboard assertions. Non-goals: replacing the manual checklist, which catches what axe cannot.

Files. `tests/a11y/`, [package.json](../../../package.json).

Implementation notes. Automated tools catch roughly a third of real accessibility problems, so pair axe with explicit keyboard assertions for the things it misses: skip-link focus movement, mobile navigation focus trapping and restoration, and the code-group tab pattern.

Scan every route in both themes, since contrast violations are theme-specific and a light-mode-only scan misses half of them.

Acceptance criteria.

- Every route scanned in both themes.
- Zero serious or critical violations.
- Moderate violations are listed and either fixed or explicitly accepted with a reason.
- A keyboard test asserts the skip link moves `document.activeElement`.
- A keyboard test asserts the mobile navigation traps focus and restores it on close.
- Failures name the element and the rule.

Validation.

```bash
yarn test:a11y
```

Risks and rollback. Third-party iframes such as Giscus will produce violations that cannot be fixed here. Exclude the iframe from the scan and note it. Rollback: not applicable; failures are fixed, not reverted.

### SINGULARITY-057 Client boundary guard

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P6              |
| Size       | S               |
| Depends on | SINGULARITY-018 |
| Unlocks    | SINGULARITY-059 |

Objective. Prevent the most likely architectural regression: a well-meaning change adding `'use client'` high in the component tree.

Scope. One check plus its allowlist. Non-goals: a general architecture linter.

Files. `scripts/check-client-boundary.mjs`, [package.json](../../../package.json).

Implementation notes. `Evidence`: the baseline is seven client components, and [architecture.md](architecture.md) permits exactly eleven after the transformation. The check scans for the directive and fails if any file outside the allowlist carries it. The allowlist lives in the script with a comment explaining each entry, so adding one is a deliberate, reviewable act.

Acceptance criteria.

- Fails when an unlisted file gains the directive.
- Passes on the current tree.
- The failure message names the file and links to the architecture rule.
- The allowlist has exactly the eleven permitted entries, each with a comment.
- Runs in under 2 seconds.
- Wired into continuous integration.

Validation.

```bash
node scripts/check-client-boundary.mjs
```

Then add the directive to a test file and confirm it fails.

Risks and rollback. A guard that is too easy to satisfy by editing the allowlist is theatre. The comment requirement is the friction that makes it meaningful. Rollback: remove from continuous integration.

### SINGULARITY-058 Lighthouse CI and performance budgets

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P6                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-001, SINGULARITY-054, SINGULARITY-062 |
| Unlocks    | SINGULARITY-059                                   |

Objective. Turn the budgets in [README.md](README.md) from stated targets into enforced gates.

Scope. Lighthouse CI configuration with assertions plus production-only Vercel Speed Insights instrumentation for field Interaction to Next Paint. Non-goals: fixing regressions, which are separate tasks.

Files. `lighthouserc.json`, [package.json](../../../package.json), [app/layout.tsx](../../../app/layout.tsx).

Implementation notes. Configure assertions, not just collection. A score report that nobody reads is not a budget. Run against four representative routes: the home page, a blog post, a project detail page, and the resume. Use the mobile preset with throttling, matching how J1 actually happens. Take three runs and use the median, because single Lighthouse runs are noisy enough to produce false failures.

Thresholds come directly from the table in [README.md](README.md). Lighthouse asserts Total Blocking Time, not Interaction to Next Paint. Install Vercel Speed Insights as production-only field instrumentation and record its privacy characteristics before enablement; `SINGULARITY-068` evaluates the 75th-percentile INP after enough real traffic exists.

Acceptance criteria.

- Four routes configured.
- Assertions for performance, accessibility, Largest Contentful Paint, Cumulative Layout Shift, Total Blocking Time, and total byte weight.
- Accessibility asserted at 100, not merely reported.
- Three runs with median aggregation.
- The build fails on assertion failure.
- Vercel Speed Insights is loaded only in production, collects no data in local or preview checks, and its data processing and notice decision are recorded.
- Passes against the current site, or the gaps are listed as follow-up tasks.

Validation.

```bash
yarn build
npx lhci autorun
```

Risks and rollback. Continuous integration runners are slower and noisier than local machines, which produces flaky failures. Tune thresholds against observed runner variance, and do not weaken them below the stated budgets without recording the reason. Rollback: switch assertions to warnings temporarily, with an issue.

### SINGULARITY-059 Continuous integration workflow

| Field      | Value                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Phase      | P6                                                                                                                    |
| Size       | M                                                                                                                     |
| Depends on | SINGULARITY-008, SINGULARITY-053, SINGULARITY-055, SINGULARITY-056, SINGULARITY-057, SINGULARITY-058, SINGULARITY-061 |
| Unlocks    | SINGULARITY-067                                                                                                       |

Objective. Run every quality gate automatically on every pull request. The repository currently has no quality gate at all.

Scope. One workflow. Non-goals: deployment, which Vercel handles.

Files. `.github/workflows/ci.yml`, `.github/workflows/pages.yml`.

Implementation notes. `Evidence`: the only existing workflow deploys to GitHub Pages. Per decision A1, demote it to `workflow_dispatch` so it remains available as a fallback but does not run on every push.

Order the jobs so that cheap checks fail fast: lint, format, and typecheck first; then unit tests; then build; then end-to-end, accessibility, and Lighthouse against the build output. Cache Yarn and Playwright browsers. Cache the selected engine's generated output only if its documentation supports reusable caches, and key it on configuration, lockfile, and content hashes so stale generated data cannot survive a schema or content change.

Acceptance criteria.

- Runs on pull request and on push to the default branch.
- All ten checks run: lint, format, typecheck, unit, build, end-to-end, accessibility, Lighthouse, client boundary, and link and content integrity.
- Cheap checks fail fast before expensive ones start.
- Yarn and Playwright caches are effective on a second run.
- Total duration under 10 minutes.
- The Pages workflow no longer runs automatically.
- A failing gate blocks the merge.

Validation.

Open a pull request with a deliberate lint error and confirm the run fails at the lint job.

Risks and rollback. Yarn 3 with a `.yarn` directory needs the right cache configuration or continuous integration will reinstall everything each run. Rollback: disable the workflow.

### SINGULARITY-060 Tighten the Content Security Policy

| Field      | Value                       |
| ---------- | --------------------------- |
| Phase      | P6                          |
| Size       | M                           |
| Depends on | a deployed preview existing |
| Unlocks    | SINGULARITY-067             |

Objective. Narrow the policy from the starter's permissive defaults to the target in [architecture.md](architecture.md).

Scope. Header configuration and verification against a real deployment. Non-goals: nonce-based script injection, which forfeits static generation.

Files. [next.config.js](../../../next.config.js).

Implementation notes. The target directive table is in [architecture.md](architecture.md). The important narrowings are `connect-src` from `*` to `'self'` plus the Umami beacon, `img-src` from `*`, and `media-src` to `'none'`. Add `frame-ancestors`, `base-uri`, `form-action`, and `object-src`.

`Assumption` that must be verified rather than assumed: `unsafe-eval` can be removed from production. Next.js requires it in development, so the policy must branch on `NODE_ENV`. A broken production policy silently disables interactivity, which is why this is verified against a deployed preview and not only locally.

`Recommendation`: `unsafe-inline` in `script-src` stays. Removing it needs nonces, which need middleware, which forfeits full static generation. Document the acceptance rather than pretending it is resolved.

Acceptance criteria.

- Every directive matches the target table.
- No policy violations in the console on any route of a deployed preview.
- Giscus still loads after a click.
- Umami still reports.
- kbar still works.
- Fonts still load with `font-src 'self'`.
- Development mode still works with the permissive branch.
- The `unsafe-inline` acceptance is documented in a comment.

Validation.

```bash
yarn build
```

Then deploy a preview and walk every route with the console open.

Risks and rollback. A too-narrow `connect-src` breaks analytics silently, since a blocked beacon produces no visible symptom. Check the console explicitly. Rollback: revert to the previous policy string.

### SINGULARITY-061 Internal link and content-integrity checker

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P6                               |
| Size       | S                                |
| Depends on | SINGULARITY-036, SINGULARITY-045 |
| Unlocks    | SINGULARITY-059                  |

Objective. Prevent broken links, anchors, and project-to-MDX references after a slug or content change.

Scope. Internal links, heading anchors, project case-study references, generated search records, sitemap entries, and feed entries. Non-goals: fetching external links, which is flaky and rate-limited.

Files. `scripts/check-links.mjs`, [package.json](../../../package.json).

Implementation notes. Run against the built output. Extract every internal `href`, resolve it against the generated route list, and verify that fragment identifiers match a heading identifier that `rehype-slug` actually produced. Invoke the bidirectional project and case-study validator from `SINGULARITY-028`, then confirm every published content item appears where expected in search, sitemap, and feeds. `Evidence`: `trailingSlash: true` in [next.config.js](../../../next.config.js) means the checker must normalize trailing slashes or it will report false failures on every link.

Acceptance criteria.

- Every internal link resolves to a real route.
- Every fragment resolves to a real heading identifier.
- Every project `caseStudy` value resolves to one MDX document, and no orphan project MDX document exists.
- Every published post appears once in search, sitemap, and the main feed; drafts and templates appear in none.
- Trailing slashes normalized.
- External links are reported as a count but not fetched.
- Failure output names the source file, the link, and the reason.
- Runs in under 30 seconds.

Validation.

```bash
yarn build
node scripts/check-links.mjs
```

Risks and rollback. Rollback: remove from continuous integration.

### SINGULARITY-062 Image optimization pass

| Field      | Value                            |
| ---------- | -------------------------------- |
| Phase      | P6                               |
| Size       | M                                |
| Depends on | SINGULARITY-035, SINGULARITY-037 |
| Unlocks    | SINGULARITY-058                  |

Objective. Bring every image within budget with correct dimensions, formats, and loading behaviour.

Scope. All images in `public/static/images/`. Non-goals: an image content delivery network.

Files. `public/static/images/`, and any component setting image props.

Implementation notes. Every image needs explicit width and height to prevent layout shift, which the existing [components/Image.tsx](../../../components/Image.tsx) wrapper supports since it passes through to `next/image`. Serve modern formats with fallbacks. Only above-the-fold images get `priority`; everything else stays lazy. `Evidence`: [next.config.js](../../../next.config.js) allows remote images from `picsum.photos`, which is a starter artifact and should be removed once no content references it.

Per-page image payload budget is 400 KB, matching the case study criterion in `SINGULARITY-037`.

Acceptance criteria.

- Every image has explicit dimensions.
- Modern formats served with fallbacks.
- Only above-the-fold images marked priority.
- Per-page image payload at or under 400 KB.
- Measured Cumulative Layout Shift from images is 0.
- The `picsum.photos` remote pattern is removed.
- Every image has appropriate alternative text, empty for decorative.

Validation.

```bash
yarn build
yarn serve
```

Then run Lighthouse and check the network panel for image weight.

Risks and rollback. Rollback: restore the original images.

## Phase P7: Launch readiness

### SINGULARITY-063 Favicons, manifest, and theme colours

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P7              |
| Size       | S               |
| Depends on | SINGULARITY-009 |
| Unlocks    | SINGULARITY-067 |

Objective. Replace the starter's browser identity with Singularity's.

Scope. Favicon set, web manifest, and theme colour meta tags. Non-goals: a full brand identity system.

Files. `public/static/favicons/`, `app/layout.tsx`.

Implementation notes. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) hardcodes links for the apple touch icon, two PNG favicons, the manifest, a mask icon with `color="#5bbad5"`, an msapplication tile colour, and a theme-colour pair. All of those values are starter defaults and must be updated together. The mask icon colour and the manifest colours are easy to miss.

The mark should work at 16 pixels. An observatory-derived form, a star, an aperture, or a crosshair, survives that size; a wordmark does not.

Acceptance criteria.

- Complete favicon set regenerated.
- `site.webmanifest` carries the correct name, short name, and colours.
- Theme colour meta tags match the void and plate surfaces.
- Mask icon colour updated from the starter default.
- The mark is legible at 16 pixels.
- No starter favicon remains.
- The manifest validates.

Validation.

```bash
yarn build
yarn serve
```

Then inspect the browser tab, install as a progressive web application, and validate the manifest.

Risks and rollback. Rollback: restore the previous asset set.

### SINGULARITY-064 Sitemap, robots, and feed coverage

| Field      | Value               |
| ---------- | ------------------- |
| Phase      | P7                  |
| Size       | S                   |
| Depends on | all routes existing |
| Unlocks    | SINGULARITY-067     |

Objective. Ensure discovery artifacts cover every route and exclude everything that should not be indexed.

Scope. Sitemap, robots, and RSS. Non-goals: search console setup.

Files. `app/sitemap.ts`, `app/robots.ts`, [scripts/rss.mjs](../../../scripts/rss.mjs).

Implementation notes. `Evidence`: [app/sitemap.ts](../../../app/sitemap.ts) currently lists `/`, `/blog`, `/projects`, and `/tags` plus post routes. It must add `/about`, `/resume`, `/uses`, and every project detail route. Drafts must stay excluded. `Evidence`: [scripts/rss.mjs](../../../scripts/rss.mjs) generates the main feed and per-tag feeds and already filters drafts; verify it still runs after the `data/site.ts` migration in `SINGULARITY-020`.

Acceptance criteria.

- Sitemap includes every public route including project detail pages.
- Drafts and the template are excluded from the sitemap, the feeds, and the search index.
- `lastModified` reflects real content dates.
- Robots allows crawling and points at the sitemap.
- The main feed and per-tag feeds generate and validate.
- No `BASE_PATH` artifacts in any generated URL.

Validation.

```bash
yarn build
```

Then inspect `public/feed.xml` and request `/sitemap.xml` and `/robots.txt`.

Risks and rollback. Rollback: revert the files.

### SINGULARITY-065 Production domain and deployment configuration

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P7              |
| Size       | M               |
| Depends on | OQ-2 resolved   |
| Unlocks    | SINGULARITY-067 |

Objective. Configure the production domain and environment so that canonical URLs, feeds, and social cards all point at the real site.

Scope. Domain, environment variables, and redirects. Non-goals: a content delivery network beyond Vercel's default.

Files. `data/site.ts`, Vercel project settings, `.env.example`.

Implementation notes. `Evidence`: `siteUrl` is currently the starter's Vercel demo URL, and it feeds canonical URLs, Open Graph URLs, the sitemap, the feeds, and the structured data. A wrong value here breaks all of them at once. Configure a redirect from the apex to the canonical host, or the reverse, and pick one so that duplicate content does not split signals. Confirm no `BASE_PATH` is set in production, since it exists only for the GitHub Pages fallback and would corrupt every URL if left set.

Acceptance criteria.

- Domain resolves over HTTPS with a valid certificate.
- `siteUrl` matches the production domain.
- One canonical host, with the other redirecting permanently.
- No `BASE_PATH` set in production.
- Canonical tags, feed URLs, sitemap URLs, and Open Graph URLs all use the production domain.
- Security headers present on the production response.
- Preview deployments carry `noindex`.

Validation.

Deploy to production, then inspect response headers and view source on three routes to confirm canonical URLs.

Risks and rollback. Preview deployments being indexed is a real and common problem that splits search signals. Verify the `noindex` behaviour explicitly. Rollback: revert the domain assignment.

### SINGULARITY-066 Content, licensing, and attribution audit

| Field      | Value                                             |
| ---------- | ------------------------------------------------- |
| Phase      | P7                                                |
| Size       | M                                                 |
| Depends on | SINGULARITY-025, SINGULARITY-031, SINGULARITY-037 |
| Unlocks    | SINGULARITY-067                                   |

Objective. Verify every published word and asset before launch: accuracy, rights, and privacy.

Scope. A full audit of copy, assets, and licences. Non-goals: writing new content.

Files. None modified unless the audit finds problems.

Implementation notes. Three separate passes, because they catch different things.

Accuracy: every claim on the site is checked against the resume and against reality. Dates, titles, organizations, award names, and outcomes. A wrong date on a portfolio is a credibility failure.

Rights: every image, font, and icon has a recorded licence and, where required, an attribution. The upstream MIT notice from `LICENSE` must still be present and credited per `SINGULARITY-025`. Confirm that nothing was copied from `enscribe.dev`, whose site-specific code and design are reserved, or from `aarabii/An`, whose custom licence permits personal portfolio use but restricts redistribution and paid client delivery. Singularity treats both as inspiration only, as documented in [research.md](research.md).

Privacy: scan the repository tree and the entire built output for generic phone-number patterns and other unintended personal data. Include Markdown, source maps, generated search data, PDFs, and document metadata. Exclude dependency and build-cache directories only after documenting them.

Acceptance criteria.

- Every date, title, and organization verified against the resume.
- Every award name stated exactly.
- Every asset has a recorded licence in an assets manifest.
- Required attributions present.
- The upstream MIT notice retained and credited.
- Written confirmation that no code, design, content, or asset came from the two inspiration-only references.
- A search of the built output finds no phone number.
- No placeholder text, no lorem ipsum, no starter copy anywhere.
- Spelling and grammar pass on every page.

Validation.

```bash
yarn build
```

Then run the generic sensitive-data scanner over the repository and build output, and search for "Tails Azimuth" and "TailwindBlog".

Risks and rollback. This is the last defence against publishing a factual error or an unlicensed asset. Do not compress it. Rollback: not applicable; findings are fixed.

### SINGULARITY-067 Launch checklist and rollback rehearsal

| Field      | Value                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Phase      | P7                                                                                                   |
| Size       | M                                                                                                    |
| Depends on | SINGULARITY-059, SINGULARITY-060, SINGULARITY-063, SINGULARITY-064, SINGULARITY-065, SINGULARITY-066 |
| Unlocks    | SINGULARITY-068                                                                                      |

Objective. Execute the final manual pass and prove that rollback works before it is needed.

Scope. The manual checklist from [roadmap.md](roadmap.md), plus one rehearsed rollback. Non-goals: new features.

Files. A new `docs/planning/singularity/launch-checklist.md`.

Implementation notes. Every item on the manual checklist in [roadmap.md](roadmap.md) is executed and recorded, including the one that cannot be automated: asking someone unfamiliar with the site to describe what Matthew does after sixty seconds on the home page. That is the real acceptance test for the whole project.

Rehearse the rollback rather than documenting it. Promote a previous Vercel deployment, confirm the site serves correctly, then promote back. An untested rollback is an assumption.

Acceptance criteria.

- Every manual checklist item executed and recorded with a pass or fail.
- Tested on a real phone over a real cellular connection, not an emulator.
- Tested with JavaScript disabled.
- Tested with the operating system reduced-motion setting on.
- Tested at 200 percent browser zoom.
- The unfamiliar-reader test conducted and the response recorded verbatim.
- Rollback performed and reversed successfully.
- Any failure either fixed or recorded as a known issue with an owner.

Validation.

Manual, following the recorded checklist.

Risks and rollback. If the unfamiliar-reader test fails, the home page copy needs revision, which is a content change rather than a build change and should not delay launch beyond one iteration.

### SINGULARITY-068 Post-launch monitoring

| Field      | Value           |
| ---------- | --------------- |
| Phase      | P7              |
| Size       | S               |
| Depends on | SINGULARITY-067 |
| Unlocks    | none            |

Objective. Confirm the live site behaves as expected and set up the small amount of ongoing observation that a static site warrants.

Scope. Verification and monitoring setup. Non-goals: an alerting stack.

Files. A new `docs/planning/singularity/post-launch.md`.

Implementation notes. Confirm indexing has begun, that optional Umami page views arrive if it was enabled, and that Vercel Speed Insights is receiving field Core Web Vitals. Compare field results with Lighthouse without treating them as equivalent measurements. Record 75th-percentile INP after the dashboard has enough production samples to report it; if sample volume is insufficient, record that state rather than claiming the target passed. Check for policy violations.

Set a calendar reminder to review the deferred decisions in [risks-and-decisions.md](risks-and-decisions.md) after three months, when there is enough data to resolve `OQ-3` on the `/uses` navigation slot.

Acceptance criteria.

- Sitemap submitted and indexing confirmed.
- Umami receiving page views.
- Vercel Speed Insights is named as the field source, with its reporting window and sample sufficiency recorded.
- The 75th-percentile field INP is recorded against the 200-millisecond target when sufficient data exists.
- Real-user Core Web Vitals are compared with laboratory metrics without combining them into one pass or fail result.
- No policy violations reported.
- Social cards verified on at least two platforms.
- A three-month review reminder set.
- Any divergence between laboratory and field metrics recorded with a hypothesis.

Validation.

Manual verification against the live site.

Risks and rollback. None.
