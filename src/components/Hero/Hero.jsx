import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import styles from './Hero.module.css'

export function Hero() {
  const headingRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Minimal GSAP proof-of-wiring: fade/slide the heading in on mount.
  // Uses gsap.context() so StrictMode's mount/unmount/remount cycle in dev
  // reverts cleanly instead of leaving the tween killed mid-animation.
  useEffect(() => {
    if (prefersReducedMotion || !headingRef.current) return undefined

    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power2.out',
      })
    })

    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section id="hero" className={styles.hero} aria-label="Hero">
      {/* TODO: real hero content (headline, intro, CTA) goes here */}
      <h1 ref={headingRef} className={styles.heading}>
        Hero
      </h1>
    </section>
  )
}
