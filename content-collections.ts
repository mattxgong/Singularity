import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX, type Options as MdxOptions } from '@content-collections/mdx'
import type { Image, Root } from 'mdast'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { imageSize } from 'image-size'
import readingTime from 'reading-time'
import { slug } from 'github-slugger'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCitation from 'rehype-citation'
import rehypeKatex from 'rehype-katex'
import rehypeKatexNoTranslate from 'rehype-katex-notranslate'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { remarkAlert } from 'remark-github-blockquote-alert'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'
import { z } from 'zod'
import siteMetadata from './data/siteMetadata'
import projectsData from './data/projectsData'
import { coreContent } from './lib/content'
import { extractTocHeadings } from './lib/content/toc'

const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'

const headingLinkIcon = fromHtmlIsomorphic(
  `<span class="content-header-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 linkicon"><path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z"/><path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z"/></svg></span>`,
  { fragment: true }
)

function remarkLocalImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node: Image) => {
      if (!node.url?.startsWith('/')) return

      const imagePath = path.join(root, 'public', node.url)
      const dimensions = imageSize(readFileSync(imagePath))
      Object.assign(node, {
        type: 'mdxJsxFlowElement' as const,
        name: 'Image',
        attributes: [
          { type: 'mdxJsxAttribute', name: 'alt', value: node.alt ?? '' },
          { type: 'mdxJsxAttribute', name: 'src', value: node.url },
          { type: 'mdxJsxAttribute', name: 'width', value: dimensions.width },
          { type: 'mdxJsxAttribute', name: 'height', value: dimensions.height },
        ],
      })
    })
  }
}

type ArtifactBlog = {
  date: string
  draft?: boolean
  path: string
  tags: string[]
}

const mdxOptions = {
  cwd: root,
  remarkPlugins: [remarkGfm, remarkMath, remarkLocalImages, remarkAlert],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: 'prepend',
        headingProperties: { className: ['content-header'] },
        content: headingLinkIcon,
      },
    ],
    rehypeKatex,
    rehypeKatexNoTranslate,
    [rehypeCitation, { path: path.join(root, 'data') }],
    [rehypePrettyCode, { defaultLang: 'js', keepBackground: false }],
    rehypePresetMinify,
  ],
} satisfies MdxOptions

function writeArtifacts<T extends ArtifactBlog>(allBlogs: T[]) {
  const publishedBlogs = allBlogs.filter((post) => !isProduction || post.draft !== true)
  const tagCount: Record<string, number> = {}

  for (const post of publishedBlogs) {
    for (const tag of post.tags) {
      const formattedTag = slug(tag)
      tagCount[formattedTag] = (tagCount[formattedTag] ?? 0) + 1
    }
  }

  const sortedTagCount = Object.fromEntries(
    Object.entries(tagCount).sort(([a], [b]) => a.localeCompare(b))
  )
  writeFileSync('app/tag-data.json', `${JSON.stringify(sortedTagCount, null, 2)}\n`)

  if (siteMetadata.search?.provider === 'local') {
    const searchDocumentsPath = siteMetadata.search.searchDocumentsPath
    if (typeof searchDocumentsPath !== 'string') return

    const searchPath = path.basename(searchDocumentsPath)
    const postDocuments = publishedBlogs
      .sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
      .map((post) => ({
        ...coreContent(post),
        id: post.path,
        href: `/${post.path}`,
        kind: 'post',
      }))
    const projectDocuments = projectsData.map((project, index) => ({
      ...project,
      id: `project-${index}`,
      href: project.href ?? '/projects',
      kind: 'project',
    }))
    writeFileSync(`public/${searchPath}`, JSON.stringify([...postDocuments, ...projectDocuments]))
  }
}

const dateSchema = z.coerce.date().transform((value) => value.toISOString())

const blogs = defineCollection({
  name: 'blogs',
  typeName: 'Blog',
  directory: 'data/blog',
  include: '**/*.mdx',
  schema: z.object({
    content: z.string(),
    title: z.string(),
    date: dateSchema,
    tags: z.array(z.string()).default([]),
    lastmod: dateSchema.optional(),
    draft: z.boolean().optional(),
    summary: z.string().optional(),
    images: z.union([z.string(), z.array(z.string())]).optional(),
    authors: z.array(z.string()).optional(),
    layout: z.string().optional(),
    bibliography: z.string().optional(),
    canonicalUrl: z.string().optional(),
  }),
  transform: async (document, context) => {
    const slugPath = document._meta.path
    const mdx = await compileMDX(context, document, mdxOptions)
    const reading = readingTime(document.content)

    return {
      ...document,
      mdx,
      readingTime: {
        text: reading.text,
        minutes: reading.minutes,
        time: reading.time,
        words: reading.words,
      },
      slug: slugPath,
      path: `blog/${slugPath}`,
      filePath: path.posix.join('blog', document._meta.filePath.replaceAll('\\', '/')),
      toc: await extractTocHeadings(document.content),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: document.title,
        datePublished: document.date,
        dateModified: document.lastmod ?? document.date,
        description: document.summary,
        image: document.images?.[0] ?? siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/blog/${slugPath}`,
      },
    }
  },
  onSuccess: writeArtifacts,
})

const authors = defineCollection({
  name: 'authors',
  typeName: 'Authors',
  directory: 'data/authors',
  include: '**/*.mdx',
  schema: z.object({
    content: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    occupation: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    twitter: z.string().optional(),
    bluesky: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    layout: z.string().optional(),
  }),
  transform: async (document, context) => ({
    ...document,
    mdx: await compileMDX(context, document, mdxOptions),
    slug: document._meta.path,
    path: `authors/${document._meta.path}`,
    filePath: path.posix.join('authors', document._meta.filePath.replaceAll('\\', '/')),
    toc: await extractTocHeadings(document.content),
  }),
})

export default defineConfig({ content: [blogs, authors] })
