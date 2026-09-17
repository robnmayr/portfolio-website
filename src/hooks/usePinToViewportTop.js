import { useEffect, useRef } from 'react'

// position: fixed/sticky reposition on the compositor thread during scroll
// without a real repaint, so mix-blend-mode never recomputes against the
// newly-scrolled content underneath — it freezes at whatever was behind the
// element on first paint (verified empirically: the blended pixels didn't
// change on scroll, even though the geometry did). Writing `top` from JS
// forces a real repaint every frame, which keeps the blend live against
// whatever is actually behind the bar right now.
export function usePinToViewportTop() {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    let rafId
    let lastScrollY = null
    function update() {
      const scrollY = window.scrollY
      // Only touch the style when the value actually changes. A per-frame
      // write even to an unchanged value reads to the compositor as an
      // ongoing animation and gets the element promoted to its own layer —
      // which is what silently breaks mix-blend-mode against the content
      // behind it in the first place.
      if (scrollY !== lastScrollY) {
        element.style.top = `${scrollY}px`
        lastScrollY = scrollY
      }
      rafId = requestAnimationFrame(update)
    }
    update()

    return () => cancelAnimationFrame(rafId)
  }, [])

  return ref
}
