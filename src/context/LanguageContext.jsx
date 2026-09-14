import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { dictionary } from '../i18n/dictionary'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'language'
const SUPPORTED_LANGUAGES = ['de', 'en']

function getInitialLanguage() {
  if (typeof window === 'undefined') return 'en'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored

  const browserLang = window.navigator.language?.slice(0, 2)
  return browserLang === 'de' ? 'de' : 'en'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'en' ? 'de' : 'en'))
  }, [])

  const value = useMemo(
    () => ({ language, toggleLanguage, setLanguage, t: dictionary[language] }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
