'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/content/toc'
import { cn } from '@/lib/cn'

export default function TocScrollSpy({ items }: { items: TocItem[] }) {
  const [activeUrl, setActiveUrl] = useState(items[0]?.url)

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.url.slice(1)))
      .filter((heading): heading is HTMLElement => heading !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveUrl(`#${visible.target.id}`)
      },
      { rootMargin: '0px 0px -70% 0px' }
    )

    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [items])

  function focusHeading(url: string) {
    const heading = document.getElementById(url.slice(1))
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }

  return (
    <ul className="text-small space-y-2 font-sans">
      {items.map((item) => (
        <li key={item.url} className={item.depth > 2 ? 'pl-3' : undefined}>
          <a
            href={item.url}
            onClick={() => focusHeading(item.url)}
            aria-current={activeUrl === item.url ? 'location' : undefined}
            className={cn(
              'text-ink-muted hover:text-accent block truncate',
              activeUrl === item.url && 'text-accent font-semibold'
            )}
            title={item.value}
          >
            {item.value}
          </a>
        </li>
      ))}
    </ul>
  )
}
