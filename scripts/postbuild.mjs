import { mkdirSync, writeFileSync } from 'node:fs'

// Declares the generated ESM output as a module so Node does not reparse it on import.
const generatedDir = new URL('../.content-collections/generated/', import.meta.url)
mkdirSync(generatedDir, { recursive: true })
writeFileSync(new URL('package.json', generatedDir), '{ "type": "module" }\n')

const { default: rss } = await import('./rss.mjs')

await rss()
