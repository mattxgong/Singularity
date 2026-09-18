import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Bleed from './Bleed'
import CodeBlock from './CodeBlock'
import { components } from './MDXComponents'
import TableOfContents from './TableOfContents'

describe('content primitives', () => {
  it('renders nested and filtered table-of-contents entries', () => {
    render(
      <TableOfContents
        toc={[
          { value: 'Intro', url: '#intro', depth: 2 },
          { value: 'Detail', url: '#detail', depth: 3 },
          { value: 'Hidden', url: '#hidden', depth: 2 },
        ]}
        exclude="Hidden"
      />
    )

    expect(screen.getByRole('link', { name: 'Intro' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Detail' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Hidden' })).not.toBeInTheDocument()
  })

  it('copies the rendered code and announces completion', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(
      <CodeBlock>
        <code>const answer = 42</code>
      </CodeBlock>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('const answer = 42')
    expect(await screen.findByRole('button', { name: 'Code copied' })).toBeInTheDocument()
  })

  it('provides local MDX mappings and full-bleed layout classes', () => {
    const { container } = render(<Bleed full>Wide</Bleed>)

    expect(components.TOCInline).toBe(TableOfContents)
    expect(components.pre).toBe(CodeBlock)
    expect(container.firstChild).toHaveClass('mx-[calc(-50vw+50%)]')
  })
})
