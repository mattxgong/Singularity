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
