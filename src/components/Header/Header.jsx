import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { LanguageToggle } from '../LanguageToggle/LanguageToggle'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { href: '#hero', key: 'hero' },
  { href: '#about', key: 'about' },
  { href: '#projects', key: 'projects' },
]

export function Header() {
  const { t } = useLanguage()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const navPanelRef = useRef(null)

  useEffect(() => {
    if (!isNavOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsNavOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isNavOpen])

  function closeNav() {
    setIsNavOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a href="#hero" className={styles.logo}>
          RM
        </a>

        <nav className={styles.navDesktop} aria-label="Primary">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a href={item.href}>{t.nav[item.key]}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <LanguageToggle />
          <button
            type="button"
            className={styles.hamburger}
            aria-expanded={isNavOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isNavOpen ? t.header.menuClose : t.header.menuOpen}
            onClick={() => setIsNavOpen((open) => !open)}
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>
        </div>
      </div>

      {/* Mobile slide-in nav panel */}
      <div
        id="mobile-nav-panel"
        ref={navPanelRef}
        className={`${styles.navPanel} ${isNavOpen ? styles.navPanelOpen : ''}`}
        aria-hidden={!isNavOpen}
      >
        <nav aria-label="Mobile">
          <ul className={styles.navPanelList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <a href={item.href} onClick={closeNav} tabIndex={isNavOpen ? 0 : -1}>
                  {t.nav[item.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {isNavOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-hidden="true"
          tabIndex={-1}
          onClick={closeNav}
        />
      )}
    </header>
  )
}
