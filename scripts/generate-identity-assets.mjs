/**
 * Regenerates every Singularity brand asset from one geometric source of truth.
 *
 * The mark is a gravitational lens: a broken photon ring around the event
 * horizon, two lensed arcs of a background source on opposite sides, and the
 * unlensed source itself sitting outside the deflection field.
 *
 * It is drawn at three optical sizes rather than scaled from one master,
 * because the lensed arcs merge into the ring below roughly 24 pixels. Large
 * tiers carry the full lens; the 16 pixel tier keeps only the broken ring and
 * the source, which is the smallest form that still reads as a lens.
 *
 * Run: node scripts/generate-identity-assets.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const favicons = join(root, 'public', 'static', 'favicons')
const images = join(root, 'public', 'static', 'images')
const fonts = join(root, 'public', 'fonts')

/** Resolved from the OKLCH `@theme` tokens in css/tailwind.css. */
const color = {
  tile: '#08121f', // void-900
  horizon: '#02060f', // void-950
  ring: '#8cd7f4', // starlight-200
  arc: '#139ec6', // starlight-400
  source: '#fcfaf4', // plate-50
  plate: '#fcfaf4', // plate-50
  ink: '#02060f', // void-950
  inkMuted: '#39495d', // void-600
  accentLight: '#004e69', // starlight-700
  rule: '#b2aea1', // plate-400
}

const VIEW = 64
const C = VIEW / 2

const toRad = (deg) => (deg * Math.PI) / 180
const n = (value) => Number(value.toFixed(3))

/** Polar to SVG cartesian. Angles use the math convention; SVG y grows down. */
function polar(radius, deg) {
  return [C + radius * Math.cos(toRad(deg)), C - radius * Math.sin(toRad(deg))]
}

/** Counter-clockwise arc, so the SVG sweep flag is always 0. */
function arcPath(radius, from, to) {
  const [x0, y0] = polar(radius, from)
  const [x1, y1] = polar(radius, to)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  return `M${n(x0)} ${n(y0)}A${n(radius)} ${n(radius)} 0 ${large} 0 ${n(x1)} ${n(y1)}`
}

/** Filled annulus sector, for the fill-only Safari mask icon. */
function annulusSector(inner, outer, from, to) {
  const large = Math.abs(to - from) > 180 ? 1 : 0
  const [ox0, oy0] = polar(outer, from)
  const [ox1, oy1] = polar(outer, to)
  const [ix1, iy1] = polar(inner, to)
  const [ix0, iy0] = polar(inner, from)
  return [
    `M${n(ox0)} ${n(oy0)}`,
    `A${n(outer)} ${n(outer)} 0 ${large} 0 ${n(ox1)} ${n(oy1)}`,
    `L${n(ix1)} ${n(iy1)}`,
    `A${n(inner)} ${n(inner)} 0 ${large} 1 ${n(ix0)} ${n(iy0)}`,
    'Z',
  ].join('')
}

/**
 * Optical size tiers. `ringGaps` are the angular windows left open in the
 * photon ring; the source star sits inside the upper-right one so the eye
 * connects the source to the arcs it is lensed into.
 */
const tiers = {
  full: {
    ring: {
      radius: 9.5,
      width: 1.9,
      spans: [
        [72, 222],
        [252, 402],
      ],
    },
    horizon: 9.5,
    arcs: [
      {
        radius: 21,
        width: 2.4,
        opacity: 1,
        spans: [
          [100, 200],
          [280, 380],
        ],
      },
      {
        radius: 15,
        width: 1.5,
        opacity: 0.5,
        spans: [
          [128, 172],
          [308, 352],
        ],
      },
    ],
    source: { radius: 27, size: 2.9 },
  },
  medium: {
    ring: {
      radius: 10,
      width: 3.4,
      spans: [
        [70, 220],
        [250, 400],
      ],
    },
    horizon: 10,
    arcs: [
      {
        radius: 21,
        width: 3.6,
        opacity: 1,
        spans: [
          [112, 188],
          [292, 368],
        ],
      },
    ],
    source: { radius: 26, size: 3.5 },
  },
  // Butt caps, because round caps on a band this wide close the gaps entirely.
  minimal: {
    ring: {
      radius: 13.5,
      width: 5.2,
      linecap: 'butt',
      spans: [
        [84, 216],
        [264, 396],
      ],
    },
    horizon: 13.5,
    arcs: [],
    source: { radius: 23.5, size: 4.4 },
  },
}

/** The lens, as coloured strokes. Omits the tile so callers choose the ground. */
function markBody(tier, { horizonFill, ringColor, arcColor, sourceColor, arcOpacity = 1 }) {
  const parts = []

  if (horizonFill) {
    parts.push(`<circle cx="${C}" cy="${C}" r="${tier.horizon}" fill="${horizonFill}"/>`)
  }

  for (const arc of tier.arcs) {
    const d = arc.spans.map(([from, to]) => arcPath(arc.radius, from, to)).join('')
    parts.push(
      `<path d="${d}" fill="none" stroke="${arcColor}" stroke-width="${arc.width}"` +
        ` stroke-linecap="round" stroke-opacity="${n(arc.opacity * arcOpacity)}"/>`
    )
  }

  const ringD = tier.ring.spans.map(([from, to]) => arcPath(tier.ring.radius, from, to)).join('')
  parts.push(
    `<path d="${ringD}" fill="none" stroke="${ringColor}" stroke-width="${tier.ring.width}"` +
      ` stroke-linecap="${tier.ring.linecap ?? 'round'}"/>`
  )

  const [sx, sy] = polar(tier.source.radius, 45)
  parts.push(`<circle cx="${n(sx)}" cy="${n(sy)}" r="${tier.source.size}" fill="${sourceColor}"/>`)

  return parts.join('')
}

/** Tiled variant, used for every favicon and app icon. */
function tileSvg(tierName, { scale = 1, title } = {}) {
  const tier = tiers[tierName]
  const body = markBody(tier, {
    horizonFill: color.horizon,
    ringColor: color.ring,
    arcColor: color.arc,
    sourceColor: color.source,
  })
  const scaled =
    scale === 1
      ? body
      : `<g transform="translate(${C} ${C}) scale(${scale}) translate(-${C} -${C})">${body}</g>`

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}"`,
    ` width="${VIEW}" height="${VIEW}" role="img" aria-label="${title}">`,
    `<rect width="${VIEW}" height="${VIEW}" fill="${color.tile}"/>`,
    scaled,
    '</svg>',
  ].join('')
}

/**
 * Header mark. Inherits the page ink, and punches the accent through the
 * source. The viewBox is cropped to the artwork, because an inline logo has no
 * tile to breathe against and would otherwise read as undersized beside the
 * wordmark.
 */
function logoSvg() {
  const tier = tiers.full
  const body = markBody(
    { ...tier, ring: { ...tier.ring, width: 2.2 } },
    {
      horizonFill: null,
      ringColor: 'currentColor',
      arcColor: 'currentColor',
      sourceColor: 'var(--color-accent, currentColor)',
    }
  )
  const reach = Math.max(
    ...tier.arcs.map((arc) => arc.radius + arc.width / 2),
    (tier.source.radius * Math.SQRT2) / 2 + tier.source.size
  )
  const min = n(C - reach)
  const span = n(reach * 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${min} ${min} ${span} ${span}" fill="none">${body}</svg>\n`
}

/** Safari mask icon: one layer, opaque black fills, transparent ground. */
function maskIconSvg() {
  const tier = tiers.medium
  const paths = []

  for (const arc of tier.arcs) {
    for (const [from, to] of arc.spans) {
      paths.push(annulusSector(arc.radius - arc.width / 2, arc.radius + arc.width / 2, from, to))
    }
  }
  for (const [from, to] of tier.ring.spans) {
    paths.push(
      annulusSector(
        tier.ring.radius - tier.ring.width / 2,
        tier.ring.radius + tier.ring.width / 2,
        from,
        to
      )
    )
  }

  const [sx, sy] = polar(tier.source.radius, 45)
  const r = tier.source.size
  paths.push(`M${n(sx - r)} ${n(sy)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`)

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}">` +
    `<path fill="#000000" fill-rule="evenodd" d="${paths.join('')}"/>` +
    '</svg>\n'
  )
}

/** 1200x630 title card. The lens anchors the right, the type holds the left. */
function socialCardSvg() {
  const scale = 8.4
  const offsetX = 912 - C * scale
  const offsetY = 308 - C * scale
  const lens = markBody(tiers.full, {
    horizonFill: color.plate,
    ringColor: color.ink,
    arcColor: color.ink,
    sourceColor: color.accentLight,
    arcOpacity: 0.45,
  })

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"',
    ' role="img" aria-labelledby="social-card-title social-card-desc">',
    '<title id="social-card-title">Singularity, by Matthew Gong</title>',
    '<desc id="social-card-desc">An observatory title card: a gravitational lens mark beside the',
    ' site name, author, and focus areas.</desc>',
    `<rect width="1200" height="630" fill="${color.plate}"/>`,
    `<g stroke="${color.rule}" stroke-width="1" opacity="0.8">`,
    '<path d="M0 105h1200M0 525h1200M72 0v630"/>',
    '</g>',
    `<g stroke="${color.rule}" stroke-width="1">`,
    '<path d="M72 105v16M72 509v16M58 315h28"/>',
    '</g>',
    `<g transform="translate(${n(offsetX)} ${n(offsetY)}) scale(${scale})">${lens}</g>`,
    `<g fill="${color.ink}" font-family="Inter, system-ui, sans-serif">`,
    '<text x="110" y="286" font-size="92" font-weight="700" letter-spacing="-2">Singularity</text>',
    `<text x="113" y="344" font-size="32" font-weight="500" fill="${color.inkMuted}">Matthew Gong</text>`,
    '</g>',
    `<text x="113" y="416" font-size="22" letter-spacing="3" fill="${color.accentLight}"`,
    ' font-family="&quot;JetBrains Mono&quot;, ui-monospace, monospace">',
    'SYSTEMS / AI AGENTS / ROBOTICS</text>',
    `<path d="M110 440h404" stroke="${color.accentLight}" stroke-width="3"/>`,
    '</svg>',
  ].join('')
}

async function fontFaceCss() {
  const faces = [
    ['Inter', 'inter-latin-wght-normal.woff2', '100 900'],
    ['JetBrains Mono', 'jetbrains-mono-latin-wght-normal.woff2', '100 800'],
  ]
  const declarations = await Promise.all(
    faces.map(async ([family, file, weight]) => {
      const data = await readFile(join(fonts, file))
      return (
        `@font-face{font-family:"${family}";font-weight:${weight};font-display:block;` +
        `src:url(data:font/woff2;base64,${data.toString('base64')}) format("woff2")}`
      )
    })
  )
  return declarations.join('')
}

function icoFrom(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  let offset = 6 + entries.length * 16
  const directory = []
  for (const { size, png } of entries) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    directory.push(entry)
    offset += png.length
  }

  return Buffer.concat([header, ...directory, ...entries.map((entry) => entry.png)])
}

async function main() {
  await mkdir(favicons, { recursive: true })
  await mkdir(images, { recursive: true })

  const css = await fontFaceCss()
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: 1 })

  async function raster(svg, width, height) {
    await page.setViewportSize({ width, height })
    await page.setContent(
      '<!doctype html><meta charset="utf-8"><style>' +
        `html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${width}px;height:${height}px}` +
        css +
        `</style>${svg}`
    )
    await page.evaluate(() => document.fonts.ready)
    return page.screenshot({ omitBackground: true, type: 'png' })
  }

  const written = []
  async function emit(relativePath, contents) {
    const absolute = join(root, relativePath)
    await mkdir(dirname(absolute), { recursive: true })
    await writeFile(absolute, contents)
    written.push(`${relativePath} (${contents.length} bytes)`)
  }

  const label = 'Singularity'
  const faviconSvg = tileSvg('full', { title: label })

  await emit('public/static/favicons/favicon.svg', `${faviconSvg}\n`)
  await emit('public/static/favicons/safari-pinned-tab.svg', maskIconSvg())
  await emit('data/logo.svg', logoSvg())

  const socialSvg = socialCardSvg()
  await emit('public/static/images/social-card.svg', `${socialSvg}\n`)

  const rasters = [
    ['public/static/favicons/favicon-16x16.png', tileSvg('minimal', { title: label }), 16],
    ['public/static/favicons/favicon-32x32.png', tileSvg('medium', { title: label }), 32],
    ['public/static/favicons/apple-touch-icon.png', faviconSvg, 180],
    ['public/static/favicons/android-chrome-192x192.png', faviconSvg, 192],
    ['public/static/favicons/android-chrome-512x512.png', faviconSvg, 512],
    [
      'public/static/favicons/maskable-512x512.png',
      tileSvg('full', { scale: 0.62, title: label }),
      512,
    ],
    ['public/static/favicons/mstile-150x150.png', faviconSvg, 150],
    ['public/static/images/logo.png', faviconSvg, 512],
  ]

  for (const [relativePath, svg, size] of rasters) {
    await emit(relativePath, await raster(svg, size, size))
  }

  await emit('public/static/images/social-card.png', await raster(socialSvg, 1200, 630))

  const icoEntries = []
  for (const size of [16, 32, 48]) {
    const svg =
      size === 16 ? tileSvg('minimal', { title: label }) : tileSvg('medium', { title: label })
    icoEntries.push({ size, png: await raster(svg, size, size) })
  }
  await emit('public/static/favicons/favicon.ico', icoFrom(icoEntries))

  await browser.close()

  console.log(`Wrote ${written.length} identity assets:`)
  for (const entry of written) console.log(`  ${entry}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
