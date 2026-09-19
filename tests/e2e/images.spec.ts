import { expect, test } from '@playwright/test'

const imageRoutes = [
  '/blog/designing-observable-multi-agent-workflows/',
  '/projects/robotics-challenge/',
]
const imageBudget = 400 * 1024

for (const route of imageRoutes) {
  test(`${route} keeps images dimensioned, prioritized, stable, and within budget`, async ({
    browserName,
    page,
  }) => {
    let imageBytes = 0

    await page.addInitScript(() => {
      let imageLayoutShift = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries() as Array<
          PerformanceEntry & {
            hadRecentInput: boolean
            sources?: Array<{ node?: Node }>
            value: number
          }
        >
        for (const entry of entries) {
          if (
            !entry.hadRecentInput &&
            entry.sources?.some(({ node }) => node instanceof HTMLImageElement)
          ) {
            imageLayoutShift += entry.value
          }
        }
        Object.assign(window, { __imageLayoutShift: imageLayoutShift })
      }).observe({ type: 'layout-shift', buffered: true })
    })

    page.on('response', async (response) => {
      if (response.request().resourceType() !== 'image') return
      const contentLength = Number(response.headers()['content-length'] ?? 0)
      imageBytes += contentLength || (await response.body()).byteLength
    })

    await page.goto(route)
    await page.waitForLoadState('networkidle')

    const images = page.locator('main img')
    expect(await images.count()).toBeGreaterThan(0)

    const viewportHeight = page.viewportSize()?.height ?? 0
    const eager: string[] = []

    for (const image of await images.all()) {
      const attributes = await image.evaluate((element) => ({
        alt: element.getAttribute('alt'),
        height: Number(element.getAttribute('height')),
        loading: element.getAttribute('loading'),
        src: element.getAttribute('src') ?? '',
        top: element.getBoundingClientRect().top + window.scrollY,
        width: Number(element.getAttribute('width')),
      }))

      expect(attributes.alt, `${attributes.src} is missing an alt attribute`).not.toBeNull()
      expect(attributes.width).toBeGreaterThan(0)
      expect(attributes.height).toBeGreaterThan(0)

      if (attributes.loading === 'lazy') continue

      eager.push(attributes.src)
      expect(
        attributes.top,
        `${attributes.src} loads eagerly but starts below the initial viewport`
      ).toBeLessThan(viewportHeight)
    }

    expect(
      eager.length,
      `only the above-the-fold image may opt out of lazy loading, found ${eager.join(', ')}`
    ).toBeLessThanOrEqual(1)
    expect(imageBytes).toBeLessThanOrEqual(imageBudget)

    // WebKit does not implement the layout-shift entry type, so the metric would be a false zero.
    if (browserName !== 'webkit') {
      expect(await page.evaluate(() => Reflect.get(window, '__imageLayoutShift') ?? 0)).toBe(0)
    }
  })
}
