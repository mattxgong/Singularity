import { projects } from '@/data/index'
import { ProjectGrid } from '@/components/portfolio/project-grid'
import type { Project } from '@/data/types'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Projects',
  description: 'Selected work in machine learning, robotics, and software systems.',
})

const statusLabels: Record<Project['status'], string> = {
  active: 'Current work',
  archived: 'Archive',
  competition: 'Competition work',
  shipped: 'Shipped work',
}

export default function Projects() {
  const orderedProjects = [...projects].sort((first, second) => {
    if (first.featured !== second.featured) return first.featured ? -1 : 1
    if (first.order !== second.order) return first.order - second.order
    return second.period.start.localeCompare(first.period.start)
  })
  const projectsByStatus = new Map<Project['status'], Project[]>()

  for (const project of orderedProjects) {
    const group = projectsByStatus.get(project.status) ?? []
    group.push(project)
    projectsByStatus.set(project.status, group)
  }

  return (
    <div className="py-rhythm-7 sm:py-rhythm-8">
      <header className="space-y-rhythm-3 max-w-[68ch]">
        <p className="text-small text-accent font-sans font-semibold uppercase">Selected work</p>
        <h1 className="text-heading-1 font-title">Projects</h1>
        <p className="text-lead text-ink-muted font-serif">
          Machine learning, robotics, and software systems built for measurable outcomes.
        </p>
      </header>

      <div className="mt-rhythm-8 space-y-rhythm-9">
        {[...projectsByStatus].map(([status, groupedProjects]) => {
          const headingId = `${status}-projects`

          return (
            <section key={status} aria-labelledby={headingId}>
              <div className="mb-rhythm-5 gap-rhythm-4 flex items-center">
                <h2 id={headingId} className="text-heading-3 font-sans font-semibold">
                  {statusLabels[status]}
                </h2>
                <span aria-hidden="true" className="border-boundary h-px flex-1 border-t" />
              </div>
              <ProjectGrid projects={groupedProjects} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
