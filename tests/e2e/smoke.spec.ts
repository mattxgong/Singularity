import { expect, test } from '@playwright/test'

const topLevelRoutes = ['/', '/about/', '/blog/', '/projects/', '/resume/', '/tags/', '/uses/']

for (const route of topLevelRoutes) {
  test(`${route} returns a page with a primary heading`, async ({ page }) => {
    const response = await page.goto(route)

    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
  })
}
