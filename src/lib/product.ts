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

export interface Product {
  name: string
  tagline: string
  problem: string
  audience: string
  /** Имя иконки Material Symbols. */
  icon: string
  colors: { primary: string; accent: string }
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
  tagline: 'Гермес выбирает идею',
  problem: 'Гермес читает идеи участников и скоро расскажет, какую проблему решает наш стартап.',
  audience: 'Все, кто прислал идею, и все, кто к ним присоединится.',
  icon: 'rocket_launch',
  colors: { primary: '#5b5bd6', accent: '#ff7a59' },
  about: {
    summary: 'Участники конференции присылают идеи и промпты, а ИИ-агент Гермес собирает из них стартап.',
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
