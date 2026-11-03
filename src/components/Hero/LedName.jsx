import { useEffect, useState } from 'react'
import PixelLedDisplay from '@/components/originkit/ui/pixel-led-display'
import styles from './Hero.module.css'

// The ticker's glyphs are 7 dot rows tall; the whole name is about 64 dot
// columns wide (5 columns + 1 gap per letter, plus the word gap).
const ROWS = 7
const NAME_COLUMNS = 64
// Largest dot pitch: one cell of the page's dot grid.
const MAX_CELL = 24
// The band is wider than the hero so, tilted, it still reaches both edges.
const BAND_WIDTH = 1.25
// Lit dot diameter as a fraction of the dot pitch.
const DOT_FILL = 0.78

const toRgb = ([r, g, b]) =>
  `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

function pitchForViewport() {
  return Math.max(6, Math.min(MAX_CELL, Math.floor((window.innerWidth * BAND_WIDTH) / NAME_COLUMNS)))
}

// The name as a scrolling LED ticker (OriginKit "Pixel LED Display"), tilted
// like the hands. Lit dots take the text color; unlit ones are transparent.
export function LedName({ name, rotation, ink }) {
  const [cell, setCell] = useState(pitchForViewport)

  useEffect(() => {
    const handleResize = () => setCell(pitchForViewport())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      data-hero-led
      className={styles.led}
      style={{ height: cell * ROWS, width: `${BAND_WIDTH * 100}%`, rotate: `${rotation}deg` }}
      aria-hidden="true"
    >
      <PixelLedDisplay
        items={[name]}
        textSize={cell * ROWS}
        dotSize={cell * DOT_FILL}
        onColor={toRgb(ink.low)}
        offColor="rgba(0, 0, 0, 0)"
        speed={7}
      />
    </div>
  )
}
