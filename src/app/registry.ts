import type { ComponentType } from 'react'
import type { FeatureEntry, FeatureKind } from './types'
import { recordFeatureError } from './errors'
import disabledRaw from '../features.disabled.json'

// Функции находятся сами: каждая папка src/features/<id>/index.tsx. Центрального списка нет.
// Каждая функция грузится отдельным куском: если файл одной функции падает уже при
// загрузке (ошибка вне компонента), падает только она, а не весь сайт.
const loaders = import.meta.glob<Record<string, unknown>>('../features/*/index.tsx')

/** Сколько ждём загрузки одной функции, прежде чем считать её упавшей. */
const LOAD_TIMEOUT_MS = 8000

const ID_FROM_PATH = /\/features\/([^/]+)\/index\.tsx$/

function readDisabled(raw: unknown): Set<string> {
  if (!Array.isArray(raw)) return new Set()
  return new Set(raw.filter((x): x is string => typeof x === 'string'))
}

function isComponent(value: unknown): value is ComponentType {
  if (typeof value === 'function') return true
  // memo() и forwardRef() возвращают объект с полем $$typeof
  return typeof value === 'object' && value !== null && '$$typeof' in value
}

function cleanText(value: unknown, fallback: string, max: number): string {
  if (typeof value !== 'string') return fallback
  const text = value.trim()
  return text ? text.slice(0, max) : fallback
}

function cleanAuthors(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item === 'string' && item.trim()) seen.add(item.trim().slice(0, 60))
  }
  return [...seen]
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`не загрузилась за ${ms / 1000} с`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function toEntry(id: string, mod: Record<string, unknown> | undefined): FeatureEntry | null {
  const raw = mod?.feature
  if (!raw || typeof raw !== 'object') {
    recordFeatureError(id, 'в index.tsx нет export const feature')
    return null
  }
  const manifest = raw as Record<string, unknown>
  if (!isComponent(manifest.component)) {
    recordFeatureError(id, 'у feature нет component')
    return null
  }
  if (typeof manifest.id === 'string' && manifest.id !== id) {
    console.warn(`[features] id «${manifest.id}» не совпадает с папкой «${id}», беру имя папки`)
  }
  const kind: FeatureKind = manifest.kind === 'widget' ? 'widget' : 'page'
  const order = typeof manifest.order === 'number' && Number.isFinite(manifest.order) ? manifest.order : 500
  return {
    id,
    title: cleanText(manifest.title, id, 80),
    icon: cleanText(manifest.icon, 'extension', 60),
    kind,
    order,
    component: manifest.component,
    authors: cleanAuthors(manifest.authors),
  }
}

// Списки заполняет loadFeatures() до первой отрисовки; импортёры видят их живыми.
export let features: FeatureEntry[] = []
export let pages: FeatureEntry[] = []
export let widgets: FeatureEntry[] = []

/** Загружает все включённые функции. Упавшая при загрузке записывается в ошибки и пропускается. */
export async function loadFeatures(): Promise<void> {
  const disabled = readDisabled(disabledRaw as unknown)
  const jobs: { id: string; load: () => Promise<Record<string, unknown>> }[] = []
  for (const [path, load] of Object.entries(loaders)) {
    const match = ID_FROM_PATH.exec(path)
    if (!match || disabled.has(match[1])) continue
    jobs.push({ id: match[1], load })
  }
  const results = await Promise.allSettled(jobs.map((job) => withTimeout(job.load(), LOAD_TIMEOUT_MS)))
  const list: FeatureEntry[] = []
  results.forEach((result, i) => {
    const id = jobs[i].id
    if (result.status === 'rejected') {
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
      recordFeatureError(id, `ошибка при загрузке: ${reason}`)
      return
    }
    const entry = toEntry(id, result.value)
    if (entry) list.push(entry)
  })
  list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'))
  features = list
  pages = list.filter((f) => f.kind === 'page')
  widgets = list.filter((f) => f.kind === 'widget')
}

export function findFeature(id: string): FeatureEntry | undefined {
  return features.find((f) => f.id === id)
}
