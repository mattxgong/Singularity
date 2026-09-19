import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { config } = vi.hoisted(() => ({
  config: {
    umamiWebsiteId: undefined as string | undefined,
    src: undefined as string | undefined,
  },
}))

vi.mock('next/script', async () => {
  const React = await import('react')
  return {
    default: ({ strategy, ...props }: React.ComponentProps<'script'> & { strategy?: string }) =>
      React.createElement('script', {
        ...props,
        'data-strategy': strategy,
        'data-testid': 'umami-script',
      }),
  }
})
vi.mock('@/data/index', () => ({
  siteMetadata: { analytics: { umamiAnalytics: config } },
}))

import Analytics from './Analytics'

describe('Analytics', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.stubEnv('NODE_ENV', 'production')
    config.umamiWebsiteId = undefined
    config.src = undefined
  })

  it('loads nothing without an explicit website ID', () => {
    const { container } = render(<Analytics />)
    expect(container).toBeEmptyDOMElement()
  })

  it('loads page-view tracking only in configured production builds', () => {
    config.umamiWebsiteId = 'website-id'
    config.src = 'https://analytics.example.com/script.js'
    render(<Analytics />)

    const script = screen.getByTestId('umami-script')
    expect(script).toHaveAttribute('src', config.src)
    expect(script).toHaveAttribute('data-website-id', 'website-id')
    expect(script).toHaveAttribute('data-auto-track', 'true')
    expect(script).not.toHaveAttribute('data-umami-event')
  })

  it('loads nothing during development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    config.umamiWebsiteId = 'website-id'
    const { container } = render(<Analytics />)
    expect(container).toBeEmptyDOMElement()
  })
})
