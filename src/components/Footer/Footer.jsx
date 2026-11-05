import { useLanguage } from '../../context/LanguageContext'
import { site } from '../../content'
import styles from './Footer.module.css'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className={styles.footer}>
      <ul className={styles.links}>
        {/* The addresses are in src/content/site.md; an empty one links nowhere yet. */}
        <li>
          <a href={site.links.linkedin || '#'} target="_blank" rel="noreferrer">
            {t.footer.linkedin}
          </a>
        </li>
        <li>
          <a href={site.links.github || '#'} target="_blank" rel="noreferrer">
            {t.footer.github}
          </a>
        </li>
        <li>
          <a href={site.links.email ? `mailto:${site.links.email}` : '#'}>{t.footer.email}</a>
        </li>
      </ul>

      <a href="#hero" className={styles.backToTop}>
        {t.footer.backToTop}
      </a>
    </footer>
  )
}
