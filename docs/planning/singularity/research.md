---
title: Singularity Research
description: Repository baseline inventory, capability classification, reference project matrix, and evidence sources for the Singularity transformation
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: reference
keywords:
  - baseline
  - inventory
  - reference research
  - licensing
estimated_reading_time: 22
---

## Method

The repository at `c:\Users\GongMa\Documents\Programming\Projects\Singularity` was inspected directly. Every claim in the baseline section is traceable to a file path, and several claims from an initial automated sweep were corrected after manual verification. Reference research uses immutable GitHub links pinned to full commit SHAs. The evidence matrix distinguishes source inspection, licence text, README claims, deployed-site observations, and planning inferences.

The current codebase is treated as the source of truth. The starter README was found to be stale and describes the upstream template, not this checkout.

## Repository baseline

### Verified stack

`Evidence` from [package.json](../../../package.json):

| Package              | Version      | Notes                                                |
| -------------------- | ------------ | ---------------------------------------------------- |
| `next`               | 15.5.12      | App Router                                           |
| `react`, `react-dom` | 19.2.4       |                                                      |
| `tailwindcss`        | ^4.1.18      | CSS-first configuration, no `tailwind.config.js`     |
| `contentlayer2`      | 0.5.8        | Community fork                                       |
| `next-contentlayer2` | 0.5.8        |                                                      |
| `pliny`              | 0.4.1        | Search, comments, newsletter, analytics, MDX plugins |
| `typescript`         | ^5.9.3       |                                                      |
| `@headlessui/react`  | 2.2.9        | Used by theme switch and mobile nav                  |
| `next-themes`        | ^0.4.6       |                                                      |
| `esbuild`            | 0.27.3       | Pinned exactly, a Contentlayer2 requirement          |
| `eslint`             | ^9.18.0      | Flat config                                          |
| `packageManager`     | `yarn@3.6.1` | Yarn Berry                                           |

This table records the current checkout, not the target architecture. The plan requires Contentlayer2, Next Contentlayer2, Pliny, their aliases, and the legacy exact `esbuild` constraint to be absent before P1.

### Scripts

`Evidence` from [package.json](../../../package.json):

```text
start    next dev
dev      cross-env INIT_CWD=$PWD next dev
build    cross-env INIT_CWD=$PWD next build && cross-env NODE_OPTIONS='--experimental-json-modules' node ./scripts/postbuild.mjs
serve    next start
analyze  cross-env ANALYZE=true next build
lint     next lint --fix --dir pages --dir app --dir components --dir lib --dir layouts --dir scripts
prepare  husky
```

`Evidence`: there is no `typecheck` script, no `test` script, and no formatting script. The `lint` script references a `pages` directory that does not exist in this checkout.

### Route map, current

`Evidence` from the `app/` directory.

| Route                     | File                                                                       | Rendering                                             | Notes                                                                            |
| ------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| `/`                       | [app/page.tsx](../../../app/page.tsx)                                      | Server                                                | Delegates to [app/Main.tsx](../../../app/Main.tsx), shows five most recent posts |
| `/about`                  | [app/about/page.tsx](../../../app/about/page.tsx)                          | Server                                                | Renders the `default` author MDX through `AuthorLayout`                          |
| `/blog`                   | [app/blog/page.tsx](../../../app/blog/page.tsx)                            | Server                                                | Five posts per page                                                              |
| `/blog/page/[page]`       | [app/blog/page/[page]/page.tsx](app/blog/page/[page]/page.tsx)             | Server, `generateStaticParams`                        |                                                                                  |
| `/blog/[...slug]`         | [app/blog/[...slug]/page.tsx](app/blog/[...slug]/page.tsx)                 | Server, `generateStaticParams` and `generateMetadata` | Catch-all supports nested post paths                                             |
| `/projects`               | [app/projects/page.tsx](../../../app/projects/page.tsx)                    | Server                                                | Maps `projectsData` onto `Card`                                                  |
| `/tags`                   | [app/tags/page.tsx](../../../app/tags/page.tsx)                            | Server                                                | Reads the generated [app/tag-data.json](../../../app/tag-data.json)              |
| `/tags/[tag]`             | [app/tags/[tag]/page.tsx](app/tags/[tag]/page.tsx)                         | Server, `generateStaticParams`                        |                                                                                  |
| `/tags/[tag]/page/[page]` | [app/tags/[tag]/page/[page]/page.tsx](app/tags/[tag]/page/[page]/page.tsx) | Server, `generateStaticParams`                        |                                                                                  |
| `/api/newsletter`         | [app/api/newsletter/route.ts](../../../app/api/newsletter/route.ts)        | `force-static`                                        | Effectively inert                                                                |
| `/robots.txt`             | [app/robots.ts](../../../app/robots.ts)                                    | `force-static`                                        |                                                                                  |
| `/sitemap.xml`            | [app/sitemap.ts](../../../app/sitemap.ts)                                  | `force-static`                                        |                                                                                  |
| 404                       | [app/not-found.tsx](../../../app/not-found.tsx)                            | Server                                                |                                                                                  |

> [!IMPORTANT]
> An earlier automated inventory reported that `/tags/[tag]/page/[page]` did not exist. Manual verification proved otherwise. Tag pagination is already fully implemented and must not be rebuilt.

### Client component boundary

`Evidence` from a repository-wide search for `'use client'`. Exactly seven files carry the directive:

- [app/theme-providers.tsx](../../../app/theme-providers.tsx)
- [components/Comments.tsx](../../../components/Comments.tsx)
- [components/MobileNav.tsx](../../../components/MobileNav.tsx)
- [components/ScrollTopAndComment.tsx](../../../components/ScrollTopAndComment.tsx)
- [components/ThemeSwitch.tsx](../../../components/ThemeSwitch.tsx)
- [layouts/ListLayout.tsx](../../../layouts/ListLayout.tsx)
- [layouts/ListLayoutWithTags.tsx](../../../layouts/ListLayoutWithTags.tsx)

This is a genuinely good boundary and is the single most valuable asset in the starter. Everything that renders content is a Server Component. Preserving this discipline is a hard constraint on the design direction, and it is why decorative motion must be an isolated leaf component rather than a page wrapper.

### Content model, current

`Evidence` from [contentlayer.config.ts](../../../contentlayer.config.ts).

Two document types exist. `Blog` matches `blog/**/*.mdx` with fields `title`, `date`, `tags`, `lastmod`, `draft`, `summary`, `images`, `authors`, `layout`, `bibliography`, `canonicalUrl`, plus computed `readingTime`, `slug`, `path`, `filePath`, `toc`, and `structuredData`. `Authors` matches `authors/**/*.mdx` with name, avatar, occupation, company, and social handles.

The MDX behavior is substantial and worth preserving through migration. Remark plugins cover frontmatter extraction, GitHub Flavored Markdown, code titles, mathematics, image-to-JSX conversion, and GitHub-style alerts. Rehype plugins cover heading slugs, autolinked headings with an inline icon, KaTeX with a no-translate guard, citations sourced from [data/references-data.bib](../../../data/references-data.bib), Prism syntax highlighting, and a minifying preset.

An `onSuccess` hook writes two generated artifacts: [app/tag-data.json](../../../app/tag-data.json) and `public/search.json`.

`Evidence` from [data/projectsData.ts](../../../data/projectsData.ts): the project type has only four fields, `title`, `description`, `href?`, and `imgSrc?`, and holds two placeholder entries pointing at Google and a sample post. This is the weakest part of the starter relative to Singularity's purpose.

### Styling, current

`Evidence` from [css/tailwind.css](../../../css/tailwind.css): Tailwind v4 CSS-first configuration. The `@theme` block defines a `--color-primary-*` ramp in the pink and magenta range (`--color-primary-500: oklch(0.656 0.241 354.308)`), a neutral gray ramp, four extended line heights, and three z-index values. Dark mode uses a custom variant, `@custom-variant dark (&:where(.dark, .dark *))`. Focus-visible outlines are already defined in the base layer against `--color-primary-500`.

`Evidence` from [app/layout.tsx](../../../app/layout.tsx): the sole typeface is Space Grotesk, loaded through `next/font/google` and bound to `--font-space-grotesk`.

`Evidence` from [css/prism.css](../../../css/prism.css): syntax highlighting is a Night Owl derivative with support for code titles, line numbers, and highlighted lines.

### Security posture, current

`Evidence` from [next.config.js](../../../next.config.js): a Content Security Policy is already present and allowlists `giscus.app` and `analytics.umami.is`. It also carries `'unsafe-eval' 'unsafe-inline'` in `script-src`, and `connect-src *`, both of which are weak. `Referrer-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Strict-Transport-Security`, and a `Permissions-Policy` denying camera, microphone, and geolocation are all set.

`Evidence`: `img-src * blob: data:` and `media-src *.s3.amazonaws.com` are both broader than Singularity needs.

### Tooling gaps

`Evidence`: no Vitest, Jest, Playwright, or Testing Library configuration exists anywhere in the repository. No `tests/` or `__tests__/` directory exists.

`Evidence` from `tsconfig.json`: `strict` is `false`. Only `strictNullChecks` is enabled. Target is `ES6`. Path aliases exist for `@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*`, `contentlayer/generated`, and `pliny/*`.

`Evidence`: the only continuous integration is a GitHub Pages deployment workflow. There is no lint, typecheck, or test gate on push or pull request.

`Evidence`: Husky is configured with a `pre-commit` hook running `lint-staged`, which applies ESLint and Prettier.

### Licensing of the current checkout

`Evidence` from `LICENSE`: MIT, copyright Timothy Lin, 2021 to 2025. Rebranding to Singularity does not remove the attribution obligation. The MIT notice must remain in the repository, and a credit line should remain in the footer or a colophon.

## Capability classification

Every meaningful capability in the current repository, classified. `retain` means keep as is, `adapt` means keep the mechanism and change the content or presentation, `replace` means swap the implementation, `remove` means delete, and `add` means net new.

### Routing and pages

| Capability                   | Class   | Evidence and rationale                                                                                                                 |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| App Router structure         | retain  | [app/](../../../app/) is idiomatic and correct. No reason to move to `src/`.                                                           |
| Blog list with pagination    | retain  | [app/blog/page/[page]/page.tsx](app/blog/page/[page]/page.tsx) works and is statically generated.                                      |
| Tag index and tag pagination | retain  | Fully implemented including the nested pagination route.                                                                               |
| Catch-all post routing       | retain  | [app/blog/[...slug]/page.tsx](app/blog/[...slug]/page.tsx) enables nested series paths at no cost.                                     |
| Home page                    | replace | [app/Main.tsx](../../../app/Main.tsx) is a five-post list. A portfolio home must lead with identity, then selected work, then writing. |
| `/about`                     | adapt   | Mechanism is fine. Content becomes a real biography, and the page gains skills, education, and awards sections.                        |
| `/projects`                  | adapt   | Keep the route, replace the card grid and the underlying data shape.                                                                   |
| `/api/newsletter`            | remove  | `force-static` makes it inert, and D6 removes the newsletter as part of mandatory Pliny removal.                                       |
| `/projects/[slug]`           | add     | Case-study depth is the difference between a link list and a portfolio.                                                                |
| `/resume`                    | add     | D18. Rendered HTML plus a downloadable redacted PDF.                                                                                   |
| `/uses`                      | add     | D13. Cheap to build, high signal for a technical audience.                                                                             |
| Dynamic Open Graph route     | add     | No dynamic OG generation exists today; social previews use a single static banner.                                                     |

### Layouts and components

| Capability                                | Class   | Evidence and rationale                                                                                                                                                                      |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PostLayout`, `PostSimple`, `PostBanner`  | replace | Three near-duplicate layouts in [layouts/](../../../layouts/). D17 consolidates them into one layout driven by frontmatter. Reduces the surface that every future design change must touch. |
| `ListLayout`                              | remove  | [layouts/ListLayout.tsx](../../../layouts/ListLayout.tsx) is unused by any route once `ListLayoutWithTags` is the blog list. Dead code.                                                     |
| `ListLayoutWithTags`                      | adapt   | Keep, restyle, and fix the client boundary so the search filter is the only client-side part.                                                                                               |
| `AuthorLayout`                            | adapt   | Becomes the `/about` composition rather than a generic author renderer.                                                                                                                     |
| `Link`                                    | retain  | [components/Link.tsx](../../../components/Link.tsx) correctly handles internal, external, and anchor cases with `rel="noopener noreferrer"`.                                                |
| `Image`                                   | retain  | [components/Image.tsx](../../../components/Image.tsx) handles the `BASE_PATH` prefix.                                                                                                       |
| `Tag`                                     | adapt   | Restyle only.                                                                                                                                                                               |
| `Card`                                    | replace | Four-field card cannot express a case study.                                                                                                                                                |
| `SectionContainer`                        | adapt   | Widen the reading measure and introduce a second, wider container for portfolio grids.                                                                                                      |
| `LayoutWrapper`                           | remove  | Unused. [app/layout.tsx](../../../app/layout.tsx) composes the shell directly. Dead code.                                                                                                   |
| `Header`, `MobileNav`                     | adapt   | Keep the structure, restyle, and add a skip link plus a focus trap audit.                                                                                                                   |
| `ThemeSwitch`                             | retain  | [components/ThemeSwitch.tsx](../../../components/ThemeSwitch.tsx) is a correct Headless UI menu with proper labels.                                                                         |
| `SearchButton`                            | replace | Preserve its entry points while replacing Pliny and kbar with a first-party `cmdk` dialog and MiniSearch ranking.                                                                           |
| `Comments`                                | replace | Use official `@giscus/react`, restrict it to blog posts, and preserve the click-to-load gate that avoids iframe cost on first paint.                                                        |
| `ScrollTopAndComment`                     | adapt   | Keep the scroll-to-top button. Drop the scroll-to-comment button when comments move behind a gate.                                                                                          |
| `MDXComponents`                           | replace | Move to a first-party map for the selected engine; remove Pliny and `BlogNewsletterForm`, then add callouts, figures, and code groups.                                                      |
| `TableWrapper`, `PageTitle`, social icons | retain  | Small and correct.                                                                                                                                                                          |
| Design-system primitives                  | add     | No `Button`, `Badge`, `Prose`, or `Card` primitive exists. Everything is ad-hoc Tailwind.                                                                                                   |
| Starfield component                       | add     | D4. Static SVG, Server Component, no animation after the SINGULARITY-005 measurement.                                                                                                       |

### Content and data

| Capability                                 | Class   | Evidence and rationale                                                                                                           |
| ------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Blog content schema                        | replace | Preserve the current fields in owner-selected Content Collections or Velite, then add `series` and `featured`.                   |
| Authors content schema                     | remove  | Migrate temporarily for parity, then fold into typed site data because a single-author collection adds indirection.              |
| MDX remark and rehype behavior             | replace | Preserve behavior in the selected engine, replacing Pliny-owned transforms with maintained or first-party equivalents.           |
| KaTeX and citations                        | retain  | D17. Directly relevant given the mathematics competition and quantitative background.                                            |
| `projectsData.ts`                          | replace | Four fields cannot carry a case study.                                                                                           |
| `siteMetadata.js`                          | adapt   | Convert to TypeScript, strip the newsletter block, replace every placeholder value.                                              |
| `headerNavLinks.ts`                        | adapt   | New information architecture.                                                                                                    |
| Experience, skills, education, awards data | add     | None exists. All four are needed and all four are sourced from the resume.                                                       |
| Eleven starter posts                       | remove  | D8. Delete all, keep one template and one seed post.                                                                             |
| Starter demo images                        | remove  | `google.png`, `time-machine.jpg`, `canada/*`, `ocean.jpeg`, `github-traffic.png`, `twitter-card.png` are all template artifacts. |

### Infrastructure

| Capability                          | Class  | Evidence and rationale                                                                  |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| RSS generation                      | retain | [scripts/rss.mjs](../../../scripts/rss.mjs) generates a main feed and per-tag feeds.    |
| Sitemap and robots                  | adapt  | Add the new routes.                                                                     |
| JSON-LD structured data             | adapt  | Extend from `BlogPosting` to include `Person` and `WebSite`.                            |
| Security headers                    | adapt  | Tighten `connect-src`, `img-src`, and `media-src`. Attempt removal of `unsafe-eval`.    |
| Static export capability            | retain | Keep as a documented fallback per D1, even though Vercel is the target.                 |
| GitHub Pages workflow               | adapt  | Demote to a manually dispatched fallback. Add a real quality gate workflow.             |
| Husky and lint-staged               | retain | Working pre-commit discipline.                                                          |
| Bundle analyzer                     | retain | Needed to enforce the JavaScript budgets.                                               |
| Test infrastructure                 | add    | Nothing exists.                                                                         |
| Continuous integration quality gate | add    | Nothing exists.                                                                         |
| Lighthouse CI                       | add    | Nothing exists, and the budgets in [README.md](README.md) are unenforceable without it. |

## Reference project research

Four repositories were researched on 2026-09-01. For each, the licence was checked before any pattern was recommended.

### Evidence and licence matrix

Research was frozen at the commits below. A repository tree was used only to locate files; semantic claims come from the linked file contents. Deployed sites are observational evidence, not proof of how a feature is implemented.

| Reference and pinned commit                                                                                                                                               | Evidence type                     | File-level observation                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Singularity implication                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`nelsonlaidev/nelsonlai.dev` at `17f1966b613219bcc0cf295614d41e363135f112`](https://github.com/nelsonlaidev/nelsonlai.dev/tree/17f1966b613219bcc0cf295614d41e363135f112) | Source                            | [`content-collections.ts`](https://github.com/nelsonlaidev/nelsonlai.dev/blob/17f1966b613219bcc0cf295614d41e363135f112/content-collections.ts) defines Zod-validated post, project, and page collections, compiles MDX, and computes slugs, dates, table-of-contents data, and Open Graph paths. [`package.json`](https://github.com/nelsonlaidev/nelsonlai.dev/blob/17f1966b613219bcc0cf295614d41e363135f112/package.json) runs separate unit and end-to-end suites.                      | Use as evidence that this starter lineage can migrate to `content-collections`, but port Singularity's existing transforms deliberately rather than copying the configuration.           |
| `nelsonlai.dev` at the same commit                                                                                                                                        | Source                            | [`vitest.config.ts`](https://github.com/nelsonlaidev/nelsonlai.dev/blob/17f1966b613219bcc0cf295614d41e363135f112/vitest.config.ts) scopes unit tests under `src/tests/unit`; [`playwright.config.ts`](https://github.com/nelsonlaidev/nelsonlai.dev/blob/17f1966b613219bcc0cf295614d41e363135f112/playwright.config.ts) retains failure artifacts and starts the application through a configured web server.                                                                              | Confirms the value of installing real test runners before component tasks depend on them. Singularity does not inherit this project's authenticated test topology.                       |
| [`jktrn/enscribe.dev` at `0c25ea4f2f56ff8cfad94023d4ebc942fb2875be`](https://github.com/jktrn/enscribe.dev/tree/0c25ea4f2f56ff8cfad94023d4ebc942fb2875be)                 | Source                            | [`astro.config.ts`](https://github.com/jktrn/enscribe.dev/blob/0c25ea4f2f56ff8cfad94023d4ebc942fb2875be/astro.config.ts) configures Astro, sitemap filtering, and a Markdown processor with math and custom AST plugins. [`package.json`](https://github.com/jktrn/enscribe.dev/blob/0c25ea4f2f56ff8cfad94023d4ebc942fb2875be/package.json) shows substantial font, media, line-breaking, site-test, and content-rendering tooling.                                                        | Adopt the principle of deliberate long-form rendering and themed graphics. Do not import its bespoke typography or asset pipeline into Singularity.                                      |
| `enscribe.dev` at the same commit                                                                                                                                         | Licence text                      | [`LICENSE.md`](https://github.com/jktrn/enscribe.dev/blob/0c25ea4f2f56ff8cfad94023d4ebc942fb2875be/LICENSE.md) reserves site-specific code and visual design, identifies separately licensed software, and applies CC BY-NC-ND 4.0 to editorial content.                                                                                                                                                                                                                                   | Inspiration only. Do not copy site code, design, layout, editorial content, or assets.                                                                                                   |
| [`aarabii/An` at `b152e5ca3dd1f284cec98491692f068894e985f0`](https://github.com/aarabii/An/tree/b152e5ca3dd1f284cec98491692f068894e985f0)                                 | Source                            | [`constant/index.ts`](https://github.com/aarabii/An/blob/b152e5ca3dd1f284cec98491692f068894e985f0/constant/index.ts) re-exports profile, experience, projects, skills, social, and SEO modules. [`package.json`](https://github.com/aarabii/An/blob/b152e5ca3dd1f284cec98491692f068894e985f0/package.json) includes Notion, shader, Motion, GSAP, email, and Next.js dependencies.                                                                                                         | Adopt only the general idea of centralized typed personal data, using Singularity's existing `data/` convention. Reject the runtime and visual dependencies for v1.                      |
| `aarabii/An` at the same commit                                                                                                                                           | Source and licence text           | [`app/api/send/route.ts`](https://github.com/aarabii/An/blob/b152e5ca3dd1f284cec98491692f068894e985f0/app/api/send/route.ts) validates and sanitizes input, applies origin and rate checks, and sends mail through credential-backed Nodemailer. [`LICENSE`](https://github.com/aarabii/An/blob/b152e5ca3dd1f284cec98491692f068894e985f0/LICENSE) permits modification and publication as a personal portfolio but forbids template redistribution, paid client delivery, and relicensing. | A server contact form has operational and secret-management costs that D7 avoids. Although personal-portfolio reuse is permitted, Singularity will not copy its code, design, or assets. |
| [`prakhau143/Portfolio` at `098198492880498dcf3aed8c585639e279588566`](https://github.com/prakhau143/Portfolio/tree/098198492880498dcf3aed8c585639e279588566)             | README claim corroborated by tree | [`README.md`](https://github.com/prakhau143/Portfolio/blob/098198492880498dcf3aed8c585639e279588566/README.md) identifies a single-page HTML, Three.js, Canvas, GSAP, and EmailJS stack, lists large MP4 and GLB assets, and reports a desktop Lighthouse performance score of 64 with a 33.5-second Largest Contentful Paint. The pinned tree contains the named deployment and media artifacts.                                                                                          | Use as a risk contrast for immersive media. The numbers are self-reported local measurements, not independently reproduced benchmarks.                                                   |
| `prakhau143/Portfolio` at the same commit                                                                                                                                 | Deployed-site observation         | The README's GitHub Pages URL returned HTTP 404 during research on 2026-09-01.                                                                                                                                                                                                                                                                                                                                                                                                             | Do not present any live-site behavior as verified. Use only the pinned repository evidence and label README performance data as self-reported.                                           |

> [!WARNING]
> [`enscribe.dev`'s licence](https://github.com/jktrn/enscribe.dev/blob/0c25ea4f2f56ff8cfad94023d4ebc942fb2875be/LICENSE.md) explicitly forbids copying its site-specific source code and visual design, and directs users to the separately licensed `jktrn/astro-erudite` foundation. Its ideas inform Singularity's typography requirements. None of its site code, CSS, visual design, content, or assets may be transcribed.

### Project summaries

#### nelsonlaidev/nelsonlai.dev

Pinned commit `17f1966b613219bcc0cf295614d41e363135f112`, "fix: default og image shouldn't be localized".

Stack: Next.js 16, App Router, TypeScript strict, Tailwind, MDX through `content-collections`, Drizzle ORM, internationalization, Base UI, Shiki, Motion, Better Auth, Redis, Upstash rate limiting, Umami, Vitest, Playwright, Oxlint, Oxfmt, Lefthook.

`Evidence` from source: the project uses `content-collections` for Zod-validated MDX posts, projects, and pages, and has dedicated Vitest and Playwright configurations. Its broader application also includes authentication, databases, email, internationalization, and rate limiting, none of which are Singularity requirements.

`Inference`: the project proves that migration from this starter lineage to `content-collections` is feasible. The source does not establish why the maintainer migrated, so the plan does not attribute the decision to Contentlayer's maintenance status.

#### jktrn/enscribe.dev

Pinned commit `0c25ea4f2f56ff8cfad94023d4ebc942fb2875be`, "feat: better toc with sidenotes".

Stack: Astro, vanilla CSS, Svelte islands, Bun, Biome, Cloudflare via Wrangler. Architecturally unrelated to Singularity.

The value is in its reader-experience engineering. The pinned configuration and package scripts show custom Markdown transforms, math handling, content-asset rendering, font preparation, media management, line breaking, and site tests. These files establish a high implementation cost as clearly as they establish capability.

`Recommendation`: adopt the _principle_ that every graphic is authored for both themes, and adopt a fluid type scale. Do not attempt Knuth-Plass line breaking. The author describes it as fragile and gates it behind a toggle, which is a strong signal about its cost-to-benefit ratio for a site of Singularity's scale.

#### aarabii/An

Pinned commit `b152e5ca3dd1f284cec98491692f068894e985f0`, "feat(api): implement resend email functionality with validation and rate limiting".

Stack: Next.js 16, React 19, Tailwind v4, Motion, GSAP, `@paper-design/shaders-react` for WebGL shaders, Notion as a headless CMS, Nodemailer with Gmail SMTP, Sonner, Lucide.

The genuinely transferable idea is its `constant/` directory. The barrel exports profile, projects, experience, skills, social, and SEO modules, centralizing personal data outside components.

`Recommendation`: adopt the centralized typed content directory pattern. Singularity will name it `data/` to match the existing repository convention rather than introducing a second top-level content location.

`Recommendation`: reject the Notion CMS, the WebGL shaders, and the Gmail SMTP contact form. Notion adds a network dependency and an API key to a site whose content is already version-controlled. The shaders violate D4. The SMTP form requires credential handling that D7 avoids.

#### prakhau143/Portfolio

Pinned commit `098198492880498dcf3aed8c585639e279588566`, "Redesign portfolio into recruiter-facing engineering product".

Stack: a single `index.html`, vanilla JavaScript, Three.js r128, GSAP ScrollTrigger, EmailJS, deployed to GitHub Pages.

`README claim`: self-reported desktop Lighthouse scores of Performance 64, Accessibility 100, Best Practices 100, and SEO 100. The same README reports a 33.5-second Largest Contentful Paint and attributes the cost to cinematic MP4 files, Three.js GLB models, and WebGL canvases. These figures were not independently reproduced because the published URL returned 404.

This is the most useful reference in the set, for the opposite of the usual reason. It is a rigorous demonstration of the cost of the immersive-hero approach. Its accessibility work is genuinely good, and worth copying as _practice_: IntersectionObserver pausing offscreen 3D and video, `prefers-reduced-motion` honoured throughout, `pointer-events: none` on every decorative layer, all interactive targets at least 24 by 24 pixels, and a correct heading order with a `<main>` landmark.

`Recommendation`: adopt the accessibility practices wholesale. Adopt none of the asset strategy. The 97 MB video and the 64 performance score are the direct evidence behind D4.

## Feature and user-experience matrix

How each reference's notable features map onto Singularity. "Fit" is the judgement, with the reason.

| Feature                             |        nelsonlai.dev        |          enscribe.dev           |          An          |   Portfolio   | Fit for Singularity                                                                     |
| ----------------------------------- | :-------------------------: | :-----------------------------: | :------------------: | :-----------: | --------------------------------------------------------------------------------------- |
| MDX content in repository           |             Yes             |               Yes               |      No, Notion      |      No       | Adopt. Already present and working.                                                     |
| Headless CMS                        |             No              |               No                |         Yes          |      No       | Reject. Adds a runtime dependency and a secret for no editorial gain.                   |
| Typed central data directory        |             Yes             |             Partial             |         Yes          |      No       | Adopt. The single highest-value structural idea in the set.                             |
| Project case-study pages            |           Partial           |               Yes               |         Yes          |      Yes      | Adopt. Core to the portfolio goal.                                                      |
| Experience timeline                 |             No              |               Yes               |         Yes          |      Yes      | Adopt. Directly serves the recruiter journey.                                           |
| Table of contents                   |             Yes             |       Yes, with sidenotes       |          No          |      No       | Adopt. Preserve `toc` as a typed derived field in the selected engine.                  |
| Shiki syntax highlighting           |             Yes             |               Yes               |          No          |      No       | Defer. Prism already works. Revisit only if theme-aware highlighting becomes a blocker. |
| Fluid type scale                    |             No              |           Yes, Utopia           |          No          |      No       | Adopt. Cheap in Tailwind v4 with `clamp()` tokens.                                      |
| Dual-theme graphics                 |             No              |               Yes               |          No          |      No       | Adopt as an authoring rule for diagrams.                                                |
| Reader mode                         |             No              |               Yes               |          No          |      No       | Defer. Interesting, but unproven value at Singularity's scale.                          |
| Knuth-Plass line breaking           |             No              |               Yes               |          No          |      No       | Reject. Author flags it as fragile, and it demands custom font tooling.                 |
| Dynamic Open Graph images           |             Yes             |               Yes               |         Yes          |      No       | Adopt. `next/og` is available under D1.                                                 |
| Comment system                      | Yes, custom with a database |           Yes, Giscus           |          No          |      No       | Adopt Giscus. A custom system needs a database, which is out of scope.                  |
| Post view counts and likes          |             Yes             |               No                |          No          |      No       | Reject per D15. Requires a database.                                                    |
| Internationalization                |             Yes             |               No                |          No          |      No       | Reject per D10.                                                                         |
| Motion library                      |         Yes, Motion         |             Minimal             | Yes, Motion and GSAP |   Yes, GSAP   | Reject for v1. CSS transitions and the Canvas starfield cover the need.                 |
| WebGL or 3D                         |             No              |               No                |     Yes, shaders     | Yes, Three.js | Reject per D4. The Portfolio reference quantifies the cost.                             |
| Video backgrounds                   |             No              |               No                |          No          |      Yes      | Reject. 97 MB of media is indefensible.                                                 |
| Live third-party status widgets     |             No              | Yes, WakaTime, Spotify, Discord |          No          |  Yes, GitHub  | Defer. Every widget is a third-party request, a privacy disclosure, and a failure mode. |
| Contact form                        |             Yes             |               No                |         Yes          | Yes, EmailJS  | Reject for v1 per D7.                                                                   |
| Newsletter                          |             No              |               No                |          No          |      No       | Remove. No reference retained it, which is corroborating evidence.                      |
| Unit and end-to-end testing         |             Yes             |               Yes               |          No          |      No       | Adopt per D9.                                                                           |
| Continuous integration quality gate |             Yes             |               Yes               |       Partial        |      Yes      | Adopt.                                                                                  |
| Command palette search              |             No              |               No                |          No          |      No       | Adopt the behavior through `cmdk` and MiniSearch; do not retain Pliny or kbar.          |

### What does not fit, and why

Three ideas were seriously considered and rejected. Recording the reasoning prevents them being relitigated.

The immersive 3D hero was rejected because the only reference that implements it fully publishes a performance score of 64 and attributes it to that choice. Singularity's stated goal is a sixty-second recruiter skim. A hero that delays Largest Contentful Paint works directly against the primary goal.

Notion as a content source was rejected because it converts a version-controlled, reviewable, offline-editable content set into a network call guarded by a secret. The current MDX pipeline already supports mathematics, citations, and syntax highlighting, which Notion does not.

A database-backed engagement layer, meaning view counts, likes, and a custom comment system, was rejected because it converts a static site into a stateful application with a hosting bill, a migration story, a privacy policy obligation, and a new class of outage. Giscus provides comments at zero infrastructure cost by delegating to GitHub Discussions.

## Portfolio content source

`Evidence` from `ResumeLatex3.pdf`, present at the repository root and extracted on 2026-09-01. This is the authoritative seed for all portfolio data.

Subject: Matthew Gong. Bachelor of Computing and Financial Management, University of Waterloo, 2023 to 2027 expected.

Experience entries:

| Role              | Organization                 | Dates                |
| ----------------- | ---------------------------- | -------------------- |
| Technical Analyst | MPBSDP                       | Apr 2026 to Oct 2026 |
| Data Analyst      | Ontario Financing Authority  | Jan 2025 to Aug 2025 |
| Finance Intern    | Trench Group, Siemens Energy | May 2024 to Aug 2024 |

Project entries:

| Project               | Dates                | Core technologies                                                                           |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| Robotics Challenge    | Jul 2025 to Aug 2025 | YOLO, ROS, Python, computer vision. Third place among hundreds of university teams in China |
| ROS Mobile Controller | Sep 2023 to Apr 2024 | iOS, C++, ROS, SLAM                                                                         |

Awards: American Invitational Mathematics Examination 2022, Canadian Computing Competition 2021 top 7 percent, USA Computing Olympiad Bronze 2020 with a perfect score of 1000, University of Waterloo President's Scholarship of Distinction and CFM Entrance Award.

Skills, as three groups: programming languages, libraries and frameworks, and tools and platforms. The full lists are transcribed into the task specification for `SINGULARITY-029` in [tasks.md](tasks.md).

Interests: ultimate frisbee, tennis, skiing, snowboarding, swimming, guitar, piano, escape rooms.

> [!CAUTION]
> The resume contains a phone number, `[REDACTED PHONE]`, and a plain-text email address. `Recommendation`: the phone number must not be published on the website or entered into site data, and the published PDF must be a redacted variant. See `SINGULARITY-032` and the privacy section of [architecture.md](architecture.md).

`Evidence`: the Technical Analyst role at MPBSDP describes multi-agent systems, an Angular 4 to Angular 20 migration, Karma and Jasmine validation loops, Azure DevOps and Figma automation, and Karpathy-style LLM wikis with hybrid retrieval. This is unusually specific, current, and differentiated material. `Recommendation`: it should anchor both the home page positioning and the first seed blog post rather than being compressed into a single resume bullet.

## Sources

Repository files are cited inline throughout. External source inspection and deployed-site observations were performed on 2026-09-01. The full commit SHAs in the evidence matrix freeze the researched state. README-only claims are labelled and are not treated as independently measured facts.

The deployed `nelsonlai.dev` and `enscribe.dev` sites were inspected only to understand visible navigation and reader flows. `aarab.me` redirected to `www.aarab.me`; no implementation claim rests on that redirect. The `prakhau143/Portfolio` GitHub Pages URL returned 404. Source files and licence text control every recommendation in this plan.
