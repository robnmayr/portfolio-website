import { useLanguage } from '../../context/LanguageContext'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { LanguageToggle } from '../LanguageToggle/LanguageToggle'
import { SectionNav } from '../SectionNav/SectionNav'
import { scrollToSection } from '../../lib/scrollToSection'
import { usePinToViewportTop } from '../../hooks/usePinToViewportTop'
import styles from './Header.module.css'

export function Header() {
  const { t } = useLanguage()
  const headerRef = usePinToViewportTop()

  function handleLogoClick(event) {
    event.preventDefault()
    scrollToSection('hero')
  }

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.bar}>
        <a
          href="#hero"
          className={styles.logo}
          aria-label={t.nav.hero}
          onClick={handleLogoClick}
        />

        <SectionNav />

        <div className={styles.actions}>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
