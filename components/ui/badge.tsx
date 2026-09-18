import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: 'default' | 'accent'
}

export function Badge({ tone = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-caption inline-flex items-center rounded-sm border px-2 py-1 font-sans font-semibold',
        tone === 'accent'
          ? 'border-accent bg-accent text-surface'
          : 'border-boundary bg-surface-raised text-ink',
        className
      )}
      {...props}
    />
  )
}
