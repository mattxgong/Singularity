import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export function Prose({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('prose dark:prose-invert', className)} {...props} />
}
