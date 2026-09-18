import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type HeadingLevel = 2 | 3 | 4 | 5 | 6

interface SectionProps extends ComponentPropsWithoutRef<'section'> {
  heading?: ReactNode
  headingLevel?: HeadingLevel
}

export function Section({
  heading,
  headingLevel = 2,
  children,
  className,
  ...props
}: SectionProps) {
  const headingElement = heading
    ? createElement(
        `h${headingLevel}`,
        { className: 'text-heading-3 font-semibold text-ink' },
        heading
      )
    : null

  return (
    <section className={cn('py-rhythm-7 sm:py-rhythm-8', className)} {...props}>
      {headingElement && (
        <div className="mb-rhythm-6 gap-rhythm-4 flex items-center">
          {headingElement}
          <span
            aria-hidden="true"
            className="border-boundary relative h-px flex-1 border-t before:absolute before:top-[-4px] before:left-0 before:h-2 before:border-l"
          />
        </div>
      )}
      {children}
    </section>
  )
}
