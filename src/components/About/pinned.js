import { PORTRAIT_SCROLL } from './portraitConfig'

// How far you have scrolled into the About section's pinned stretch, in screen
// heights (0 = just pinned, PORTRAIT_SCROLL = done). Without the pinned layout
// (small screens, reduced motion) everything is simply done.
export function readScrolled(stage) {
  const track = stage?.parentElement
  if (!stage || !track || getComputedStyle(stage).position !== 'sticky') return PORTRAIT_SCROLL
  const rect = track.getBoundingClientRect()
  return Math.min(PORTRAIT_SCROLL, Math.max(0, -rect.top / stage.offsetHeight))
}
