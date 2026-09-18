import type { ReactNode } from 'react'

export default function Bleed({ full = false, children }: { full?: boolean; children: ReactNode }) {
  return (
    <div className={`relative mt-6 ${full ? 'mx-[calc(-50vw+50%)]' : '-mx-6 md:-mx-8 2xl:-mx-24'}`}>
      {children}
    </div>
  )
}
