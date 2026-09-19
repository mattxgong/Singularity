import type { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/CodeBlock'
import Image from '@/components/Image'
import CustomLink from '@/components/Link'
import TableOfContents from '@/components/TableOfContents'
import TableWrapper from '@/components/TableWrapper'
import Callout from './callout'
import CodeGroup from './code-group'
import Figure from './figure'

export const components: MDXComponents = {
  Image,
  Figure,
  Callout,
  CodeGroup,
  TOCInline: TableOfContents,
  a: CustomLink,
  pre: CodeBlock,
  table: TableWrapper,
}
