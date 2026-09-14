import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

  const isDark = theme === 'dark'
  const label = isDark ? t.theme.toggleToLight : t.theme.toggleToDark

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true" className={styles.icon}>
        {isDark ? '☀' : '☾'}
      </span>
    </button>
  )
}
