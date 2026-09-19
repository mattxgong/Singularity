'use client'

import { siteMetadata } from '@/data/index'
import { useSearch } from '@/components/SearchProvider'

export default function SearchButton() {
  const { openSearch } = useSearch()
  if (siteMetadata.search?.provider !== 'local') return null

  return (
    <button
      type="button"
      aria-label="Search"
      onClick={openSearch}
      className="focus-visible:outline-focus text-ink-muted duration-fast hover:bg-surface-raised hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </button>
  )
}
