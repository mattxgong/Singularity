import Link from '@/components/Link'
import { Section } from '@/components/ui/section'
import { uses } from '@/data/index'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Uses' })

const categories = [...new Set(uses.map((entry) => entry.category))]

export default function UsesPage() {
  return (
    <>
      <header className="py-rhythm-7 sm:py-rhythm-8 max-w-[68ch]">
        <p className="text-small text-accent font-sans font-semibold uppercase">Uses</p>
        <h1 className="text-heading-1 mt-rhythm-4 font-title">Tools I work with</h1>
        <p className="text-lead text-ink-muted mt-rhythm-4 font-serif">
          A focused list of editors, shells, and development tools in my current workflow.
        </p>
      </header>

      {categories.map((category) => (
        <Section key={category} heading={category}>
          <ul className="gap-rhythm-5 grid sm:grid-cols-2">
            {uses
              .filter((entry) => entry.category === category)
              .map((entry) => (
                <li key={entry.name} className="border-boundary pt-rhythm-4 border-t">
                  <h3 className="text-heading-4 font-sans font-semibold">
                    {entry.href ? (
                      <Link href={entry.href} className="hover:text-accent">
                        {entry.name}
                      </Link>
                    ) : (
                      entry.name
                    )}
                  </h3>
                  <p className="text-ink-muted mt-rhythm-2 font-serif">{entry.description}</p>
                </li>
              ))}
          </ul>
        </Section>
      ))}
    </>
  )
}
