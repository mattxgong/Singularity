import { expect, test, type Page } from '@playwright/test'

const postPath = '/blog/designing-observable-multi-agent-workflows/'

async function settle(page: Page, theme: 'light' | 'dark') {
  await page.evaluate((selected) => localStorage.setItem('theme', selected), theme)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('class', new RegExp(`(^|\\s)${theme}(\\s|$)`))
  await page.evaluate(() => document.fonts.ready)
}

test.describe('J1 initial mobile viewport', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'J1 is a phone journey.')

  test('matches the reviewed above-the-fold baseline', async ({ page }) => {
    await page.goto('/')
    await settle(page, 'light')

    await expect(page).toHaveScreenshot('j1-above-the-fold.png', {
      clip: { x: 0, y: 0, width: 375, height: 667 },
    })
  })
})

test.describe('desktop regions', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'One reviewed baseline per region.')

  test('project metadata block matches the reviewed baseline', async ({ page }) => {
    await page.goto('/projects/robotics-challenge/')
    await settle(page, 'light')

    await expect(page.getByRole('article').locator('header')).toHaveScreenshot(
      'project-metadata.png'
    )
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`${theme} prose matches the reviewed baseline`, async ({ page }) => {
      await page.goto(postPath)
      await settle(page, theme)

      const prose = page.locator('.prose')
      await prose.scrollIntoViewIfNeeded()
      const box = await prose.boundingBox()
      expect(box, 'expected the prose block to have a layout box').not.toBeNull()

      await expect(page).toHaveScreenshot(`prose-${theme}.png`, {
        clip: { ...box!, height: Math.min(box!.height, 900) },
        mask: [page.locator('time')],
      })
    })
  }
})
