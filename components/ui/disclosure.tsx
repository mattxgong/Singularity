import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface DisclosureProps extends ComponentPropsWithoutRef<'details'> {
  label: ReactNode
}

export function Disclosure({ label, children, className, ...props }: DisclosureProps) {
  return (
    <details className={cn('border-boundary rounded-md border', className)} {...props}>
      <summary className="cursor-pointer px-4 py-3 font-semibold">{label}</summary>
      <div className="border-boundary border-t px-4 py-3">{children}</div>
    </details>
  )
}
