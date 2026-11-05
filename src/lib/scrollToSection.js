import { getLenisInstance } from './lenisInstance'

// Shared scroll trigger for the logo and the section nav. Routes through the
// live Lenis instance when smooth scroll is active, and falls back to native
// scrolling when it isn't (prefers-reduced-motion, or before mount).
//
// `settled`: for a section with a scroll-pinned opening (About), land at the
// end of that stretch, where everything has played and the section is in its
// final state, instead of at its start. Without the pinned layout (small
// screens, reduced motion) it makes no difference.
export function scrollToSection(id, { settled = false } = {}) {
  const target = document.getElementById(id)
  if (!target) return

  const lenis = getLenisInstance()

  const stage = settled ? target.querySelector('[data-portrait-stage]') : null
  if (stage && getComputedStyle(stage).position === 'sticky') {
    const track = stage.parentElement
    const end = track.getBoundingClientRect().top + window.scrollY + track.offsetHeight - stage.offsetHeight
    if (lenis) {
      lenis.scrollTo(end)
    } else {
      window.scrollTo(0, end)
    }
    return
  }

  if (lenis) {
    lenis.scrollTo(target)
  } else {
    target.scrollIntoView()
  }
}
