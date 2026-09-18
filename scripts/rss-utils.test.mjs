import { describe, expect, it } from 'vitest'
import { generateRss } from './rss-utils.mjs'

describe('generateRss', () => {
  it('escapes XML-sensitive metadata and post fields', () => {
    const rss = generateRss(
      {
        title: 'Research & Notes',
        description: '<Signal>',
        language: 'en-US',
        siteUrl: 'https://example.com/?a=1&b=2',
        email: 'me&you@example.com',
        author: 'A < B',
      },
      [
        {
          slug: 'one',
          title: 'A < B',
          summary: '"quoted" & useful',
          date: '2024-01-02',
          tags: ['R&D'],
        },
      ]
    )

    expect(rss).toContain('Research &amp; Notes')
    expect(rss).toContain('&lt;Signal&gt;')
    expect(rss).toContain('&quot;quoted&quot; &amp; useful')
    expect(rss).toContain('<category>R&amp;D</category>')
    expect(rss).not.toContain('me&you@example.com')
  })
})
