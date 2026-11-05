// How the About portrait is revealed on scroll:
//   'dither' - when it comes into view the panel and the head dither in (Bayer
//              pattern), then the ring of pictures opens. Plays once.
//   'expand' - a scroll-pinned expand effect, reversed: the
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

// The About texts are revealed word by word as you scroll, each in its own window
// of the pinned scroll [from, to], counted in screen heights from the very start
// of it. They start once the frame has moved off the left half, where they sit.
export const TEXT_WINDOWS = {
  heading: [PRE_SCROLL + 0.6, PRE_SCROLL + 1.0],
  lead: [PRE_SCROLL + 0.8, PRE_SCROLL + 1.15],
  paragraphs: [
    [PRE_SCROLL + 0.95, PRE_SCROLL + 1.35],
    [PRE_SCROLL + 1.1, PRE_SCROLL + 1.5],
  ],
}
const TEXT_END = PRE_SCROLL + 1.5

// How the big heading ("Hi, I'm Robin") comes in:
//   'rise' - it is revealed word by word in its place (TEXT_WINDOWS.heading).
//   'fly'  - it flies in from the left edge of the screen on a curve into its
//            place, shrinking to its normal size on the way (HEADING_FLIGHT).
// Both are kept, so switching is just changing this value.
export const HEADING_INTRO = 'fly'

// The 'fly' heading. `in` is the scroll window [from, to] of the pinned scroll, in
// screen heights like the other phases. `fromY` is the height it starts at on the
// left edge (a fraction of the stage's height, 0 = top, 1 = bottom), `scale` its
// size at the start as a multiple of its own.
export const HEADING_FLIGHT = {
  in: [PRE_SCROLL + 0.4, PRE_SCROLL + 1.0],
  fromY: 0.55,
  scale: 1.6,
}

// The whole pinned scroll: everything is done when the last of these is.
export const PORTRAIT_SCROLL = Math.max(
  PRE_SCROLL + SHRINK_SCROLL,
  PRE_SCROLL + RING_START_SCROLL + RING_SCROLL,
  TEXT_END,
)

// On narrow screens only the portrait and the heading are pinned (the other texts
// are below, revealed by the normal scroll), so the pinned scroll ends as soon as
// those are done.
export const PORTRAIT_SCROLL_COMPACT = Math.max(
  PRE_SCROLL + SHRINK_SCROLL,
  PRE_SCROLL + RING_START_SCROLL + RING_SCROLL,
  HEADING_INTRO === 'fly' ? HEADING_FLIGHT.in[1] : TEXT_WINDOWS.heading[1],
)
