import TocScrollSpy from './toc-scroll-spy'
import { Disclosure } from '@/components/ui/disclosure'
import type { TocItem } from '@/lib/content/toc'

function TocLinks({ items }: { items: TocItem[] }) {
  return (
    <ul className="text-small space-y-2 font-sans">
      {items.map((item) => (
        <li key={item.url} className={item.depth > 2 ? 'pl-3' : undefined}>
          <a className="text-ink-muted hover:text-accent block truncate" href={item.url}>
            {item.value}
          </a>
        </li>
      ))}
    </ul>
  )
}

interface BlogTableOfContentsProps {
  toc: TocItem[]
  presentation: 'mobile' | 'desktop'
}

export default function BlogTableOfContents({ toc, presentation }: BlogTableOfContentsProps) {
  const items = toc.filter((item) => item.depth >= 2 && item.depth <= 4)
  if (items.length < 3) return null

  if (presentation === 'mobile') {
    return (
      <nav aria-label="Table of contents" className="py-6 lg:hidden">
        <Disclosure label="On this page">
          <TocLinks items={items} />
        </Disclosure>
      </nav>
    )
  }

  return (
    <nav
      aria-label="Table of contents"
      className="py-rhythm-7 sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto lg:block"
    >
      <h2 className="text-caption text-ink-muted mb-3 font-sans font-semibold tracking-wide uppercase">
        On this page
      </h2>
      <TocScrollSpy items={items} />
    </nav>
  )
}
