import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CalloutKind = 'note' | 'tip' | 'important' | 'warning' | 'caution'

interface CalloutProps {
  children: ReactNode
  kind?: CalloutKind
  title?: string
}

export default function Callout({ children, kind = 'note', title }: CalloutProps) {
  const label = title ?? kind[0].toUpperCase() + kind.slice(1)

  return (
    <aside
      className={cn(
        'markdown-alert border-boundary bg-surface-raised my-6 border-l-4 px-4 py-3',
        `markdown-alert-${kind}`
      )}
      aria-label={label}
    >
      <p className="markdown-alert-title font-sans font-semibold">{label}</p>
      <div>{children}</div>
    </aside>
  )
}
