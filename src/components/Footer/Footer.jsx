import { useLanguage } from '../../context/LanguageContext'
import styles from './Footer.module.css'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <ul className={styles.links}>
        <li>
          {/* TODO: replace with real LinkedIn profile URL */}
          <a href="#" target="_blank" rel="noreferrer">
            {t.footer.linkedin}
          </a>
        </li>
        <li>
          <a href="https://github.com/robnmayr" target="_blank" rel="noreferrer">
            {t.footer.github}
          </a>
        </li>
        <li>
          {/* TODO: replace with real email address (consider obfuscating) */}
          <a href="#">{t.footer.email}</a>
        </li>
      </ul>

      <a href="#hero" className={styles.backToTop}>
        {t.footer.backToTop}
      </a>
    </footer>
  )
}
