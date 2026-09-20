---
title: Singularity Architecture
description: Architectural decisions with alternatives, target file tree, rendering strategy, data flows, and security and privacy design for Singularity
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: concept
keywords:
  - architecture
  - rendering strategy
  - file tree
  - security
estimated_reading_time: 28
---

## Decisions

Each decision records what is proposed, what was rejected, and what would reverse it. Decisions D1 through D18 become locked only after owner confirmation at the P0 entry gate; [risks-and-decisions.md](risks-and-decisions.md) records their provenance and confirmation state.

### A1: Deploy on Vercel, Node runtime

Chosen: Vercel with the default Node runtime. A degraded static-export profile stays documented and executable as a recovery option.

Rejected: GitHub Pages static export, which is the currently configured deployment. `Evidence`: [next.config.js](../../../next.config.js) reads `EXPORT`, `BASE_PATH`, and `UNOPTIMIZED`, and a Pages workflow exists.

Static export forfeits four things Singularity needs. `next/image` optimization is disabled, which forces manual responsive image generation for every project screenshot. Dynamic Open Graph image generation through `next/og` is impossible, so social previews stay a single static banner. Route handlers do not run, which is why [app/api/newsletter/route.ts](../../../app/api/newsletter/route.ts) is already marked `force-static` and does nothing. Response headers, including the Content Security Policy defined in [next.config.js](../../../next.config.js), are not emitted at all, because Pages serves static files and ignores the `headers()` function.

That last point is the decisive one. The security posture the starter already implements is silently inert under the current deployment target.

The degraded profile is invoked with `EXPORT=1 UNOPTIMIZED=1 yarn build` and has an explicit contract:

- It includes every required content route, local search artifacts, sitemap, robots, and feeds.
- It uses the static default social image and excludes the conditional `/og/[...slug]` route.
- It uses unoptimized images and therefore retains the source image dimensions and formats.
- It does not claim response-header security controls, because a static host must configure equivalent headers separately.
- It excludes Giscus and Umami unless the chosen static host is configured and reviewed for them.

`SINGULARITY-002` verifies both the primary build and this profile before P1. The manually dispatched Pages workflow re-runs the static-export build, so the fallback cannot silently decay.

Reversal trigger: if Vercel's free tier limits become a problem, promote a build that passed the degraded-profile check. Cost of reversal: lose dynamic Open Graph images, image optimization, and application-defined response headers.

### A2: Migrate to Content Collections or Velite before P1

Chosen: require the owner to select Content Collections or Velite in `SINGULARITY-002`, then complete the migration in `SINGULARITY-003`. `Recommendation`: select Content Collections because its first-party Next.js adapter, modular MDX package, multi-contributor maintenance, and worked migration from this starter lineage fit Singularity best.

Velite remains a valid owner-selectable alternative. Its single package includes MDX, asset handling, image processing, schemas, hooks, and generated types, but its Next.js integration requires custom process wiring and its documentation warns of incomplete areas and possible significant changes. Content Collections requires more explicit package and artifact configuration, but its narrower modules give the Next.js integration a clearer ownership boundary. [tasks.md](tasks.md) records the full pros-and-cons comparison and decision procedure.

Rejected: retaining `contentlayer2` or choosing an engine without owner approval.

`Evidence`: the baseline pipeline in [contentlayer.config.ts](../../../contentlayer.config.ts) is 180 lines covering six remark plugins, seven rehype plugins, reading time, table of contents, JSON-LD, tag counting, and search indexing. Those behaviors are migration acceptance criteria, not reasons to keep an unmaintained architecture. Contentlayer2 also pins `esbuild` to exactly `0.27.3` and requires `INIT_CWD` workarounds in [package.json](../../../package.json).

Reversal trigger: if the selected engine fails schema, MDX, watch-mode, clean-build, degraded-export, or Vercel-preview checks, the owner may amend the decision to the other approved candidate. Contentlayer2 is not a fallback, and P1 remains blocked until one replacement passes.

### A3: Replace Pliny by responsibility

Chosen: remove `pliny` in `SINGULARITY-069` and replace only the behavior Singularity uses. Use `cmdk` plus MiniSearch for local command search, official `@giscus/react` behind the existing click-to-load boundary, a first-party Next.js `Script` integration for Umami, the selected engine's MDX renderer, `Intl.DateTimeFormat`, `entities.encodeXML`, and small typed first-party content and presentation helpers.

Rejected: retaining Pliny selectively or replacing it with another umbrella package. The package spans unrelated responsibilities, so another monolith would preserve the same maintenance and ownership problem.

`Evidence`: [contentlayer.config.ts](../../../contentlayer.config.ts) imports four Pliny MDX plugins, while [components/MDXComponents.tsx](../../../components/MDXComponents.tsx) and the broader repository use its rendering, search, comments, analytics, formatting, feed, and layout helpers. Removal is therefore a mandatory migration with focused behavior tests, not a dependency deletion.

The newsletter API, components, environment variables, and MDX registration are deleted without replacement. P1 remains blocked until repository and dependency scans return zero Pliny references.

### A4: One consolidated post layout

Chosen: a single `PostLayout` with variants selected by frontmatter.

Rejected: keeping [layouts/PostLayout.tsx](../../../layouts/PostLayout.tsx), [layouts/PostSimple.tsx](../../../layouts/PostSimple.tsx), and [layouts/PostBanner.tsx](../../../layouts/PostBanner.tsx) as three files.

`Evidence`: the three files differ mainly in whether an author sidebar renders and whether a banner image renders. They share the header, prose body, tag list, comment mount, and previous-next navigation. Three copies means every typography or spacing change is made three times and gets missed once.

The consolidated layout takes a `variant` derived from the existing `layout` frontmatter field, so existing posts keep working. `PostSimple` becomes `variant="minimal"` and `PostBanner` becomes `variant="banner"`.

Reversal trigger: if the variants diverge enough that the single component develops more than two conditional branches, split it again.

### A5: Starfield as a server-rendered layer with compositor-only motion

Chosen: inline SVG rendered by a Server Component, placed once in the site shell layout, positioned fixed behind all content. Five tiled star layers drift through a CSS `transform` animation that the browser runs on the compositor, producing parallax from differential speed rather than from geometry. Two of them also pulse through `opacity`, the other property the compositor owns.

Rejected: a `<canvas>` client component, a client component wrapping page content, and any WebGL or Three.js scene.

The wrapper approach is rejected because it would convert the entire subtree into client components, destroying the seven-file client boundary documented in [research.md](research.md). This is the single most important architectural constraint in the project.

Canvas 2D was the original choice and remained so through the design phase. `SINGULARITY-005` then measured it: the single-canvas prototype held roughly 1.06 milliseconds mean draw at 4 times throttling, but at 6 times it reached 1.82 milliseconds mean and produced an 81 millisecond long task, and a five-minute run reached 5.29 milliseconds mean with forty long tasks. That fails both the 2 millisecond frame budget and the 50 millisecond long-task threshold, so the reversal trigger fired and the Canvas module was withdrawn.

The shipped layer is therefore the SVG that was always the designated fallback: a nebula wash, five tiled star layers, a coordinate grid, and an instrument reticle, drawn with the theme's semantic colour tokens so it follows both themes without JavaScript. It costs zero kilobytes of client script and renders identically on every viewport.

The 2026-09-19 amendment restored depth without restoring cost. The star layers drift at different speeds through a CSS `transform` animation, and two of them pulse through `opacity`. The browser runs both properties on the compositor rather than the main thread, so the frame budget `SINGULARITY-005` measured is untouched. The keyframes sit inside a `prefers-reduced-motion: no-preference` query, so the animation is never created for a reader who asks for stillness.

Reversal trigger: reintroducing main-thread motion requires a fresh measurement that clears the 2 millisecond frame budget and the long-task threshold at 6 times throttling, recorded against an amended `SINGULARITY-005`. Reversing the drift alone requires only deleting one keyframe block.

### A6: Projects as typed data plus optional MDX

Chosen: a hybrid. Structured metadata lives in `data/projects.ts` as typed TypeScript. Long-form case studies live in `data/projects/[slug].mdx` and are processed as a project collection by the owner-selected content engine.

Rejected: pure MDX with frontmatter, and pure TypeScript.

Pure MDX makes the project _index_ awkward. Sorting, filtering, and rendering cards need structured fields, and expressing an array of link objects in YAML frontmatter is clumsy and untyped. Pure TypeScript makes the case study awkward, because a multi-paragraph narrative with code, images, and diagrams does not belong in a string literal.

The hybrid gives type safety where structure matters and MDX where prose matters. The link is the `caseStudy` field, holding an MDX slug. Projects without a case study still render a full card and a detail page from metadata alone, which means content can ship incrementally.

### A7: No database, no authentication, no CMS

Chosen: everything is version-controlled, statically generated, and stateless.

Rejected: the engagement layer implemented by `nelsonlaidev/nelsonlai.dev`, meaning post views, likes, and a custom comment system backed by Drizzle, Postgres, Redis, and Better Auth. Also rejected: the Notion CMS used by `aarabii/An`.

`Evidence` from [research.md](research.md): implementing these requires a database, a hosting cost, a migration process, a privacy policy obligation, a rate-limiting layer, and a new class of production outage. Giscus delivers comments by delegating to GitHub Discussions at zero infrastructure cost.

Reversal trigger: a documented requirement that static generation cannot satisfy. None exists today.

### A8: TypeScript strict mode before new code

Chosen: enable `strict: true` early, in Phase 1, before substantial new code lands.

`Evidence`: `tsconfig.json` currently sets `strict: false` with only `strictNullChecks: true`.

The alternative, enabling it at the end, is strictly worse. Every module written under loose settings must then be revisited, and the fix-up lands as one large, unreviewable change. Doing it first means all new code is written correctly the first time.

`Assumption`: the blast radius is bounded after `SINGULARITY-003` and `SINGULARITY-069` remove legacy third-party types. If the error count is still large, `SINGULARITY-008` may add narrow declarations only for maintained dependencies that cannot expose adequate types.

### A9: Route group for the site shell

Chosen: `app/(site)/` holds every user-facing page. The root `app/layout.tsx` owns only the document, fonts, theme provider, and analytics.

Rejected: keeping everything at the `app/` root, which is the current shape.

The benefit is that `app/og/[...slug]/route.tsx` and the metadata routes do not inherit a shell they must opt out of. `Evidence`: [app/layout.tsx](../../../app/layout.tsx) currently composes `SectionContainer`, `SearchProvider`, `Header`, `main`, and `Footer` all in the root layout, which means every future non-page route inherits them.

Cost: moving eight page files. It is a mechanical change and it happens once, early, in `SINGULARITY-018`, before new routes are added.

### A10: Dynamic Open Graph images

Chosen conditionally: an edge route at `/og/[...slug]` using `next/og`, generating a card per post and per project only if `SINGULARITY-004` passes. Otherwise, static section images remain the accepted result.

Rejected: the current single static `twitter-card.png`, and build-time generation.

`Evidence`: [app/layout.tsx](../../../app/layout.tsx) points every Open Graph and Twitter card at `siteMetadata.socialBanner`, one image for the entire site. Every shared post looks identical in a feed.

`Assumption`, and the reason this needs early validation in `SINGULARITY-004`: `next/og` requires font data as an `ArrayBuffer` at the edge, and self-hosted variable fonts can be awkward to load in that context. Static subsets may be needed specifically for image generation.

## Target file tree

Annotated. `[new]` is net new, `[moved]` changes location, `[changed]` is a substantial rewrite, `[deleted]` is removed. Unmarked entries are retained as they are.

```text
singularity/
├── app/
│   ├── layout.tsx                          [changed]  Document, fonts, theme, analytics only.
│   │                                                  Shell composition moves to (site).
│   ├── (site)/                             [new]      Route group for all user-facing pages.
│   │   ├── layout.tsx                      [new]      Site shell: skip link, header, main,
│   │   │                                              footer, starfield mount, search provider.
│   │   ├── page.tsx                        [changed]  Portfolio home, replacing the post list.
│   │   ├── not-found.tsx                   [moved]    From app/. Observatory-themed 404.
│   │   ├── about/page.tsx                  [changed]  Biography, skills, education, awards.
│   │   ├── resume/page.tsx                 [new]      HTML resume plus PDF download.
│   │   ├── uses/page.tsx                   [optional]
│   │   ├── projects/
│   │   │   ├── page.tsx                    [changed]  Filterable project index.
│   │   │   └── [slug]/page.tsx             [new]      Case study detail.
│   │   ├── blog/
│   │   │   ├── page.tsx                    [moved]
│   │   │   ├── page/[page]/page.tsx        [moved]
│   │   │   └── [...slug]/page.tsx          [changed]  Single consolidated layout.
│   │   └── tags/
│   │       ├── page.tsx                    [moved]
│   │       └── [tag]/
│   │           ├── page.tsx                [moved]
│   │           └── page/[page]/page.tsx    [moved]
│   ├── og/[...slug]/route.tsx              [conditional] Dynamic Open Graph images via next/og.
│   ├── robots.ts
│   ├── sitemap.ts                          [changed]  New routes added.
│   ├── seo.ts                              [changed]  Renamed from seo.tsx; no JSX remains.
│   ├── theme-providers.tsx
│   ├── tag-data.json                                  Generated. Do not edit.
│   ├── Main.tsx                            [deleted]  Absorbed into (site)/page.tsx.
│   └── api/newsletter/route.ts             [deleted]  D6. Inert under force-static.
│
├── components/
│   ├── ui/                                 [new]      Design-system primitives. No domain logic.
│   │   ├── button.tsx                      [new]      Variant and size props, polymorphic as.
│   │   ├── badge.tsx                       [new]      Tech tags, status pills.
│   │   ├── card.tsx                        [new]      Composable Root/Header/Body/Footer.
│   │   ├── prose.tsx                       [new]      Single owner of typography styles,
│   │   │                                              replacing scattered `prose` classes.
│   │   ├── section.tsx                     [new]      Section with observatory tick annotation.
│   │   ├── container.tsx                   [new]      prose | content | wide widths.
│   │   └── disclosure.tsx                  [new]      Native <details> wrapper for mobile TOC.
│   ├── layout/                             [new]      Site-shell components, grouped.
│   │   ├── header.tsx                      [moved]    From components/Header.tsx.
│   │   ├── footer.tsx                      [moved]    From components/Footer.tsx.
│   │   ├── mobile-nav.tsx                  [moved]    From components/MobileNav.tsx. Client.
│   │   ├── skip-link.tsx                   [new]      First focusable element. Does not exist.
│   │   ├── theme-switch.tsx                [moved]    From components/ThemeSwitch.tsx. Client.
│   │   └── search-button.tsx               [moved]    From components/SearchButton.tsx.
│   ├── portfolio/                          [new]      Feature components for portfolio surfaces.
│   │   ├── hero.tsx                        [new]      Identity block. Server component.
│   │   ├── project-card.tsx                [new]      Replaces the four-field Card.
│   │   ├── project-grid.tsx                [new]
│   │   ├── project-meta.tsx                [new]      Role, period, stack, outcome block.
│   │   ├── experience-timeline.tsx         [new]
│   │   ├── skill-groups.tsx                [new]
│   │   └── contact-block.tsx               [new]      Public mailto plus social links.
│   ├── blog/                               [new]      Blog feature components, grouped.
│   │   ├── post-card.tsx                   [new]
│   │   ├── table-of-contents.tsx           [new]      Sticky sidebar, from the computed toc.
│   │   ├── post-nav.tsx                    [new]      Previous and next.
│   │   ├── tag.tsx                         [moved]    From components/Tag.tsx.
│   │   └── comments.tsx                    [moved]    From components/Comments.tsx. Client.
│   ├── decorative/                         [new]
│   │   └── starfield.tsx                   [new]      Layered SVG. Server component. aria-hidden.
│   ├── mdx/                                [new]
│   │   ├── mdx-components.tsx              [moved]    From components/MDXComponents.tsx.
│   │   ├── figure.tsx                      [new]      Image plus caption plus dual-theme source.
│   │   ├── callout.tsx                     [new]
│   │   └── code-group.tsx                  [new]      Tabbed code blocks. Client.
│   ├── link.tsx                            [moved]    Correct as written. Do not modify.
│   ├── image.tsx                           [moved]    Handles BASE_PATH. Keep.
│   ├── table-wrapper.tsx                   [moved]
│   ├── scroll-to-top.tsx                   [changed]  From ScrollTopAndComment.tsx. Comment
│   │                                                  button removed with the comment gate.
│   ├── social-icons/                                  Retained wholesale. Dependency-free.
│   ├── LayoutWrapper.tsx                   [deleted]  Unused. Verified: zero importers.
│   ├── PageTitle.tsx                       [deleted]  Superseded by ui/section.tsx.
│   ├── Card.tsx                            [deleted]  Superseded by portfolio/project-card.tsx.
│   └── SectionContainer.tsx                [deleted]  Superseded by ui/container.tsx.
│
├── layouts/
│   ├── post-layout.tsx                     [changed]  Single layout, variant-driven.
│   ├── list-layout-with-tags.tsx           [changed]  Restyled. Client boundary narrowed.
│   ├── ListLayout.tsx                      [deleted]  Unused by any route.
│   ├── PostSimple.tsx                      [deleted]  Becomes variant="minimal".
│   ├── PostBanner.tsx                      [deleted]  Becomes variant="banner".
│   └── AuthorLayout.tsx                    [deleted]  Absorbed into (site)/about/page.tsx.
│
├── data/
│   ├── index.ts                            [new]      Barrel export.
│   ├── site.ts                             [changed]  From siteMetadata.js. TypeScript, no
│   │                                                  newsletter block, real values.
│   ├── navigation.ts                       [changed]  From headerNavLinks.ts.
│   ├── profile.ts                          [new]      Name, positioning, status, biography.
│   ├── social.ts                           [new]
│   ├── projects.ts                         [changed]  Full Project type. Was 4 fields.
│   ├── experience.ts                       [new]
│   ├── skills.ts                           [new]
│   ├── education.ts                        [new]      Degree plus awards.
│   ├── uses.ts                             [new]
│   ├── projects/                           [new]      MDX case studies.
│   │   └── robotics-challenge.mdx          [new]      Seed case study.
│   ├── blog/
│   │   ├── _template.mdx                   [new]      draft: true. Authoring template.
│   │   ├── <seed-post>.mdx                 [new]      One real post.
│   │   └── *.mdx                           [deleted]  All 11 starter posts. D8.
│   ├── authors/                            [deleted]  Single-author site. Folded into profile.
│   ├── references-data.bib                            Retained. Citations stay per D17.
│   └── projectsData.ts                     [deleted]  Replaced by projects.ts.
│
├── lib/                                    [new]      Utilities. No such directory exists today.
│   ├── content.ts                          [new]      Sorting, filtering, related-post lookup.
│   ├── seo.ts                              [new]      Metadata builders and JSON-LD.
│   ├── format.ts                           [new]      Date and period formatting.
│   └── cn.ts                               [new]      Class merge helper.
│
├── css/
│   ├── tailwind.css                        [changed]  Observatory tokens replace the pink ramp.
│   ├── prism.css                           [changed]  Retuned to the new palette.
│   └── fonts.css                           [new]      @font-face with size-adjust fallbacks.
│
├── public/
│   ├── fonts/                              [new]      Self-hosted variable fonts, subsetted.
│   ├── resume/
│   │   └── matthew-gong-resume.pdf         [new]      Redacted. No phone number.
│   ├── static/
│   │   ├── favicons/                                  Regenerated from the new mark.
│   │   └── images/
│   │       ├── projects/                   [new]
│   │       ├── avatar.png                  [changed]  Real photograph.
│   │       ├── google.png                  [deleted]  Starter demo asset.
│   │       ├── time-machine.jpg            [deleted]
│   │       ├── ocean.jpeg                  [deleted]
│   │       ├── github-traffic.png          [deleted]
│   │       ├── twitter-card.png            [deleted]  Superseded by dynamic OG.
│   │       └── canada/                     [deleted]
│   └── search.json                                    Generated. Do not edit.
│
├── tests/                                  [new]      No test infrastructure exists today.
│   ├── unit/                               [new]      Vitest. lib/ and pure helpers.
│   ├── e2e/                                [new]      Playwright. One spec per journey J1-J5.
│   ├── a11y/                               [new]      axe assertions per route.
│   └── fixtures/                           [new]
│
├── scripts/
│   ├── rss.mjs                                        Retained.
│   ├── postbuild.mjs                                  Retained.
│   └── check-links.mjs                     [new]      Internal link integrity gate.
│
├── docs/planning/singularity/                    [new]      This planning set.
│
├── .github/workflows/
│   ├── ci.yml                              [new]      Lint, typecheck, test, build, Lighthouse.
│   └── pages.yml                           [changed]  Demoted to workflow_dispatch fallback.
│
├── content-collections.ts or               [new]      Owner-selected engine configuration.
│   velite.config.ts
├── contentlayer.config.ts                  [deleted]  Replaced before P1.
├── next.config.js                          [changed]  Tightened CSP. Image domains.
├── tsconfig.json                           [changed]  strict: true. New path aliases.
├── vitest.config.ts                        [new]
├── playwright.config.ts                    [new]
├── lighthouserc.json                       [new]      Enforces the budgets from README.
├── .env.example                            [changed]  Newsletter variables removed.
└── ResumeLatex3.pdf                        [moved]    Out of the repository root. See SINGULARITY-032.
```

### Why each structural move is justified

Component directories are grouped by role, `ui`, `layout`, `portfolio`, `blog`, `decorative`, `mdx`, because the flat `components/` directory already holds sixteen files and the transformation roughly doubles that. Flat becomes unnavigable at thirty files. The grouping is by architectural role rather than by page, so a component used on three pages has one obvious home.

`lib/` is added because helper logic currently has nowhere to live and ends up inline in page components, which makes it untestable. Vitest needs pure functions to target, and `lib/` provides them. `Evidence`: the `lint` script in [package.json](../../../package.json) already references a `--dir lib` that does not exist, so the original template anticipated this directory.

The route group `(site)` is justified in A9.

Deletions of `LayoutWrapper.tsx`, `ListLayout.tsx`, and `PageTitle.tsx` require a verified zero-importer check before removal, specified as an acceptance criterion in `SINGULARITY-019`.

Files are renamed to kebab-case during their moves. This is a convention change, not a functional one, and it is only applied to files that are already being moved for another reason. `Recommendation`: do not rename files that are otherwise untouched. Churn without benefit costs review attention.

## Rendering strategy

### Server and client boundaries

The governing rule: a component becomes a Client Component only if it needs browser state, a browser event listener, or a browser-only API. Nothing else.

Every route is a Server Component. Every page renders its full content, including the identity block, project cards, experience timeline, post bodies, and the resume, on the server.

The complete permitted client set after transformation:

| Component                                | Reason                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| `app/theme-providers.tsx`                | `next-themes` context                                  |
| `components/layout/theme-switch.tsx`     | Reads and sets theme state                             |
| `components/layout/active-nav-link.tsx`  | `usePathname` for the current-page indicator           |
| `components/layout/mobile-nav.tsx`       | Sheet open state and lazy panel trigger                |
| `components/layout/mobile-nav-panel.tsx` | Headless UI dialog and body scroll lock, loaded lazily |
| `components/layout/search-button.tsx`    | Opens the command dialog through context               |
| `components/SearchProvider.tsx`          | Keyboard shortcut, open state, focus restoration       |
| `components/search/command-menu.tsx`     | `cmdk` dialog and deferred local search, loaded lazily |
| `components/blog/comments.tsx`           | Click-to-load gate for the Giscus iframe               |
| `components/blog/toc-scroll-spy.tsx`     | Scroll-spy for the active heading                      |
| `components/blog/filtered-post-list.tsx` | Search filter state                                    |
| `components/CodeBlock.tsx`               | Clipboard copy state                                   |
| `components/mdx/code-group.tsx`          | Tab selection state                                    |
| `components/ScrollTopAndComment.tsx`     | Scroll position listener                               |

That is fourteen, up from seven, for a site with roughly twice the surface area. `SINGULARITY-057` enforces the ceiling with an automated check that fails continuous integration if an unlisted file gains `'use client'`.

Three entries deserve a note, because they depart from the original eleven-file plan.

`components/layout/active-nav-link.tsx` crosses the boundary that `SINGULARITY-023` warned about. No server-side approach exists in the App Router, because a layout cannot read the current pathname. The indicator was kept rather than omitted, because `aria-current="page"` is the only programmatic signal a screen-reader user gets for location. The cost is bounded: the component renders a single anchor and holds no other state.

`components/layout/mobile-nav-panel.tsx` and `components/search/command-menu.tsx` exist so that Headless UI, `cmdk`, and MiniSearch load on first interaction instead of on first paint. Splitting each surface into a small trigger plus a lazily imported panel removed roughly 40 KB gzipped from every route's first load. Their parents remain client components; only the heavy dependency moved.

The decorative starfield is no longer a client component at all. `SINGULARITY-005` measured the Canvas prototype over its frame budget, so `SINGULARITY-026` ships a Server Component whose only motion is CSS animation of `transform` and `opacity`, both of which the compositor owns.

The starfield still deserves emphasis as a structural rule. It is rendered as a _sibling_ of `{children}` in the shell layout, never as a wrapper. A wrapper would force the entire page subtree to be client-rendered, which is the most common way this architecture gets destroyed by a well-meaning change.

### Generation strategy

Everything in the required site is statically generated at build time. There is no incremental static regeneration, no server-side rendering per request, and no client-side data fetching, because there is no dynamic data. `/og/[...slug]` is prerendered too: it declares `dynamic = 'force-static'` with `generateStaticParams` over published posts and projects, so one card is emitted per slug at build time. That keeps the route working under the degraded export profile, which cannot host a dynamic or edge handler, and it lets the CDN serve the cards without invoking a function.

`generateStaticParams` is already used correctly for blog posts, blog pagination, tags, and tag pagination. It is extended to `/projects/[slug]`.

### Data flow

```text
Build time
  data/*.ts  ──────────────────────┐
    (typed, imported directly)     │
                                   ├──► Server Components ──► static HTML
    data/blog/*.mdx  ──┐             │
    data/projects/*.mdx│             │
        ▼             │
     Selected content engine ───┘
        │
        ├──► generated typed collection exports
        ├──► app/tag-data.json   (deterministic artifact step)
        └──► public/search.json  (deterministic artifact step)

Post-build
  scripts/postbuild.mjs ──► scripts/rss.mjs ──► public/feed.xml
                                             └► public/tags/*/feed.xml

Request time
  /og/[...slug] ──► next/og ──► PNG, immutable cache
  Giscus iframe ──► GitHub Discussions   (only after user click)
  Umami script  ──► page view beacon     (optional; privacy review required)
```

Typed data is imported directly by Server Components. There is no data-fetching layer, no client store, and no context beyond the theme provider, because there is no cross-component mutable state on this site. Adding one would be unjustified complexity.

### Metadata and SEO

Per-route metadata is produced by `generateMetadata`, extending the existing `genPageMetadata` helper in [app/seo.tsx](../../../app/seo.tsx). Each post and project resolves its Open Graph image to `/og/<type>/<slug>`.

JSON-LD is extended from the current `BlogPosting`-only coverage. `Evidence`: the baseline [contentlayer.config.ts](../../../contentlayer.config.ts) computes `structuredData` for blog posts only, and `SINGULARITY-003` preserves that derived field in the selected engine. Singularity adds a `Person` graph on `/about` and `/resume`, a `WebSite` graph in the root layout, and a `BreadcrumbList` on nested routes. This is not decoration: `Person` markup is what lets a name query surface the correct entity.

Canonical URLs are already handled through the `canonicalUrl` frontmatter field and the `alternates` block in [app/layout.tsx](../../../app/layout.tsx). Retained.

## Security and privacy

### Personal data

`Evidence`: `ResumeLatex3.pdf` at the repository root contains the phone number `[REDACTED PHONE]` and a plain-text email address. The literal value must not be copied into source, tests, documentation, logs, or issue trackers.

The phone number must not appear on the website, in `data/`, or in the published PDF. A phone number on a public page is scraped within days and its only realistic use by a stranger is unsolicited contact. Recruiters who need it get it from the application, not the site.

The email address is intentionally public because J1 requires an accessible contact path. Render a normal `mailto:` link from typed profile data. CSS ordering and base64 reconstruction do not provide a meaningful privacy boundary, can impair copying or assistive-technology output, and conflict with the no-JavaScript requirement. Use a dedicated public contact alias if spam volume warrants separation from a private mailbox.

The published PDF at `public/resume/matthew-gong-resume.pdf` is a redacted build with the phone number removed. `SINGULARITY-032` also requires stripping PDF document metadata, which frequently leaks a local username, a file path, and the authoring toolchain.

> [!IMPORTANT]
> `Evidence`: as of 2026-09-01 this workspace is **not** a Git repository. `git status` reports "not a git repository". The unredacted PDF therefore exists only in the working tree, with no history behind it.
>
> This is a narrow and closing window. Handle `SINGULARITY-032` **before** running `git init`, and the phone number never enters history at all. If the repository is initialized first, removing the file in a later commit will not remove it from history, and the remediation becomes destructive.

### Content Security Policy

`Evidence`: [next.config.js](../../../next.config.js) defines a policy with `script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is`, `img-src * blob: data:`, `media-src *.s3.amazonaws.com`, and `connect-src *`.

Three of those are wider than Singularity needs. `connect-src *` permits exfiltration to any origin, which negates much of the policy's value. `img-src *` permits any remote image. `media-src *.s3.amazonaws.com` is a template artifact with no corresponding usage in this codebase.

Target policy, implemented in `SINGULARITY-060`:

| Directive         | Value                                                  | Change                                          |
| ----------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `default-src`     | `'self'`                                               | Unchanged                                       |
| `script-src`      | `'self' 'unsafe-inline' giscus.app analytics.umami.is` | Attempt removal of `unsafe-eval`                |
| `style-src`       | `'self' 'unsafe-inline'`                               | Unchanged. Required by Tailwind and `next/font` |
| `img-src`         | `'self' blob: data:`                                   | Narrowed from `*`                               |
| `media-src`       | `'none'`                                               | Narrowed. No media on the site                  |
| `connect-src`     | `'self' analytics.umami.is`                            | Narrowed from `*`                               |
| `font-src`        | `'self'`                                               | Unchanged. All fonts self-hosted                |
| `frame-src`       | `giscus.app`                                           | Unchanged                                       |
| `frame-ancestors` | `'none'`                                               | Added, reinforcing `X-Frame-Options`            |
| `base-uri`        | `'self'`                                               | Added, blocks base-tag injection                |
| `form-action`     | `'self'`                                               | Added                                           |
| `object-src`      | `'none'`                                               | Added                                           |

`Assumption`: removing `unsafe-eval` will not break the build output. Next.js development mode requires it, so the policy must remain permissive in development and tighten only in production. `SINGULARITY-060` must verify this rather than assume it, since a broken production policy silently disables the site's interactivity.

`Recommendation`: `unsafe-inline` in `script-src` cannot be removed without nonce-based script injection, which needs middleware and forfeits full static generation. Not worth it for a site with no authentication and no user-supplied content. Document the acceptance rather than pretending it is fixed.

### Third-party surface

Three third-party integration surfaces remain, each with a stated justification.

Giscus loads an iframe from `giscus.app` and reads GitHub Discussions. It only loads after an explicit user click. `Evidence`: [components/Comments.tsx](../../../components/Comments.tsx) already gates it behind a button, which is both a performance and a privacy win, and must be preserved.

Umami is optional and limited to page views. Cookieless operation is not equivalent to anonymous processing: request metadata and server logs can still include personal data, and consent or notice obligations depend on hosting mode, configuration, retention, and jurisdiction. `SINGULARITY-050` records that review before enablement. Custom events require a new review.

`cmdk` and MiniSearch are bundled, not remote. They read the locally generated `public/search.json` and make no third-party requests. They have no remote privacy surface.

Removed surface: the newsletter provider, which would have handled email addresses and created a genuine data-protection obligation for a personal site. Its removal under D6 is as much a privacy decision as a scope one.

### Dependency and supply chain

`Recommendation`: enable Dependabot or Renovate for security updates on a weekly cadence, grouped so that patch bumps arrive as one pull request. `Recommendation`: run `yarn npm audit` in continuous integration as a reporting step, not a blocking gate, because transitive advisories in the build toolchain are common and blocking on them stalls unrelated work.

`Evidence`: the baseline pins `esbuild` to `0.27.3` for Contentlayer2. `SINGULARITY-003` removes that exact pin unless the owner-selected engine independently requires one; do not carry the legacy constraint into dependency automation.
