import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const buttonRef = useRef(null)

  const isDark = theme === 'dark'
  const label = isDark ? t.theme.toggleToLight : t.theme.toggleToDark

  // Circle-spread reveal via the View Transitions API, reusing this project's
  // own toggleTheme() and data-theme convention.
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
      <span
        className={`${styles.icon} ${isDark ? styles.sun : styles.moon}`}
        aria-hidden="true"
      />
    </button>
  )
}
