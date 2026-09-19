import { describe, expect, it } from 'vitest'
import { extractTocHeadings } from '@/lib/content/toc'

describe('table-of-contents extraction', () => {
  it('preserves heading depth and creates stable slugs for duplicates', async () => {
    const toc = await extractTocHeadings(`
# Overview

## **Build** with \`TypeScript\`

## Build with TypeScript
`)

    expect(toc).toEqual([
      { value: 'Overview', url: '#overview', depth: 1 },
      { value: 'Build with TypeScript', url: '#build-with-typescript', depth: 2 },
      { value: 'Build with TypeScript', url: '#build-with-typescript-1', depth: 2 },
    ])
  })

  it('returns an empty table of contents when no headings exist', async () => {
    await expect(extractTocHeadings('A paragraph without headings.')).resolves.toEqual([])
  })
})
