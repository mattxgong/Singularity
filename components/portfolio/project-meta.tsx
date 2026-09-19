import { Badge } from '@/components/ui/badge'
import type { Project } from '@/data/types'
import { formatPeriod } from '@/lib/format'

interface ProjectMetaProps {
  project: Project
}

const statusLabels: Record<Project['status'], string> = {
  active: 'Active',
  archived: 'Archived',
  competition: 'Competition',
  shipped: 'Shipped',
}

export function ProjectMeta({ project }: ProjectMetaProps) {
  return (
    <div className="space-y-rhythm-4">
      <dl className="gap-x-rhythm-5 gap-y-rhythm-2 text-small grid grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-ink-muted">Role</dt>
        <dd>{project.role}</dd>
        <dt className="text-ink-muted">Period</dt>
        <dd>{formatPeriod(project.period)}</dd>
        <dt className="text-ink-muted">Status</dt>
        <dd>{statusLabels[project.status]}</dd>
      </dl>
      <ul aria-label="Technology stack" className="gap-rhythm-2 flex flex-wrap">
        {project.stack.map((technology) => (
          <li key={technology}>
            <Badge>{technology}</Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
