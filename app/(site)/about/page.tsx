import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { awards, education, profile, siteMetadata, skillGroups } from '@/data/index'
import { formatPeriod } from '@/lib/format'
import { createPersonJsonLd } from '@/lib/seo'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const personJsonLd = createPersonJsonLd({
    name: profile.name,
    url: `${siteMetadata.siteUrl}/about`,
    email: profile.email,
    jobTitle: profile.status,
    sameAs: [siteMetadata.github, siteMetadata.linkedin],
    education: education.map((entry) => entry.institution),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <header className="py-rhythm-7 sm:py-rhythm-8 space-y-rhythm-4 max-w-[68ch]">
        <p className="text-small text-accent font-sans font-semibold uppercase">About</p>
        <h1 className="text-heading-1 font-sans font-bold">Building useful systems</h1>
        {profile.biography.map((paragraph) => (
          <p key={paragraph} className="text-lead text-ink-muted font-serif">
            {paragraph}
          </p>
        ))}
      </header>

      <Section heading="Skills">
        <div className="gap-rhythm-6 grid md:grid-cols-3">
          {skillGroups.map((group) => (
            <section key={group.label}>
              <h3 className="text-heading-4 font-sans font-semibold">{group.label}</h3>
              <ul className="mt-rhythm-4 gap-rhythm-2 flex flex-wrap">
                {group.skills.map((skill) => (
                  <li key={skill.name}>
                    <Badge tone={skill.primary ? 'accent' : 'default'}>{skill.name}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section heading="Education and recognition">
        {education.map((entry) => (
          <article key={entry.degree} className="mb-rhythm-6">
            <h3 className="text-heading-4 font-sans font-semibold">{entry.degree}</h3>
            <p className="text-ink-muted font-serif">
              {entry.institution}, {formatPeriod(entry.period)}
            </p>
          </article>
        ))}
        <ul className="space-y-rhythm-2 font-serif">
          {[...awards]
            .sort((first, second) => second.year - first.year)
            .map((award) => (
              <li key={award.title}>
                <span className="text-ink-muted mr-3 font-sans tabular-nums">{award.year}</span>
                {award.title}
              </li>
            ))}
        </ul>
      </Section>

      <Section heading="Away from the screen">
        <p className="text-lead text-ink-muted max-w-[68ch] font-serif">
          I play ultimate frisbee and tennis, ski and snowboard, swim, play guitar and piano, and
          enjoy escape rooms.
        </p>
      </Section>
    </>
  )
}
