---
title: Singularity Typography Decision
description: Typeface selection, licensing evidence, subsetting method, and measured font payload for Singularity
author: Matthew Gong
ms.date: 2026-09-17
ms.topic: reference
keywords:
  - typography
  - fonts
  - licensing
estimated_reading_time: 5
---

## Decision

Singularity uses Source Serif 4 for prose, Inter for interface text and headings,
and JetBrains Mono for code and data. Each family is self-hosted as a variable
font and distributed under the SIL Open Font License 1.1.

| Role                   | Typeface       | Upstream release | Web asset source           | Licence                                                                       |
| ---------------------- | -------------- | ---------------- | -------------------------- | ----------------------------------------------------------------------------- |
| Body and prose         | Source Serif 4 | 4.005            | Adobe release variable TTF | [OFL 1.1](https://github.com/adobe-fonts/source-serif/blob/4.005R/LICENSE.md) |
| Interface and headings | Inter          | 4.1              | Fontsource variable 5.3.0  | [OFL 1.1](https://github.com/rsms/inter/blob/v4.1/LICENSE.txt)                |
| Code and data          | JetBrains Mono | 2.304            | Fontsource variable 5.3.0  | [OFL 1.1](https://github.com/JetBrains/JetBrainsMono/blob/v2.304/OFL.txt)     |

The OFL permits use, modification, embedding, self-hosting, and redistribution
with software when the copyright and licence notice remain available. A copy of
each notice is stored beside its font assets in `public/fonts/`.

## Capability verification

Source Serif 4 provides a real italic variable font rather than synthetic
slanting. The shipped Roman and italic subsets retain the `wght` axis and the
`onum` OpenType feature. Prose enables proportional old-style numerals through
`font-variant-numeric`.

Inter retains the `wght` axis for interface weights. JetBrains Mono retains the
`wght` axis and uses distinct zero and letterform designs. Code ligatures remain
disabled so source text is not visually substituted.

## Payload

The Fontsource Latin files totalled 191,000 bytes before custom subsetting, so
they could not meet the 120 KiB budget. The shipped assets use the current
published content corpus plus printable ASCII. Source Serif's optical-size axis
is fixed at the 16-pixel text master while its weight axis remains variable.

| Asset                                    |  Bytes | SHA-256                                                            |
| ---------------------------------------- | -----: | ------------------------------------------------------------------ |
| `inter-latin-wght-normal.woff2`          | 19,764 | `B7B1E22FBFCD33FE53097628F897B44B8A1A4B7199725BEA32706E1A6A9E9A86` |
| `jetbrains-mono-latin-wght-normal.woff2` | 12,524 | `50E40C11160F7896EDB53A2BC6AB0A0A7F3F4A4B1CD62D5B62A0A2DCD5CCF65`  |
| `source-serif-4-latin-wght-italic.woff2` | 33,476 | `CCE081B5C20BDE0D21529393D29579B26A74A4A7411DFAFA9D11C17D2A6E5A2C` |
| `source-serif-4-latin-wght-normal.woff2` | 29,964 | `3297234500823F37498C08FC555C40DF3A0C6F6A349E5226BBB5C41B89A6BF87` |
| Total                                    | 95,728 | 77.9% of the 120 KiB budget                                        |

Source Serif normal and Inter are preloaded. Source Serif italic and JetBrains
Mono load only when a page uses them. All faces use `font-display: swap` through
`next/font/local`.

## Contrast verification

Contrast was calculated from the OKLCH theme tokens after conversion to clipped
linear sRGB, using the WCAG 2 relative-luminance formula. Semantic tokens select
different stops from the same ramps in each theme so that the plate and void
surfaces retain their intended character without compromising legibility.

| Pairing                           | Light theme                        |   Ratio | Dark theme                         |   Ratio | Minimum |
| --------------------------------- | ---------------------------------- | ------: | ---------------------------------- | ------: | ------: |
| Body and heading text             | `void-950` on `plate-50`           | 19.46:1 | `plate-50` on `void-950`           | 19.46:1 |   7.0:1 |
| Muted and secondary text          | `void-600` on `plate-50`           |  8.82:1 | `plate-400` on `void-950`          |  9.13:1 |   7.0:1 |
| Accent links                      | `starlight-700` on `plate-50`      |  8.79:1 | `starlight-300` on `void-950`      |  9.36:1 |   4.5:1 |
| Focus ring against surface        | `starlight-600` against `plate-50` |  6.21:1 | `starlight-400` against `void-950` |  6.46:1 |   3.0:1 |
| Non-text boundary against surface | `void-500` against `plate-50`      |  5.78:1 | `plate-600` against `void-950`     |  3.38:1 |   3.0:1 |
| Code text                         | `plate-100` on `void-950`          | 18.31:1 | `plate-100` on `void-950`          | 18.31:1 |   4.5:1 |
| Lowest-contrast syntax token      | `plate-500` on `void-950`          |  5.55:1 | `plate-500` on `void-950`          |  5.55:1 |   4.5:1 |

The initial dark muted-text candidate was `plate-500` at 5.55:1. It was
replaced with `plate-400` at 9.13:1 to meet the 7.0:1 project threshold. No
other measured pairing required adjustment.
