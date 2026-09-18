---
title: Singularity Product and Design
description: Target audiences, user journeys, information architecture, route map, content strategy, and the observatory visual direction for Singularity
author: Matthew Gong
ms.date: 2026-09-01
ms.topic: concept
keywords:
  - information architecture
  - design system
  - accessibility
  - user journeys
estimated_reading_time: 26
---

## Audiences

Four audiences, ordered by how much design authority each holds. When two audiences want different things, the higher one wins.

### Primary: technical recruiters and hiring managers

University of Waterloo co-op cycles and new-graduate pipelines for software engineering, applied machine learning, and quantitative or fintech roles. They arrive from a resume link, a LinkedIn profile, or an application form. They are skimming, often on a phone, often with dozens of other tabs open, and they are looking for a reason to advance or reject.

What they need, in order: name and current status, evidence of shipped work, depth on one or two things, and a way to contact or download a resume. What they will not do: scroll through a decorative hero, wait for a 3D scene, or hunt for a navigation item.

### Secondary: engineers evaluating technical depth

Interviewers preparing for a conversation, and peers who arrived from a shared post. They will read a case study properly, open the repository, and judge the writing. They are the reason the blog exists and the reason code, mathematics, and diagrams must render well.

### Tertiary: the broader technical web

Readers who found a post through search or aggregation. They may never look at the portfolio. They should still get a fast, readable, well-typeset article, correct social previews, and an obvious path to the rest of the site.

### Quaternary: Matthew

The site is also a durable record. Low friction for adding a project or a post is a real requirement, not a nicety. If publishing is painful, the site goes stale, and a stale portfolio is worse than none.

## User journeys

Each journey has an entry point, a success condition, and a measurable target. These are the basis of the end-to-end tests specified in `SINGULARITY-055`.

### J1: The sixty-second screen

A recruiter opens `/` on a mid-tier Android phone over a throttled connection.

1. Above the fold, without scrolling, they see the name, a one-line positioning statement, current status, and primary actions.
2. One scroll reveals two or three selected projects with an outcome stated in each.
3. A second scroll reveals recent writing and the contact block.
4. They either download the resume or open a project.

Success: identity and evidence acquired without scrolling past decoration. Target: Largest Contentful Paint under 1.8 seconds, and the positioning statement present in the initial server-rendered HTML.

### J2: The depth check

An interviewer opens a project from `/projects`.

1. The project page opens with the problem, the role, the stack, and the outcome visible before any narrative.
2. They scan the case study, which is structured rather than a wall of prose.
3. They open the repository or a related post.

Success: they can describe the project accurately after ninety seconds. Target: every project page states role, timeframe, stack, and outcome in a scannable block at the top.

### J3: The reader

Someone arrives at a blog post from search or a social share.

1. The post renders with correct typography, a table of contents on wide viewports, and working code, mathematics, and figures.
2. Comments are available but not loaded until requested.
3. Related tags and adjacent posts offer a next step.

Success: the article is finished. Target: zero layout shift after first paint, and a social preview card that renders the post title.

### J4: The resume fetch

A recruiter needs the PDF.

1. `/resume` is reachable from the header on every viewport.
2. The page shows the resume as real HTML, which is indexable and readable on a phone.
3. A prominent download control serves the redacted PDF.

Success: PDF obtained in two clicks from any page. Target: the PDF is under 400 KB and carries a descriptive filename.

### J5: The author

Matthew adds a post or a project.

1. A post is one new MDX file in `data/blog/`, copied from a template.
2. A project is one new entry in the typed projects data plus an optional MDX case study.
3. `yarn dev` shows it immediately. `yarn build` regenerates the tag counts, the search index, and the feeds.

Success: publishing requires no component edits. Target: no more than two files touched for either operation.

## Information architecture

### Principles

Navigation is flat. There are no dropdowns and no nested menus, because every top-level destination fits in a single row on desktop and a single column on mobile.

Portfolio and writing are peers, not parent and child. The current starter treats the blog as the site and the portfolio as an afterthought. Singularity inverts the emphasis on the home page while keeping both first-class in navigation.

Tags belong to writing only. Projects are categorized by their own typed fields, not by the blog tag vocabulary, because mixing them pollutes both.

### Primary navigation

Five items. This is the ceiling. Adding a sixth requires removing one.

| Label   | Destination | Rationale                                                |
| ------- | ----------- | -------------------------------------------------------- |
| Work    | `/projects` | Named for what the audience wants, not for the data type |
| Writing | `/blog`     |                                                          |
| About   | `/about`    | Biography, skills, education, awards                     |
| Resume  | `/resume`   | Elevated to top level because J4 is a primary journey    |
| Uses    | `/uses`     |                                                          |

Secondary destinations reachable from the footer only: `/tags`, the RSS feed, and the colophon.

`Decision needed`: whether `Uses` earns a top-level slot or moves to the footer. `Recommendation`: ship it in the header, and demote it if analytics show negligible engagement after three months. Tracked as `OQ-3` in [risks-and-decisions.md](risks-and-decisions.md).

### Route map, target

New and changed routes are marked. Everything unmarked is retained as-is.

| Route                     | Rendering                      | Status      | Notes                                                                 |
| ------------------------- | ------------------------------ | ----------- | --------------------------------------------------------------------- |
| `/`                       | Static                         | Rebuilt     | Portfolio home. Identity, selected work, recent writing, contact      |
| `/projects`               | Static                         | Adapted     | Filterable index of all projects                                      |
| `/projects/[slug]`        | Static, `generateStaticParams` | New         | Case study. MDX body plus typed metadata                              |
| `/blog`                   | Static                         | Retained    | List with tag sidebar                                                 |
| `/blog/page/[page]`       | Static, `generateStaticParams` | Retained    |                                                                       |
| `/blog/[...slug]`         | Static, `generateStaticParams` | Adapted     | Single consolidated post layout                                       |
| `/tags`                   | Static                         | Retained    |                                                                       |
| `/tags/[tag]`             | Static, `generateStaticParams` | Retained    |                                                                       |
| `/tags/[tag]/page/[page]` | Static, `generateStaticParams` | Retained    |                                                                       |
| `/about`                  | Static                         | Adapted     | Biography, skills, education, awards, interests                       |
| `/resume`                 | Static                         | New         | HTML resume plus PDF download                                         |
| `/uses`                   | Static                         | Optional    | Hardware, editor, tooling; withdraw if the content is filler          |
| `/og/[...slug]`           | Edge, dynamic                  | Conditional | Open Graph image generation; ship only after `SINGULARITY-004` passes |
| `/feed.xml`               | Build artifact                 | Retained    | Plus per-tag feeds                                                    |
| `/sitemap.xml`            | Static                         | Adapted     | New routes added                                                      |
| `/robots.txt`             | Static                         | Retained    |                                                                       |
| `/api/newsletter`         | Removed                        | Removed     | D6                                                                    |
| 404                       | Static                         | Adapted     | Observatory-themed, with useful links                                 |

### Route groups

`Recommendation`: introduce a single route group, `app/(site)/`, holding every user-facing page, and leave `app/og/`, `app/robots.ts`, and `app/sitemap.ts` outside it.

The benefit is concrete rather than cosmetic. The site shell, meaning the header, footer, skip link, and starfield mount, becomes a `(site)/layout.tsx`, which keeps the root `app/layout.tsx` responsible only for the document, fonts, theme provider, and analytics. Open Graph image routes then do not inherit the shell they would otherwise have to opt out of.

`Recommendation`: do not adopt a `src/` directory. The reference project `nelsonlai.dev` uses one, but migrating costs a repository-wide path-alias change and every import edit, for zero functional gain. The existing top-level layout is already conventional for this starter lineage.

## Content strategy

### Portfolio data

All personal data lives in `data/` as typed TypeScript modules with a barrel export, following the centralized-constants pattern observed in `aarabii/An` but named to match this repository's existing convention.

| Module               | Contents                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `data/profile.ts`    | Name, positioning statement, current status, location, biography paragraphs |
| `data/social.ts`     | Platform, URL, handle, and icon key for each social destination             |
| `data/projects.ts`   | Full typed project records                                                  |
| `data/experience.ts` | Roles, organizations, dates, achievement bullets                            |
| `data/skills.ts`     | Grouped skills with proficiency signalling                                  |
| `data/education.ts`  | Degree, institution, dates, and awards                                      |
| `data/uses.ts`       | Hardware, software, and tooling entries                                     |
| `data/site.ts`       | Replaces `siteMetadata.js`, converted to TypeScript                         |
| `data/navigation.ts` | Replaces `headerNavLinks.ts`                                                |

The project type is the critical one, because the current four-field shape is the main content blocker. The target shape:

```typescript
export type ProjectStatus = 'shipped' | 'active' | 'archived' | 'competition'

export interface Project {
  slug: string
  title: string
  tagline: string // one line, appears on cards and OG images
  role: string // what Matthew personally did
  period: { start: string; end?: string } // ISO YYYY-MM
  status: ProjectStatus
  stack: string[] // canonical technology names
  outcome: string // a measurable or verifiable result
  featured: boolean // surfaces on the home page
  order: number // manual sort within featured
  links: { label: string; href: string; kind: 'repo' | 'demo' | 'writeup' | 'award' }[]
  cover?: { src: string; alt: string; width: number; height: number }
  caseStudy?: string // slug of the MDX file in data/projects/
}
```

Every field earns its place against a journey. `outcome` exists because J1 needs evidence, not description. `role` exists because team projects are ambiguous without it. `status` exists because an archived 2023 project should not read as current work.

### Seed content from the resume

Two projects, three roles, and the awards are transcribed from `ResumeLatex3.pdf`. See [research.md](research.md) for the extracted source.

`Recommendation`: the Robotics Challenge project gets a full case study. It has a verifiable outcome, third place among hundreds of university teams, a substantial technical narrative covering YOLO retraining and ROS navigation, and it is visually rich. It should be the featured project.

`Recommendation`: the Technical Analyst role at MPBSDP is the strongest current material and should anchor the home page positioning statement. Multi-agent systems, a full Angular 4 to Angular 20 migration, and Karpathy-style LLM wikis with hybrid retrieval are specific and current. `Decision needed`: how much of this is publishable given employer confidentiality. Tracked as `OQ-1`.

`Assumption`: at least one additional personal project can be added during the content phase, bringing the portfolio to three or four entries. Two is thin for a portfolio index.

### Blog content

Frontmatter extends the existing Contentlayer `Blog` type with two fields and removes none, so no existing post breaks.

| Field      | Type              | Purpose                                                            |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| `series`   | string, optional  | Groups multi-part posts, pairing with the existing catch-all route |
| `featured` | boolean, optional | Surfaces on the home page independently of recency                 |

The eleven starter posts are deleted per D8. Two files remain: `data/blog/_template.mdx`, excluded from the build by the existing `draft` mechanism, and one real seed post.

`Recommendation`: the seed post should be drawn from the MPBSDP work, on multi-agent workflow orchestration or on the practice of building a Karpathy-style LLM wiki without a vector store. It demonstrates current, differentiated expertise, and it gives the blog a credible first impression rather than a "hello world" placeholder.

### Tag vocabulary

The starter's tags are template artifacts and go with the posts. `Recommendation`: seed a deliberate, small vocabulary and resist growth. Proposed initial set: `ai-agents`, `machine-learning`, `robotics`, `systems`, `finance`, `tooling`, `notes`. Tags are lowercase and hyphenated, matching the existing `github-slugger` behaviour.

## Visual direction

### Concept

The reference is an observatory, not outer space. This distinction carries the whole design.

Space imagery, as commonly executed, means a dark page with a nebula photograph and glowing purple gradients. It is decorative, it is everywhere, and it says nothing about the person.

An observatory is an instrument. It is precise, quiet, and legible in the dark by necessity. Its visual language is measurement: star charts, coordinate grids, magnitude scales, spectral classification, plate annotations, and finding charts. It is dense with information and almost entirely monochrome, with colour reserved for meaning.

Singularity takes the instrument, not the postcard. Charts over photographs. Annotation over ornament. Colour as data, not as mood.

This also resolves the light-mode problem that afflicts space-themed sites. An observatory has two authentic modes: the night sky as observed, and the printed star chart on paper. Light mode is not a compromised inversion of dark mode. It is a photographic plate.

### Colour

Built as Tailwind v4 `@theme` tokens in [css/tailwind.css](../../../css/tailwind.css), replacing the current pink `--color-primary-*` ramp. All values in OKLCH, matching the existing file's convention.

Three ramps.

`--color-void-*` is the dark-mode surface ramp. Deep blue-black rather than neutral black, because true black on OLED against light text produces smearing during scroll, and a slight blue cast reads as sky rather than as absence.

`--color-plate-*` is the light-mode surface ramp. Warm off-white with a faint grey cast, referencing a photographic plate rather than paper white. Pure white is avoided because it raises effective contrast against dark text past comfort for long reading.

`--color-starlight-*` is the single accent ramp. Cyan-white, in the region of a hot main-sequence star. It is used for links, focus rings, active navigation state, and nothing else.

`Recommendation`: one accent only. Every additional accent colour is a decision the reader has to decode. Semantic colours for success, warning, and error are added only when a component genuinely needs them, which for a portfolio is close to never.

Contrast requirements, verified in `SINGULARITY-012`:

| Pairing                             | Minimum                       |
| ----------------------------------- | ----------------------------- |
| Body text on surface, both themes   | 7.0:1, WCAG AAA for body copy |
| Large text and headings             | 4.5:1                         |
| Accent on surface, for links        | 4.5:1                         |
| Focus ring against adjacent surface | 3.0:1                         |
| Non-text UI boundaries              | 3.0:1                         |

The accent is the risk. A cyan-white bright enough to feel like starlight on the void surface can fail against the plate surface. `Recommendation`: use a different stop from the same ramp per theme rather than compromising to a single value that is mediocre in both.

### Typography

`Evidence`: the current site uses Space Grotesk for everything, via `next/font/google` in [app/layout.tsx](../../../app/layout.tsx). A single geometric sans for both headings and long-form body text is the wrong tool for a site whose credibility rests on essays.

Three faces, all self-hosted under the SIL Open Font License, all variable, all subsetted to Latin.

| Role                   | Choice                                                                                                 | Rationale                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Body and prose         | A humanist or transitional serif with true italics and old-style numerals                              | Long-form reading. Old-style numerals matter because dates and measurements appear constantly in a resume-adjacent site |
| Interface and headings | A neutral grotesque                                                                                    | Navigation, labels, metadata, buttons. Deliberately recessive so the serif carries the voice                            |
| Code and data          | A monospace with clear zero disambiguation and programming ligatures available but disabled by default | Code blocks, technical labels, coordinate-style annotations                                                             |

`Recommendation`: candidate faces are Source Serif 4, Inter, and JetBrains Mono, all OFL, all variable, all with mature subsetting. Final selection happens in `SINGULARITY-010` with licence verification as an explicit acceptance criterion.

`Recommendation`: adopt a fluid type scale using `clamp()` in the `@theme` block, sized so that body copy lands at 17 to 19 pixels across the viewport range and the measure stays between 60 and 75 characters. This borrows the fluid-scale principle demonstrated by `enscribe.dev` without borrowing its implementation.

Font loading rules, enforced in `SINGULARITY-011`:

- `font-display: swap` on every face.
- Preload only the body regular and interface regular weights. Nothing else.
- Subset to `latin` and `latin-ext`. No other ranges.
- Total font payload budget: 120 KB across all faces and weights.
- Metric-compatible fallbacks declared with `size-adjust` so that swap produces no layout shift.

### Layout

Three container widths, replacing the single `max-w-3xl` and `xl:max-w-5xl` in [components/SectionContainer.tsx](../../../components/SectionContainer.tsx).

| Container | Width  | Used by                                               |
| --------- | ------ | ----------------------------------------------------- |
| Prose     | 68ch   | Blog post and case study body copy                    |
| Content   | 1024px | Page headers, lists, forms                            |
| Wide      | 1280px | Project grids, the home page, the experience timeline |

A four-column baseline grid on mobile and a twelve-column grid from the large breakpoint governs alignment. The observatory reference appears here as a faint coordinate rule: section boundaries are marked by a hairline with a small tick annotation rather than by a heavy divider, echoing a chart's declination grid.

Post pages gain a wide-viewport sidebar carrying the table of contents, using the `toc` field Contentlayer already computes. It is sticky, it collapses to a disclosure element below the large breakpoint, and it is not rendered at all when a post has fewer than three headings.

### Imagery and iconography

`Recommendation`: every diagram is authored in both themes. This is the one idea from `enscribe.dev` worth adopting wholesale as an authoring rule. Vector diagrams are inlined as SVG and reference the same CSS custom properties as the page, so they retheme for free. Raster images get an explicit dark variant or a subtle luminance treatment, never an automatic CSS filter inversion, which mangles photographs.

Iconography is a single line-based set at a consistent stroke weight, imported per icon so that tree-shaking works. The existing hand-written social icons in [components/social-icons/icons.tsx](../../../components/social-icons/icons.tsx) are retained, since they are already minimal and dependency-free.

`Recommendation`: no stock space photography. It is the fastest way to make a distinctive concept look generic. Project imagery is screenshots, diagrams, and photographs of actual work, such as the robot from the Robotics Challenge.

### Motion

Governed by D4. The ceiling is Canvas 2D.

The starfield is a single isolated client leaf component. It renders into a fixed, full-viewport `<canvas>` behind all content, with `aria-hidden="true"`, `pointer-events: none`, and a `z-index` below every interactive layer. It never wraps content, so it cannot force parent components to become client components. This is what protects the seven-file client boundary documented in [research.md](research.md).

Hard constraints, verified in `SINGULARITY-026`:

- The Canvas implementation is not imported when `prefers-reduced-motion: reduce` is set. The small media-query mount still executes so it can select the static SVG fallback.
- Mounted through `next/dynamic` with `ssr: false`, after first paint, so it is never on the Largest Contentful Paint critical path.
- Suspended through `IntersectionObserver` and the `visibilitychange` event, a practice taken directly from the `prakhau143/Portfolio` accessibility notes.
- Device pixel ratio capped at 2. Star count scales with viewport area and caps at 240.
- Frame budget: under 2 milliseconds of main-thread time per frame on a mid-tier device.
- Bundle budget: 8 KB gzipped, and 0 KB when reduced motion is requested.
- Disabled entirely below the medium breakpoint. Mobile gets the static fallback. Phones are where the recruiter journey actually happens and where the battery cost is least justifiable.

Interface motion beyond the starfield is CSS-only: transitions on colour, opacity, and transform, all at or under 200 milliseconds, all with a standard easing token, all suppressed under a global reduced-motion media query. No animation library is introduced, which keeps Singularity clear of the Motion and GSAP dependencies carried by two of the reference projects.

`Recommendation`: no scroll-linked animation, no parallax, and no reveal-on-scroll. They fight the sixty-second skim, they are a common source of Cumulative Layout Shift, and they degrade badly under fast scrolling.

### Theming

The existing `next-themes` setup in [app/theme-providers.tsx](../../../app/theme-providers.tsx) is retained unchanged, including `suppressHydrationWarning` on the `html` element and the `.dark` class variant already declared in [css/tailwind.css](../../../css/tailwind.css).

The default resolves to system preference, which is the current behaviour. The `<meta name="theme-color">` pair already present in [app/layout.tsx](../../../app/layout.tsx) is updated to the new void and plate values.

`Recommendation`: keep the three-state control, light, dark, and system, rather than a two-state toggle. The Headless UI implementation in [components/ThemeSwitch.tsx](../../../components/ThemeSwitch.tsx) already does this correctly and is accessible as written.

## Responsive behaviour

Breakpoints follow Tailwind defaults. No custom breakpoints are introduced.

| Range            | Behaviour                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Below 640px      | Single column. Static SVG starfield. Table of contents collapsed into a disclosure. Navigation in the existing mobile sheet. Project cards full width. |
| 640px to 1024px  | Two-column project grid. Navigation still in the sheet. Starfield still static.                                                                        |
| 1024px to 1280px | Full horizontal navigation. Canvas starfield enabled. Table of contents as a sticky sidebar. Three-column project grid.                                |
| Above 1280px     | Wide container engages. Experience timeline gains its date gutter. Measure stays capped at 68ch regardless of available width.                         |

Mobile is the design target, not the fallback. J1 explicitly assumes a phone.

## Accessibility

Every item below is a testable requirement, not an aspiration. Enforcement lives in `SINGULARITY-055` and `SINGULARITY-056`.

### Keyboard

A skip link is the first focusable element on every page, visible on focus, targeting the `<main>` landmark. It does not exist today and must be added.

Every interactive element is reachable and operable by keyboard in a logical order. Focus is never trapped except inside the mobile navigation sheet, which must trap deliberately and restore focus to the trigger on close. `Evidence`: [components/MobileNav.tsx](../../../components/MobileNav.tsx) uses Headless UI's `Dialog`, which handles this, and it must be verified rather than assumed.

Focus indication uses the existing `:focus-visible` outline rule in [css/tailwind.css](../../../css/tailwind.css), retinted to the starlight accent, at a minimum of 3:1 against every adjacent surface. Outlines are never removed.

### Screen readers

One `<h1>` per page, with heading levels descending without gaps. Landmarks are explicit: `<header>`, `<nav>`, `<main>`, `<footer>`. The starfield canvas carries `aria-hidden="true"`. Decorative images take an empty `alt`. Every content image takes a meaningful `alt`, which is why the project cover type makes `alt` required rather than optional.

Icon-only controls carry an accessible name. `Evidence`: the existing components already do this correctly through `sr-only` spans and `aria-label` attributes in [components/social-icons/index.tsx](../../../components/social-icons/index.tsx) and [components/SearchButton.tsx](../../../components/SearchButton.tsx). Preserve the pattern.

The blog list search filter in [layouts/ListLayoutWithTags.tsx](../../../layouts/ListLayoutWithTags.tsx) must announce result counts through a polite live region. It currently does not.

### Reduced motion

A global `@media (prefers-reduced-motion: reduce)` rule sets animation and transition duration to near zero. The starfield module is not loaded at all. The `scroll-smooth` class currently on the `html` element in [app/layout.tsx](../../../app/layout.tsx) must be made conditional, because smooth scrolling is itself vestibular motion.

### Contrast and target size

Contrast minimums are tabulated in the colour section. Interactive targets are at least 24 by 24 CSS pixels, matching WCAG 2.2 target size, a practice the `prakhau143/Portfolio` reference documents explicitly and gets right.

### Progressive enhancement and fallbacks

The site must be fully usable with JavaScript disabled. Every core route is statically rendered, so navigation, reading, project browsing, and the resume download all work without client JavaScript. What degrades: the theme switch falls back to the system preference, the kbar command palette is unavailable, the blog search filter is unavailable, Giscus comments do not load, and the Canvas starfield is replaced by static artwork.

Canvas is treated as optional, not assumed. If `getContext('2d')` returns null, the static SVG fallback remains. There is no WebGL path at all, so no WebGL fallback is required, which is a direct benefit of D4.

## Success measurement

Beyond the technical budgets in [README.md](README.md), the product signals worth watching if Umami is enabled are `/resume` reach rate as a share of home page sessions, project page depth, and referral sources from applications. Version 1 permits page views only. Cookieless operation reduces tracking surface but does not prove that no personal data is processed or that a consent banner is unnecessary in every jurisdiction. `SINGULARITY-050` must record the selected hosting mode, data fields, retention, applicable jurisdiction, and resulting notice or consent decision before analytics is enabled.
