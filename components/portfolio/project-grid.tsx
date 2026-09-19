import { ProjectCard } from '@/components/portfolio/project-card'
import type { Project } from '@/data/types'

interface ProjectGridProps {
  projects: readonly Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  )
}
