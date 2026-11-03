import { useLayoutEffect, useRef, useState } from 'react'
import StrokeText from '@/components/reactbits/StrokeText'
import styles from './Hero.module.css'

const toRgb = ([r, g, b]) =>
  `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

// The name as outlined type that draws itself on (React Bits "StrokeText"): an
// accent-colored outline is traced letter by letter, then the text color wipes
// in from the left. Same block, size and line spacing as the classic name (the
// h1 carries .name, so --name-size, the position and the 0.782 line pitch are
// shared); each word is its own StrokeText so the two lines keep that pitch.
export function StrokeName({ name, accent }) {
  const ref = useRef(null)
  // Pixel font size of the name block (from --name-size); StrokeText wants px.
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const measure = () => setSize(Math.round(parseFloat(getComputedStyle(ref.current).fontSize)))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <h1 ref={ref} className={styles.name} aria-label={name}>
      {size &&
        name.split(' ').map((word) => (
          <span key={word} className={styles.strokeLine} aria-hidden="true">
            <StrokeText
              text={word}
              fontSize={size}
              fontFamily="var(--font-name)"
              fontWeight={700}
              letterSpacing={0}
              strokeColor={toRgb(accent)}
              strokeWidth={2.5}
              drawDuration={1.8}
              fillDelay={0.1}
              stagger={0.08}
              fillMode="wipe"
              wipeFrom="left"
            />
          </span>
        ))}
    </h1>
  )
}
