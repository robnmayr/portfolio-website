// How the About portrait is revealed on scroll:
//   'dither' - when it comes into view the panel and the head dither in (Bayer
//              pattern), then the ring of pictures opens. Plays once.
//   'expand' - a scroll-pinned version of React Bits' ScrollExpand, reversed: the
//              portrait starts full-bleed (the whole screen, head large) and,
//              as you scroll, shrinks into its place in the layout; the ring of
//              pictures then opens. Reverses when scrolling back up.
// Both are kept, so switching is just changing this value.
export const PORTRAIT_REVEAL = 'expand'

// 'expand' reveal: how long the pinned scroll is, in screen heights, and what
// happens when. The portrait starts out as a grayscale Bayer dither of itself:
// over SATURATE_SCROLL its colour comes in, then over DISSOLVE_SCROLL the dither
// dissolves into the clean picture. After that the frame shrinks into place over
// SHRINK_SCROLL, and RING_START_SCROLL into that (while it is still shrinking) the
// ring of pictures starts to open and takes RING_SCROLL to finish. The section
// scrolls on as soon as everything is done.
export const SATURATE_SCROLL = 0.25
export const DISSOLVE_SCROLL = 0.45
export const SHRINK_SCROLL = 0.96
export const RING_START_SCROLL = 0.6
export const RING_SCROLL = 0.45
export const PRE_SCROLL = SATURATE_SCROLL + DISSOLVE_SCROLL
export const PORTRAIT_SCROLL = PRE_SCROLL + Math.max(SHRINK_SCROLL, RING_START_SCROLL + RING_SCROLL)
