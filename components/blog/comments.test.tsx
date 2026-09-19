import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { giscus, siteMetadata, theme } = vi.hoisted(() => ({
  giscus: vi.fn<(props: object) => void>(),
  siteMetadata: {
    comments: {
      provider: 'giscus',
      giscusConfig: {
        repo: 'owner/repo',
        repositoryId: 'repository-id',
        category: 'Comments',
        categoryId: 'category-id',
        mapping: 'pathname',
        theme: 'noborder_light',
        darkTheme: 'dark_dimmed',
      },
    } as object | undefined,
  },
  theme: { current: 'dark' },
}))

vi.mock('@giscus/react', async () => {
  const React = await import('react')
  return {
    default: (props: object) => (
      giscus(props),
      React.createElement('div', { 'data-testid': 'giscus' })
    ),
  }
})
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: theme.current }) }))
vi.mock('@/data/index', () => ({ siteMetadata }))

import Comments from './comments'

describe('Comments', () => {
  beforeEach(() => {
    giscus.mockClear()
    theme.current = 'dark'
    siteMetadata.comments = {
      provider: 'giscus',
      giscusConfig: {
        repo: 'owner/repo',
        repositoryId: 'repository-id',
        category: 'Comments',
        categoryId: 'category-id',
        mapping: 'pathname',
        theme: 'noborder_light',
        darkTheme: 'dark_dimmed',
      },
    }
  })

  it('does not mount Giscus until the visitor activates it', () => {
    render(<Comments slug="post" />)
    expect(giscus).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Load comments' }))
    expect(screen.getByTestId('giscus')).toBeInTheDocument()
    expect(giscus).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark_dimmed' }))
  })

  it('updates Giscus when the site theme changes', () => {
    const view = render(<Comments slug="post" />)
    fireEvent.click(screen.getByRole('button', { name: 'Load comments' }))

    theme.current = 'light'
    view.rerender(<Comments slug="post" />)
    expect(giscus).toHaveBeenLastCalledWith(expect.objectContaining({ theme: 'noborder_light' }))
  })

  it('renders nothing when Giscus is not configured', () => {
    siteMetadata.comments = undefined
    const { container } = render(<Comments slug="post" />)
    expect(container).toBeEmptyDOMElement()
  })
})
