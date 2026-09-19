import { describe, expect, it } from 'vitest'
import { getPostNavigation, getRelatedPosts, type NavigablePost } from './index'

const posts: NavigablePost[] = [
  {
    slug: 'newest',
    path: 'blog/newest',
    title: 'Newest',
    date: '2026-03-01',
    tags: ['systems', 'tooling'],
  },
  {
    slug: 'series-two',
    path: 'blog/series-two',
    title: 'Series two',
    date: '2026-02-01',
    tags: ['systems'],
    series: 'Building systems',
  },
  {
    slug: 'middle',
    path: 'blog/middle',
    title: 'Middle',
    date: '2026-01-15',
    tags: ['notes'],
  },
  {
    slug: 'series-one',
    path: 'blog/series-one',
    title: 'Series one',
    date: '2026-01-01',
    tags: ['systems', 'tooling'],
    series: 'Building systems',
  },
]

describe('post navigation', () => {
  it('uses series neighbors before chronological neighbors', () => {
    const navigation = getPostNavigation(posts, 'series-two')

    expect(navigation.prev?.slug).toBe('series-one')
    expect(navigation.next?.slug).toBe('newest')
  })

  it('handles chronological boundaries without empty posts', () => {
    expect(getPostNavigation(posts, 'newest').next).toBeUndefined()
    expect(getPostNavigation(posts, 'series-one').prev).toBeUndefined()
    expect(getPostNavigation(posts, 'missing')).toEqual({ prev: undefined, next: undefined })
  })

  it('ranks related posts by tag overlap and caps the result', () => {
    const related = getRelatedPosts(posts, 'newest', 2)

    expect(related.map((post) => post.slug)).toEqual(['series-one', 'series-two'])
    expect(getRelatedPosts(posts, 'middle')).toEqual([])
  })
})
