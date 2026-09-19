'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { brand } from '@/data/index'
import { cn } from '@/lib/cn'

const iconClassName = 'h-5 w-5'

const Sun = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={iconClassName}>
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
)

const Moon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className={iconClassName}>
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
)

const Monitor = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={iconClassName}
  >
    <rect x="3" y="3" width="14" height="10" rx="2" />
    <path d="M7 17h6M10 13v4" />
  </svg>
)

const Blank = () => <svg aria-hidden="true" className={iconClassName} />

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  // The document ships a static theme-color for the default theme, so it needs
  // updating whenever the reader resolves to the other one.
  useEffect(() => {
    if (!resolvedTheme) return
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? brand.void : brand.plate)
  }, [resolvedTheme])

  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label="Theme switcher"
        className="focus-visible:outline-focus text-ink-muted duration-fast hover:bg-surface-raised hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {mounted ? resolvedTheme === 'dark' ? <Moon /> : <Sun /> : <Blank />}
      </MenuButton>
      <MenuItems
        transition
        className="border-boundary bg-surface-raised mt-rhythm-2 duration-fast ease-standard absolute right-0 z-50 w-36 origin-top-right rounded-sm border p-1 shadow-lg transition focus:outline-hidden data-closed:scale-95 data-closed:opacity-0"
      >
        {options.map(({ value, label, icon: Icon }) => (
          <MenuItem key={value}>
            {({ focus }) => (
              <button
                type="button"
                onClick={() => setTheme(value)}
                aria-current={theme === value ? 'true' : undefined}
                className={cn(
                  'gap-rhythm-2 text-small text-ink flex min-h-10 w-full items-center rounded-sm px-3 py-2 font-sans',
                  focus && 'bg-surface text-accent',
                  theme === value && 'font-semibold'
                )}
              >
                <Icon />
                {label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
