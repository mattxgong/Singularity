import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import CodeBlock from './CodeBlock'
import TableOfContents from './TableOfContents'

export const components: MDXComponents = {
  Image,
  TOCInline: TableOfContents,
  a: CustomLink,
  pre: CodeBlock,
  table: TableWrapper,
}
