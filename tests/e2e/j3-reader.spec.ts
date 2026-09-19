import { expect, test } from '@playwright/test'

const postPath = '/blog/designing-observable-multi-agent-workflows/'

test('J3 renders rich article content without loading comments before consent', async ({
  page,
}) => {
  const giscusRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('giscus')) giscusRequests.push(request.url())
  })

  await page.goto(postPath)

  await expect(
    page.getByRole('heading', { level: 1, name: 'Designing Observable Multi-Agent Workflows' })
  ).toBeVisible()
  await expect(page.getByRole('figure').getByRole('img')).toHaveAttribute(
    'alt',
    /workflow moving from intake/i
  )
  await expect(page.locator('pre').filter({ hasText: 'type WorkflowState' })).toBeVisible()
  await expect(page.locator('.katex')).not.toHaveCount(0)
  await expect(page.locator('iframe.giscus-frame')).toHaveCount(0)
  expect(giscusRequests).toEqual([])

  const loadComments = page.getByRole('button', { name: 'Load comments' })
  const commentsConfigured = Boolean(
    process.env.NEXT_PUBLIC_GISCUS_REPO &&
    process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY &&
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID
  )

  await expect(loadComments).toHaveCount(commentsConfigured ? 1 : 0)
  test.skip(!commentsConfigured, 'Giscus is not configured in this environment.')

  await loadComments.click()
  await expect(page.locator('iframe.giscus-frame')).toBeVisible()
})
