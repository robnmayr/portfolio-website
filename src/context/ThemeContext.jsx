import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'theme'

function getStoredTheme() {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme() ?? getSystemTheme())
  // Tracks whether the current theme came from an explicit user action, so we
  // know whether to keep following the OS setting or respect the override.
  const hasUserOverrideRef = useRef(getStoredTheme() !== null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Follow live OS theme changes until the user explicitly picks one —
  // writing every mount's system-derived theme to localStorage (the
  // previous behavior) would silently "lock in" that value and the site
  // would stop reacting to OS changes after the very first load.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event) => {
      if (hasUserOverrideRef.current) return
      setTheme(event.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const applyTheme = useCallback((next) => {
    hasUserOverrideRef.current = true
    window.localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light'
      hasUserOverrideRef.current = true
      window.localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: applyTheme }),
    [theme, toggleTheme, applyTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
