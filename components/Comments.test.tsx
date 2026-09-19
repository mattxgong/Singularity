import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { giscus } = vi.hoisted(() => ({ giscus: vi.fn<(props: object) => void>() }))

vi.mock('@giscus/react', async () => {
  const React = await import('react')
  return {
    default: (props: object) => (
      giscus(props),
      React.createElement('div', { 'data-testid': 'giscus' })
    ),
  }
})
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'dark' }) }))
vi.mock('@/data/index', () => ({
  siteMetadata: {
    comments: {
      provider: 'giscus',
      giscusConfig: {
        repo: 'owner/repo',
        repositoryId: 'repository-id',
        category: 'Comments',
        categoryId: 'category-id',
        mapping: 'pathname',
        theme: 'light',
        darkTheme: 'transparent_dark',
      },
    },
  },
}))

import Comments from './Comments'

describe('Comments', () => {
  beforeEach(() => giscus.mockClear())

  it('does not mount Giscus until the visitor activates it', () => {
    render(<Comments slug="post" />)
    expect(giscus).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Load Comments' }))
    expect(screen.getByTestId('giscus')).toBeInTheDocument()
    expect(giscus).toHaveBeenCalledWith(expect.objectContaining({ theme: 'transparent_dark' }))
  })
})
