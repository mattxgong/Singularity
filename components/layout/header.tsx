import Logo from '@/data/logo.svg'
import Link from '@/components/Link'
import { navigation, siteMetadata } from '@/data/index'
import { cn } from '@/lib/cn'
import { ActiveNavLink } from './active-nav-link'
import MobileNav from './mobile-nav'
import SearchButton from './search-button'
import ThemeSwitch from './theme-switch'

export default function Header() {
  return (
    <header
      className={cn(
        'border-boundary/30 bg-surface/90 py-rhythm-4 flex min-h-20 w-full items-center justify-between border-b backdrop-blur-sm',
        siteMetadata.stickyNav && 'sticky top-0 z-50'
      )}
    >
      <Link
        href="/"
        aria-label={`${siteMetadata.headerTitle}, home`}
        className="focus-visible:outline-focus gap-rhythm-3 flex min-h-6 items-center focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <Logo className="h-8 w-8" aria-hidden="true" />
        <span className="text-heading-3 text-ink font-title hidden sm:inline">
          {siteMetadata.headerTitle}
        </span>
      </Link>

      <div className="gap-rhythm-2 sm:gap-rhythm-3 flex items-center">
        <nav aria-label="Primary" className="gap-rhythm-5 hidden items-center md:flex">
          {navigation.map((link) => (
            <ActiveNavLink key={link.href} {...link} />
          ))}
        </nav>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}
