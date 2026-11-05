import { useLanguage } from '../../context/LanguageContext'
import styles from './Projects.module.css'

export function Projects() {
  const { t } = useLanguage()

  return (
    <section id="projects" className={styles.projects} aria-label={t.nav.projects}>
      {/* TODO: real project/case-study content goes here (as Markdown in src/content) */}
      <h2 className={styles.heading}>{t.nav.projects}</h2>
    </section>
  )
}
