import { expect, test } from '@playwright/test'

const fixtureTitle = 'Phase 6 Authoring Fixture'
const fixturePath = '/blog/phase-6-authoring-fixture/'

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'J5 asserts build artifacts, which do not vary by browser.'
)

test('J5 publishes a new MDX file to the site and generated artifacts', async ({
  page,
  request,
}) => {
  test.skip(!process.env.E2E_AUTHORING_FIXTURE, 'Run through yarn test:e2e to install the fixture.')

  await page.goto('/blog/')
  await expect(page.getByRole('link', { name: fixtureTitle })).toHaveAttribute('href', fixturePath)

  const searchResponse = await request.get('/search.json')
  expect(searchResponse.ok()).toBe(true)
  const searchDocuments = (await searchResponse.json()) as Array<{ href: string; title: string }>
  expect(searchDocuments).toContainEqual(
    expect.objectContaining({ href: fixturePath.slice(0, -1) })
  )

  const feedResponse = await request.get('/feed.xml')
  expect(feedResponse.ok()).toBe(true)
  expect(await feedResponse.text()).toContain(fixtureTitle)

  const sitemapResponse = await request.get('/sitemap.xml')
  expect(sitemapResponse.ok()).toBe(true)
  expect(await sitemapResponse.text()).toContain(fixturePath.slice(0, -1))
})
