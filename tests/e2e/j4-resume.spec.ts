import { expect, test } from '@playwright/test'

// Mirrors scripts/check-sensitive-data.py: North American area and exchange codes start at 2.
const phonePattern =
  /(?<!\d)(?:\+?1[\s.()-]*)?\(?[2-9]\d{2}\)?[\s.()-]*[2-9]\d{2}[\s.()-]*\d{4}(?!\d)/

function routesFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(({ 1: url }) => {
    const { pathname } = new URL(url)
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  })
}

test('J4 reaches and downloads the redacted resume from another page', async ({ page }) => {
  await page.goto('/blog/')

  const isMobile = (page.viewportSize()?.width ?? 0) < 768
  if (isMobile) await page.getByRole('button', { name: 'Open menu' }).click()

  await page.getByRole('link', { name: 'Resume', exact: true }).click()
  await expect(page).toHaveURL(/\/resume\/$/)

  const downloadLink = page.getByRole('link', { name: 'Download PDF' })
  await expect(downloadLink).toHaveAttribute('download', 'matthew-gong-resume.pdf')
  await expect(downloadLink).toHaveAttribute('href', '/resume/matthew-gong-resume.pdf')
})

test('published routes do not expose North American phone numbers', async ({ page, request }) => {
  test.setTimeout(90_000)

  const sitemapResponse = await request.get('/sitemap.xml')
  expect(sitemapResponse.ok()).toBe(true)

  const routes = routesFromSitemap(await sitemapResponse.text())
  expect(routes.length).toBeGreaterThan(7)

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route)

      // Visible copy, link and metadata attributes, and structured data are the plausible leaks.
      const surfaces = await page.evaluate(() => [
        document.body.innerText,
        ...[...document.querySelectorAll('a[href]')].map((element) => element.getAttribute('href')),
        ...[...document.querySelectorAll('meta[content]')].map((element) =>
          element.getAttribute('content')
        ),
        ...[...document.querySelectorAll('script[type="application/ld+json"]')].map(
          (element) => element.textContent
        ),
      ])

      for (const surface of surfaces) {
        expect
          .soft(surface ?? '', `${route} exposed a phone-number pattern`)
          .not.toMatch(phonePattern)
      }

      expect
        .soft(await page.locator('a[href^="tel:"]').count(), `${route} exposed a tel: link`)
        .toBe(0)
    })
  }
})
