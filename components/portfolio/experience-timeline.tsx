import type { Experience } from '@/data/types'
import { formatPeriod } from '@/lib/format'

interface ExperienceTimelineProps {
  entries: readonly Experience[]
}

export function ExperienceTimeline({ entries }: ExperienceTimelineProps) {
  const orderedEntries = [...entries].sort((first, second) =>
    second.period.start.localeCompare(first.period.start)
  )

  return (
    <ol className="space-y-rhythm-7">
      {orderedEntries.map((entry) => (
        <li
          key={`${entry.organization}-${entry.period.start}`}
          className="gap-rhythm-5 relative grid min-w-0 pl-6 md:grid-cols-[10rem_minmax(0,1fr)] md:pl-0"
        >
          <span
            aria-hidden="true"
            className="border-boundary absolute top-2 bottom-0 left-0 border-l md:left-[11rem]"
          />
          <p className="text-small text-ink-muted font-sans tabular-nums">
            {formatPeriod(entry.period)}
          </p>
          <div className="min-w-0 md:pl-6">
            <h3 className="text-heading-4 font-sans font-semibold">{entry.title}</h3>
            <p className="text-ink-muted font-sans">{entry.organization}</p>
            <ul className="mt-rhythm-3 space-y-rhythm-2 list-disc pl-5 font-serif">
              {entry.achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}
