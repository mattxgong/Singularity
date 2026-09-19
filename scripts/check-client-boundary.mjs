import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const allowedClientComponents = new Map([
  ['app/theme-providers.tsx', 'Provides the next-themes context.'],
  ['components/blog/comments.tsx', 'Controls the click-to-load Giscus boundary.'],
  ['components/blog/filtered-post-list.tsx', 'Manages blog filtering state.'],
  ['components/blog/toc-scroll-spy.tsx', 'Tracks the active heading while scrolling.'],
  ['components/CodeBlock.tsx', 'Manages clipboard copy state.'],
  ['components/layout/active-nav-link.tsx', 'Reads the current pathname.'],
  ['components/layout/mobile-nav-panel.tsx', 'Owns the lazy mobile dialog.'],
  ['components/layout/mobile-nav.tsx', 'Owns mobile navigation state.'],
  ['components/layout/search-button.tsx', 'Opens the search dialog context.'],
  ['components/layout/theme-switch.tsx', 'Reads and changes theme state.'],
  ['components/mdx/code-group.tsx', 'Manages code-group tab selection.'],
  ['components/ScrollTopAndComment.tsx', 'Listens to the scroll position.'],
  ['components/search/command-menu.tsx', 'Owns the lazy command dialog.'],
  ['components/SearchProvider.tsx', 'Manages search shortcuts, state, and focus.'],
])

const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const sourceRoots = ['app', 'components', 'data', 'layouts', 'lib']
// The directive is only meaningful as the first statement, so anchor rather than scanning lines.
const clientDirective = /^(?:\s*(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)\s*)*(['"])use client\1\s*;?/

async function findClientComponents(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const matches = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      matches.push(...(await findClientComponents(absolutePath)))
      continue
    }

    if (!entry.isFile() || !sourceExtensions.has(path.extname(entry.name))) continue

    const source = await readFile(absolutePath, 'utf8')
    if (clientDirective.test(source)) {
      matches.push(path.relative(process.cwd(), absolutePath).replaceAll(path.sep, '/'))
    }
  }

  return matches
}

const clientComponents = (
  await Promise.all(sourceRoots.map((root) => findClientComponents(path.join(process.cwd(), root))))
).flat()
const unexpected = clientComponents.filter((file) => !allowedClientComponents.has(file))
const missing = [...allowedClientComponents.keys()].filter(
  (file) => !clientComponents.includes(file)
)

if (unexpected.length > 0 || missing.length > 0) {
  console.error('Client component boundary does not match the approved architecture.')

  if (unexpected.length > 0) {
    console.error(
      `Unlisted client components:\n${unexpected.map((file) => `  - ${file}`).join('\n')}`
    )
  }

  if (missing.length > 0) {
    console.error(
      `Allowlisted files without a client directive:\n${missing.map((file) => `  - ${file}`).join('\n')}`
    )
  }

  console.error(
    'Review docs/planning/singularity/architecture.md#server-and-client-boundaries before changing the allowlist.'
  )
  process.exitCode = 1
} else {
  console.log(`Client component boundary verified (${clientComponents.length} approved files).`)
}
