'use client'

import { Suspense, createContext, lazy, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// Lazy so cmdk and MiniSearch stay out of the shell's shared chunk.
const CommandMenu = lazy(() => import('@/components/search/command-menu'))

interface SearchContextValue {
  openSearch: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch() {
  const value = useContext(SearchContext)
  if (!value) throw new Error('useSearch must be used within SearchProvider')
  return value
}

export default function SearchProvider({ children }: { children: ReactNode }) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const openRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      triggerRef.current = document.activeElement as HTMLElement
      setMounted(true)
    } else {
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
    openRef.current = nextOpen
    setOpen(nextOpen)
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        changeOpen(!openRef.current)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // changeOpen only touches refs and setState, so a single subscription is correct.
  }, [])

  return (
    <SearchContext.Provider value={{ openSearch: () => changeOpen(true) }}>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <CommandMenu open={open} onOpenChange={changeOpen} />
        </Suspense>
      )}
    </SearchContext.Provider>
  )
}
