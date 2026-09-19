import 'css/prism.css'
import 'katex/dist/katex.css'

import { components } from '@/components/mdx/mdx-components'
import { MDXContent } from '@content-collections/mdx/react'
import {
  sortPosts,
  coreContent,
  allCoreContent,
  getPostNavigation,
  getRelatedPosts,
} from '@/lib/content'
import { allBlogs } from 'content-collections'
import type { Blog } from 'content-collections'
import PostLayout from '@/layouts/post-layout'
import type { PostLayoutVariant } from '@/layouts/post-layout'
import { Metadata } from 'next'
import { siteMetadata } from '@/data/index'
import { createBreadcrumbJsonLd, createSocialImageUrl } from '@/lib/seo'
import { notFound } from 'next/navigation'

const layoutVariants = {
  PostLayout: 'default',
  PostSimple: 'minimal',
  PostBanner: 'banner',
} satisfies Record<string, PostLayoutVariant>

function getLayoutVariant(layout: string | undefined): PostLayoutVariant {
  if (layout && layout in layoutVariants) {
    return layoutVariants[layout as keyof typeof layoutVariants]
  }

  return 'default'
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)
  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const socialImage = createSocialImageUrl(siteMetadata.siteUrl, 'blog', post.slug)

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: [{ url: socialImage, width: 1200, height: 630, alt: post.title }],
      authors: [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [socialImage],
    },
  }
}

export const generateStaticParams = async () => {
  return allCoreContent(sortPosts(allBlogs)).map((post) => ({
    slug: post.slug.split('/').map((name) => decodeURI(name)),
  }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  // Filter out drafts in production
  const sortedCoreContents = allCoreContent(sortPosts(allBlogs))
  if (!sortedCoreContents.some((candidate) => candidate.slug === slug)) {
    return notFound()
  }

  const post = allBlogs.find((p) => p.slug === slug)
  if (!post) {
    return notFound()
  }

  const { prev, next } = getPostNavigation(sortedCoreContents, slug)
  const related = getRelatedPosts(sortedCoreContents, slug)
  const mainContent = coreContent(post)
  const jsonLd = {
    ...post.structuredData,
    author: {
      '@type': 'Person',
      name: siteMetadata.author,
    },
  }
  const breadcrumbJsonLd = createBreadcrumbJsonLd(siteMetadata.siteUrl, [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  const variant = getLayoutVariant(post.layout)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PostLayout content={mainContent} variant={variant} next={next} prev={prev} related={related}>
        <MDXContent code={post.mdx} components={components} toc={post.toc} />
      </PostLayout>
    </>
  )
}
