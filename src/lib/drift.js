import gsap from 'gsap'

// Slowly drifts the picture *inside* a dither canvas (see DitherMotion in
// dither-reveal.tsx): every property on its own cycle, so nothing repeats in
// lockstep. The canvas's dither grid stays put while the image moves under it,
// so the pattern visibly shimmers, like a wave.
//
// `ranges` maps each property to [from, to, seconds per half-cycle]; x/y are
// fractions of the canvas size, rotate is in degrees. Call inside a
// gsap.context() so the tweens are cleaned up with it.
export function drift(motion, ranges) {
  Object.entries(ranges).forEach(([property, [from, to, duration]]) => {
    motion[property] = from
    gsap.to(motion, {
      [property]: to,
      duration,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  })
}
