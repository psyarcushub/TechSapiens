import type { Product } from '../lib/product'

type RGB = [number, number, number]

const WHITE: RGB = [255, 255, 255]
const BLACK: RGB = [0, 0, 0]
const INK: RGB = [21, 22, 28]
// Страницы в стиле TechSapiens: белый фон, тёмные секции чёрные.
const BG_LIGHT: RGB = [255, 255, 255]
const BG_DARK: RGB = [0, 0, 0]
const SURFACE_DARK: RGB = [20, 20, 20]
// По умолчанию цвета сайта TechSapiens: ярко-розовый и светло-розовый.
const DEFAULT_PRIMARY: RGB = [255, 0, 139]
const DEFAULT_ACCENT: RGB = [255, 79, 179]
/** Белый текст на заливке, если контраст не ниже 3:1 (крупные надписи и кнопки, как на сайте). */
const WHITE_TEXT_MIN_CONTRAST = 3

function parseHex(value: unknown): RGB | null {
  if (typeof value !== 'string') return null
  let hex = value.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = [...hex].map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]
}

function toHex(c: RGB): string {
  return '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
}

/** t = 0 даёт a, t = 1 даёт b. */
function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function luminance(c: RGB): number {
  const ch = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])
}

function contrast(a: RGB, b: RGB): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Сдвигает цвет к toward, пока контраст с фоном не дойдёт до target. */
function ensureContrast(c: RGB, bg: RGB, target: number, toward: RGB): RGB {
  let out = c
  for (let i = 1; i <= 20 && contrast(out, bg) < target; i++) out = mix(c, toward, i * 0.05)
  return out
}

/**
 * Цвет текста на заливке. Белый, пока контраст не ниже 3:1: так розовые кнопки
 * TechSapiens (#FF008B, контраст 3,7:1) остаются с белым текстом, как на сайте.
 * На светлых заливках (жёлтый, светло-розовый) текст тёмный.
 */
function inkFor(fill: RGB): RGB {
  if (contrast(WHITE, fill) >= WHITE_TEXT_MIN_CONTRAST) return WHITE
  return contrast(WHITE, fill) >= contrast(INK, fill) ? WHITE : INK
}

/** Цвет текста, читаемый сразу на двух цветах (на градиенте). */
function inkForPair(a: RGB, b: RGB): RGB {
  const white = Math.min(contrast(WHITE, a), contrast(WHITE, b))
  const dark = Math.min(contrast(INK, a), contrast(INK, b))
  return white >= dark ? WHITE : INK
}

interface Palette {
  fillL: RGB
  fillD: RGB
  vars: Record<string, string>
}

function palette(prefix: 'brand' | 'accent', base: RGB): Palette {
  const fillL = ensureContrast(base, BG_LIGHT, 1.25, BLACK)
  const fillD = ensureContrast(base, BG_DARK, 2.4, WHITE)
  const strongL = ensureContrast(base, WHITE, 4.5, BLACK)
  const strongD = ensureContrast(fillD, SURFACE_DARK, 4.5, WHITE)
  return {
    fillL,
    fillD,
    vars: {
      [`--${prefix}-l`]: toHex(fillL),
      [`--${prefix}-d`]: toHex(fillD),
      [`--on-${prefix}-l`]: toHex(inkFor(fillL)),
      [`--on-${prefix}-d`]: toHex(inkFor(fillD)),
      [`--${prefix}-soft-l`]: toHex(mix(WHITE, base, 0.12)),
      [`--${prefix}-soft-d`]: toHex(mix(SURFACE_DARK, fillD, 0.2)),
      [`--${prefix}-strong-l`]: toHex(strongL),
      [`--${prefix}-strong-d`]: toHex(strongD),
      [`--${prefix}-line-l`]: toHex(mix(WHITE, base, 0.3)),
      [`--${prefix}-line-d`]: toHex(mix(SURFACE_DARK, fillD, 0.42)),
    },
  }
}

/**
 * Красит приложение в цвета продукта: из primary и accent считает оттенки
 * для светлой темы и тёмных секций (мягкая подложка, читаемый текст, контрастные надписи).
 * Фон страниц от цветов продукта не зависит: белый, в тёмных секциях чёрный.
 */
export function applyTheme(product: Product): void {
  try {
    const primary = parseHex(product.colors.primary) ?? DEFAULT_PRIMARY
    const accent = parseHex(product.colors.accent) ?? DEFAULT_ACCENT
    const brand = palette('brand', primary)
    const acc = palette('accent', accent)

    const heroToL = mix(brand.fillL, acc.fillL, 0.55)
    const heroToD = mix(brand.fillD, acc.fillD, 0.55)
    // фон страниц не подкрашивается цветом бренда: белый и чёрный, как на сайте
    const bgL = BG_LIGHT
    const bgD = BG_DARK

    const vars: Record<string, string> = {
      ...brand.vars,
      ...acc.vars,
      '--hero-to-l': toHex(heroToL),
      '--hero-to-d': toHex(heroToD),
      '--on-hero-l': toHex(inkForPair(brand.fillL, heroToL)),
      '--on-hero-d': toHex(inkForPair(brand.fillD, heroToD)),
      '--bg-l': toHex(bgL),
      '--bg-d': toHex(bgD),
    }
    const root = document.documentElement
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value)
    // Цвет строки браузера задан в index.html: чёрный, под цвет шапки.
  } catch (error) {
    console.warn('[theme] не удалось применить цвета продукта', error)
  }
}
