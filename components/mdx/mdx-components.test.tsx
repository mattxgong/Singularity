import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Callout from './callout'
import CodeGroup from './code-group'
import Figure from './figure'

describe('MDX components', () => {
  it('renders a captioned figure with explicit dimensions and theme sources', () => {
    render(
      <Figure
        src="/light.png"
        darkSrc="/dark.png"
        alt="A chart"
        caption="Measured results"
        width={800}
        height={400}
      />
    )

    expect(screen.getByRole('figure')).toHaveTextContent('Measured results')
    const images = screen.getAllByRole('img', { name: 'A chart' })
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('width', '800')
    expect(images[0]).toHaveAttribute('height', '400')
  })

  it('uses the existing markdown alert classes for callouts', () => {
    render(<Callout kind="warning">Check the inputs.</Callout>)
    expect(screen.getByRole('complementary', { name: 'Warning' })).toHaveClass(
      'markdown-alert',
      'markdown-alert-warning'
    )
  })

  it('moves tab selection and focus with arrow keys', () => {
    render(
      <CodeGroup
        tabs={[
          { label: 'npm', content: <code>npm install</code> },
          { label: 'yarn', content: <code>yarn add</code> },
        ]}
      />
    )
    const npmTab = screen.getByRole('tab', { name: 'npm' })
    const yarnTab = screen.getByRole('tab', { name: 'yarn' })

    npmTab.focus()
    fireEvent.keyDown(npmTab, { key: 'ArrowRight' })
    expect(yarnTab).toHaveFocus()
    expect(yarnTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('yarn add')
  })
})
