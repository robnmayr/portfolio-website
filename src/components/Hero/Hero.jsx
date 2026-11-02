import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import DitherReveal from '@/components/originkit/ui/dither-reveal'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { scrollToSection } from '../../lib/scrollToSection'
import humanHandImage from '../../assets/images/hero/hand-human-clean.png'
import robotHandImage from '../../assets/images/hero/hand-robot-clean.png'
import styles from './Hero.module.css'

const NAME = 'Robin Mayer'

// Tilt of the hands (as one group) in degrees (negative = counter-clockwise).
const HANDS_ROTATION = -10

// Pixel sizes of the two source images (same height, so they sit side by side
// as one composition). Used for the aspect ratios and the width split.
const HUMAN_HAND = { src: humanHandImage, width: 580, height: 749 }
const ROBOT_HAND = { src: robotHandImage, width: 551, height: 749 }
const TOTAL_WIDTH = HUMAN_HAND.width + ROBOT_HAND.width

// Each dither canvas is larger than its hand's layout box by this fraction on
// every side. The fingertips sit right at the edge of the source images, so
// without this margin the drifting image would be clipped at the canvas edge.
// The picture is drawn at 1 / (1 + 2 * pad) of the canvas so it keeps its size.
const CANVAS_PAD = 0.1
const BASE_SCALE = 1 / (1 + 2 * CANVAS_PAD)

// Phones/tablets have no hover, so the cursor-driven reveal never fires there.
const NO_HOVER_QUERY = '(hover: none)'

function hexToRgb(hex) {
  const value = parseInt(hex.trim().replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255)
}

// The dither mixes between two inks: dark parts of the image get the text
// color, bright parts get the page background. In dark mode that makes the
// dither a negative (dark image areas light, bright areas dark).
function readInk() {
  const computed = getComputedStyle(document.documentElement)
  return {
    low: hexToRgb(computed.getPropertyValue('--color-text')),
    high: hexToRgb(computed.getPropertyValue('--color-bg')),
  }
}

const canvasPadStyle = { inset: `${-CANVAS_PAD * 100}%` }

function handStyle({ width, height }) {
  return { width: `${(width / TOTAL_WIDTH) * 100}%`, aspectRatio: `${width} / ${height}` }
}

export function Hero() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  const rootRef = useRef(null)
  const humanRef = useRef(null)
  const robotRef = useRef(null)
  const hintRef = useRef(null)
  const arrowRef = useRef(null)
  // Live image transforms read by each dither canvas every frame (see the
  // DitherMotion note in dither-reveal.tsx); tweened by GSAP below.
  const humanMotion = useRef({ x: 0, y: 0, scale: BASE_SCALE, rotate: 0 })
  const robotMotion = useRef({ x: 0, y: 0, scale: BASE_SCALE, rotate: 0 })
  // Pointer positions in each canvas's own 0..1 space, written by the pointer
  // effect below every frame and read by the dither canvases.
  const humanPointer = useRef({ x: 0.5, y: 0.5, active: false })
  const robotPointer = useRef({ x: 0.5, y: 0.5, active: false })

  const [ink, setInk] = useState({ low: [0, 0, 0], high: [1, 1, 1] })
  const [isTouch, setIsTouch] = useState(() => window.matchMedia(NO_HOVER_QUERY).matches)

  // Passive effect on purpose: ThemeProvider flips data-theme in a layout
  // effect, which runs after this component's own layout effects but before
  // any passive effect, so the CSS variables read here are already the new ones.
  useEffect(() => {
    setInk(readInk())
  }, [theme])

  useEffect(() => {
    const query = window.matchMedia(NO_HOVER_QUERY)
    const handleChange = (event) => setIsTouch(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  // Intro + looping animations. useLayoutEffect so the "from" state is applied
  // before first paint (no flash of the finished layout). gsap.context() makes
  // StrictMode's mount/unmount/remount revert cleanly.
  useLayoutEffect(() => {
    if (prefersReducedMotion) return undefined

    const ctx = gsap.context(() => {
      // Name letters rise in, the hands slide in from opposite sides, then the
      // scroll hint fades up.
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('[data-hero-char]', { yPercent: 115, duration: 1.1, stagger: 0.05 })
        .from(
          humanRef.current,
          { xPercent: -120, duration: 1.7, ease: 'power3.out' },
          0.3,
        )
        .from(
          robotRef.current,
          { xPercent: 120, duration: 1.7, ease: 'power3.out' },
          0.45,
        )
        .from(hintRef.current, { autoAlpha: 0, y: 16, duration: 0.9 }, '-=0.9')

      // Each hand's picture drifts slowly *inside* its dither canvas (shifting,
      // tilting and swelling a little), every property on its own cycle and the
      // two hands out of sync. The dither grid stays put, so the pattern
      // visibly shimmers as the image moves under it, like a wave.
      const drift = (motion, ranges) => {
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
      // property: [from, to, seconds per half-cycle]; x/y are fractions of the
      // canvas size, rotate is degrees.
      drift(humanMotion.current, {
        y: [0.006, -0.012, 3.8],
        x: [-0.004, 0.005, 5.2],
        rotate: [-0.4, 0.5, 4.6],
        scale: [BASE_SCALE, BASE_SCALE * 1.012, 6.3],
      })
      drift(robotMotion.current, {
        y: [-0.005, 0.01, 2.9],
        x: [0.005, -0.004, 4.4],
        rotate: [0.45, -0.35, 3.7],
        scale: [BASE_SCALE * 1.01, BASE_SCALE, 5.4],
      })

      // Only the arrow bobs (gently and slowly); the label stays put.
      gsap.to(arrowRef.current, {
        y: 3,
        duration: 1.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, rootRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  // Pointer for the dither canvases. Each hand is its own canvas, so the hero
  // tracks the cursor itself (one position in screen coordinates, shared by
  // both hands) and maps it into each canvas's own 0..1 space every frame.
  // That keeps the reveal gliding across the gap between the hands, and keeps
  // it correct while the page scrolls or the hands slide in under a still
  // cursor, when no pointer event fires. The mapping is done here, by
  // geometry, instead of trusting a browser's offsetX/offsetY for events on
  // rotated elements, which differs between browsers.
  //
  // On touch devices without a cursor, a synthetic pointer sweeps from one hand
  // to the other instead; a real touch takes over and the sweep resumes shortly
  // after the finger lifts.
  useEffect(() => {
    const root = rootRef.current
    const hands = [humanRef.current, robotRef.current]
    const pointers = [humanPointer.current, robotPointer.current]
    const canvases = hands.map((hand) => hand?.querySelector('canvas'))
    if (!root || canvases.some((canvas) => !canvas)) return undefined

    const angle = (HANDS_ROTATION * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // The cursor in screen (client) coordinates, or null when not over the hero.
    let cursor = null

    const apply = () => {
      const rect = root.getBoundingClientRect()
      const inside =
        cursor &&
        cursor.x >= rect.left &&
        cursor.x <= rect.right &&
        cursor.y >= rect.top &&
        cursor.y <= rect.bottom

      canvases.forEach((canvas, index) => {
        const pointer = pointers[index]
        pointer.active = Boolean(inside)
        if (!inside) return
        // A canvas inside the rotated group keeps its rectangle's center at the
        // center of its (rotated) bounding box, so undo the group's rotation
        // around that center to get the position in the canvas's own axes.
        const box = canvas.getBoundingClientRect()
        const dx = cursor.x - (box.left + box.width / 2)
        const dy = cursor.y - (box.top + box.height / 2)
        pointer.x = (dx * cos + dy * sin) / canvas.offsetWidth + 0.5
        pointer.y = (-dx * sin + dy * cos) / canvas.offsetHeight + 0.5
      })
    }

    const handleMove = (event) => {
      cursor = { x: event.clientX, y: event.clientY }
    }
    const handleLeave = () => {
      cursor = null
    }
    root.addEventListener('pointermove', handleMove)
    root.addEventListener('pointerleave', handleLeave)
    gsap.ticker.add(apply)

    let sweep
    let resumeTimer
    const handlePause = () => {
      window.clearTimeout(resumeTimer)
      sweep?.pause()
    }
    const handleResume = () => {
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => sweep?.play(), 1500)
    }

    if (isTouch && !prefersReducedMotion) {
      const progress = { value: 0 }
      const center = (hand) => {
        const rect = hand.getBoundingClientRect()
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      }
      sweep = gsap.timeline({ delay: 1.8 })
      sweep.to(progress, {
        value: 1,
        duration: 4.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        onUpdate: () => {
          const from = center(hands[0])
          const to = center(hands[1])
          cursor = {
            x: from.x + (to.x - from.x) * progress.value,
            y: from.y + (to.y - from.y) * progress.value,
          }
        },
      })
      // While a real finger is down, it (via pointermove) drives the cursor.
      root.addEventListener('pointerdown', handlePause)
      root.addEventListener('pointerup', handleResume)
      root.addEventListener('pointercancel', handleResume)
    }

    return () => {
      window.clearTimeout(resumeTimer)
      gsap.ticker.remove(apply)
      root.removeEventListener('pointermove', handleMove)
      root.removeEventListener('pointerleave', handleLeave)
      root.removeEventListener('pointerdown', handlePause)
      root.removeEventListener('pointerup', handleResume)
      root.removeEventListener('pointercancel', handleResume)
      sweep?.kill()
    }
  }, [isTouch, prefersReducedMotion])

  const ditherProps = {
    wave: false,
    ditherStyle: 'bayer8',
    dotSize: 4,
    revealRadius: isTouch ? 90 : 130,
    revealSoftness: 50,
    inkLow: ink.low,
    inkHigh: ink.high,
  }

  return (
    <section id="hero" ref={rootRef} className={styles.hero} aria-label="Hero">
      <h1 className={styles.name} aria-label={NAME}>
        {NAME.split(' ').map((word) => (
          <span key={word} className={styles.word} aria-hidden="true">
            {[...word].map((char, index) => (
              <span key={index} className={styles.charMask}>
                <span data-hero-char className={styles.char}>
                  {char}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div
        className={styles.hands}
        style={{ rotate: `${HANDS_ROTATION}deg` }}
        role="img"
        aria-label={t.hero.imageAlt}
      >
        <div ref={humanRef} className={styles.hand} style={handStyle(HUMAN_HAND)}>
          <div className={styles.canvasPad} style={canvasPadStyle}>
            <DitherReveal
              image={{ src: HUMAN_HAND.src }}
              motion={humanMotion}
              pointer={humanPointer}
              {...ditherProps}
            />
          </div>
        </div>
        <div ref={robotRef} className={styles.hand} style={handStyle(ROBOT_HAND)}>
          <div className={styles.canvasPad} style={canvasPadStyle}>
            <DitherReveal
              image={{ src: ROBOT_HAND.src }}
              motion={robotMotion}
              pointer={robotPointer}
              {...ditherProps}
            />
          </div>
        </div>
      </div>

      <button
        ref={hintRef}
        type="button"
        className={styles.scrollHint}
        onClick={() => scrollToSection('about')}
      >
        <span ref={arrowRef} className={styles.arrow} aria-hidden="true" />
        <span>{t.hero.scrollHint}</span>
      </button>
    </section>
  )
}
