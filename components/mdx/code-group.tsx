'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CodeGroupTab {
  label: string
  content: ReactNode
}

export default function CodeGroup({ tabs }: { tabs: CodeGroupTab[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const id = useId()

  function selectTab(index: number) {
    const nextIndex = (index + tabs.length) % tabs.length
    setSelectedIndex(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') selectTab(index + 1)
    else if (event.key === 'ArrowLeft') selectTab(index - 1)
    else if (event.key === 'Home') selectTab(0)
    else if (event.key === 'End') selectTab(tabs.length - 1)
    else return
    event.preventDefault()
  }

  if (tabs.length === 0) return null

  return (
    <div className="border-boundary my-6 overflow-hidden rounded-md border">
      <div
        role="tablist"
        aria-label="Code examples"
        className="bg-surface-raised flex overflow-x-auto"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={selectedIndex === index ? 0 : -1}
            onClick={() => setSelectedIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'border-boundary text-small px-4 py-2 font-sans',
              selectedIndex === index && 'text-accent border-b-2 font-semibold'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.label}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selectedIndex !== index}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
