import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

const widths = {
  prose: 'max-w-[68ch]',
  content: 'max-w-[1024px]',
  wide: 'max-w-[1280px]',
} as const

interface ContainerProps extends ComponentPropsWithoutRef<'div'> {
  width?: keyof typeof widths
}

export function Container({ width = 'content', className, ...props }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)}
      {...props}
    />
  )
}
