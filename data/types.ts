export type IsoMonth = `${number}-${number}`

export interface Period {
  start: IsoMonth
  end?: IsoMonth
}

export type ProjectStatus = 'shipped' | 'active' | 'archived' | 'competition'

export interface Project {
  slug: string
  title: string
  tagline: string
  role: string
  period: Period
  status: ProjectStatus
  stack: string[]
  outcome: string
  featured: boolean
  order: number
  links: { label: string; href: string; kind: 'repo' | 'demo' | 'writeup' | 'award' }[]
  cover?: { src: string; alt: string; width: number; height: number }
  caseStudy?: string
}

export interface Experience {
  organization: string
  title: string
  period: Period
  achievements: string[]
}

export interface SkillGroup {
  label: string
  skills: { name: string; primary: boolean }[]
}

export interface Education {
  institution: string
  degree: string
  period: Period
}

export interface Award {
  title: string
  year: number
}

export interface SocialLink {
  label: string
  href: string
  kind: 'github' | 'linkedin' | 'mail'
}

export interface UsesEntry {
  category: string
  name: string
  description: string
  href?: string
}

const ISO_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function assertIsoMonth(value: string, field: string): asserts value is IsoMonth {
  if (!ISO_MONTH_PATTERN.test(value)) {
    throw new Error(`${field} must use the ISO YYYY-MM format`)
  }
}

export function validateProjects(projects: readonly Project[]): void {
  const slugs = new Set<string>()

  for (const project of projects) {
    if (!SLUG_PATTERN.test(project.slug)) {
      throw new Error(`Project slug "${project.slug}" must be lowercase and hyphenated`)
    }
    if (slugs.has(project.slug)) {
      throw new Error(`Duplicate project slug: ${project.slug}`)
    }
    slugs.add(project.slug)

    assertIsoMonth(project.period.start, `${project.slug}.period.start`)
    if (project.period.end) {
      assertIsoMonth(project.period.end, `${project.slug}.period.end`)
    }

    if (
      project.cover &&
      (!project.cover.alt.trim() || project.cover.width <= 0 || project.cover.height <= 0)
    ) {
      throw new Error(`Project cover for "${project.slug}" requires alt text and dimensions`)
    }
  }
}

export function validateProjectCaseStudies(
  projects: readonly Project[],
  caseStudySlugs: readonly string[]
): void {
  const availableCaseStudies = new Set(caseStudySlugs)
  const caseStudyReferences = projects.flatMap((project) =>
    project.caseStudy ? [project.caseStudy] : []
  )
  const referencedCaseStudies = new Set(caseStudyReferences)

  if (availableCaseStudies.size !== caseStudySlugs.length) {
    const duplicate = caseStudySlugs.find((slug, index) => caseStudySlugs.indexOf(slug) !== index)
    throw new Error(`Duplicate case study document: ${duplicate}`)
  }

  if (referencedCaseStudies.size !== caseStudyReferences.length) {
    const duplicate = caseStudyReferences.find(
      (slug, index) => caseStudyReferences.indexOf(slug) !== index
    )
    throw new Error(`Case study referenced by multiple projects: ${duplicate}`)
  }

  for (const slug of referencedCaseStudies) {
    if (!availableCaseStudies.has(slug)) {
      throw new Error(`Missing case study: ${slug}`)
    }
  }

  for (const slug of availableCaseStudies) {
    if (!referencedCaseStudies.has(slug)) {
      throw new Error(`Orphan case study: ${slug}`)
    }
  }
}
