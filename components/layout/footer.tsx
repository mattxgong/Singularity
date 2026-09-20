import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import { siteMetadata, socialLinks } from '@/data/index'

const secondaryLinks = [
  { href: '/tags', label: 'Tags' },
  { href: '/feed.xml', label: 'RSS' },
]

export default function Footer() {
  return (
    <footer className="mt-rhythm-9 border-boundary/40 py-rhythm-7 text-small text-ink-muted border-t">
      <div className="gap-rhythm-6 grid md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-rhythm-3">
          <p className="text-ink font-sans font-semibold">{siteMetadata.author}</p>
          <div className="gap-rhythm-4 flex items-center">
            {socialLinks.map((link) => (
              <SocialIcon
                key={link.kind}
                kind={link.kind}
                href={link.href}
                label={link.label}
                size={6}
              />
            ))}
          </div>
        </div>

        <nav aria-label="Secondary" className="gap-rhythm-5 flex font-sans font-semibold">
          {secondaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-rhythm-6 gap-rhythm-3 border-boundary/25 pt-rhythm-5 grid border-t md:grid-cols-2">
        <p>
          Set in Source Serif 4, IBM Plex Sans, and JetBrains Mono, each licensed under the SIL Open
          Font License 1.1. Titles set in Sterion by Lithochray Studio.
        </p>
        <p className="md:text-right">
          © {new Date().getFullYear()} {siteMetadata.author}. Built from the{' '}
          <Link
            href="https://github.com/timlrx/tailwind-nextjs-starter-blog"
            className="text-ink decoration-boundary hover:text-accent underline underline-offset-4"
          >
            Tailwind Next.js Starter Blog
          </Link>{' '}
          under the MIT License.
        </p>
      </div>
    </footer>
  )
}
