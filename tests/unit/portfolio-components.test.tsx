import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProjectCard } from '@/components/portfolio/project-card'
import { ProjectGrid } from '@/components/portfolio/project-grid'
import type { Project } from '@/data/types'

const project: Project = {
  slug: 'solomon-chess-engine',
  title: 'Solomon: Chess Engine',
  tagline: 'A high-performance C++ chess engine.',
  role: 'Chess engine developer',
  period: { start: '2025-01' },
  status: 'active',
  stack: ['C++', 'NNUE'],
  outcome: 'Maintains real-time play with incremental neural evaluation.',
  featured: false,
  order: 3,
  links: [],
}

afterEach(cleanup)

describe('ProjectCard', () => {
  it('uses one accessible link for the full card', () => {
    render(<ProjectCard project={project} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName(/Solomon: Chess Engine/)
    expect(links[0]).toHaveAttribute('href', '/projects/solomon-chess-engine')
  })

  it('surfaces the outcome, metadata, and stack', () => {
    render(<ProjectCard project={project} />)

    expect(screen.getByText(project.outcome)).toHaveClass('font-semibold')
    expect(screen.getByText('Chess engine developer')).toBeInTheDocument()
    expect(screen.getByText('January 2025 to Present')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Technology stack' })).getAllByRole('listitem')
    ).toHaveLength(2)
  })
})

describe('ProjectGrid', () => {
  it('renders a responsive three-column grid', () => {
    const { container } = render(<ProjectGrid projects={[project]} />)

    expect(container.firstElementChild).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3'
    )
  })
})
