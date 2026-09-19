import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/data/index', () => ({
  siteMetadata: { search: { provider: 'local', searchDocumentsPath: '/search.json' } },
}))

import SearchButton from './layout/search-button'
import SearchProvider from './SearchProvider'

describe('SearchProvider', () => {
  it('defers loading, searches projects, and restores trigger focus', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 'post', title: 'Ordinary Post', href: '/blog/post', kind: 'post' },
        { id: 'project', title: 'Singularity Atlas', href: '/projects', kind: 'project' },
      ],
    })
    vi.stubGlobal('fetch', fetchMock)
    render(
      <SearchProvider>
        <SearchButton />
      </SearchProvider>
    )

    const trigger = screen.getByRole('button', { name: 'Search' })
    expect(fetchMock).not.toHaveBeenCalled()
    trigger.focus()
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(await screen.findByRole('dialog', {}, { timeout: 5000 })).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())

    fireEvent.change(screen.getByPlaceholderText('Search posts and projects'), {
      target: { value: 'Atlas' },
    })
    expect(await screen.findByText('Singularity Atlas')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
