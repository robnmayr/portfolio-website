import { useLanguage } from '../../context/LanguageContext'
import styles from './LanguageToggle.module.css'

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleLanguage}
      aria-label={t.language.toggle}
      title={t.language.toggle}
    >
      <span aria-hidden="true">{language === 'en' ? 'DE' : 'EN'}</span>
    </button>
  )
}
