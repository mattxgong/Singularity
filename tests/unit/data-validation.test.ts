import { describe, expect, it } from 'vitest'
import { type Project, validateProjectCaseStudies, validateProjects } from '@/data/types'

const validProject: Project = {
  slug: 'robotics-challenge',
  title: 'Robotics Challenge',
  tagline: 'Autonomous navigation and manipulation on a humanoid robot.',
  role: 'Computer vision and autonomous navigation developer',
  period: { start: '2025-07', end: '2025-08' },
  status: 'competition',
  stack: ['Python', 'ROS'],
  outcome: 'Third place among hundreds of university teams.',
  featured: true,
  order: 1,
  links: [],
  cover: {
    src: '/static/images/robotics-challenge.jpg',
    alt: 'A humanoid robot',
    width: 1600,
    height: 900,
  },
  caseStudy: 'robotics-challenge',
}

describe('portfolio data validation', () => {
  it('accepts a valid project and matching case study', () => {
    expect(() => validateProjects([validProject])).not.toThrow()
    expect(() => validateProjectCaseStudies([validProject], ['robotics-challenge'])).not.toThrow()
  })

  it('rejects duplicate project slugs', () => {
    expect(() => validateProjects([validProject, { ...validProject }])).toThrow(
      'Duplicate project slug'
    )
  })

  it('rejects malformed dates', () => {
    const malformed = {
      ...validProject,
      period: { start: 'July 2025' },
    } as unknown as Project

    expect(() => validateProjects([malformed])).toThrow('ISO YYYY-MM')
  })

  it('rejects covers without complete dimensions', () => {
    const malformed = {
      ...validProject,
      cover: { src: '/cover.jpg', alt: 'Robot', width: 0, height: 900 },
    }

    expect(() => validateProjects([malformed])).toThrow('requires alt text and dimensions')
  })

  it('rejects missing and orphaned case studies', () => {
    expect(() => validateProjectCaseStudies([validProject], [])).toThrow('Missing case study')
    expect(() => validateProjectCaseStudies([], ['robotics-challenge'])).toThrow(
      'Orphan case study'
    )
  })

  it('rejects duplicate case-study documents and references', () => {
    expect(() =>
      validateProjectCaseStudies([validProject], ['robotics-challenge', 'robotics-challenge'])
    ).toThrow('Duplicate case study document: robotics-challenge')

    expect(() =>
      validateProjectCaseStudies(
        [validProject, { ...validProject, slug: 'second-project' }],
        ['robotics-challenge']
      )
    ).toThrow('Case study referenced by multiple projects: robotics-challenge')
  })
})
