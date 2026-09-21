import type { ReactNode } from 'react'
import type { Blog } from 'content-collections'
import Bleed from '@/components/Bleed'
import Comments from '@/components/blog/comments'
import PostNav from '@/components/blog/post-nav'
import BlogTableOfContents from '@/components/blog/table-of-contents'
import Image from '@/components/Image'
import Link from '@/components/Link'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import Tag from '@/components/blog/tag'
import { Prose } from '@/components/ui/prose'
import { siteMetadata } from '@/data/index'
import { formatDate } from '@/lib/format'
import type { CoreContent, NavigablePost } from '@/lib/content'

export type PostLayoutVariant = 'default' | 'minimal' | 'banner'

interface PostLayoutProps {
  content: CoreContent<Blog>
  variant: PostLayoutVariant
  children: ReactNode
  next?: Pick<NavigablePost, 'path' | 'title'>
  prev?: Pick<NavigablePost, 'path' | 'title'>
  related: Array<Pick<NavigablePost, 'path' | 'title'>>
}

const editUrl = (filePath: string) => `${siteMetadata.siteRepo}/blob/main/data/${filePath}`

export default function PostLayout({
  content,
  variant,
  next,
  prev,
  related,
  children,
}: PostLayoutProps) {
  const { filePath, path, slug, date, title, tags, images, toc } = content
  const basePath = path.split('/')[0]
  const bannerImage = variant === 'banner' && images && images.length > 0 ? images[0] : undefined

  return (
    <>
      <ScrollTopAndComment />
      <article>
        <header className="border-boundary/40 pb-rhythm-7 space-y-rhythm-3 border-b text-center">
          {bannerImage && (
            <Bleed>
              <Image
                src={bannerImage}
                alt=""
                width={1600}
                height={800}
                sizes="(min-width: 1536px) 1376px, (min-width: 768px) calc(100vw - 4rem), calc(100vw - 3rem)"
                className="aspect-2/1 w-full object-cover"
                priority
              />
            </Bleed>
          )}
          <dl className={bannerImage ? 'pt-rhythm-7' : 'pt-rhythm-5'}>
            <div>
              <dt className="sr-only">Published on</dt>
              <dd className="text-small text-ink-muted font-sans tabular-nums">
                <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
              </dd>
            </div>
          </dl>
          <h1 className="text-heading-1 text-ink font-sans font-bold">{title}</h1>
        </header>

        <BlogTableOfContents toc={toc} presentation="mobile" />
        <div className="divide-boundary/25 pb-rhythm-6 divide-y">
          <div className="gap-rhythm-7 grid lg:grid-cols-[minmax(0,1fr)_16rem]">
            <Prose className="prose-fluid py-rhythm-7 min-w-0">{children}</Prose>
            <BlogTableOfContents toc={toc} presentation="desktop" />
          </div>
          <div className="py-rhythm-5 text-small text-ink-muted font-sans">
            <Link href={editUrl(filePath)} className="hover:text-accent">
              View this post on GitHub
            </Link>
          </div>

          {siteMetadata.comments && (
            <div className="py-rhythm-5 text-center" id="comment">
              <Comments slug={slug} />
            </div>
          )}

          <footer className="space-y-rhythm-5 py-rhythm-5">
            {tags && tags.length > 0 && (
              <div>
                <h2 className="text-caption text-ink-muted font-sans tracking-wide uppercase">
                  Tags
                </h2>
                <div className="mt-rhythm-2 flex flex-wrap">
                  {tags.map((tag) => (
                    <Tag key={tag} text={tag} />
                  ))}
                </div>
              </div>
            )}

            <PostNav prev={prev} next={next} related={related} />

            <Link
              href={`/${basePath}`}
              className="text-accent hover:text-accent-hover text-small inline-block font-sans font-semibold"
              aria-label="Back to the blog"
            >
              &larr; Back to the blog
            </Link>
          </footer>
        </div>
      </article>
    </>
  )
}
