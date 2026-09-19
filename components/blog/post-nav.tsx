import Link from '@/components/Link'
import type { NavigablePost } from '@/lib/content'

interface PostNavProps {
  prev?: Pick<NavigablePost, 'path' | 'title'>
  next?: Pick<NavigablePost, 'path' | 'title'>
  related: Array<Pick<NavigablePost, 'path' | 'title'>>
}

export default function PostNav({ prev, next, related }: PostNavProps) {
  if (!prev && !next && related.length === 0) return null

  return (
    <div className="space-y-rhythm-5">
      {(prev || next) && (
        <nav
          aria-label="Post navigation"
          className="gap-rhythm-4 text-small flex flex-col font-sans font-semibold sm:flex-row sm:justify-between"
        >
          {prev && (
            <Link
              href={`/${prev.path}`}
              className="text-accent hover:text-accent-hover"
              aria-label={`Previous post: ${prev.title}`}
            >
              &larr; {prev.title}
            </Link>
          )}
          {next && (
            <Link
              href={`/${next.path}`}
              className="text-accent hover:text-accent-hover sm:ml-auto"
              aria-label={`Next post: ${next.title}`}
            >
              {next.title} &rarr;
            </Link>
          )}
        </nav>
      )}

      {related.length > 0 && (
        <aside aria-labelledby="related-posts-heading">
          <h2
            id="related-posts-heading"
            className="text-caption text-ink-muted font-sans font-semibold tracking-wide uppercase"
          >
            Related posts
          </h2>
          <ul className="mt-2 space-y-2">
            {related.map((post) => (
              <li key={post.path}>
                <Link href={`/${post.path}`} className="text-accent hover:text-accent-hover">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  )
}
