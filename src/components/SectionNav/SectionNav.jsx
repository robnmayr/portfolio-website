import { useEffect, useState } from 'react'
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
// animated-components/step-indicator). Kept: the per-item blur/opacity
// tooltip reveal driven by motion/react. Dropped: the original's shared
// clip-path/translateX morph sliding one tooltip's bubble into the next
// across all three pills' concatenated widths — that math depended on
// Work Sans's measured text width matching its rendered width pixel for
// pixel, and Safari resolves the resulting clip-path region several
// pixels narrower than Chromium for the same input, visibly pushing the
// icon/label toward the right edge. Each pill now owns an independent
// tooltip, centered under its own button with plain CSS — no cross-item
// measurement, so nothing to disagree on between engines. A second
// "current section" (scrollspy) index still drives the pill's filled
// state independently of hover.
export function SectionNav() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()

  const steps = SECTIONS.map((section) => ({
    ...section,
    label: t.nav[section.id],
  }))

  const [hoverIndex, setHoverIndex] = useState(null)
  const [currentSection, setCurrentSection] = useState(0)

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

  return (
    <div className={styles.nav} onMouseLeave={() => setHoverIndex(null)}>
      {steps.map((step, index) => (
        <div key={step.id} className={styles.pillWrap}>
          <button
            onMouseEnter={() => setHoverIndex(index)}
            onFocus={() => setHoverIndex(index)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setHoverIndex(null)
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

          <AnimatePresence>
            {hoverIndex === index && (
              <motion.div
                className={styles.tooltip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              >
                <motion.div
                  className={styles.tooltipContent}
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                >
                  <span className={styles.tooltipIconWrap}>
                    <step.icon className={styles.tooltipIcon} />
                  </span>
                  <span className={styles.tooltipLabel}>{step.label}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
