import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import styles from './ThemeToggle.module.css'

// Plain SVGs instead of the ☀/☾ glyphs: iOS/macOS render those unicode
// symbols via Apple Color Emoji (colored) rather than the system text font,
// regardless of font-family. SVG + currentColor keeps it monochrome and
// theme-colored everywhere.
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.4" y1="4.4" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.6" y2="19.6" />
        <line x1="4.4" y1="19.6" x2="6.5" y2="17.5" />
        <line x1="17.5" y1="6.5" x2="19.6" y2="4.4" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a.75.75 0 0 0-.95-.95 10 10 0 1 0 12.9 12.9.75.75 0 0 0-.95-.95Z"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const buttonRef = useRef(null)

  const isDark = theme === 'dark'
  const label = isDark ? t.theme.toggleToLight : t.theme.toggleToDark

  // Circle-spread reveal via the View Transitions API, adapted from a
  // "circle-spread" toggle-theme component the user found online (Next.js/
  // Tailwind/class-based theming, lucide-react icons) — reusing this
  // project's own toggleTheme() and data-theme convention instead of
  // reimplementing theme state, dropping the other animation variants and
  // the dynamic <style> injection since only this one type is wanted here.
  async function handleClick() {
    const supportsViewTransition = typeof document.startViewTransition === 'function'
    if (!supportsViewTransition || prefersReducedMotion || !buttonRef.current) {
      toggleTheme()
      return
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    )

    const transition = document.startViewTransition(() => {
      flushSync(() => toggleTheme())
    })
    await transition.ready

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 400,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={styles.toggle}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon}>{isDark ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  )
}
