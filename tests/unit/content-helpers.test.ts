import { afterEach, describe, expect, it, vi } from 'vitest'
import { allCoreContent, coreContent, sortPosts } from '@/lib/content'

const posts = [
  {
    slug: 'older',
    date: '2025-01-01',
    content: 'Rendered content',
    mdx: 'Compiled MDX',
    _meta: { filePath: 'older.mdx' },
  },
  {
    slug: 'newer',
    date: '2026-01-01',
    draft: true,
    content: 'Draft content',
    mdx: 'Compiled draft MDX',
    _meta: { filePath: 'newer.mdx' },
  },
]

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('content helpers', () => {
  it('removes generated body fields without mutating the document', () => {
    const document = posts[0]

    expect(coreContent(document)).toEqual({ slug: 'older', date: '2025-01-01' })
    expect(document.content).toBe('Rendered content')
  })

  it('sorts newest first without mutating the input order', () => {
    const sorted = sortPosts(posts)

    expect(sorted.map(({ slug }) => slug)).toEqual(['newer', 'older'])
    expect(posts.map(({ slug }) => slug)).toEqual(['older', 'newer'])
  })

  it('removes drafts only in production and projects remaining posts', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(allCoreContent(posts)).toEqual([{ slug: 'older', date: '2025-01-01' }])

    vi.stubEnv('NODE_ENV', 'development')
    expect(allCoreContent(posts).map(({ slug }) => slug)).toEqual(['older', 'newer'])
  })
})
