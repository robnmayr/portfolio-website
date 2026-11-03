// Colors for the dither canvases (DitherReveal's inkLow / inkHigh), read from
// the live CSS custom properties so they follow the theme. Call this after the
// data-theme attribute has changed (a passive effect is late enough).

function hexToRgb(hex) {
  const value = parseInt(hex.trim().replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255)
}

function readToken(name) {
  return hexToRgb(getComputedStyle(document.documentElement).getPropertyValue(name))
}

// The orange accent, for the rim on the dissolving edge of the reveal.
export function readAccent() {
  return readToken('--color-accent')
}

// Neutral dither: dark parts of the image get the text color, bright parts the
// page background. In dark mode that makes the dither a negative (dark image
// areas light, bright areas dark).
export function readInk() {
  return { low: readToken('--color-text'), high: readToken('--color-bg') }
}

// Duotone dither: dark parts of the image get a near-black (the page's dark
// color in either theme), bright parts the orange accent.
export function readAccentInk(theme) {
  return {
    low: readToken(theme === 'dark' ? '--color-bg' : '--color-text'),
    high: readToken('--color-accent'),
  }
}
