import { expect, test } from '@playwright/test'

const requiredDirectives = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "media-src 'none'",
  "font-src 'self'",
  'frame-src giscus.app',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
]

function routesFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(({ 1: url }) => {
    const { pathname } = new URL(url)
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  })
}

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'Response headers do not vary by browser.'
)

test('the production response carries the tightened Content Security Policy', async ({ page }) => {
  const response = await page.goto('/')
  const policy = response?.headers()['content-security-policy']

  expect(policy, 'expected a Content-Security-Policy response header').toBeTruthy()

  for (const directive of requiredDirectives) {
    expect(policy, `missing directive: ${directive}`).toContain(directive)
  }

  expect(policy, 'unsafe-eval must not reach production').not.toContain("'unsafe-eval'")
  expect(policy).toMatch(/script-src 'self' 'unsafe-inline' giscus\.app https?:\/\/\S+/)
  expect(policy).toMatch(/connect-src 'self' https?:\/\/\S+/)
})

test('no route triggers a Content Security Policy violation', async ({ page, request }) => {
  test.setTimeout(90_000)

  await page.addInitScript(() => {
    Object.assign(window, { __cspViolations: [] as string[] })
    document.addEventListener('securitypolicyviolation', (event) => {
      const violations = Reflect.get(window, '__cspViolations') as string[]
      violations.push(`${event.violatedDirective} blocked ${event.blockedURI}`)
    })
  })

  const sitemapResponse = await request.get('/sitemap.xml')
  expect(sitemapResponse.ok()).toBe(true)

  for (const route of routesFromSitemap(await sitemapResponse.text())) {
    await test.step(route, async () => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')

      const violations = await page.evaluate(() => Reflect.get(window, '__cspViolations') ?? [])
      expect.soft(violations, `${route} violated the policy`).toEqual([])
    })
  }
})
