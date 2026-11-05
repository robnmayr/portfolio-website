import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { readScrolled } from './pinned'
import { HEADING_FLIGHT } from './portraitConfig'
import styles from './About.module.css'

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

// The big About heading for the 'fly' intro (HEADING_INTRO in portraitConfig.js).
// It waits off-screen on the left and flies in from there into its place: it
// comes in on a curve, rising from lower left, and lands level, shrinking from the
// flying size to its own. It is driven by the pinned scroll, so it also flies back
// out when you scroll up. Without the pinned layout (reduced motion) it simply
// sits in its place.
export function FlyingHeading({ children }) {
  const boxRef = useRef(null)
  const textRef = useRef(null)

  useIsomorphicLayoutEffect(() => {
    const box = boxRef.current
    const text = textRef.current
    // The pinned stage this sits in (About.jsx); its ref is not set yet when this runs.
    const stage = box?.closest('[data-portrait-stage]')
    if (!box || !text || !stage) return undefined

    const [from, to] = HEADING_FLIGHT.in
    let current = readScrolled(stage)
    let settled = false

    const apply = () => {
      const q = clamp01((current - from) / (to - from))
      if (q >= 1) {
        if (!settled) gsap.set(text, { clearProps: 'transform' })
        settled = true
        return
      }
      settled = false
      const rest = box.getBoundingClientRect()
      const stageTop = stage.getBoundingClientRect().top
      const grown = 1 + (HEADING_FLIGHT.scale - 1) * (1 - q) * (1 - q)
      // Start fully off the left edge.
      const startX = -(rest.left + text.offsetWidth * HEADING_FLIGHT.scale + 24)
      const startY = HEADING_FLIGHT.fromY * stage.offsetHeight - (rest.top - stageTop + rest.height / 2)
      const left = 1 - q
      gsap.set(text, {
        x: startX * left * left,
        y: startY * left * left * left,
        // Along the curve's slope, so it levels out as it lands.
        rotation: (Math.atan((1.5 * startY * left) / startX) * 180) / Math.PI,
        scale: grown,
        transformOrigin: '0% 50%',
      })
    }

    apply()
    const tick = (time, deltaTime) => {
      const target = readScrolled(stage)
      // Follows the scroll with the same slight smoothing as the portrait.
      current =
        Math.abs(target - current) < 0.0005
          ? target
          : current + (target - current) * (1 - Math.exp(-deltaTime / 1000 / 0.1))
      apply()
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      gsap.set(text, { clearProps: 'transform' })
    }
  }, [])

  return (
    <h2 ref={boxRef} className={styles.flyingBox}>
      <span ref={textRef} className={`${styles.heading} ${styles.flyingText}`}>
        {children}
      </span>
    </h2>
  )
}
