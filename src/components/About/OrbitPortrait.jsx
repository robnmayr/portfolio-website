import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import UserCursor from '@/components/originkit/ui/usercursor'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import headSrc from '../../assets/images/about/head.webp'
import {
  DISSOLVE_SCROLL,
  PORTRAIT_REVEAL,
  PORTRAIT_SCROLL,
  PRE_SCROLL,
  RING_SCROLL,
  RING_START_SCROLL,
  SATURATE_SCROLL,
  SHRINK_SCROLL,
} from './portraitConfig'
import { readScrolled } from './pinned'
import styles from './OrbitPortrait.module.css'

gsap.registerPlugin(ScrollTrigger)

// The "thoughts" orbiting the head, in ring order (files are numbered).
const THOUGHTS = Object.values(
  import.meta.glob('../../assets/images/about/thoughts/*.webp', { eager: true, import: 'default' }),
)

// A solid accent panel with the cut-out portrait on it, and a ring of
// illustrations circling the head like the stars in an old cartoon, passing
// behind the head on the far side and in front of it on the near side.
//
// The ring is a circle in a tilted plane, projected in perspective, with flat
// cards standing on it, turned along the ring and depth-sorted, so they
// foreshorten and go edge-on at the sides. It is seen from below, its plane is
// tilted 77.5 degrees (a flat ellipse), it always turns at the same speed, and
// every card bobs up and down on its own cycle.
const RING = {
  axis: 25.5, // screen angle of the ring's major axis, degrees
  tilt: 77.5, // tilt of the ring's plane away from facing the viewer, degrees
  dist: 13, // camera distance, in ring radii
  phase: 93, // angle of card 0 at t = 0, degrees
  direction: 1, // which way the cards travel
  flipVertical: true, // mirrored top to bottom: the ring is seen from below
}
const REVOLUTION_SECONDS = 15.015
const SPEED = 0.7 // revolutions run at this fraction of the original's speed
// Each card bobs up and down a little along its own vertical axis (the one it
// stands on, which tilts with it), on its own cycle, like the hero's hands
// breathe: +/- BOB_AMOUNT ring radii, one cycle per entry of BOB_PERIODS
// (seconds, handed out card by card), each starting out of step.
const BOB_AMOUNT = 0.05
const BOB_PERIODS = [4.6, 6.1, 5.2, 7.0, 3.9, 5.7, 6.6, 4.3, 5.0]

// Scroll reveal. When the portrait scrolls into view the panel dithers in from
// its bottom edge, the head dithers in outward from the face (both with an 8x8
// Bayer pattern, like the hero's hands), then the ring opens: it grows out of
// the head, the cards pop in one after another and the whole ring has a
// revolution or so to unwind. Afterwards scrolling still stirs the ring a little.
const REVEAL_CELL = 5 // css px per cell of the reveal's dither pattern
const SWIRL = 0.45 // extra revolutions the ring unwinds while it opens
const STIR = 0.3 // extra revolutions per second at full scroll speed (0 = off)
const STIR_SPEED = 3000 // scroll speed, px per second, that counts as full
// 'expand' reveal (see portraitConfig.js): the portrait first shows as a Bayer
// dither of itself with cells of this many css pixels.
const STAGE_DITHER_PIXEL = 2
// The dithered head's intro: it slides up from below the stage; how long that
// takes (seconds), like the hero's hands.
const HEAD_INTRO_SECONDS = 1.7
const HEAD_OUTRO_SECONDS = 1.0 // and how long it takes to slide out again
// How far the ring has to be open (0..1) for the cursor label to change from
// "That's me" to "What's on my mind": the point where the last picture starts
// to appear, so all of them are there.
const RING_LABEL_AT = 0.4
// How large the head is at the start of the 'expand' reveal, as a fraction of
// the stage's height (1 = it fills it from the bottom edge up).
const EXPAND_HEAD_SCALE = 0.8
// ...but never wider than the stage (on a narrow screen the head would otherwise
// be cut off at the sides): as a fraction of the stage's width.
const EXPAND_HEAD_MAX_WIDTH = 1
const clamp01 = (value) => Math.min(1, Math.max(0, value))
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)

// Layout, as fractions of the panel width (the panel is 4:5, see the CSS).
const PORTRAIT_WIDTH = 0.96 // the head picture, bottom-aligned and centered
// Ring center and size relative to the head picture (its own width/height).
const HEAD_X = 0.49 // eye line x, fraction of the picture width
const HEAD_Y = 0.28 // ring center y, fraction of the picture height
const RING_RADIUS = 0.43 // semi-major axis, fraction of the picture width
const CARD_SIZE = 0.52 // card side, fraction of the ring's semi-major axis (bigger = smaller gaps)
const HALF_CARD = CARD_SIZE / 2

// Each card's texture is made at the size the card is drawn at (in device
// pixels), so that the dither cells below stay crisp instead of being resampled.
const MIN_TEXTURE = 64
const MAX_TEXTURE = 1024
// 1 = the pictures' own colors, 0 = gray.
const SATURATION = 1
// Ordered Bayer dither on the pictures, as on the hero's hands, in cells of
// DITHER_PIXEL_SIZE screen pixels (0 turns the dither off). 'rgb' dithers each
// color channel on its own (a retro color look); 'duotone' reduces the picture to
// tones between INK and PAPER. The cut-out silhouette stays, with hard cell edges.
const DITHER_PIXEL_SIZE = 1
const DITHER_PALETTE = 'rgb'
const DITHER_LEVELS = 3
const DITHER_CONTRAST = 1.15
const INK = [22, 22, 22] // duotone: the light theme's text color
const PAPER = [246, 246, 246] // duotone: the light theme's background
// Far side of a card: the same picture, dimmed (as in the original).
const BACK_TINT = 'rgba(10, 12, 24, 0.4)'

const rad = (deg) => (deg * Math.PI) / 180

// Ring plane basis: U, V span the plane, AXIS is its
// normal, z points at the viewer.
const axis = rad(RING.axis)
const ratio = Math.cos(rad(RING.tilt)) // semi-minor / semi-major of the projected ring
const sinTilt = Math.sin(rad(RING.tilt))
const flip = RING.flipVertical ? -1 : 1
const U = [Math.cos(axis), Math.sin(axis) * flip, 0]
const V = [-Math.sin(axis) * ratio, Math.cos(axis) * ratio * flip, sinTilt]
const AXIS = [
  U[1] * V[2] - U[2] * V[1],
  U[2] * V[0] - U[0] * V[2],
  U[0] * V[1] - U[1] * V[0],
]

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

// 8x8 ordered-dither thresholds in 0..1, built by the usual recursion.
const BAYER = (() => {
  const build = (n) => {
    if (n === 1) return [[0]]
    const half = n / 2
    const previous = build(half)
    const matrix = []
    for (let y = 0; y < n; y += 1) {
      matrix.push([])
      for (let x = 0; x < n; x += 1) {
        const offset = [[0, 2], [3, 1]][Math.floor(y / half)][Math.floor(x / half)]
        matrix[y].push(4 * previous[y % half][x % half] + offset)
      }
    }
    return matrix
  }
  return build(8).map((row) => row.map((value) => (value + 0.5) / 64))
})()

// Redraws `source` (an image of `width` x `height` pixels) as an ordered dither
// with cells of `cell` pixels.
function ditherTexture(source, width, height, cell) {
  const columns = Math.max(1, Math.round(width / cell))
  const rows = Math.max(1, Math.round(height / cell))
  const low = document.createElement('canvas')
  low.width = columns
  low.height = rows
  const lowContext = low.getContext('2d')
  lowContext.imageSmoothingQuality = 'high'
  lowContext.drawImage(source, 0, 0, columns, rows)
  const pixels = lowContext.getImageData(0, 0, columns, rows)
  const data = pixels.data
  const steps = DITHER_LEVELS - 1
  const rgb = DITHER_PALETTE === 'rgb'
  // Contrast, then (duotone only) the same gamma as the hero's dither.
  const grade = (value) => {
    const contrasted = Math.min(1, Math.max(0, (value - 0.5) * DITHER_CONTRAST + 0.5))
    return rgb ? contrasted : Math.pow(contrasted, 1.6)
  }
  const quantize = (value, threshold) => {
    const scaled = value * steps
    const base = Math.floor(scaled)
    return Math.min(steps, base + (scaled - base >= threshold ? 1 : 0)) / steps
  }
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const i = (y * columns + x) * 4
      if (data[i + 3] < 128) {
        data[i + 3] = 0
        continue
      }
      const threshold = BAYER[y % 8][x % 8]
      if (rgb) {
        for (let c = 0; c < 3; c += 1) data[i + c] = quantize(grade(data[i + c] / 255), threshold) * 255
      } else {
        const gray = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        const level = quantize(grade(gray), threshold)
        for (let c = 0; c < 3; c += 1) data[i + c] = INK[c] + (PAPER[c] - INK[c]) * level
      }
      data[i + 3] = 255
    }
  }
  lowContext.putImageData(pixels, 0, 0)

  const result = document.createElement('canvas')
  result.width = width
  result.height = height
  const context = result.getContext('2d')
  context.imageSmoothingEnabled = false
  context.drawImage(low, 0, 0, width, height)
  return result
}

// Scales every pixel's distance from its own gray by `amount` (alpha untouched).
// Done on the pixels instead of with ctx.filter, which Safari does not support.
function setSaturation(context, amount, size) {
  if (amount === 1) return
  const data = context.getImageData(0, 0, size, size)
  const pixels = data.data
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]
    pixels[i] = gray + (pixels[i] - gray) * amount
    pixels[i + 1] = gray + (pixels[i + 1] - gray) * amount
    pixels[i + 2] = gray + (pixels[i + 2] - gray) * amount
  }
  context.putImageData(data, 0, 0)
}

// Which cells of a coarse grid over `source` are mostly opaque, for hit tests
// (a card is only hovered where its illustration is, not on its empty corners).
function alphaMask(source, columns, rows) {
  const small = document.createElement('canvas')
  small.width = columns
  small.height = rows
  const smallContext = small.getContext('2d', { willReadFrequently: true })
  smallContext.drawImage(source, 0, 0, columns, rows)
  const data = smallContext.getImageData(0, 0, columns, rows).data
  const cells = new Uint8Array(columns * rows)
  for (let i = 0; i < cells.length; i += 1) cells[i] = data[i * 4 + 3] > 100 ? 1 : 0
  return { columns, rows, cells }
}

// Whether the point (u, v), both in 0..1 across the picture, is on an opaque cell.
function maskHit(mask, u, v) {
  if (!mask || u < 0 || u >= 1 || v < 0 || v >= 1) return false
  return mask.cells[Math.floor(v * mask.rows) * mask.columns + Math.floor(u * mask.columns)] === 1
}

// A square texture of the picture, plus its dimmed far-side version.
function makeTextures(image, size, cell) {
  let front = document.createElement('canvas')
  front.width = front.height = size
  const frontContext = front.getContext('2d')
  frontContext.imageSmoothingQuality = 'high'
  frontContext.drawImage(image, 0, 0, size, size)
  setSaturation(frontContext, SATURATION, size)
  if (cell > 0) front = ditherTexture(front, size, size, cell)

  const back = document.createElement('canvas')
  back.width = back.height = size
  const context = back.getContext('2d')
  context.drawImage(front, 0, 0)
  context.globalCompositeOperation = 'source-atop'
  context.fillStyle = BACK_TINT
  context.fillRect(0, 0, size, size)
  return { front, back, size, mask: alphaMask(front, 32, 32) }
}

export function OrbitPortrait() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const frameRef = useRef(null)
  const canvasRef = useRef(null)
  const panelRef = useRef(null)
  const cursorLayerRef = useRef(null)
  // Which card (index into THOUGHTS) the pointer is over, or null.
  const [hovered, setHovered] = useState(null)
  // Whether the ring of pictures has appeared (until then the cursor label says
  // "That's me").
  const [ringOpen, setRingOpen] = useState(false)
  // Whether the portrait's opening dither has dissolved (the cursor label only
  // shows from then on).
  const [dissolved, setDissolved] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const panel = panelRef.current
    const cursorLayer = cursorLayerRef.current
    const context = canvas?.getContext('2d')
    if (!frame || !panel || !cursorLayer || !context) return undefined
    const expandMode = PORTRAIT_REVEAL === 'expand'
    // The scroll-pinned stage the canvas fills, and the tall track it sticks in
    // (both from About.jsx).
    const stage = canvas.closest('[data-portrait-stage]')
    const track = stage?.parentElement

    let cancelled = false
    let head = null
    let sources = [] // the loaded illustrations
    let cards = [] // their dithered textures, at the current card size
    let width = 1
    let height = 1
    let dpr = 1
    let radiusPx = 0 // the panel's corner radius, in canvas pixels
    // The panel's rectangle in canvas pixels, measured from the page itself so
    // it matches the CSS panel to the pixel (computing it from the canvas size
    // left the head up to a pixel short of the panel's bottom edge).
    let panelBox = { left: 0, top: 0, right: 1, bottom: 1 }
    let accent = '#fc6510' // the panel's color, read from the page's --color-accent
    let visible = true
    let raf = 0
    let last = 0
    let spin = 0 // revolutions
    let clock = 0 // seconds, drives the bobbing
    // For finding the card under the pointer: where each card was drawn this
    // frame (in drawing order, so the last hit is the front-most), and where the
    // head is and which parts of it are opaque.
    let hits = []
    let headBox = null
    let headMask = null
    let pointer = null // client coordinates, or null while it is outside
    let hoveredIndex = null
    let ringOpenState = false
    let dissolvedState = false
    let canvasFilter = ''
    let startLayers = null // the portrait as it is at the start of the 'expand' reveal: clean, and dithered
    let cursorBoxKey = ''
    let cssScale = 1 // CSS pixels per canvas pixel

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      canvas.width = width
      canvas.height = height
      radiusPx = parseFloat(getComputedStyle(panel).borderTopLeftRadius) * dpr || 0
      cursorBoxKey = ''
      accent = getComputedStyle(frame).getPropertyValue('--color-accent').trim() || accent
      const canvasRect = canvas.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      cssScale = canvasRect.width / width
      const scaleX = width / canvasRect.width
      const scaleY = height / canvasRect.height
      panelBox = {
        left: (panelRect.left - canvasRect.left) * scaleX,
        top: (panelRect.top - canvasRect.top) * scaleY,
        right: (panelRect.right - canvasRect.left) * scaleX,
        bottom: (panelRect.bottom - canvasRect.top) * scaleY,
      }
    }

    // The texture size that matches a card at rest: the card side in device
    // pixels (head picture width x ring radius x card size).
    const restingCardSize = () => {
      const panelWidth = panelBox.right - panelBox.left
      const side = panelWidth * PORTRAIT_WIDTH * RING_RADIUS * CARD_SIZE
      return Math.min(MAX_TEXTURE, Math.max(MIN_TEXTURE, Math.round(side)))
    }

    const rebuildCards = () => {
      const size = restingCardSize()
      const cell = DITHER_PIXEL_SIZE > 0 ? Math.max(1, Math.round(DITHER_PIXEL_SIZE * dpr)) : 0
      cards = sources.map((image) => makeTextures(image, size, cell))
    }

    // The scroll reveal's progress, each part from 0 (not there) to 1 (done);
    // tweened by GSAP below. With reduced motion everything is simply there.
    const intro = {
      panel: prefersReducedMotion || expandMode ? 1 : 0,
      head: prefersReducedMotion || expandMode ? 1 : 0,
      ring: prefersReducedMotion ? 1 : 0,
      // 'expand' reveal: the portrait starts as a grayscale dither of itself.
      // saturation: 0 = gray, 1 = its colors; dissolve: 0 = dithered, 1 = clean.
      saturation: prefersReducedMotion || !expandMode ? 1 : 0,
      dissolve: prefersReducedMotion || !expandMode ? 1 : 0,
      // The dithered head's own intro: 0 = still below the stage, 1 = in place
      // (time based, played when the stage scrolls into view).
      headIn: prefersReducedMotion || !expandMode ? 1 : 0,
    }
    // 'expand' reveal: how far through the pinned scroll we are, in screen
    // heights (eased), and the frame's state: 0 = full-bleed over the whole
    // stage, 1 = settled in place.
    let scrolled = PORTRAIT_SCROLL
    let settle = 1
    const readScrolledNow = () => (expandMode ? readScrolled(stage) : PORTRAIT_SCROLL)
    const smooth = (t) => t * t * (3 - 2 * t)
    const updateScroll = (dt) => {
      if (!expandMode) return
      const target = readScrolledNow()
      scrolled = dt > 0 ? scrolled + (target - scrolled) * (1 - Math.exp(-dt / 0.1)) : target
      intro.saturation = smooth(clamp01(scrolled / SATURATE_SCROLL))
      intro.dissolve = clamp01((scrolled - SATURATE_SCROLL) / DISSOLVE_SCROLL)
      settle = smooth(clamp01((scrolled - PRE_SCROLL) / SHRINK_SCROLL))
      intro.ring = clamp01((scrolled - PRE_SCROLL - RING_START_SCROLL) / RING_SCROLL)
      // The text next to the portrait fades in as the frame settles (About.module.css).
      stage?.style.setProperty('--portrait-settle', String(settle))
    }
    let stir = 0 // extra revolutions per second, from scrolling
    let lastScrollY = window.scrollY

    // Offscreen layers for the parts that dither in, and the mask that does it.
    const panelLayer = document.createElement('canvas')
    const headLayer = document.createElement('canvas')
    const maskCanvas = document.createElement('canvas')
    let maskImage = null

    // Draws `paint` so that only the cells of an ordered-dither pattern the
    // reveal has reached by `progress` (0..1) show. `when(x, y)` is 0..1 and says
    // when the reveal gets to a point; the Bayer threshold roughens that front.
    const drawRevealed = (layer, progress, when, paint) => {
      if (progress >= 1) {
        paint(context)
        return
      }
      if (progress <= 0) return
      if (layer.width !== width || layer.height !== height) {
        layer.width = width
        layer.height = height
      }
      const layerContext = layer.getContext('2d')
      layerContext.setTransform(1, 0, 0, 1, 0, 0)
      layerContext.globalCompositeOperation = 'source-over'
      layerContext.clearRect(0, 0, width, height)
      paint(layerContext)

      const cell = Math.max(2, Math.round(REVEAL_CELL * dpr))
      const columns = Math.ceil(width / cell)
      const rows = Math.ceil(height / cell)
      if (!maskImage || maskImage.width !== columns || maskImage.height !== rows) {
        maskCanvas.width = columns
        maskCanvas.height = rows
        maskImage = maskCanvas.getContext('2d').createImageData(columns, rows)
      }
      const pixels = maskImage.data
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const threshold = when((x + 0.5) * cell, (y + 0.5) * cell) * 0.7 + BAYER[y % 8][x % 8] * 0.3
          pixels[(y * columns + x) * 4 + 3] = progress * 1.001 >= threshold ? 255 : 0
        }
      }
      maskCanvas.getContext('2d').putImageData(maskImage, 0, 0)

      layerContext.globalCompositeOperation = 'destination-in'
      layerContext.imageSmoothingEnabled = false
      layerContext.drawImage(maskCanvas, 0, 0, columns * cell, rows * cell)
      layerContext.globalCompositeOperation = 'source-over'
      context.drawImage(layer, 0, 0)
    }

    // The portrait as it is at the start of the 'expand' reveal (frame = the whole
    // stage, head large and standing on its bottom edge), once as it really is and
    // once dithered, for the opening phases. Rebuilt whenever the stage changes.
    const buildStartLayers = () => {
      if (!expandMode || !head || width < 2 || height < 2) return
      const panelWidth = panelBox.right - panelBox.left
      const headWidth = panelWidth * PORTRAIT_WIDTH
      const headHeight = (headWidth * head.naturalHeight) / head.naturalWidth
      const headLeft = panelBox.left + (panelWidth - headWidth) / 2
      const headTop = panelBox.bottom + 2 * dpr - headHeight
      const anchorX = (panelBox.left + panelBox.right) / 2
      const scale = Math.min((height / headHeight) * EXPAND_HEAD_SCALE, (width / headWidth) * EXPAND_HEAD_MAX_WIDTH)
      const paintHead = (ctx) => {
        ctx.imageSmoothingQuality = 'high'
        ctx.setTransform(scale, 0, 0, scale, width / 2 - anchorX * scale, height - panelBox.bottom * scale)
        ctx.drawImage(head, headLeft, headTop, headWidth, headHeight)
      }
      // The head alone (transparent around it), for the dither: in the gray
      // opening phase the orange is not there yet, so the page's dot pattern
      // shows around the dithered head.
      const headOnly = document.createElement('canvas')
      headOnly.width = width
      headOnly.height = height
      paintHead(headOnly.getContext('2d'))
      // The clean portrait, orange and all, that takes over from the dither.
      const clean = document.createElement('canvas')
      clean.width = width
      clean.height = height
      const cleanContext = clean.getContext('2d')
      cleanContext.fillStyle = accent
      cleanContext.fillRect(0, 0, width, height)
      paintHead(cleanContext)
      const cell = Math.max(2, Math.round(STAGE_DITHER_PIXEL * dpr))
      startLayers = { clean, dithered: ditherTexture(headOnly, width, height, cell) }
    }

    const render = () => {
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)

      // The colors come in by scroll: a CSS grayscale on the canvas (the canvas'
      // own filter is not available in Safari).
      const filter = intro.saturation >= 1 ? '' : `grayscale(${(1 - intro.saturation).toFixed(3)})`
      if (filter !== canvasFilter) {
        canvasFilter = filter
        canvas.style.filter = filter
      }

      // 'expand' reveal, opening phases: the dithered head (on the page's dot
      // pattern, the orange fading in with the colors), which the clean portrait
      // takes over from the face outward (a Bayer pattern again) as you scroll.
      if (expandMode && intro.dissolve < 1) {
        hits = []
        if (!startLayers) return
        // The orange comes in with the colors; until then the page shows through.
        context.globalAlpha = intro.saturation
        context.fillStyle = accent
        context.fillRect(0, 0, width, height)
        context.globalAlpha = 1
        // The dithered head slides up into place from below the stage (its intro,
        // see headTrigger below), like the hero's hands slide in.
        const rise = (1 - intro.headIn) * (1 - intro.dissolve) * height
        context.drawImage(startLayers.dithered, 0, rise)
        drawRevealed(
          panelLayer,
          intro.dissolve,
          (x, y) => clamp01(Math.hypot(x - width * 0.5, y - height * 0.4) / (Math.hypot(width, height) * 0.5)),
          (ctx) => ctx.drawImage(startLayers.clean, 0, 0),
        )
        return
      }

      // The panel itself is drawn here, on the canvas, together with the head
      // (not as a CSS box under it): two separately rendered layers can disagree
      // by a pixel about where the panel ends (Safari showed a sliver of orange
      // under the head), while one drawing has no such seam.
      const { left: panelLeft, top: panelTop, right: panelRight, bottom: panelBottom } = panelBox
      // 'expand' reveal: until it has settled, the frame is bigger than the panel's
      // place, the whole stage at first, and shrinks into it (its corners round
      // off on the way).
      const expanding = expandMode && settle < 1
      const mix = (from, to) => from + (to - from) * settle
      const frame = expanding
        ? {
            left: mix(0, panelLeft),
            top: mix(0, panelTop),
            right: mix(width, panelRight),
            bottom: mix(height, panelBottom),
            radius: radiusPx * settle,
          }
        : { left: panelLeft, top: panelTop, right: panelRight, bottom: panelBottom, radius: radiusPx }
      // The cursor label's area follows the frame as it shrinks into place.
      const boxKey = [frame.left, frame.top, frame.right, frame.bottom, frame.radius].map(Math.round).join()
      if (boxKey !== cursorBoxKey) {
        cursorBoxKey = boxKey
        const box = cursorLayer.style
        box.left = `${frame.left * cssScale}px`
        box.top = `${frame.top * cssScale}px`
        box.width = `${(frame.right - frame.left) * cssScale}px`
        box.height = `${(frame.bottom - frame.top) * cssScale}px`
        box.borderRadius = `${frame.radius * cssScale}px`
      }
      const tracePanel = (ctx) => {
        const { left, top, right, bottom, radius: r } = frame
        ctx.beginPath()
        ctx.moveTo(left + r, top)
        ctx.lineTo(right - r, top)
        ctx.arcTo(right, top, right, top + r, r)
        ctx.lineTo(right, bottom - r)
        ctx.arcTo(right, bottom, right - r, bottom, r)
        ctx.lineTo(left + r, bottom)
        ctx.arcTo(left, bottom, left, bottom - r, r)
        ctx.lineTo(left, top + r)
        ctx.arcTo(left, top, left + r, top, r)
        ctx.closePath()
      }
      hits = []

      // The panel dithers in from its bottom edge upward.
      drawRevealed(
        panelLayer,
        intro.panel,
        (x, y) => clamp01((panelBottom - y) / (panelBottom - panelTop)),
        (ctx) => {
          ctx.fillStyle = accent
          tracePanel(ctx)
          ctx.fill()
        },
      )
      if (!head) return

      // The head picture is bottom aligned on the panel.
      const panelWidth = panelRight - panelLeft
      const headWidth = panelWidth * PORTRAIT_WIDTH
      const headHeight = (headWidth * head.naturalHeight) / head.naturalWidth
      const headLeft = panelLeft + (panelWidth - headWidth) / 2
      // A couple of pixels too low on purpose: the clip below cuts it off at the
      // panel's edge, so no sliver of the panel's color can show under it.
      const headTop = panelBottom + 2 * dpr - headHeight

      // While the frame is still shrinking, the head (and the ring, which may
      // already be opening) is shown larger and lower: a scale about the bottom
      // middle of the panel's place, moved from the stage's bottom middle.
      const anchorX = (panelLeft + panelRight) / 2
      const startScale = Math.min((height / headHeight) * EXPAND_HEAD_SCALE, (width / headWidth) * EXPAND_HEAD_MAX_WIDTH)
      const viewScale = expanding ? mix(startScale, 1) : 1
      const viewX = expanding ? mix(width / 2, anchorX) : anchorX
      const viewY = expanding ? mix(height, panelBottom) : panelBottom
      const toViewX = (x) => viewX + (x - anchorX) * viewScale
      const toViewY = (y) => viewY + (y - panelBottom) * viewScale

      headBox = {
        left: toViewX(headLeft),
        top: toViewY(headTop),
        width: headWidth * viewScale,
        height: headHeight * viewScale,
      }

      const centerX = toViewX(headLeft + headWidth * HEAD_X)
      const centerY = toViewY(headTop + headHeight * HEAD_Y)
      // The ring opens out of the head while it is revealed.
      const ringScale = 0.2 + 0.8 * easeOutCubic(intro.ring)
      const radius = headWidth * RING_RADIUS * ringScale * viewScale

      const project = (p) => {
        const k = (radius * RING.dist) / (RING.dist - p[2])
        return [centerX + k * p[0], centerY + k * p[1]]
      }

      // The ring unwinds from a few extra revolutions as it opens.
      const spinAngle = (spin + (1 - intro.ring) * (1 - intro.ring) * SWIRL) * Math.PI * 2 * RING.direction
      const list = cards.map((card, index) => {
        const psi = rad(RING.phase) - (index * 2 * Math.PI) / cards.length + spinAngle
        // How far the card is lifted along its own vertical axis, in ring
        // radii, on its own cycle (not at all with reduced motion).
        const cycle = BOB_PERIODS[index % BOB_PERIODS.length]
        const bob = prefersReducedMotion
          ? 0
          : BOB_AMOUNT * Math.sin((clock * 2 * Math.PI) / cycle + index * 1.7)
        // Cards pop in one after another, with a little overshoot.
        const grow = easeOutBack(clamp01((intro.ring - index * 0.05) / 0.6))
        return { card, index, psi, z: Math.sin(psi) * sinTilt, bob, half: HALF_CARD * grow }
      })
      list.sort((a, b) => a.z - b.z)

      const drawCard = ({ card, index, psi, z, bob, half }) => {
        if (half < 0.002) return
        const c = Math.cos(psi)
        const s = Math.sin(psi)
        // The card's own up is the ring's axis; the bob moves it along that.
        const center = [
          c * U[0] + s * V[0] + AXIS[0] * bob,
          c * U[1] + s * V[1] + AXIS[1] * bob,
          c * U[2] + s * V[2] + AXIS[2] * bob,
        ]
        const tangent = [-s * U[0] + c * V[0], -s * U[1] + c * V[1], -s * U[2] + c * V[2]]
        const p0 = project(center)
        const pT = project(center.map((v, i) => v + tangent[i] * half))
        const pA = project(center.map((v, i) => v + AXIS[i] * half))
        // Picture x runs against the ring's direction of travel and picture y
        // down against the ring's axis, so the near side reads upright and the
        // far side (seen from behind) comes out mirrored.
        const ex = p0[0] - pT[0]
        const ey = p0[1] - pT[1]
        const fx = p0[0] - pA[0]
        const fy = p0[1] - pA[1]
        if (Math.abs(ex * fy - ey * fx) < 0.4) return // edge-on
        const size = card.size
        context.setTransform((ex * 2) / size, (ey * 2) / size, (fx * 2) / size, (fy * 2) / size, p0[0], p0[1])
        context.drawImage(z > 0 ? card.front : card.back, -size / 2, -size / 2)
        context.setTransform(1, 0, 0, 1, 0, 0)
        hits.push({ index, card, far: z <= 0, x: p0[0], y: p0[1], ex, ey, fx, fy })
      }

      context.imageSmoothingQuality = 'high'
      // Far half of the ring, then the head, then the near half.
      let next = 0
      for (; next < list.length && list[next].z <= 0; next += 1) drawCard(list[next])
      // The head dithers in outward from the face, and is cut off by the panel's
      // rounded bottom corners.
      drawRevealed(
        headLayer,
        intro.head,
        (x, y) =>
          clamp01(Math.hypot(x - (headLeft + headWidth * 0.52), y - (headTop + headHeight * 0.38)) / (headWidth * 0.8)),
        (ctx) => {
          ctx.save()
          tracePanel(ctx)
          ctx.clip()
          // The head is shown large at first, standing on the bottom edge of the
          // stage, and settles into its place on the panel.
          if (expanding) {
            ctx.setTransform(viewScale, 0, 0, viewScale, viewX - anchorX * viewScale, viewY - panelBottom * viewScale)
          }
          ctx.drawImage(head, headLeft, headTop, headWidth, headHeight)
          ctx.restore()
        },
      )
      for (; next < list.length; next += 1) drawCard(list[next])
    }

    // The card under the pointer, front-most first, judged on what was drawn in
    // the last frame. A card behind the head does not count where the head is.
    const findHovered = () => {
      if (!pointer || !head || !headBox) return null
      const rect = canvas.getBoundingClientRect()
      const x = ((pointer.x - rect.left) * width) / rect.width
      const y = ((pointer.y - rect.top) * height) / rect.height
      const onHead = maskHit(
        headMask,
        (x - headBox.left) / headBox.width,
        (y - headBox.top) / headBox.height,
      )
      for (let i = hits.length - 1; i >= 0; i -= 1) {
        const hit = hits[i]
        if (hit.far && onHead) continue
        // The card is drawn as x * (ex, ey) + y * (fx, fy) around its center,
        // x and y in -1..1 across the picture: solve for them.
        const det = hit.ex * hit.fy - hit.fx * hit.ey
        const dx = x - hit.x
        const dy = y - hit.y
        const a = (dx * hit.fy - hit.fx * dy) / det
        const b = (hit.ex * dy - hit.ey * dx) / det
        if (Math.abs(a) > 1 || Math.abs(b) > 1) continue
        if (maskHit(hit.card.mask, (a + 1) / 2, (b + 1) / 2)) return hit.index
      }
      return null
    }

    const syncRingOpen = () => {
      const open = intro.ring >= RING_LABEL_AT
      if (open !== ringOpenState) {
        ringOpenState = open
        setRingOpen(open)
      }
      const done = intro.dissolve >= 0.99
      if (done !== dissolvedState) {
        dissolvedState = done
        setDissolved(done)
      }
    }

    const updateHovered = () => {
      const found = findHovered()
      if (found === hoveredIndex) return
      hoveredIndex = found
      setHovered(found)
    }

    const handlePointerMove = (event) => {
      pointer = { x: event.clientX, y: event.clientY }
      updateHovered()
    }
    const handlePointerLeave = () => {
      pointer = null
      updateHovered()
    }
    cursorLayer.addEventListener('pointermove', handlePointerMove)
    cursorLayer.addEventListener('pointerleave', handlePointerLeave)

    const tick = (now) => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
      last = now
      clock += dt
      updateScroll(dt)
      // Scrolling stirs the ring: its extra speed follows the scroll speed, eased.
      const scrollY = window.scrollY
      const scrollSpeed = dt > 0 ? (scrollY - lastScrollY) / dt : 0
      lastScrollY = scrollY
      const stirTarget = Math.max(-1, Math.min(1, scrollSpeed / STIR_SPEED)) * STIR
      stir += (stirTarget - stir) * (1 - Math.exp(-dt / 0.3))
      spin = (spin + (dt * SPEED) / REVOLUTION_SECONDS + dt * stir) % 1
      render()
      syncRingOpen()
      updateHovered()
      if (visible) raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (prefersReducedMotion || raf || !visible || !head) return
      last = 0
      raf = requestAnimationFrame(tick)
    }

    // The reveal plays once, when the portrait has scrolled into view and its
    // pictures are loaded: the panel and the head dither in, then the ring opens.
    let triggered = false
    const timeline = gsap
      .timeline({ paused: true })
      .to(intro, { panel: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
      .to(intro, { head: 1, duration: 1.1, ease: 'power2.inOut' }, 0.35)
      .to(intro, { ring: 1, duration: 1.8, ease: 'none' }, 1.0)
    const playReveal = () => {
      if (triggered && head && cards.length && !prefersReducedMotion) timeline.play()
    }
    const scrollTrigger = prefersReducedMotion || expandMode
      ? null
      : ScrollTrigger.create({
          trigger: frame,
          start: 'top 78%',
          once: true,
          onEnter: () => {
            triggered = true
            playReveal()
          },
        })

    // The dithered head's intro plays when the stage has scrolled into view (also
    // when you jump to it); once you are back above it, it slides out again.
    let headTween = null
    const headTrigger =
      expandMode && !prefersReducedMotion && track
        ? ScrollTrigger.create({
            trigger: track,
            start: 'top 55%',
            onEnter: () => {
              headTween?.kill()
              headTween = gsap.to(intro, { headIn: 1, duration: HEAD_INTRO_SECONDS, ease: 'power3.out' })
            },
            // Scrolling back up: it slides out again, the way it came.
            onLeaveBack: () => {
              headTween?.kill()
              headTween = gsap.to(intro, { headIn: 0, duration: HEAD_OUTRO_SECONDS, ease: 'power2.in' })
            },
          })
        : null

    Promise.all([loadImage(headSrc), ...THOUGHTS.map(loadImage)]).then(([headImage, ...images]) => {
      if (cancelled) return
      head = headImage
      headMask = alphaMask(head, 64, Math.round((64 * head.naturalHeight) / head.naturalWidth))
      sources = images.filter(Boolean)
      layout()
      rebuildCards()
      buildStartLayers()
      updateScroll(0)
      render()
      syncRingOpen()
      start()
      playReveal()
    })

    const resizeObserver = new ResizeObserver(() => {
      layout()
      buildStartLayers()
      updateScroll(0)
      // Textures are only remade when the card size has really changed.
      const built = cards[0]?.size
      if (built && Math.abs(restingCardSize() - built) > built * 0.08) rebuildCards()
      render()
    })
    resizeObserver.observe(canvas)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
    })
    intersectionObserver.observe(frame)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      timeline.kill()
      scrollTrigger?.kill()
      headTween?.kill()
      headTrigger?.kill()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      cursorLayer.removeEventListener('pointermove', handlePointerMove)
      cursorLayer.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [prefersReducedMotion])

  // "That's me" while the portrait is still shrinking into place and the ring is
  // opening, then "What's on my mind" and, over a picture, that picture's label.
  const label = !ringOpen
    ? t.about.cursorIntro
    : hovered === null
      ? t.about.cursorIdle
      : t.about.thoughts[hovered]

  return (
    <>
      {/* The canvas fills the whole stage around the portrait (About.jsx), so the
          expanding frame and the swinging cards can use all of it. */}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <figure ref={frameRef} className={styles.frame} role="img" aria-label={t.about.portraitAlt}>
        <div ref={panelRef} className={styles.panel} />
      </figure>
      {/* The cursor label: a pill that trails the pointer over the frame and says
          what the pointer is over. The cursor component's own arrow is replaced by
          nothing and the normal pointer is shown again (the component hides it by
          default; `cursor: auto` below undoes that). */}
      <div ref={cursorLayerRef} className={styles.cursorLayer}>
        <UserCursor
          color="#f6f6f6"
          textColor="#161616"
          arrow={<span />}
          showLabel={dissolved}
          labelOffsetUseDefault={false}
          labelOffsetX={18}
          labelOffsetY={16}
          label={
            <span className={styles.cursorLabel}>
              {label}
            </span>
          }
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
            cursor: 'auto',
          }}
        />
      </div>
    </>
  )
}
