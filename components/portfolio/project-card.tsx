import Link from '@/components/Link'
import { ProjectMeta } from '@/components/portfolio/project-meta'
import { Card } from '@/components/ui/card'
import type { Project } from '@/data/types'

const basePath = process.env.BASE_PATH ?? ''

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="duration-fast hover:border-accent relative flex h-full flex-col overflow-hidden transition-colors">
      {project.cover && (
        // A plain img keeps next/image off the home and projects first-load path.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${basePath}${project.cover.src}`}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover"
        />
      )}
      <Card.Header>
        <h3 className="text-heading-4 font-sans font-semibold">
          <Link
            href={`/projects/${project.slug}`}
            className="focus-visible:outline-focus after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-ink-muted mt-rhythm-2 font-serif">{project.tagline}</p>
      </Card.Header>
      <Card.Body className="space-y-rhythm-5 flex flex-1 flex-col">
        <p className="border-accent bg-surface border-l-2 px-4 py-3 font-sans font-semibold">
          {project.outcome}
        </p>
        <ProjectMeta project={project} />
      </Card.Body>
    </Card>
  )
}
