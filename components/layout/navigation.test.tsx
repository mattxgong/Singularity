import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ActiveNavLink } from './active-nav-link'
import MobileNav from './mobile-nav'

vi.mock('next/navigation', () => ({ usePathname: () => '/blog/example-post' }))
vi.mock('body-scroll-lock', () => ({
  clearAllBodyScrollLocks: vi.fn(),
  disableBodyScroll: vi.fn(),
  enableBodyScroll: vi.fn(),
}))

describe('navigation', () => {
  it('marks nested routes as current', () => {
    render(<ActiveNavLink href="/blog" title="Writing" />)
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute('aria-current', 'page')
  })

  it('closes the mobile dialog with Escape and restores trigger focus', async () => {
    render(<MobileNav />)
    const trigger = screen.getByRole('button', { name: 'Open menu' })
    trigger.focus()
    fireEvent.click(trigger)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: 'Mobile' })).getAllByRole('link')
    ).toHaveLength(5)

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })
})
