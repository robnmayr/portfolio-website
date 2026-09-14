import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// Initializes Lenis smooth scroll on mount. Skips it entirely when the user
// prefers reduced motion, so the browser's native (instant) scroll is used.
export function useLenis() {
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [prefersReducedMotion])
}
