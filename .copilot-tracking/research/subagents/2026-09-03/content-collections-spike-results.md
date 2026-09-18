<!-- markdownlint-disable-file -->

# SINGULARITY-002 Content Collections Spike Results

## Scope

Execution date: 2026-09-03

Candidate pins:

- `@content-collections/core@0.15.2`
- `@content-collections/next@0.2.11`
- `@content-collections/mdx@0.2.2`

Runtime:

- Node.js `v24.15.0`
- Yarn `3.6.1`
- Next.js `15.5.12`
- React and React DOM `19.2.4`
- Windows PowerShell

Only the Content Collections candidate phase was executed. The app and fixtures
were created under
`.copilot-tracking/spikes/2026-09-03/content-collections`. No production source,
package metadata, lockfile, existing documentation, resume data, secrets, or
deployment target was used.

## Fixture Contract

The isolated app defined typed `Blog` and `Author` collections. The synthetic
Blog document included every current Blog frontmatter field, a GFM table and
task list, strikethrough, inline and display math, a local Markdown image
reference, a titled JavaScript fence, nested `h2`/`h3`/`h4` headings, and an
injected `Callout` component. The synthetic Author document included all tested
public profile fields with non-personal example values.

Computed Blog output included normalized ISO dates, slug, flattened path, source
path, reading-time and word-count metadata, a nested table of contents, and a
complete `BlogPosting` object. An explicit script emitted sorted tag counts and
a sorted search index with compiled MDX and table-of-contents data excluded.

## Exact Commands

Commands were run from
`.copilot-tracking/spikes/2026-09-03/content-collections` unless noted.

```powershell
yarn install
Remove-Item -Recurse -Force .content-collections,.next -ErrorAction SilentlyContinue
yarn build
yarn validate:content
yarn artifacts
yarn typecheck
Remove-Item -Recurse -Force .content-collections,artifacts -ErrorAction SilentlyContinue
yarn content:build
yarn artifacts
Remove-Item -Recurse -Force .content-collections,artifacts -ErrorAction SilentlyContinue
yarn content:build
yarn artifacts
yarn dev
Remove-Item -Recurse -Force .content-collections,.next,artifacts -ErrorAction SilentlyContinue
yarn build
yarn artifacts
yarn validate:content
yarn typecheck
Remove-Item -Recurse -Force .content-collections,.next,out -ErrorAction SilentlyContinue
$env:EXPORT = '1'
$env:UNOPTIMIZED = '1'
yarn build
```

The direct generation command behind `yarn content:build` was:

```powershell
node --input-type=module -e "import('@content-collections/core').then(async ({ createBuilder }) => { const builder = await createBuilder('content-collections.ts'); await builder.build() })"
```

The invalid-frontmatter command used `yarn build` after temporarily adding
`content/blog/invalid.mdx`. The watcher and Next.js server were terminated
through their owning VS Code terminal before production builds began.

## Timing Results

Elapsed values are wall-clock measurements around the commands. Content
Collections and Next.js reported values are included where available.

| Operation                             |        Exit | Wall time |                  Tool-reported time |
| ------------------------------------- | ----------: | --------: | ----------------------------------: |
| Initial Yarn install                  |           0 |  35.897 s |                            34.999 s |
| Fixture dependency refresh            |           0 |  17.121 s |                            15.697 s |
| Initial successful cold adapter build |           0 |  79.989 s |                 Generation: 2.886 s |
| Invalid schema build                  | 1, expected |   3.422 s |                                 n/a |
| Rendered-content assertions           |           0 |   0.976 s |                                 n/a |
| Artifact generation                   |           0 |   0.872 s |                                 n/a |
| Generated import typecheck            |           0 |   4.207 s |                                 n/a |
| Direct clean generation 1             |           0 |   3.033 s |                                 n/a |
| Direct clean generation 2             |           0 |   3.075 s |                                 n/a |
| Watch regeneration after fixture edit |           0 |   0.592 s |                             0.550 s |
| Updated HTTP request                  |         200 |   0.210 s |                             0.202 s |
| Final normal Next.js build            |           0 |  31.252 s | Generation: 0.657 s; compile: 5.2 s |
| `EXPORT=1 UNOPTIMIZED=1` build        |           0 |  25.266 s | Generation: 0.659 s; compile: 3.8 s |

An exploratory normal build compiled the application but failed after 180.165
seconds because the nested spike inherited Singularity's parent ESLint and Prettier
configuration, which rejected CRLF endings. The isolated Next configuration was
updated to skip Next's build-time lint hook. Explicit strict typechecks remained
enabled and passed before the successful production builds.

## Schema Diagnostics

The invalid fixture omitted `title` and set `date` to
`definitely-not-a-date`. The sanitized native diagnostic was:

```text
Validation failed on content\blog\invalid.mdx:
- title: Invalid input: expected string, received undefined
- date: Invalid ISO date
```

The build exited with code 1 in 3.422 seconds. No custom diagnostic adapter was
required.

## Content Assertions

The focused assertion script reported:

```json
{
  "blog": "representative",
  "author": "fixture",
  "readingTime": 0.455,
  "wordCount": 91,
  "tocDepth": 4,
  "renderedChecks": 11
}
```

Rendered static HTML assertions covered a GFM table, task-list checkbox,
strikethrough, KaTeX output, local image URL, custom image component mapping,
`data-title="orbit.js"`, three stable heading IDs, and the injected custom
component. Generated values matched:

- Date: `2026-08-30T00:00:00.000Z`
- Modified date: `2026-09-01T00:00:00.000Z`
- Slug: `representative`
- Path: `blog/representative`
- Source path: `content/blog/representative.mdx`
- Structured-data type: `BlogPosting`

## Types and Watch Behavior

The generated `.content-collections/generated/index.d.ts` was imported by both
the Next.js app and a strict type assertion file. Blog title, Blog structured
data, and Author name were asserted not to be `any`. The assertion path contained
no `any`, `as unknown as`, `@ts-ignore`, or `@ts-expect-error`, and
`tsc --noEmit` passed.

The Next adapter started content generation and watch mode with `yarn dev`. The
server and watcher remained running while only the synthetic post title and one
body paragraph were edited. Generated output changed 591.9734 milliseconds after
the fixture write timestamp. The same Next parent PID `48468` and listener PID
`8300` served both requests. The updated route returned HTTP 200 and contained
both edited strings without a restart.

## Determinism and Footprint

Two clean generations produced byte-identical collection payloads, declarations,
tag counts, and search data:

| Generated file                                 | SHA-256                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `.content-collections/generated/allAuthors.js` | `1513B64FD2F4C1DF76DFBA3D9ACB75873B8DE052CF2141DCC229040DA2F121DE` |
| `.content-collections/generated/allBlogs.js`   | `1807ADFACA7271C0D80D1CF8910D201090560EE32052D16F64128297FFA1A9DB` |
| `.content-collections/generated/index.d.ts`    | `DE5BB3DA11968EB890B4B5E28908CA4BE6FC0CB7B3F3BF9774341C2B69C029FF` |
| `artifacts/search.json`                        | `272A47C3072BB6F77A8BF4BC59B9DBB22043F0793964BC45F11FFD33C5E1E50C` |
| `artifacts/tag-data.json`                      | `B960DD36A68885820575DC7C055DFD043B9AFAA7F836C6CE13E59622091777DD` |

The generated `index.js` barrel was not byte-identical because its first line
contains the generation wall-clock timestamp. Its imports and exports were
otherwise unchanged. The required tag and search artifacts were byte-identical.

Measured footprint:

- Engine-generated files: 4
- Engine-generated files plus tag/search artifacts: 6
- Direct dependencies and dev dependencies: 22
- Yarn lock descriptor entries: 295
- Installed `package.json` manifests under `node_modules`: 520
- `content-collections.ts`: 147 physical lines, 135 nonblank lines
- `next.config.mjs`: 14 physical lines, 12 nonblank lines

The installed-package count is a physical manifest count and includes nested
copies. It is not a unique name/version count.

## Build Results

The normal and degraded builds passed on Next.js `15.5.12` and React `19.2.4`.
The home route was statically prerendered, and both builds reported 102 kB of
shared first-load JavaScript. The degraded build created `out/index.html`.

## Criteria Summary

| Criterion                                     | Result                 | Evidence                                                           |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| Exact isolated candidate pins                 | Pass                   | Resolved manifests matched core 0.15.2, Next 0.2.11, and MDX 0.2.2 |
| Next.js 15.5.12 and React 19.2.4              | Pass                   | Both production profiles compiled and rendered                     |
| Blog and Authors schemas                      | Pass                   | Both collections generated and rendered                            |
| Invalid date and missing title diagnostics    | Pass                   | Native nonzero result named the file and both fields               |
| GFM, math, image, title, headings, custom MDX | Pass                   | Eleven rendered HTML assertions                                    |
| ISO date, slug, path, source path             | Pass                   | Exact generated-value assertions                                   |
| Reading metadata and nested TOC               | Pass                   | Reading time, word count, and depth-four TOC assertions            |
| Complete `BlogPosting` data                   | Pass                   | Type and value assertions                                          |
| Deterministic tag and search artifacts        | Pass                   | Identical hashes across two clean generations                      |
| Fully deterministic engine output             | Pass with caveat       | Payloads and declarations matched; timestamped `index.js` did not  |
| Generated type import and typecheck           | Pass                   | Strict `tsc --noEmit` with zero escape matches                     |
| Watch update without restart                  | Pass                   | 591.9734 ms update; unchanged process IDs; updated HTTP 200        |
| Normal Next.js build                          | Pass with caveat       | 31.252 s after isolating inherited build-time lint                 |
| `EXPORT=1 UNOPTIMIZED=1` build                | Pass                   | 25.266 s and `out/index.html` present                              |
| Deployment or preview                         | Not run by instruction | No secrets requested and no deployment attempted                   |

## Warnings and Caveats

- Yarn emitted cache-fetch notices (`YN0013`) and native build notices (`YN0007`)
  for `esbuild` and `sharp`; it emitted no peer-dependency warning.
- Content Collections core 0.15.2 deprecated the older `collections` property and
  implicit body field during the first exploratory run. The final configuration
  uses `content` and explicit `content: z.string()`, so successful runs emitted no
  deprecation warning.
- The Next adapter owns generation and watch behavior but does not inject the
  older `content-collections` module alias. The app imports the emitted relative
  module at `.content-collections/generated`.
- The compile-time serialization guard rejected the imported `reading-time`
  interface even though the emitted JSON was serializable. Projecting its four
  scalar fields into a plain object satisfied the guard without a type escape.
- The generated `index.js` embeds a wall-clock timestamp, preventing fully
  byte-reproducible engine output. The content modules and required tag/search
  artifacts remained deterministic.
- The nested disposable app inherited Singularity's build-time ESLint and Prettier
  configuration. Successful builds skip Next's inherited lint hook while retaining
  explicit strict typechecks. This isolation does not prescribe production lint
  configuration.
- No Vercel preview was attempted because this phase prohibited deployment and
  secret use. Local normal and degraded production builds are the recorded gates.
- This evidence covers only the Content Collections candidate. It does not select
  the SINGULARITY-002 owner decision or modify the recommendation record.

## Production Integrity

The production files retained their pre-spike SHA-256 values, write timestamps,
and lengths:

| File           | SHA-256                                                            | Last write UTC                 |  Length |
| -------------- | ------------------------------------------------------------------ | ------------------------------ | ------: |
| `package.json` | `AA8D5B2D457C57591693590DEF57E7F126BDBBF0D10A3E391054AC09DEAB099A` | `2026-09-01T18:05:28.3703749Z` |   2,445 |
| `yarn.lock`    | `0D444595C237884C79AE9F87446E9ED674FC54BF48038CA9EF73214774350692` | `2026-09-01T18:05:28.4192353Z` | 439,819 |

No production file was written during the spike.

## Cleanup Verification

Cleanup status: complete.

After the evidence was safely written, the entire
`.copilot-tracking/spikes/2026-09-03/content-collections` directory was removed.
Verification reported that the directory did not exist, the port `4318`
listener count was 0, and the spike-scoped Node process count was 0. The
production `package.json` and `yarn.lock` hashes, write timestamps, and lengths
remained the values recorded above.
