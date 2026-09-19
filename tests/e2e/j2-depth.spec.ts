import { expect, test } from '@playwright/test'

test('J2 exposes project evidence before the case-study narrative', async ({ page }) => {
  await page.goto('/projects/robotics-challenge/')

  const article = page.getByRole('article')
  const header = article.locator('header')
  const caseStudy = article.locator('.prose')

  await expect(header.getByRole('heading', { level: 1, name: 'Robotics Challenge' })).toBeVisible()
  await expect(
    header.getByText('Computer vision and autonomous navigation for a humanoid robot.')
  ).toBeVisible()
  await expect(header.getByText('Role', { exact: true })).toBeVisible()
  await expect(
    header.getByText('Computer vision and autonomous navigation developer')
  ).toBeVisible()
  await expect(header.getByText('Period', { exact: true })).toBeVisible()
  await expect(header.getByText('July 2025 to August 2025')).toBeVisible()
  await expect(
    header.getByText('Won third place among hundreds of university teams across China.')
  ).toBeVisible()
  await expect(
    header.getByRole('list', { name: 'Technology stack' }).getByRole('listitem')
  ).toHaveText(['Python', 'ROS', 'YOLO', 'Computer Vision'])

  const headerBox = await header.boundingBox()
  const caseStudyBox = await caseStudy.boundingBox()
  expect(headerBox).not.toBeNull()
  expect(caseStudyBox).not.toBeNull()
  expect(headerBox!.y + headerBox!.height).toBeLessThanOrEqual(caseStudyBox!.y)
})
