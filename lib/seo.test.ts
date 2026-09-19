import { describe, expect, it } from 'vitest'
import {
  createBreadcrumbJsonLd,
  createPersonJsonLd,
  createSocialImageUrl,
  createWebsiteJsonLd,
} from './seo'

describe('structured data builders', () => {
  it('builds one canonical website entity', () => {
    expect(createWebsiteJsonLd('https://example.com', 'Singularity', 'Portfolio')).toMatchObject({
      '@type': 'WebSite',
      name: 'Singularity',
      url: 'https://example.com/',
    })
  })

  it('builds an ordered breadcrumb trail with absolute URLs', () => {
    const jsonLd = createBreadcrumbJsonLd('https://example.com/', [
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
      { name: 'Project', path: '/projects/project' },
    ])

    expect(jsonLd.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: 'https://example.com/' }),
      expect.objectContaining({ position: 2, item: 'https://example.com/projects' }),
      expect.objectContaining({ position: 3, item: 'https://example.com/projects/project' }),
    ])
  })

  it('publishes approved profile fields without a telephone field', () => {
    const jsonLd = createPersonJsonLd({
      name: 'Matthew Gong',
      url: 'https://example.com/about',
      email: 'matthew@example.com',
      jobTitle: 'Technical Analyst',
      education: ['University of Waterloo'],
      sameAs: ['https://github.com/example', 'https://linkedin.com/in/example'],
    })

    expect(jsonLd.sameAs).toHaveLength(2)
    expect(JSON.stringify(jsonLd)).not.toContain('telephone')
  })

  it('builds an encoded dynamic social image URL', () => {
    expect(createSocialImageUrl('https://example.com/', 'blog', 'notes/café')).toBe(
      'https://example.com/og/blog/notes/caf%C3%A9/'
    )
  })
})
