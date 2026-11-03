import { useEffect, useRef, useState } from 'react'
import UserCursor from '@/components/originkit/ui/usercursor'
import { useLanguage } from '../../context/LanguageContext'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import headSrc from '../../assets/images/about/head.webp'
import styles from './OrbitPortrait.module.css'

// The "thoughts" orbiting the head, in ring order (files are numbered).
const THOUGHTS = Object.values(
  import.meta.glob('../../assets/images/about/thoughts/*.webp', { eager: true, import: 'default' }),
)

// A solid accent panel with the cut-out portrait on it, and a ring of
// illustrations circling the head like the stars in an old cartoon, passing
// behind the head on the far side and in front of it on the near side.
//
// The ring is the one from the ThreeUI "Gallery Heading" (Matte Rise variant,
// threeui.com), mirrored top to bottom: a circle in a tilted plane, projected
// in perspective, with flat cards standing on it, turned along the ring and
// depth-sorted, so they foreshorten and go edge-on at the sides. Kept from it:
// the axis angle, the camera distance, the starting phase and the revolution
// time. Changed: the cards are cut-out illustrations instead of painted plates
// (no rounded-rect clip), the ring is seen from below instead of above, its
// plane tilt is steeper (77.5 degrees instead of 60.5, so the ring is a flatter
// ellipse), it is centered on the head instead of the headline, it always turns
// at the same speed (the original rests and only turns, sprung, under the
// pointer), and every card bobs up and down on its own cycle.
const RING = {
  axis: 25.5, // screen angle of the ring's major axis, degrees
  tilt: 77.5, // tilt of the ring's plane away from facing the viewer, degrees (the original: 60.5)
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

// Layout, as fractions of the panel width (the panel is 4:5, see the CSS).
const PORTRAIT_WIDTH = 0.96 // the head picture, bottom-aligned and centered
// Ring center and size relative to the head picture (its own width/height).
const HEAD_X = 0.49 // eye line x, fraction of the picture width
const HEAD_Y = 0.28 // ring center y, fraction of the picture height
const RING_RADIUS = 0.43 // semi-major axis, fraction of the picture width
const CARD_SIZE = 0.52 // card side, fraction of the ring's semi-major axis (bigger = smaller gaps)
// The canvas is larger than the panel by this fraction on every side, so the
// cards can swing out past the panel's edges.
const CANVAS_MARGIN = 0.3
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

// Ring plane basis (see the ThreeUI source): U, V span the plane, AXIS is its
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

// Redraws `source` (a square texture of `size` pixels) as an ordered dither
// with cells of `cell` pixels.
function ditherTexture(source, size, cell) {
  const grid = Math.max(1, Math.round(size / cell))
  const low = document.createElement('canvas')
  low.width = low.height = grid
  const lowContext = low.getContext('2d')
  lowContext.imageSmoothingQuality = 'high'
  lowContext.drawImage(source, 0, 0, grid, grid)
  const pixels = lowContext.getImageData(0, 0, grid, grid)
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
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const i = (y * grid + x) * 4
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
  result.width = result.height = size
  const context = result.getContext('2d')
  context.imageSmoothingEnabled = false
  context.drawImage(low, 0, 0, size, size)
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
  if (cell > 0) front = ditherTexture(front, size, cell)

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

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const panel = panelRef.current
    const cursorLayer = cursorLayerRef.current
    const context = canvas?.getContext('2d')
    if (!frame || !panel || !cursorLayer || !context) return undefined

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

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      canvas.width = width
      canvas.height = height
      radiusPx = parseFloat(getComputedStyle(panel).borderTopLeftRadius) * dpr || 0
      accent = getComputedStyle(frame).getPropertyValue('--color-accent').trim() || accent
      const canvasRect = canvas.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
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
      const panelWidth = width / (1 + 2 * CANVAS_MARGIN)
      const side = panelWidth * PORTRAIT_WIDTH * RING_RADIUS * CARD_SIZE
      return Math.min(MAX_TEXTURE, Math.max(MIN_TEXTURE, Math.round(side)))
    }

    const rebuildCards = () => {
      const size = restingCardSize()
      const cell = DITHER_PIXEL_SIZE > 0 ? Math.max(1, Math.round(DITHER_PIXEL_SIZE * dpr)) : 0
      cards = sources.map((image) => makeTextures(image, size, cell))
    }

    const render = () => {
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)

      // The panel itself is drawn here, on the canvas, together with the head
      // (not as a CSS box under it): two separately rendered layers can disagree
      // by a pixel about where the panel ends (Safari showed a sliver of orange
      // under the head), while one drawing has no such seam.
      const { left: panelLeft, top: panelTop, right: panelRight, bottom: panelBottom } = panelBox
      const tracePanel = () => {
        const r = radiusPx
        context.beginPath()
        context.moveTo(panelLeft + r, panelTop)
        context.lineTo(panelRight - r, panelTop)
        context.arcTo(panelRight, panelTop, panelRight, panelTop + r, r)
        context.lineTo(panelRight, panelBottom - r)
        context.arcTo(panelRight, panelBottom, panelRight - r, panelBottom, r)
        context.lineTo(panelLeft + r, panelBottom)
        context.arcTo(panelLeft, panelBottom, panelLeft, panelBottom - r, r)
        context.lineTo(panelLeft, panelTop + r)
        context.arcTo(panelLeft, panelTop, panelLeft + r, panelTop, r)
        context.closePath()
      }
      context.fillStyle = accent
      tracePanel()
      context.fill()
      hits = []
      if (!head) return

      // The head picture is bottom aligned on the panel.
      const panelWidth = panelRight - panelLeft
      const headWidth = panelWidth * PORTRAIT_WIDTH
      const headHeight = (headWidth * head.naturalHeight) / head.naturalWidth
      const headLeft = panelLeft + (panelWidth - headWidth) / 2
      // A couple of pixels too low on purpose: the clip below cuts it off at the
      // panel's edge, so no sliver of the panel's color can show under it.
      const headTop = panelBottom + 2 * dpr - headHeight

      headBox = { left: headLeft, top: headTop, width: headWidth, height: headHeight }

      const centerX = headLeft + headWidth * HEAD_X
      const centerY = headTop + headHeight * HEAD_Y
      const radius = headWidth * RING_RADIUS

      const project = (p) => {
        const k = (radius * RING.dist) / (RING.dist - p[2])
        return [centerX + k * p[0], centerY + k * p[1]]
      }

      const spinAngle = spin * Math.PI * 2 * RING.direction
      const list = cards.map((card, index) => {
        const psi = rad(RING.phase) - (index * 2 * Math.PI) / cards.length + spinAngle
        // How far the card is lifted along its own vertical axis, in ring
        // radii, on its own cycle (not at all with reduced motion).
        const cycle = BOB_PERIODS[index % BOB_PERIODS.length]
        const bob = prefersReducedMotion
          ? 0
          : BOB_AMOUNT * Math.sin((clock * 2 * Math.PI) / cycle + index * 1.7)
        return { card, index, psi, z: Math.sin(psi) * sinTilt, bob }
      })
      list.sort((a, b) => a.z - b.z)

      const drawCard = ({ card, index, psi, z, bob }) => {
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
        const pT = project(center.map((v, i) => v + tangent[i] * HALF_CARD))
        const pA = project(center.map((v, i) => v + AXIS[i] * HALF_CARD))
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
      // The head is cut off by the panel's rounded bottom corners.
      context.save()
      tracePanel()
      context.clip()
      context.drawImage(head, headLeft, headTop, headWidth, headHeight)
      context.restore()
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
      spin = (spin + (dt * SPEED) / REVOLUTION_SECONDS) % 1
      render()
      updateHovered()
      if (visible) raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (prefersReducedMotion || raf || !visible || !head) return
      last = 0
      raf = requestAnimationFrame(tick)
    }

    Promise.all([loadImage(headSrc), ...THOUGHTS.map(loadImage)]).then(([headImage, ...images]) => {
      if (cancelled) return
      head = headImage
      headMask = alphaMask(head, 64, Math.round((64 * head.naturalHeight) / head.naturalWidth))
      sources = images.filter(Boolean)
      layout()
      rebuildCards()
      render()
      start()
    })

    const resizeObserver = new ResizeObserver(() => {
      layout()
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
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      cursorLayer.removeEventListener('pointermove', handlePointerMove)
      cursorLayer.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [prefersReducedMotion])

  return (
    <figure
      ref={frameRef}
      className={styles.frame}
      style={{ '--canvas-margin': `${CANVAS_MARGIN * 100}%` }}
      role="img"
      aria-label={t.about.portraitAlt}
    >
      <div ref={panelRef} className={styles.panel} />
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {/* OriginKit "User Cursor", used only for its label: a pill that trails the
          pointer over the panel and says what the pointer is over. The component's
          own arrow is replaced by nothing and the normal pointer is shown again
          (the component hides it by default; `cursor: auto` below undoes that). */}
      <div ref={cursorLayerRef} className={styles.cursorLayer}>
        <UserCursor
          color="#f6f6f6"
          textColor="#161616"
          arrow={<span />}
          labelOffsetUseDefault={false}
          labelOffsetX={18}
          labelOffsetY={16}
          label={
            <span className={styles.cursorLabel}>
              {hovered === null ? t.about.cursorIdle : t.about.thoughts[hovered]}
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
    </figure>
  )
}
