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
        className="absolute top-2 right-2 z-10 rounded border border-gray-500 bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 motion-reduce:transition-none"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre ref={codeRef} {...props}>
        {children}
      </pre>
    </div>
  )
}
