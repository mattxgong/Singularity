import type { Blog } from 'content-collections'
import Link from '@/components/Link'
import { formatDate } from '@/lib/format'
import type { CoreContent } from '@/lib/content'
import { siteMetadata } from '@/data/index'

export default function PostCard({ post }: { post: CoreContent<Blog> }) {
  const { path, date, title, summary, tags } = post

  return (
    <article className="border-boundary space-y-rhythm-3 py-rhythm-5 border-b">
      <div className="space-y-rhythm-2">
        <time className="text-ink-muted text-small font-sans tabular-nums" dateTime={date}>
          {formatDate(date, siteMetadata.locale)}
        </time>
        <h2 className="text-heading-3 text-ink font-sans font-semibold">
          <Link href={`/${path}`} className="hover:text-accent">
            {title}
          </Link>
        </h2>
      </div>
      {summary && <p className="text-ink-muted max-w-[62ch] font-serif">{summary}</p>}
      {tags && tags.length > 0 && (
        <ul aria-label="Tags" className="gap-rhythm-2 flex flex-wrap">
          {tags.map((tag) => (
            <li
              key={tag}
              className="border-boundary text-ink-muted text-caption rounded-sm border px-2 py-1 font-sans uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
