import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number]

function routesFromSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(({ 1: url }) => {
    const { pathname } = new URL(url)
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  })
}

function formatViolations(violations: AxeViolation[]): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.nodes
          .flatMap((node) => node.target)
          .join(', ')}`
    )
    .join('\n')
}

for (const theme of ['light', 'dark'] as const) {
  test(`every published route has no serious or critical axe violations in ${theme} mode`, async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000)

    const sitemapResponse = await request.get('/sitemap.xml')
    expect(sitemapResponse.ok()).toBe(true)
    const routes = routesFromSitemap(await sitemapResponse.text())
    expect(routes.length).toBeGreaterThan(7)
    const moderateFindings = new Map<string, AxeViolation>()

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route)
        await page.evaluate((selected) => localStorage.setItem('theme', selected), theme)
        await page.reload()
        await expect(page.locator('html')).toHaveAttribute(
          'class',
          new RegExp(`(^|\\s)${theme}(\\s|$)`)
        )

        const results = await new AxeBuilder({ page }).exclude('iframe').analyze()
        const blocking = results.violations.filter(
          ({ impact }) => impact === 'serious' || impact === 'critical'
        )

        for (const violation of results.violations.filter(({ impact }) => impact === 'moderate')) {
          const targets = violation.nodes.flatMap((node) => node.target).join(', ')
          moderateFindings.set(`${violation.id}:${targets}`, violation)
        }

        expect.soft(blocking, `${route} (${theme})\n${formatViolations(blocking)}`).toEqual([])
      })
    }

    if (moderateFindings.size > 0) {
      console.info(
        `Moderate axe findings in ${theme} mode (accepted for manual review):\n${formatViolations([
          ...moderateFindings.values(),
        ])}`
      )
    }
  })
}

test('the skip link moves focus to the main content', async ({ browserName, page }) => {
  test.skip(browserName === 'webkit', 'WebKit does not enable optional full keyboard access.')

  await page.goto('/')
  await page.keyboard.press('Tab')

  const skipLink = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('the mobile menu traps focus and restores it after Escape', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 768, 'Mobile navigation is hidden at this width.')

  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Open menu' })
  await trigger.click()

  const dialog = page.getByRole('dialog')
  const closeButton = page.getByRole('button', { name: 'Close menu' })
  await expect(closeButton).toBeVisible()
  await closeButton.focus()

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})
