import { slug } from 'github-slugger'
import type { Blog } from 'content-collections'
import FilteredPostList from '@/components/blog/filtered-post-list'
import Link from '@/components/Link'
import { Disclosure } from '@/components/ui/disclosure'
import type { CoreContent } from '@/lib/content'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
  basePath: string
}

interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: Omit<PaginationProps, 'basePath'>
  basePath: string
  currentTag?: string
}

function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages
  const pageHref = (page: number) => (page === 1 ? `/${basePath}/` : `/${basePath}/page/${page}`)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between py-8">
      {hasPrevious ? (
        <Link href={pageHref(currentPage - 1)} rel="prev">
          Previous
        </Link>
      ) : (
        <span className="text-ink-muted" aria-disabled="true">
          Previous
        </span>
      )}
      <span className="text-ink-muted text-small font-sans tabular-nums">
        Page {currentPage} of {totalPages}
      </span>
      {hasNext ? (
        <Link href={pageHref(currentPage + 1)} rel="next">
          Next
        </Link>
      ) : (
        <span className="text-ink-muted" aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  basePath,
  currentTag,
}: ListLayoutProps) {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort(
    (first, second) => tagCounts[second] - tagCounts[first]
  )
  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  const tagList = (
    <>
      <Link
        href="/blog"
        aria-current={currentTag ? undefined : 'page'}
        className="text-ink hover:text-accent block py-2 font-sans font-semibold"
      >
        All posts
      </Link>
      <ul className="border-boundary mt-2 border-t pt-2">
        {sortedTags.map((tag) => (
          <li key={tag}>
            <Link
              href={`/tags/${slug(tag)}`}
              aria-current={currentTag === slug(tag) ? 'page' : undefined}
              className="text-ink-muted hover:text-accent text-small block truncate py-2 font-sans"
              title={`${tag} (${tagCounts[tag]})`}
            >
              {tag} ({tagCounts[tag]})
            </Link>
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <section className="py-rhythm-7 sm:py-rhythm-8">
      <h1 className="text-display text-ink font-title">{title}</h1>
      <div className="mt-rhythm-7 gap-rhythm-7 grid md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Blog topics">
          <div className="md:hidden">
            <Disclosure label="Browse topics">{tagList}</Disclosure>
          </div>
          <div className="sticky top-24 hidden md:block">{tagList}</div>
        </nav>

        <FilteredPostList posts={posts} initialPosts={displayPosts}>
          {pagination && pagination.totalPages > 1 && (
            <Pagination {...pagination} basePath={basePath} />
          )}
        </FilteredPostList>
      </div>
    </section>
  )
}
