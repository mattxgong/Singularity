---
title: Singularity
description: Matthew Gong's personal portfolio and technical blog, built on Next.js with a static-first architecture and an observatory visual identity
author: Matthew Gong
ms.date: 2026-09-19
ms.topic: overview
keywords:
  - portfolio
  - nextjs
  - blog
  - mdx
estimated_reading_time: 7
---

![Singularity portfolio and technical writing](/public/static/images/social-card.svg)

## Overview

Singularity is Matthew Gong's personal portfolio and technical blog. Projects and writing are peers rather than parent and child: the portfolio leads, and the essays carry the technical depth.

The site is statically rendered, self-hosts its typefaces, and ships a deliberately small client bundle. The visual identity is an observatory rather than outer space, which means charts over photographs, annotation over ornament, and colour reserved for meaning. Dark is the default theme; light is a photographic plate rather than an inverted compromise.

Current preview: [mattxgong-singularity.vercel.app](https://mattxgong-singularity.vercel.app). The production domain is still open, tracked as `OQ-2` in [docs/planning/singularity/risks-and-decisions.md](docs/planning/singularity/risks-and-decisions.md).

Planning, architecture, and design documents live in [docs/planning/singularity/](docs/planning/singularity/README.md).

## Prerequisites

| Requirement         | Version     | Notes                                                                 |
| ------------------- | ----------- | --------------------------------------------------------------------- |
| Node.js             | 20 or later | Continuous integration pins 20                                        |
| Yarn                | 3.6.1       | Pinned by `packageManager`; enable it with `corepack enable`          |
| Python              | 3.12        | Only for `yarn check:sensitive`, which scans the published resume PDF |
| Playwright browsers | current     | Only for the browser suites; install with `npx playwright install`    |

## Run the site

Clone the repository, then from its root:

```bash
corepack enable
yarn install
cp .env.example .env.local
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server watches both code and content. Editing anything in `app/`, `components/`, or `data/` reloads the page, and adding or changing an MDX file regenerates the content collections without a restart.

Every environment variable is optional. Comments stay dormant until the Giscus values are set, and analytics stays dormant until `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, which is the explicit enablement gate required by the privacy review.

To run the production build locally:

```bash
yarn build
yarn serve
```

`yarn build` compiles the site and then runs `scripts/postbuild.mjs`, which generates the RSS feeds, the per-tag feeds, the tag counts, and the search index. Serving a stale build is the usual cause of a page that looks correct in development and wrong in preview.

## Commands

### Everyday

| Command       | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| `yarn dev`    | Development server with live reload                          |
| `yarn build`  | Production build plus feed, tag, and search-index generation |
| `yarn serve`  | Serve the production build                                   |
| `yarn format` | Apply Prettier across the repository                         |

### Checks

| Command                      | Purpose                                                             |
| ---------------------------- | ------------------------------------------------------------------- |
| `yarn lint`                  | ESLint over `app`, `components`, `layouts`, `lib`, and `scripts`    |
| `yarn typecheck`             | `tsc --noEmit`                                                      |
| `yarn format:check`          | Prettier verification, as run in continuous integration             |
| `yarn test`                  | Vitest unit suite                                                   |
| `yarn test:watch`            | Vitest in watch mode                                                |
| `yarn check:client-boundary` | Fails if a `'use client'` directive appears outside the allowlist   |
| `yarn check:links`           | Verifies internal links, anchors, sitemap entries, and feed entries |
| `yarn check:sensitive`       | Scans the published resume PDF for sensitive values                 |

### Browser suites

| Command                   | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `yarn test:e2e`           | Playwright end-to-end journeys                          |
| `yarn test:e2e:headed`    | The same suite with a visible browser                   |
| `yarn test:a11y`          | Accessibility sweep across every route in both themes   |
| `yarn test:visual`        | Reviewed visual baselines                               |
| `yarn test:visual:update` | Refresh those baselines after an intended visual change |
| `yarn lighthouse`         | Lighthouse CI against the performance budgets           |

Visual baselines are platform-specific, so they are a reviewed local gate rather than a continuous integration job.

> [!NOTE]
> `yarn test:visual:update` uses Playwright's default `--update-snapshots=changed`, which skips any difference that already falls within `maxDiffPixelRatio`. After a small but intentional change, such as swapping an icon, run `yarn playwright test --update-snapshots=all` with `PLAYWRIGHT_SUITE=visual` set.

### Occasional

| Command              | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `yarn identity`      | Regenerate every brand asset from `scripts/generate-identity-assets.mjs` |
| `yarn analyze`       | Build with the bundle analyzer enabled                                   |
| `yarn content:build` | Rebuild content collections without starting a server                    |

The favicons, app icons, mask icon, header mark, and social card are all generated. Edit the geometry in the script and rerun `yarn identity` rather than editing the emitted files.

## Repository layout

| Path          | Contents                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `app/`        | Routes. User-facing pages sit in the `(site)` group; Open Graph, robots, and sitemap sit outside it |
| `components/` | Primitives and feature components, grouped by area                                                  |
| `layouts/`    | Post and list templates                                                                             |
| `lib/`        | Pure helpers for formatting, content relationships, and structured data                             |
| `data/`       | Typed portfolio data, site configuration, brand palette, and MDX content                            |
| `css/`        | Theme tokens, font declarations, and syntax highlighting                                            |
| `scripts/`    | Build, generation, and repository-check scripts                                                     |
| `tests/`      | End-to-end, accessibility, and visual suites                                                        |
| `docs/`       | Planning, architecture, and design documents                                                        |

## Add content

Publishing requires no component edits.

To add a post, copy an existing file in `data/blog/` and edit its frontmatter and body. Tags, the search index, and the feeds regenerate on the next build. Set `draft: true` to keep a post out of the sitemap, the feeds, and the search index while still previewing it locally.

To add a project, append an entry to `data/projects.ts`. Every field is required by the type except the cover image and the case study. To give a project a long-form case study, add an MDX file to `data/projects/` and reference its slug from the `caseStudy` field.

Site-wide settings live in `data/site.ts`, navigation in `data/navigation.ts`, and the biography, skills, experience, and education blocks in their own modules under `data/`.

## Deploy

Vercel is the primary target and needs no additional configuration.

For static hosting, including GitHub Pages:

```bash
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Deploy the generated `out` folder. A [`pages.yml`](.github/workflows/pages.yml) workflow already does this; select GitHub Actions under `Settings > Pages > Build and deployment > Source`.

> [!IMPORTANT]
> When deploying under a path such as `https://example.org/singularity`, pass that path as `BASE_PATH`:
>
> ```bash
> EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/singularity yarn build
> ```
>
> `BASE_PATH` exists only for that fallback. Setting it in production corrupts every canonical URL, feed URL, and social card URL.

## Licence

### Code

Released under the [MIT License](LICENSE).

Singularity is a substantial rewrite of the [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) by Timothy Lin, which is also MIT licensed. That obligation survives the rebranding, so the upstream copyright notice is retained in [LICENSE](LICENSE) alongside the notice for this work, and the credit is repeated in the site footer.

### Typefaces

Source Serif 4, Inter, and JetBrains Mono are self-hosted under the SIL Open Font License 1.1. Versions, licence links, and the payload budget are recorded in [docs/planning/singularity/typography-decision.md](docs/planning/singularity/typography-decision.md).

### Content and identity

The MIT licence covers the source code. It does not cover the writing, the project case studies, the resume, the photographs, or the Singularity mark and its derived icons. Those remain the property of Matthew Gong and are not licensed for reuse.
