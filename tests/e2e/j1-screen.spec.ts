import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 375, height: 667 } })
test.skip(({ browserName }) => browserName !== 'webkit', 'J1 is a phone journey.')

test('J1 presents identity, status, positioning, and actions above the fold', async ({ page }) => {
  await page.goto('/')

  const signals = [
    page.getByRole('heading', { level: 1, name: 'Matthew Gong' }),
    page.getByText('Computing and Financial Management student and Technical Analyst'),
    page.getByText(
      'I build multi-agent systems and applied machine learning tools for complex technical workflows.'
    ),
    page.getByRole('link', { name: 'View projects' }),
    page.getByRole('link', { name: 'Resume', exact: true }),
  ]

  for (const signal of signals) {
    await expect(signal).toBeVisible()
    const box = await signal.boundingBox()
    expect(box, 'expected the signal to have a layout box').not.toBeNull()
    expect(
      box!.y + box!.height,
      'expected the signal to fit in the initial viewport'
    ).toBeLessThanOrEqual(667)
  }
})
