<!-- markdownlint-disable-file -->

# SINGULARITY-002 Content Engine Candidate Research

## Scope

Research date: 2026-09-03

Questions:

- What are the latest stable versions, release dates, and latest substantive maintenance activity for Velite and Content Collections?
- What Node.js versions and licenses do the candidates require?
- What Next.js 15 and React 19 compatibility concerns are documented or evidenced?
- How do official Next.js integration, MDX, schemas, computed fields, watch mode, and static export compare?
- Which limitations affect Singularity's current Unified plugin pipeline?
- What minimum representative corpus and assertions must each disposable spike exercise?
- Which exact package versions should each spike pin without preselecting the owner decision?

## Candidate Facts

Snapshot date: 2026-09-03. Versions below are exact spike pins, not ranges. This
research does not select an engine or record owner approval.

| Candidate package           | Stable pin | Published  | Licence | Declared runtime compatibility                                             |
| --------------------------- | ---------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `velite`                    | `0.4.0`    | 2026-06-17 | MIT     | Node `^18.20.0` or `>=20.3.0`; ESM-only                                    |
| `@content-collections/core` | `0.15.2`   | 2026-06-16 | MIT     | No Node engine in the package manifest; TypeScript peer `^5.0.2` to `^7.0` |
| `@content-collections/next` | `0.2.11`   | 2026-02-14 | MIT     | Core peer `0.x`; Next.js peer `^12` to `^16`                               |
| `@content-collections/mdx`  | `0.2.2`    | 2025-03-10 | MIT     | Core peer `0.x`; React and React DOM peers `>=18`                          |

Velite's npm `latest` tag points to `0.4.0`. Version `1.0.0-alpha.3`, published
2026-06-19, is a prerelease and is not the stable spike pin. Content Collections
publishes its packages independently. The three latest stable package versions
satisfy their declared peer ranges, but they are not a synchronized release set:
the Next adapter's manifest was developed with core `0.14.0`, while the MDX
package's manifest was developed with core `0.8.2`. The spike must prove this
combination rather than treating peer-range satisfaction as integration evidence.

Repository activity shows that neither option is abandoned at the snapshot date.
Velite merged substantive Vite 8 support on 2026-07-13 and schema-context work on
2026-06-17; its latest observed commit on 2026-08-03 was cosmetic. Content
Collections had substantive dependency and frontmatter maintenance on 2026-08-10,
following recent watch and generated-type fixes. Commit recency is evidence of
maintenance, not proof that Singularity's exact integration works.

| Capability                  | Velite `0.4.0`                                                                                                                                                      | Content Collections pinned set                                                                                             | Spike implication                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Schemas and generated types | Zod plus extended `s` schemas; emits collection JSON, `index.js`, and `index.d.ts`                                                                                  | Schema-driven collections and generated typed imports                                                                      | Compile type assertions and reject a deliberately invalid document in both spikes                          |
| Derived fields              | Field transforms, object transforms, and a whole-result `prepare` hook                                                                                              | Per-document transforms; official model supports transforms that can use other collections                                 | Reproduce all current fields and generate tag/search artifacts without hidden runtime work                 |
| MDX and Unified             | Built-in `s.mdx()` returns a function-body string and accepts remark/rehype plugins                                                                                 | MDX is an explicit `@content-collections/mdx` transform with remark/rehype configuration                                   | Run the same ordered plugin list and compare rendered semantics, not only compilation success              |
| Next.js integration         | Framework-agnostic output; official Next.js guidance uses programmatic startup in ESM config or parallel scripts                                                    | First-party `@content-collections/next` adapter wraps Next.js                                                              | Verify Next.js 15.5.12, Turbopack development, Webpack production, and clean generation ordering           |
| Watch behavior              | `velite dev` or `velite build --watch`; the roadmap still lists incremental build                                                                                   | Adapter-integrated development generation and repository fixes for watch behavior                                          | Edit frontmatter and body while Next.js runs; observe regenerated data and rendered output without restart |
| Static export               | Generated files are framework-agnostic, but Singularity's export profile is not documented as a tested recipe                                                       | Adapter declares Next.js 15 support, but Singularity's export profile is not documented as a tested recipe                 | Run both normal and `EXPORT=1 UNOPTIMIZED=1` builds from clean outputs                                     |
| Assets                      | Built-in file copying and Sharp-backed image metadata                                                                                                               | Asset behavior is deliberately composed outside the core engine                                                            | Compare only the image semantics Singularity needs; do not award unused built-ins                          |
| Principal risk              | No first-party Next adapter package; ESM startup and `new Function` MDX rendering require deliberate integration; roadmap lists incremental build and a Next plugin | Three independently released packages; latest versions have broad peers but were developed against different core versions | Keep package sets exact, inspect generated output, and fail the spike on warnings or nondeterminism        |

The package manifests cover Singularity's current Next.js 15 and React 19 versions on
paper: the Content Collections adapter explicitly includes Next.js 15, the MDX
package accepts React 19 through `>=18`, and Velite's maintained example uses
Next.js 15. None of those statements substitutes for the two deployment-profile
builds. Velite's Webpack plugin recipe is specifically unsuitable for Turbopack;
use separate content scripts for the spike so development, Vercel, and static
export exercise the same content entry point.

## Singularity Spike Corpus

Both spikes must use the same disposable fixtures and assertions. Do not point a
spike at the whole production corpus, and do not inspect or copy resume content.

### Contract to preserve

The current source contract is `contentlayer.config.ts`:

- `Blog` reads `data/blog/**/*.mdx` and validates title, date, tags, last-modified
  date, draft state, summary, images, authors, layout, bibliography, and canonical
  URL.
- `Authors` reads `data/authors/**/*.mdx` and validates name plus optional public
  profile fields.
- Typed derived fields are reading time, slug, flattened path, source file path,
  table of contents, and `BlogPosting` structured data.
- The ordered Unified pipeline covers frontmatter extraction, GFM, titled code
  blocks, math, image-to-JSX conversion, GitHub alerts, heading IDs and links,
  KaTeX, no-translate markup, citations, Prism highlighting, and minification.
- A successful generation writes deterministic `app/tag-data.json` and
  `public/search.json` artifacts, excluding production drafts from tag counts.
- The application must build normally and with `EXPORT=1 UNOPTIMIZED=1`.

### Minimum fixtures

Create these only inside each disposable spike and remove them when SINGULARITY-002
closes:

1. `data/spike/blog/representative.mdx`: a synthetic Blog document with every
   Blog frontmatter field. Its body combines the bibliography and footnote pattern,
   titled JavaScript fence, `TOCInline` JSX, and nested headings from
   `data/blog/new-features-in-v1.mdx` with the inline and display math, escaped
   dollar text, and TeX fence from `data/blog/deriving-ols-estimator.mdx`. Add one
   GFM table, task list, local Markdown image, GitHub alert, citation, external
   link, and injected custom component. Use a copied test image and bibliography,
   not personal material.
2. `data/spike/blog/invalid.mdx`: a Blog document missing `title` and containing
   an invalid `date`. It must fail generation with the source path and offending
   field in the diagnostic.
3. `data/spike/authors/fixture.mdx`: a synthetic Authors document with `name`,
   avatar, occupation, company, and non-personal example URLs. It proves that the
   second collection and its path-derived fields are not lost.

### Required assertions

- Generated data has typed Blog and Authors collections with no `any` escape for
  the fields consumed by the application.
- The representative post preserves ISO date normalization, defaults, reading
  time, slug, path, source file path, nested table of contents, and complete
  `BlogPosting` data.
- Rendered output preserves GFM, footnotes, KaTeX, citation and bibliography
  markup, image component mapping, titled highlighted code, stable heading IDs and
  links, alerts, and custom MDX components. Compare normalized HTML or a focused
  DOM snapshot for each construct.
- Invalid frontmatter causes a nonzero generation/build result with file and field
  context.
- Tag and search artifacts are deterministic across two clean generations; draft
  filtering matches production behavior.
- While the development server and content watcher are running, changing the
  title and one body paragraph updates generated data and the rendered route
  without restarting either process.
- Clean normal, degraded static-export, and Vercel preview builds complete. Record
  cold generation time, one watch-update time, warnings, generated file count,
  package count, and spike-specific configuration lines for the owner comparison.

The spike is bounded by those assertions. Image optimization redesign, syntax
highlighter replacement, broad content migration, and production configuration
changes belong to SINGULARITY-003.

## Recommended Spike Commands

Run commands only in an isolated disposable branch or worktree. The following
commands are recommendations for SINGULARITY-002 execution; they were not run during
this research task.

### Registry verification

```powershell
yarn npm info velite@0.4.0
yarn npm info @content-collections/core@0.15.2
yarn npm info @content-collections/next@0.2.11
yarn npm info @content-collections/mdx@0.2.2
```

### Velite spike

```powershell
yarn add --dev --exact velite@0.4.0
yarn velite build --clean --strict
yarn velite dev --strict
```

Use explicit `content:dev` and `content:build` scripts in the disposable spike.
Run content generation before Next.js rather than using the Webpack-only plugin.
After the watch assertion, stop the watcher and run:

```powershell
Remove-Item -Recurse -Force .velite -ErrorAction SilentlyContinue
yarn velite build --clean --strict
yarn tsc --noEmit
yarn build
yarn cross-env EXPORT=1 UNOPTIMIZED=1 yarn build
```

### Content Collections spike

```powershell
yarn add --dev --exact @content-collections/core@0.15.2 @content-collections/next@0.2.11 @content-collections/mdx@0.2.2
yarn next dev
```

The first-party Next adapter performs generation as part of Next.js development
and build. After the watch assertion, stop the server and run:

```powershell
Remove-Item -Recurse -Force .content-collections .next -ErrorAction SilentlyContinue
yarn tsc --noEmit
yarn build
yarn cross-env EXPORT=1 UNOPTIMIZED=1 yarn build
```

For each candidate, push the isolated spike to a disposable preview branch and
record the Vercel preview result. Do not merge spike configuration, generated
files, fixtures, or package changes. Preserve only measured evidence in
`docs/planning/singularity/content-engine-selection.md`, then let the owner choose.

## Evidence

### Repository evidence

- `docs/planning/singularity/tasks.md` defines SINGULARITY-002's decision procedure,
  acceptance criteria, tie rule, and boundary from SINGULARITY-003.
- `contentlayer.config.ts` is the authoritative current schema, computed-field,
  Unified plugin, tag, and search contract.
- `package.json` pins Next.js `15.5.12`, React and React DOM `19.2.4`, Yarn `3.6.1`,
  Contentlayer2 `0.5.8`, and Pliny `0.4.1`.
- `next.config.js` defines normal and degraded static-export profiles and includes
  both Turbopack and Webpack configuration.
- `data/blog/new-features-in-v1.mdx` supplies local examples of bibliography,
  citations, footnotes, titled code, table-of-contents JSX, and headings.
- `data/blog/deriving-ols-estimator.mdx` supplies local examples of inline and
  display math, footnotes, escaped dollars, and TeX highlighting.

### Primary external sources

- [Velite 0.4.0 package manifest](https://unpkg.com/velite@0.4.0/package.json)
- [Velite releases](https://github.com/zce/velite/releases)
- [Velite commit history](https://github.com/zce/velite/commits/main/)
- [Velite quick start](https://velite.js.org/guide/quick-start)
- [Velite schemas](https://velite.js.org/guide/velite-schemas)
- [Velite MDX support](https://velite.js.org/guide/using-mdx)
- [Velite Next.js integration](https://velite.js.org/guide/with-nextjs)
- [Velite Next.js 15 example](https://github.com/zce/velite/tree/main/examples/nextjs)
- [Velite roadmap](https://github.com/zce/velite#roadmap)
- [Content Collections core 0.15.2 manifest](https://unpkg.com/@content-collections/core@0.15.2/package.json)
- [Content Collections Next 0.2.11 manifest](https://unpkg.com/@content-collections/next@0.2.11/package.json)
- [Content Collections MDX 0.2.2 manifest](https://unpkg.com/@content-collections/mdx@0.2.2/package.json)
- [Content Collections releases](https://github.com/sdorra/content-collections/releases)
- [Content Collections commit history](https://github.com/sdorra/content-collections/commits/main/)
- [Content Collections documentation](https://www.content-collections.dev/docs)
- [Content Collections source and examples](https://github.com/sdorra/content-collections)

Registry publication timestamps were checked in the full npm registry package
documents, not inferred from Git tags. Package manifests are the source for
licences, engines, peers, and the cross-package development-version observations.

## Uncertainties

- No spike was executed because this task is research-only. Runtime compatibility,
  generated type quality, diagnostic quality, watch behavior, Vercel behavior,
  and static export remain empirical gates.
- Content Collections core `0.15.2` does not declare a Node engine. Use the Node
  version captured by SINGULARITY-001 and record installation or runtime constraints
  observed during the spike rather than deriving a minimum from transitive
  packages.
- The latest Content Collections packages have compatible declared peers but
  version-skewed development baselines. A clean install and both builds must
  disprove integration breakage before these pins can move to SINGULARITY-003.
- Velite `1.0.0-alpha.3` is newer than stable `0.4.0` but is a prerelease. Testing
  it would answer a different risk question and must not silently replace the
  stable comparison.
- The exact compatibility of Singularity's Pliny plugins with each candidate's Unified
  and MDX versions is not guaranteed by either engine. Plugin order and rendered
  output require corpus assertions.
- Velite's documented MDX renderer evaluates a generated function body with
  `new Function`. Singularity currently permits `unsafe-eval` in its content security
  policy, but the security and future CSP implications belong in the owner
  comparison.
- Neither candidate documents Singularity's exact `EXPORT=1 UNOPTIMIZED=1` profile as a
  supported recipe. Static-export success cannot be concluded from general
  Next.js compatibility.
- The Content Collections documentation site returned HTTP 429 during one
  retrieval pass. Registry manifests, repository history, source, and examples
  remained available; the spike owner should reopen the current official setup
  pages before implementation in case integration instructions changed.

## Clarifying Questions

None. Owner identity, decision date, and selected engine are deliberately reserved
for `docs/planning/singularity/content-engine-selection.md` after both spikes run.
