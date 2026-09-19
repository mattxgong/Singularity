export type CoreContent<T> = Omit<T, 'content' | 'mdx' | '_meta'>

export function coreContent<T extends object>(document: T): CoreContent<T> {
  const {
    content: _content,
    mdx: _mdx,
    _meta,
    ...core
  } = document as T & {
    content?: string
    mdx?: string
    _meta?: unknown
  }

  return core
}

export function sortPosts<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
}

export function allCoreContent<T extends { date: string; draft?: boolean }>(posts: T[]) {
  return posts
    .filter((post) => process.env.NODE_ENV !== 'production' || post.draft !== true)
    .map(coreContent)
}

export type NavigablePost = {
  slug: string
  path: string
  title: string
  date: string
  tags?: string[]
  series?: string
}

export function getPostNavigation<T extends NavigablePost>(posts: T[], currentSlug: string) {
  const sortedPosts = sortPosts(posts)
  const currentIndex = sortedPosts.findIndex((post) => post.slug === currentSlug)
  if (currentIndex === -1) return { prev: undefined, next: undefined }

  const currentPost = sortedPosts[currentIndex]
  const chronological = {
    prev: sortedPosts[currentIndex + 1],
    next: sortedPosts[currentIndex - 1],
  }
  if (!currentPost.series) return chronological

  const seriesPosts = sortedPosts.filter((post) => post.series === currentPost.series)
  const seriesIndex = seriesPosts.findIndex((post) => post.slug === currentSlug)

  return {
    prev: seriesPosts[seriesIndex + 1] ?? chronological.prev,
    next: seriesPosts[seriesIndex - 1] ?? chronological.next,
  }
}

export function getRelatedPosts<T extends NavigablePost>(
  posts: T[],
  currentSlug: string,
  limit = 3
): T[] {
  const currentPost = posts.find((post) => post.slug === currentSlug)
  if (!currentPost?.tags?.length) return []

  const currentTags = new Set(currentPost.tags)
  return posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => ({
      post,
      overlap: post.tags?.filter((tag) => currentTags.has(tag)).length ?? 0,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort(
      (first, second) =>
        second.overlap - first.overlap || Date.parse(second.post.date) - Date.parse(first.post.date)
    )
    .slice(0, limit)
    .map(({ post }) => post)
}
