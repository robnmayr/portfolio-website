import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { HomeIcon, UserIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { scrollToSection } from '../../lib/scrollToSection'
import styles from './SectionNav.module.css'

const SECTIONS = [
  { id: 'hero', icon: HomeIcon },
  { id: 'about', icon: UserIcon },
  { id: 'projects', icon: Squares2X2Icon },
]

// Adapted from the Watermelon UI "Step Indicator" (ui.watermelon.sh,
// animated-components/step-indicator). Kept: the clip-path/blur tooltip
// morph driven by motion/react. Changed: ported to plain JSX, icons are any
// component taking className instead of react-icons' IconType, the tooltip
// sits below the pill row instead of above it, and a second "current
// section" (scrollspy) index drives the pill's filled state independently
// of hover.
export function SectionNav() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()

  const steps = SECTIONS.map((section) => ({
    ...section,
    label: t.nav[section.id],
  }))

  const [hoverIndex, setHoverIndex] = useState(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [coords, setCoords] = useState({ clipPath: '', translateX: 0 })
  const [isEntering, setIsEntering] = useState(true)

  const measureRefs = useRef([])
  const buttonRefs = useRef([])
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  // Defensive nudge for Safari: it has been observed to occasionally paint
  // a stale/unblended frame right after a mix-blend-mode element's
  // backdrop-affecting state changes via React (class swap, new mount)
  // rather than a full repaint trigger. Forcing a synchronous layout read
  // right after the DOM update, before the browser paints, has been a
  // reliable cross-browser way to make it recompute on the same frame.
  useLayoutEffect(() => {
    buttonRefs.current.forEach((button) => {
      if (button) void button.offsetHeight
    })
    if (tooltipRef.current) void tooltipRef.current.offsetHeight
  }, [hoverIndex, currentSection])

  useEffect(() => {
    const sections = SECTIONS.map((section) => document.getElementById(section.id)).filter(
      Boolean,
    )
    if (sections.length === 0) return undefined

    // A running set of which sections currently intersect the top band,
    // rebuilt incrementally per callback since IntersectionObserver only
    // reports entries whose status *changed*, not a full snapshot — using
    // just the latest callback's entries (as a first pass here did)
    // silently kept a stale section active whenever the correct section's
    // own status happened not to change on a given scroll update.
    const intersecting = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = SECTIONS.findIndex((section) => section.id === entry.target.id)
          if (index === -1) return
          if (entry.isIntersecting) {
            intersecting.add(index)
          } else {
            intersecting.delete(index)
          }
        })

        // Prefer the intersecting section furthest down the page (i.e.
        // most recently scrolled to) rather than the highest intersection
        // ratio: ratio-sorting picked the wrong section for a tall Hero
        // and had no explicit floor case for "back at the very top." A
        // wide band anchored to the top of the viewport (top 40%) plus
        // "pick the last match" naturally falls back to Hero once nothing
        // past it still qualifies.
        if (intersecting.size > 0) {
          setCurrentSection(Math.max(...intersecting))
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const calculatePosition = (index) => {
    const activeLabel = measureRefs.current[index]
    const activeButton = buttonRefs.current[index]

    if (!activeLabel || !activeButton) return null

    const labelLeft = activeLabel.offsetLeft
    const labelWidth = activeLabel.offsetWidth
    const labelCenter = labelLeft + labelWidth / 2

    const buttonLeft = activeButton.offsetLeft
    const buttonWidth = activeButton.offsetWidth
    const buttonCenter = buttonLeft + buttonWidth / 2

    const totalWidth = measureRefs.current.reduce(
      (acc, el) => acc + (el?.offsetWidth || 0),
      0,
    )

    const cLeft = (labelLeft / totalWidth) * 100
    const cRight = 100 - ((labelLeft + labelWidth) / totalWidth) * 100

    return {
      clipPath: `inset(0 ${cRight}% 0 ${cLeft}% round 9999px)`,
      translateX: buttonCenter - labelCenter,
    }
  }

  const handleShow = (index) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    const performUpdate = () => {
      const newCoords = calculatePosition(index)
      if (newCoords) {
        setCoords(newCoords)
        setHoverIndex(index)
      }
    }

    setIsEntering(hoverIndex === null)
    performUpdate()
  }

  const handleHide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setHoverIndex(null)
    setCoords({ clipPath: '', translateX: 0 })
    setIsEntering(true)
  }

  return (
    <div className={styles.nav} onMouseLeave={handleHide}>
      <AnimatePresence>
        {hoverIndex !== null && coords.clipPath !== '' && (
          <motion.div
            ref={tooltipRef}
            className={styles.tooltipWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <motion.div
              className={styles.tooltip}
              animate={{
                clipPath: coords.clipPath,
                x: coords.translateX,
              }}
              transition={{
                type: 'spring',
                bounce: 0,
                duration: prefersReducedMotion || isEntering ? 0 : 0.4,
              }}
              onUpdate={() => {
                if (isEntering) setIsEntering(false)
              }}
            >
              <div className={styles.tooltipInner}>
                {steps.map((step, index) => (
                  <motion.div
                    key={`real-${step.id}`}
                    animate={{
                      opacity: hoverIndex === index ? 1 : 0,
                      filter: hoverIndex === index ? 'blur(0px)' : 'blur(4px)',
                    }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                    className={styles.tooltipItem}
                  >
                    <step.icon className={styles.tooltipIcon} />
                    <span className={styles.tooltipLabel}>{step.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {steps.map((step, index) => (
        <button
          key={step.id}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          onMouseEnter={() => handleShow(index)}
          onFocus={() => handleShow(index)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              handleHide()
            }
          }}
          onClick={() => scrollToSection(step.id)}
          className={styles.pillButton}
          aria-label={step.label}
        >
          <div
            className={cn(
              styles.pill,
              (hoverIndex === index || currentSection === index) && styles.pillActive,
            )}
          />
        </button>
      ))}

      <div className={styles.measure} aria-hidden="true">
        {steps.map((step, index) => (
          <div
            key={`measure-${step.id}`}
            ref={(el) => {
              measureRefs.current[index] = el
            }}
            className={styles.tooltipItem}
          >
            <step.icon className={styles.tooltipIcon} />
            <span className={styles.tooltipLabel}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
