'use client'

import { Suspense, lazy, useRef, useState } from 'react'

// Lazy so Headless UI's dialog stays out of every page's first load.
const loadPanel = () => import('./mobile-nav-panel')
const MobileNavPanel = lazy(loadPanel)

export default function MobileNav() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) setMounted(true)
    else requestAnimationFrame(() => triggerRef.current?.focus())
    setIsOpen(nextOpen)
  }

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={() => changeOpen(true)}
        className="focus-visible:outline-focus text-ink-muted duration-fast hover:bg-surface-raised hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {mounted && (
        <Suspense fallback={null}>
          <MobileNavPanel isOpen={isOpen} onClose={changeOpen} />
        </Suspense>
      )}
    </div>
  )
}
