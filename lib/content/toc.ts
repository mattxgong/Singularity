import GithubSlugger from 'github-slugger'
import type { Heading, Nodes, Root } from 'mdast'
import { remark } from 'remark'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

export type TocItem = {
  value: string
  url: string
  depth: number
}

function nodeText(node: Nodes): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  if ('alt' in node && typeof node.alt === 'string') return node.alt
  return 'children' in node ? node.children.map(nodeText).join('') : ''
}

function remarkTocHeadings() {
  return (tree: Root, file: VFile) => {
    const slugger = new GithubSlugger()
    const toc: TocItem[] = []

    visit(tree, 'heading', (node: Heading) => {
      const value = nodeText(node)
      toc.push({ value, url: `#${slugger.slug(value)}`, depth: node.depth })
    })

    file.data.toc = toc
  }
}

export async function extractTocHeadings(markdown: string): Promise<TocItem[]> {
  const file = await remark().use(remarkTocHeadings).process(markdown)
  return file.data.toc as TocItem[]
}
