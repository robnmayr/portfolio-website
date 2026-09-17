import { useEffect } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'
import { setLenisInstance } from '../lib/lenisInstance'

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
    setLenisInstance(lenis)

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Lenis tracks scroll position itself and doesn't know about native
    // hash-anchor jumps. Left to the browser, an anchor click starts a
    // native scroll that Lenis's next raf tick immediately overwrites with
    // its own (stale) position, so the page never reaches the target. Route
    // in-page anchor clicks through lenis.scrollTo() instead so its internal
    // state stays in sync.
    function handleAnchorClick(event) {
      const anchor = event.target.closest('a[href^="#"]')
      if (!anchor) return

      const hash = anchor.getAttribute('href')
      if (!hash || hash === '#') return

      const target = document.querySelector(hash)
      if (!target) return

      event.preventDefault()
      lenis.scrollTo(target)
    }
    document.addEventListener('click', handleAnchorClick)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      cancelAnimationFrame(rafId)
      lenis.destroy()
      setLenisInstance(null)
    }
  }, [prefersReducedMotion])
}
