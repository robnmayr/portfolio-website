import { getLenisInstance } from './lenisInstance'

// Shared scroll trigger for the logo and the section nav. Routes through the
// live Lenis instance when smooth scroll is active, and falls back to native
// scrollIntoView when it isn't (prefers-reduced-motion, or before mount).
export function scrollToSection(id) {
  const target = document.getElementById(id)
  if (!target) return

  const lenis = getLenisInstance()
  if (lenis) {
    lenis.scrollTo(target)
  } else {
    target.scrollIntoView()
  }
}
