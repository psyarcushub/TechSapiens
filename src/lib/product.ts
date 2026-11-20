import raw from '../product.json'

// Паспорт продукта из src/product.json. Файл правит агент, поэтому здесь он
// приводится к ожидаемому виду: если поля нет или тип не тот, берётся заглушка.

export interface ProductCluster {
  /** Название группы похожих идей. */
  title: string
  /** Сколько идей в группе. */
  count: number
  /** Что эта группа дала продукту. */
  contribution: string
}

/** Экран каркаса первой версии: заготовка, пока нет функции с тем же id. */
export interface ProductScreen {
  id: string
  title: string
  /** Подпись в нижнем меню. */
  short: string
  /** Имя иконки Material Symbols. */
  icon: string
  /** Одна фраза: зачем этот экран. */
  purpose: string
  /** Примеры промптов, которые участник может прислать для экрана. */
  examples: string[]
}

export interface Product {
  name: string
  tagline: string
  problem: string
  audience: string
  /** Имя иконки Material Symbols. */
  icon: string
  colors: { primary: string; accent: string }
  /** Каркас первой версии; пустой, пока Гермес не выбрал стартап. */
  screens: ProductScreen[]
  about: {
    summary: string
    ideasCount: number
    participantsCount: number
    clusters: ProductCluster[]
    outOfScope: string[]
  }
}

const DEFAULTS: Product = {
  name: 'Стартап собирается…',
  tagline: 'Гермес выбирает стартап',
  problem: 'Гермес читает идеи участников и скоро расскажет, какую проблему решает наш стартап.',
  audience: 'Все, кто прислал идею, и все, кто присоединится позже.',
  icon: 'rocket_launch',
  colors: { primary: '#ff008b', accent: '#ff4fb3' },
  screens: [],
  about: {
    summary: 'Участники конференции присылают идеи и промпты, а ИИ-агент Гермес склеивает идеи в один стартап и собирает его по промптам прямо во время конференции.',
    ideasCount: 0,
    participantsCount: 0,
    clusters: [],
    outOfScope: [],
  },
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function text(value: unknown, fallback: string, max = 600): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, max) : fallback
}

function count(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}

const SCREEN_ID = /^[a-z0-9][a-z0-9-]{1,60}$/
const BUILT_IN = new Set(['home', 'about'])

/** Экраны каркаса: только с понятным id и названием, без повторов, не больше 6. */
function normalizeScreens(value: unknown): ProductScreen[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const out: ProductScreen[] = []
  for (const item of value) {
    const s = record(item)
    const id = text(s.id, '', 61)
    const title = text(s.title, '', 60)
    if (!SCREEN_ID.test(id) || BUILT_IN.has(id) || seen.has(id) || !title) continue
    seen.add(id)
    const examples = Array.isArray(s.examples) ? s.examples : []
    out.push({
      id,
      title,
      short: text(s.short, title, 16),
      icon: text(s.icon, 'widgets', 60),
      purpose: text(s.purpose, '', 300),
      examples: examples
        .filter((x): x is string => typeof x === 'string' && x.trim() !== '')
        .map((x) => x.trim().slice(0, 200))
        .slice(0, 3),
    })
    if (out.length === 6) break
  }
  return out
}

export function normalizeProduct(input: unknown): Product {
  const p = record(input)
  const colors = record(p.colors)
  const about = record(p.about)
  const clusters = Array.isArray(about.clusters) ? about.clusters : []
  const outOfScope = Array.isArray(about.outOfScope) ? about.outOfScope : []

  return {
    name: text(p.name, DEFAULTS.name, 80),
    tagline: text(p.tagline, DEFAULTS.tagline, 160),
    problem: text(p.problem, DEFAULTS.problem),
    audience: text(p.audience, DEFAULTS.audience),
    icon: text(p.icon, DEFAULTS.icon, 60),
    colors: {
      primary: text(colors.primary, DEFAULTS.colors.primary, 20),
      accent: text(colors.accent, DEFAULTS.colors.accent, 20),
    },
    screens: normalizeScreens(p.screens),
    about: {
      summary: text(about.summary, DEFAULTS.about.summary, 1200),
      ideasCount: count(about.ideasCount),
      participantsCount: count(about.participantsCount),
      clusters: clusters
        .map((c) => record(c))
        .filter((c) => typeof c.title === 'string' && c.title.trim())
        .map((c) => ({
          title: text(c.title, '', 120),
          count: count(c.count),
          contribution: text(c.contribution, '', 400),
        }))
        .slice(0, 20),
      outOfScope: outOfScope
        .filter((x): x is string => typeof x === 'string' && x.trim() !== '')
        .map((x) => x.trim().slice(0, 200))
        .slice(0, 20),
    },
  }
}

/** Паспорт продукта: название, фраза, цвета, описание для страницы «О стартапе». */
export const product: Product = normalizeProduct(raw as unknown)
