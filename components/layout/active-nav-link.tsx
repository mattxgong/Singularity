'use client'

import { usePathname } from 'next/navigation'
import Link from '@/components/Link'
import { cn } from '@/lib/cn'
import type { NavigationItem } from '@/data/index'

interface ActiveNavLinkProps extends NavigationItem {
  className?: string
  onClick?: () => void
}

export function ActiveNavLink({ href, title, className, onClick }: ActiveNavLinkProps) {
  const pathname = usePathname()
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        'focus-visible:outline-focus text-small text-ink-muted duration-fast hover:text-accent relative inline-flex min-h-6 items-center font-sans font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4',
        isCurrent &&
          'text-ink after:bg-accent after:absolute after:right-0 after:bottom-[-0.625rem] after:left-0 after:h-px',
        className
      )}
      onClick={onClick}
    >
      {title}
    </Link>
  )
}
