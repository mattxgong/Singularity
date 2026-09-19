'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { Fragment, useEffect, useRef, useState } from 'react'
import { navigation } from '@/data/index'
import { ActiveNavLink } from './active-nav-link'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !isOpen) return

    disableBodyScroll(panel)
    return () => enableBodyScroll(panel)
  }, [isOpen])

  useEffect(() => clearAllBodyScrollLocks, [])

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="focus-visible:outline-focus text-ink-muted duration-fast hover:bg-surface-raised hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-70"
          onClose={setIsOpen}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false)
          }}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-normal ease-standard"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-fast ease-standard"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-void-950/55 fixed inset-0 backdrop-blur-sm" aria-hidden="true" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition duration-normal ease-standard"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition duration-fast ease-standard"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel
              ref={panelRef}
              className="border-boundary bg-surface p-rhythm-5 fixed inset-y-0 right-0 flex w-full max-w-sm flex-col border-l shadow-2xl"
            >
              <div className="border-boundary/40 pb-rhythm-4 flex items-center justify-between border-b">
                <DialogTitle className="text-heading-3 text-ink font-sans font-semibold">
                  Navigate
                </DialogTitle>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="focus-visible:outline-focus text-ink-muted duration-fast hover:bg-surface-raised hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Mobile" className="gap-rhythm-3 pt-rhythm-6 flex flex-1 flex-col">
                {navigation.map((link) => (
                  <ActiveNavLink
                    key={link.href}
                    {...link}
                    className="border-boundary/25 py-rhythm-3 text-heading-2 min-h-12 border-b after:bottom-0"
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </nav>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  )
}
