---
title: Singularity Baseline Metrics
description: Build health, dependency, bundle, and mobile Lighthouse measurements captured before the Singularity Phase P0 migrations
author: Matthew Gong
ms.date: 2026-09-03
ms.topic: reference
keywords:
  - baseline
  - lighthouse
  - bundle
  - build
estimated_reading_time: 5
---

## Measurement environment

| Item                | Value                                      |
| ------------------- | ------------------------------------------ |
| Operating system    | Microsoft Windows 10.0.26200, x64          |
| Node.js             | 24.15.0                                    |
| Yarn                | 3.6.1                                      |
| Next.js             | 15.5.12                                    |
| Lighthouse          | 12.8.2                                     |
| Audit browser       | Chrome for Testing 152.0.7977.75, headless |
| Audit profile       | Mobile, simulated throttling               |
| Measurement date    | 2026-09-03                                 |
| Representative post | `/blog/code-sample`                        |

Lighthouse ran against `yarn serve` on `http://localhost:3000` after the
workaround-assisted production build described below. The audits used an
isolated Chrome Headless Shell download because installed Chrome and Edge were
prevented from exposing a DevTools socket to Lighthouse.

## Build health

The unchanged `yarn build` command failed after 8.927 seconds on Windows:

```text
Unbound variable "PWD"
```

No configuration was changed. The build completed when the current workspace
path was supplied as the process-local `PWD` environment variable. That
workaround-assisted build took 311.368 seconds and generated 60 static pages.
The route set included the home page, about, projects, blog and pagination,
11 post routes, tags and tag pagination, robots, sitemap, and the dynamic
newsletter API route.

The unchanged `yarn analyze` command completed in 68.240 seconds and wrote the
client, edge, and Node analyzer reports.

### Build warnings

The workaround-assisted build emitted these warnings verbatim:

```text
Warning: Contentlayer might not work as expected on Windows
(node:25232) [DEP0040] DeprecationWarning: The `punycode` module is deprecated.
Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
⚠ TypeScript project references are not fully supported. Attempting to build in incremental mode.
```

The analyzer build also emitted:

```text
No bundles were parsed. Analyzer will show only original module sizes from stats file.
```

Both Lighthouse commands produced complete JSON reports, then Node.js 24 failed
to remove Lighthouse's temporary browser profile with `EPERM`. The reports were
validated as complete before their scores were recorded.

## Lighthouse baseline

Scores are out of 100. Timing values come from each report's simulated mobile
run.

| Route               | Performance | Accessibility | Best practices | SEO | LCP      | TBT    | CLS   |
| ------------------- | ----------- | ------------- | -------------- | --- | -------- | ------ | ----- |
| `/`                 | 97          | 92            | 96             | 100 | 2,090 ms | 143 ms | 0.022 |
| `/blog/code-sample` | 85          | 96            | 96             | 100 | 3,278 ms | 316 ms | 0.000 |

The post already exceeds Singularity's future targets of less than 1.8 seconds LCP
and less than 200 milliseconds TBT. The home page meets the TBT target but not
the LCP target. Neither route reaches the future accessibility target of 100.

## JavaScript baseline

Next.js reported these first-load JavaScript sizes from both the production and
analyzer builds:

| Route               | Route JavaScript | First-load JavaScript |
| ------------------- | ---------------- | --------------------- |
| `/`                 | 1.12 KB          | 107 KB                |
| `/blog/code-sample` | 4.08 KB          | 115 KB                |
| Shared by all       | Not applicable   | 102 KB                |

The home route is 3 KB below Singularity's future 110 KB budget. The representative
post is 15 KB below its future 130 KB budget. These values are the compressed
sizes reported by the Next.js build output and remain the comparison source for
`SINGULARITY-058`.

## Dependency baseline

The manifest contains 33 direct runtime dependencies and 18 direct development
dependencies. Yarn resolves 1,174 recursive workspace tree lines and the
lockfile contains 1,179 package entries.

The migration-critical legacy packages are:

| Package              | Installed version |
| -------------------- | ----------------- |
| `contentlayer2`      | 0.5.8             |
| `next-contentlayer2` | 0.5.8             |
| `pliny`              | 0.4.1             |
| `esbuild`            | 0.27.3            |

## Baseline verdict

`SINGULARITY-001` is complete. The repository has a reproducible workaround-assisted
production build and analyzer output, but the clean Windows build is not green
because its existing script assumes a bound `PWD` shell variable. The warning
and failure are baseline evidence and were not repaired in this task.

The performance baseline confirms that the blog post, not the home page, is the
first performance risk. Contentlayer's Windows warning and the current
Contentlayer2, Pliny, and exact `esbuild` pins strengthen the case for the
mandatory P0 migration; they do not reopen retention as an option.
