import { useSyncExternalStore } from 'react'

// Whether a CSS media query currently matches (and re-renders when that changes).
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
