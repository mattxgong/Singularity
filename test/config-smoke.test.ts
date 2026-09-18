import { describe, expect, it } from 'vitest'

import siteMetadata from '@/data/siteMetadata'

describe('site configuration', () => {
  it('uses a supported theme and a local search index', () => {
    expect(['system', 'light', 'dark']).toContain(siteMetadata.theme)
    expect(siteMetadata.search).toMatchObject({
      provider: 'local',
      searchDocumentsPath: '/search.json',
    })
  })
})
