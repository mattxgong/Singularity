import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/cn'

describe('layout primitives', () => {
  it.each([
    ['prose', 'max-w-[68ch]'],
    ['content', 'max-w-[1024px]'],
    ['wide', 'max-w-[1280px]'],
  ] as const)('maps the %s container width', (width, expectedClass) => {
    const { container } = render(<Container width={width}>Content</Container>)
    expect(container.firstElementChild).toHaveClass(expectedClass)
  })

  it('renders the requested heading level and a decorative tick', () => {
    const { container } = render(
      <Section heading="Coordinates" headingLevel={3}>
        Content
      </Section>
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Coordinates' })).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})

describe('interface primitives', () => {
  it('renders buttons and navigation links with the selected variant', () => {
    const { rerender } = render(<Button variant="secondary">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('bg-surface-raised')

    rerender(<Button href="/projects">Projects</Button>)
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  })

  it('merges conflicting utility classes in caller order', () => {
    expect(cn('px-2 text-sm', 'px-6')).toBe('text-sm px-6')
  })

  it('composes card regions without prop drilling', () => {
    render(
      <Card>
        <Card.Header>Signal</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>
    )

    expect(screen.getByText('Signal').tagName).toBe('HEADER')
    expect(screen.getByText('Footer').tagName).toBe('FOOTER')
  })

  it('renders badge and prose variants', () => {
    render(
      <>
        <Badge tone="accent">Active</Badge>
        <Prose>Essay</Prose>
      </>
    )

    expect(screen.getByText('Active')).toHaveClass('bg-accent')
    expect(screen.getByText('Essay')).toHaveClass('prose')
  })
})
