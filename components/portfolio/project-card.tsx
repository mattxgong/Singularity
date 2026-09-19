import Image from '@/components/Image'
import Link from '@/components/Link'
import { ProjectMeta } from '@/components/portfolio/project-meta'
import { Card } from '@/components/ui/card'
import type { Project } from '@/data/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      aria-label={`View ${project.title} project`}
      className="focus-visible:outline-focus block h-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <Card className="duration-fast hover:border-accent flex h-full flex-col overflow-hidden transition-colors">
        {project.cover && (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            className="aspect-video w-full object-cover"
          />
        )}
        <Card.Header>
          <h3 className="text-heading-4 font-sans font-semibold">{project.title}</h3>
          <p className="text-ink-muted mt-rhythm-2 font-serif">{project.tagline}</p>
        </Card.Header>
        <Card.Body className="space-y-rhythm-5 flex flex-1 flex-col">
          <p className="border-accent bg-surface border-l-2 px-4 py-3 font-sans font-semibold">
            {project.outcome}
          </p>
          <ProjectMeta project={project} />
        </Card.Body>
      </Card>
    </Link>
  )
}
