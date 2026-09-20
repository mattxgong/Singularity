import { ExperienceTimeline } from '@/components/portfolio/experience-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { awards, education, experience, profile, siteMetadata, skillGroups } from '@/data/index'
import { formatPeriod } from '@/lib/format'
import { createPersonJsonLd } from '@/lib/seo'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Resume',
  description: `${profile.name}'s experience, education, skills, and awards.`,
})

export default function ResumePage() {
  const personJsonLd = createPersonJsonLd({
    name: profile.name,
    email: profile.email,
    url: `${siteMetadata.siteUrl}/resume`,
    jobTitle: profile.status,
    education: education.map((entry) => entry.institution),
    sameAs: [siteMetadata.github, siteMetadata.linkedin],
    knowsAbout: skillGroups.flatMap((group) =>
      group.skills.filter((skill) => skill.primary).map((skill) => skill.name)
    ),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <header className="py-rhythm-7 sm:py-rhythm-8 gap-rhythm-5 flex flex-col items-start sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-rhythm-3 max-w-[68ch]">
          <p className="text-small text-accent font-sans font-semibold uppercase">Resume</p>
          <h1 className="text-heading-1 font-title">{profile.name}</h1>
          <p className="text-lead text-ink-muted font-serif">{profile.positioning}</p>
          <a
            className="text-accent font-sans underline underline-offset-4"
            href={`mailto:${profile.email}`}
          >
            {profile.email}
          </a>
        </div>
        <Button href="/resume/matthew-gong-resume.pdf" download="matthew-gong-resume.pdf">
          Download PDF
        </Button>
      </header>

      <Section heading="Experience">
        <ExperienceTimeline entries={experience} />
      </Section>

      <Section heading="Education">
        <div className="space-y-rhythm-5">
          {education.map((entry) => (
            <article key={`${entry.institution}-${entry.degree}`}>
              <h3 className="text-heading-4 font-sans font-semibold">{entry.degree}</h3>
              <p className="text-ink-muted font-sans">{entry.institution}</p>
              <p className="text-small mt-rhythm-2 font-sans tabular-nums">
                {formatPeriod(entry.period)}
              </p>
            </article>
          ))}
        </div>
      </Section>

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

      <Section heading="Awards">
        <ul className="space-y-rhythm-3">
          {[...awards]
            .sort((first, second) => second.year - first.year)
            .map((award) => (
              <li
                key={`${award.title}-${award.year}`}
                className="border-boundary/40 gap-rhythm-5 grid border-b pb-3 sm:grid-cols-[5rem_minmax(0,1fr)]"
              >
                <span className="text-ink-muted font-sans tabular-nums">{award.year}</span>
                <span className="font-serif">{award.title}</span>
              </li>
            ))}
        </ul>
      </Section>
    </>
  )
}
