<!-- markdownlint-disable-file -->

# SINGULARITY-002 Velite Spike Results

## Scope

Execution date: 2026-09-03

Candidate: `velite@0.4.0`

Runtime:

- Node.js `v24.15.0`
- Yarn `3.6.1`
- Next.js `15.5.12`
- React and React DOM `19.2.4`
- Windows PowerShell

Only the Velite candidate phase was executed. The app and fixtures were created
under `.copilot-tracking/spikes/2026-09-03/velite`. No production source,
package metadata, lockfile, existing documentation, resume data, secrets, or
deployment target was used.

## Fixture Contract

The isolated app defined typed `Blog` and `Author` collections. The synthetic
Blog document included all current Blog frontmatter fields, GFM table/task-list/
strikethrough syntax, inline and display math, a copied local SVG image, a titled
JavaScript fence, nested `h2`/`h3`/`h4` headings, and an injected `Callout` MDX
component. The synthetic Author document included non-personal example profile
fields.

Computed Blog output included normalized ISO dates, slug, flattened path, source
path, reading-time and word-count metadata, a nested table of contents, and a
complete `BlogPosting` object. A `prepare` hook emitted sorted tag counts and a
sorted search index with compiled code and table-of-contents data excluded.

## Exact Commands

Commands were run from
`.copilot-tracking/spikes/2026-09-03/velite` unless noted.

```powershell
yarn install
yarn content:build
yarn validate:content
yarn typecheck
yarn content:build
yarn content:build
yarn content:dev
yarn next dev -p 4317
yarn content:build
yarn typecheck
yarn build
$env:EXPORT = '1'
$env:UNOPTIMIZED = '1'
yarn build
```

The invalid-frontmatter command used the same strict content script after
temporarily adding `content/blog/invalid.mdx`:

```powershell
yarn content:build
```

The two live processes were terminated through their owning VS Code terminals.
Port `4317` and spike-scoped Node process command lines were checked after
termination.

## Timing Results

Elapsed values are wall-clock measurements around the commands. Velite's own
reported values are included where available.

| Operation                                      |        Exit | Wall time | Tool-reported time |
| ---------------------------------------------- | ----------: | --------: | -----------------: |
| Initial Yarn install                           |           0 |  48.506 s |           47.720 s |
| Cold strict generation                         |           0 |   1.824 s |            1.030 s |
| Content and rendered-MDX assertions            |           0 |   0.964 s |                n/a |
| Successful generated import typecheck          |           0 |   3.311 s |                n/a |
| Invalid generation with actionable diagnostics | 1, expected |   1.659 s |                n/a |
| Valid clean generation 1                       |           0 |   1.791 s |            0.769 s |
| Valid clean generation 2                       |           0 |   1.560 s |            0.644 s |
| Watch regeneration after fixture edit          |           0 |   0.167 s |            0.097 s |
| Updated HTTP request                           |         200 |   0.221 s |            0.212 s |
| Pre-build strict typecheck                     |           0 |   4.044 s |                n/a |
| Normal Next.js build, successful retry         |           0 |  19.632 s |     Compile: 3.7 s |
| `EXPORT=1 UNOPTIMIZED=1` build                 |           0 |  20.868 s |     Compile: 3.8 s |

The first normal build attempt compiled successfully but then failed after
122.147 seconds because the nested spike inherited Singularity's parent ESLint and
Prettier configuration, which rejected CRLF endings. The isolated Next config
was updated to skip Next's build-time lint hook. The explicit strict typecheck
remained enabled and passed before both successful builds.

## Schema Diagnostics

The invalid fixture omitted `title` and set `date` to
`definitely-not-a-date`. The final sanitized excerpt was:

```text
[VELITE] issues:
content/blog/invalid.mdx
 error Invalid ISO date  date
 error Required          title

2 errors
[VELITE] Schema validation failed.
```

Velite's native `s.isodate()` did not produce this diagnostic. It threw the
generic `[VELITE] Invalid time value` message without file or field context in
two exploratory runs (1.457 s and 1.567 s). A guarded Zod transform that adds a
custom issue and returns `z.NEVER` for an invalid date restored the required
file and field diagnostics. This workaround adds configuration and should be
treated as a migration caveat.

## Content Assertions

The focused assertion script reported:

```json
{
  "blog": "representative",
  "author": "fixture",
  "readingTime": 1,
  "wordCount": 84,
  "tocDepth": 3,
  "renderedChecks": 10,
  "tagCount": 2,
  "searchCount": 1
}
```

Rendered static HTML assertions covered a GFM table, task-list checkbox,
strikethrough, KaTeX output, copied hashed image URL, `data-title="orbit.js"`,
three stable heading IDs, and the injected custom component. Generated values
matched:

- Date: `2026-08-30T00:00:00.000Z`
- Slug: `representative`
- Path: `blog/representative`
- Source path: `content/blog/representative.mdx`
- Modified date: `2026-09-01T00:00:00.000Z`
- Structured-data type: `BlogPosting`

## Types and Watch Behavior

The generated `.velite/index.d.ts` was imported by both the Next.js app and a
strict type assertion file. Blog title, Blog structured data, and Author name
were asserted not to be `any`; `tsc --noEmit` passed.

The watcher and Next.js dev server remained running while only the synthetic
post title and one body paragraph were edited. The output update was observed
166.78 ms after the fixture write timestamp. The same Next listener PID `52004`
served both requests, and watcher PIDs `45988` and `46324` remained unchanged.
The updated route returned HTTP 200 and contained both edited strings without a
restart.

## Determinism and Footprint

Two clean valid generations produced byte-identical SHA-256 hashes for every
generated file:

| Generated file                           | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `.velite/authors.json`                   | `E031C677822295F2A79C20C5A53814262635B30A0DDB070DE8C3F6697A0ACA94` |
| `.velite/blogs.json`                     | `6C79C6F23E8DA08217A5C881B87871CBD55E673764B09DF39286A612B38390C2` |
| `.velite/index.d.ts`                     | `201FCB557F172705C76F0042F05B92B04E4AA693D10EDC12F6C8F234810C7BA2` |
| `.velite/index.js`                       | `91C75CA09C12A78C1D689E3B646DEB7A182EB4AE78D833202BE79537DBE1B0C3` |
| `artifacts/search.json`                  | `9704D31E147BA646E2211891FF84503A194CBCE057683DF5069E9C23FD9DF6F7` |
| `artifacts/tag-data.json`                | `BCCD59A6004E27B796EBEAFEDEA9D82F9C5549654FD1B679B70E51C3B53113CB` |
| `public/static/observatory-d5eb34dd.svg` | `A5B9EC07532E4E57FDEADA3F6624E925EB01B4E3B179FEEDB9DC03816A1566C4` |

Measured footprint:

- Generated files: 7
- Direct dependencies and dev dependencies: 12
- Yarn lock descriptor entries: 235
- Installed `package.json` manifests under `node_modules`: 438
- `velite.config.ts`: 157 physical lines, 142 nonblank lines
- `next.config.mjs`: 15 physical lines, 13 nonblank lines

The installed-package count is a physical manifest count and includes nested
copies. It is not a unique name/version count.

## Build Results

The normal and degraded builds both passed on Next.js `15.5.12` and React
`19.2.4`. The home route was statically prerendered. Both successful builds
reported 102 kB of shared first-load JavaScript. The degraded build created
`out/index.html`.

## Criteria Summary

| Criterion                                     | Result                 | Evidence                                                            |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| Exact `velite@0.4.0` isolated install         | Pass                   | Exact manifest pin and isolated Yarn lockfile                       |
| Blog and Authors schemas                      | Pass                   | Both collections generated and rendered                             |
| Invalid date and missing title diagnostics    | Pass with caveat       | Nonzero exit with file and both field names after guarded transform |
| GFM, math, image, title, headings, custom MDX | Pass                   | Ten rendered HTML assertions                                        |
| ISO date, slug, path, source path             | Pass                   | Exact generated-value assertions                                    |
| Reading metadata and nested TOC               | Pass                   | Reading time, word count, and depth-three TOC assertions            |
| Complete `BlogPosting` data                   | Pass                   | Type and value assertions                                           |
| Deterministic tag and search artifacts        | Pass                   | Identical hashes across two clean generations                       |
| Generated type import and typecheck           | Pass                   | Strict `tsc --noEmit` with no `any` escape                          |
| Watch update without restart                  | Pass                   | 166.78 ms update; unchanged process IDs; updated HTTP 200           |
| Normal Next.js build                          | Pass with caveat       | 19.632 s retry after isolating parent lint configuration            |
| `EXPORT=1 UNOPTIMIZED=1` build                | Pass                   | 20.868 s and `out/index.html` present                               |
| Deployment or preview                         | Not run by instruction | No secrets requested and no deployment attempted                    |

## Warnings and Caveats

- Yarn emitted cache-fetch notices (`YN0013`) and native build notices (`YN0007`)
  for `esbuild` and `sharp`; it emitted no peer-dependency warning.
- Velite `s.isodate()` lost file and field context for an invalid date. The spike
  required a custom guarded transform for acceptable diagnostics.
- Velite's documented MDX renderer executes generated function-body code with
  `new Function`. Production adoption must account for server/runtime CSP and
  trust-boundary implications.
- The nested disposable app initially triggered Next.js's multiple-lockfile root
  warning. Setting `outputFileTracingRoot` to the spike root removed it.
- The successful builds intentionally skipped Next's inherited build-time lint.
  Explicit strict typechecks passed, and this isolation does not prescribe the
  production lint configuration.
- No Vercel preview was attempted because this phase prohibited deployment and
  secret use. Local normal and degraded production builds are the recorded gates.
- This evidence covers only the Velite candidate. It does not select the SINGULARITY-002
  owner decision or compare Content Collections.

## Production Integrity

The production files retained their pre-spike SHA-256 values and old write
timestamps:

| File           | SHA-256                                                            | Last write UTC                 |  Length |
| -------------- | ------------------------------------------------------------------ | ------------------------------ | ------: |
| `package.json` | `AA8D5B2D457C57591693590DEF57E7F126BDBBF0D10A3E391054AC09DEAB099A` | `2026-09-01T18:05:28.3703749Z` |   2,445 |
| `yarn.lock`    | `0D444595C237884C79AE9F87446E9ED674FC54BF48038CA9EF73214774350692` | `2026-09-01T18:05:28.4192353Z` | 439,819 |

No production file was written during the spike.

## Cleanup Verification

Cleanup status: complete.

After the evidence was safely written, the entire
`.copilot-tracking/spikes/2026-09-03/velite` directory was removed. Verification
reported that the directory did not exist, the port `4317` listener count was 0,
and the spike-scoped Node process count was 0. The production `package.json` and
`yarn.lock` hashes and write timestamps remained the values recorded above.
