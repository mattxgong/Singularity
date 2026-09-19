'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { StarfieldStatic } from './starfield-static'

const Starfield = dynamic(() => import('./starfield'), { ssr: false })
const MEDIUM_BREAKPOINT = 768

export function StarfieldMount() {
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateMode = () => {
      setShowCanvas(!reducedMotion.matches && window.innerWidth >= MEDIUM_BREAKPOINT)
    }

    updateMode()
    reducedMotion.addEventListener('change', updateMode)
    window.addEventListener('resize', updateMode)

    return () => {
      reducedMotion.removeEventListener('change', updateMode)
      window.removeEventListener('resize', updateMode)
    }
  }, [])

  return (
    <>
      <StarfieldStatic />
      {showCanvas && <Starfield />}
    </>
  )
}
