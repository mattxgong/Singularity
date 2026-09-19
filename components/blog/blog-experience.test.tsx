import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Blog } from 'content-collections'
import FilteredPostList from './filtered-post-list'
import BlogTableOfContents from './table-of-contents'
import type { CoreContent } from '@/lib/content'

class IntersectionObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

const posts = [
  {
    title: 'Orbit notes',
    summary: 'Observing distant objects',
    tags: ['astronomy'],
    date: '2026-01-01T00:00:00.000Z',
    path: 'blog/orbit-notes',
  },
  {
    title: 'Build log',
    summary: 'A robotics project',
    tags: ['robotics'],
    date: '2026-01-02T00:00:00.000Z',
    path: 'blog/build-log',
  },
] as CoreContent<Blog>[]

describe('blog experience', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  })

  it('omits short tables of contents and focuses linked headings', () => {
    const { rerender } = render(
      <BlogTableOfContents
        presentation="desktop"
        toc={[
          { value: 'One', url: '#one', depth: 2 },
          { value: 'Two', url: '#two', depth: 2 },
        ]}
      />
    )
    expect(screen.queryByRole('navigation', { name: 'Table of contents' })).not.toBeInTheDocument()

    rerender(
      <>
        <h2 id="one">One</h2>
        <BlogTableOfContents
          presentation="desktop"
          toc={[
            { value: 'One', url: '#one', depth: 2 },
            { value: 'Two', url: '#two', depth: 2 },
            { value: 'Three', url: '#three', depth: 2 },
          ]}
        />
      </>
    )
    fireEvent.click(screen.getByRole('link', { name: 'One' }))
    expect(screen.getByRole('heading', { name: 'One' })).toHaveFocus()
  })

  it('announces filtered counts and renders a clear empty state', async () => {
    const user = userEvent.setup()
    render(<FilteredPostList posts={posts} initialPosts={posts} />)
    const input = screen.getByRole('searchbox', { name: 'Filter posts' })

    await user.type(input, 'robotics')
    expect(screen.getByText('1 post found')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Build log' })).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'nothing here')
    expect(screen.getByText('0 posts found')).toBeInTheDocument()
    expect(screen.getByText(/No posts match/)).toBeInTheDocument()
  })
})
