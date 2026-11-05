import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { scrollToSection } from '../../lib/scrollToSection'
import homeIcon from '../../assets/icons/home.svg'
import userIcon from '../../assets/icons/user.svg'
import briefcaseIcon from '../../assets/icons/briefcase.svg'
import styles from './SectionNav.module.css'

// Pixel icons: home, user, briefcase.
const SECTIONS = [
  { id: 'hero', icon: homeIcon },
  { id: 'about', icon: userIcon },
  { id: 'projects', icon: briefcaseIcon },
]

// Each pill owns an independent tooltip (a blur/opacity reveal driven by
// motion/react), centered under its own button with plain CSS: no cross-item
// measurement, so nothing to disagree on between engines. (An earlier version
// slid one shared bubble across all three pills; that depended on measured text
// width, and Safari rendered it several pixels narrower than Chromium.) A
// second "current section" (scrollspy) index drives the pill's filled state
// independently of hover.
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
            onClick={() => scrollToSection(step.id, { settled: true })}
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
                    <span
                      className={styles.tooltipIcon}
                      // Quoted: Vite inlines small SVGs as data URLs that contain
                      // quote characters, which break an unquoted url().
                      style={{ '--icon': `url("${step.icon}")` }}
                      aria-hidden="true"
                    />
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
