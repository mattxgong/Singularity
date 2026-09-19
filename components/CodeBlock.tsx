'use client'

import { useRef, useState, type ComponentPropsWithoutRef } from 'react'

export default function CodeBlock({ children, ...props }: ComponentPropsWithoutRef<'pre'>) {
  const codeRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    const value = codeRef.current?.textContent
    if (!value) return

    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={copied ? 'Code copied' : 'Copy code'}
        onClick={copyCode}
        className="border-boundary bg-code-surface-raised text-code-ink text-caption focus-visible:outline-focus absolute top-2 right-2 z-10 rounded border px-2 py-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={codeRef} {...props}>
        {children}
      </pre>
    </div>
  )
}
