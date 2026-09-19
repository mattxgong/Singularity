'use client'

import { useDeferredValue, useState, type ReactNode } from 'react'
import type { Blog } from 'content-collections'
import PostCard from './post-card'
import type { CoreContent } from '@/lib/content'

interface FilteredPostListProps {
  posts: CoreContent<Blog>[]
  initialPosts: CoreContent<Blog>[]
  children?: ReactNode
}

export default function FilteredPostList({ posts, initialPosts, children }: FilteredPostListProps) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const filteredPosts = deferredQuery
    ? posts.filter((post) =>
        [post.title, post.summary, ...(post.tags ?? [])]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(deferredQuery))
      )
    : initialPosts
  const resultLabel = `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} found`

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="post-filter" className="text-ink text-small font-sans font-semibold">
        Filter posts
      </label>
      <input
        id="post-filter"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title, summary, or tag"
        className="border-boundary bg-surface text-ink placeholder:text-ink-muted focus-visible:outline-focus mt-2 w-full rounded-sm border px-3 py-2 font-sans focus-visible:outline-2 focus-visible:outline-offset-2"
      />
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {resultLabel}
      </p>

      {filteredPosts.length > 0 ? (
        <ul>
          {filteredPosts.map((post) => (
            <li key={post.path}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted py-rhythm-7">No posts match “{query}”.</p>
      )}

      {!deferredQuery && children}
    </div>
  )
}
