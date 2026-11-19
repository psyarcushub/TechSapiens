import { useCallback, useRef, useSyncExternalStore } from 'react'

// Хранилище в localStorage с приставкой «ts:». Никогда не падает:
// битый JSON, запрет на localStorage (приватный режим), переполнение —
// во всех случаях функция просто получает начальное значение, а изменения
// живут в памяти до перезагрузки страницы.

const PREFIX = 'ts:'

type Listener = () => void
export type SetLocalState<T> = (next: T | ((prev: T) => T)) => void

const listeners = new Map<string, Set<Listener>>()
const memory = new Map<string, string | null>()
const cache = new Map<string, { raw: string | null; value: unknown }>()

let storageChecked = false
let storage: Storage | null = null
let storageListening = false

function getStorage(): Storage | null {
  if (storageChecked) return storage
  storageChecked = true
  try {
    const s = window.localStorage
    const probe = PREFIX + '__probe__'
    s.setItem(probe, '1')
    s.removeItem(probe)
    storage = s
  } catch {
    storage = null
  }
  return storage
}

function readRaw(fullKey: string): string | null {
  if (memory.has(fullKey)) return memory.get(fullKey) ?? null
  const s = getStorage()
  if (!s) return null
  try {
    return s.getItem(fullKey)
  } catch {
    return null
  }
}

function writeRaw(fullKey: string, raw: string | null): void {
  memory.set(fullKey, raw)
  const s = getStorage()
  if (!s) return
  try {
    if (raw === null) s.removeItem(fullKey)
    else s.setItem(fullKey, raw)
  } catch {
    // место кончилось или запись запрещена: значение остаётся в памяти
  }
}

/** Сохранённое значение того же вида, что и начальное: массив к массиву, объект к объекту. */
function sameShape(initial: unknown, stored: unknown): boolean {
  if (initial === null || initial === undefined) return true
  if (Array.isArray(initial)) return Array.isArray(stored)
  if (typeof initial === 'object') return typeof stored === 'object' && stored !== null && !Array.isArray(stored)
  return typeof initial === typeof stored
}

function readValue<T>(fullKey: string, initial: T): T {
  const raw = readRaw(fullKey)
  const hit = cache.get(fullKey)
  if (hit && hit.raw === raw) return hit.value as T
  let value: T = initial
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (sameShape(initial, parsed)) value = parsed as T
    } catch {
      // битый JSON: остаётся начальное значение
    }
  }
  cache.set(fullKey, { raw, value })
  return value
}

function emit(fullKey: string): void {
  listeners.get(fullKey)?.forEach((fn) => {
    try {
      fn()
    } catch {
      // чужой подписчик не должен ломать остальных
    }
  })
}

function listenStorage(): void {
  if (storageListening || typeof window === 'undefined') return
  storageListening = true
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      memory.clear()
      cache.clear()
      listeners.forEach((_, key) => emit(key))
    } else if (event.key.startsWith(PREFIX)) {
      memory.delete(event.key)
      emit(event.key)
    }
  })
}

function subscribeKey(fullKey: string, fn: Listener): () => void {
  listenStorage()
  let set = listeners.get(fullKey)
  if (!set) {
    set = new Set()
    listeners.set(fullKey, set)
  }
  set.add(fn)
  return () => {
    set.delete(fn)
  }
}

function writeValue<T>(fullKey: string, value: T): void {
  let raw: string | null
  try {
    raw = value === undefined ? null : JSON.stringify(value)
  } catch {
    console.warn(`[store] значение для «${fullKey}» не сохраняется: в нём есть циклические ссылки`)
    return
  }
  writeRaw(fullKey, raw)
  cache.set(fullKey, { raw, value })
  emit(fullKey)
}

function resolveInitial<T>(initial: T | (() => T)): T {
  return typeof initial === 'function' ? (initial as () => T)() : initial
}

/**
 * Как useState, только значение переживает перезагрузку страницы.
 * Ключ пишите с приставкой своей функции: useLocalState('mood-meter:votes', []).
 * Если сохранённое значение битое или другого вида, чем начальное (массив вместо
 * объекта), вернётся начальное. Третий элемент сбрасывает значение к начальному.
 */
export function useLocalState<T>(key: string, initial: T | (() => T)): [T, SetLocalState<T>, () => void] {
  const fullKey = PREFIX + key
  const initialRef = useRef<{ key: string; value: T } | null>(null)
  if (initialRef.current === null || initialRef.current.key !== fullKey) {
    initialRef.current = { key: fullKey, value: resolveInitial(initial) }
  }
  const init = initialRef.current.value

  const subscribe = useCallback((fn: Listener) => subscribeKey(fullKey, fn), [fullKey])
  const value = useSyncExternalStore(
    subscribe,
    () => readValue(fullKey, init),
    () => init,
  )

  const setValue = useCallback<SetLocalState<T>>(
    (next) => {
      const prev = readValue(fullKey, init)
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      writeValue(fullKey, resolved)
    },
    [fullKey, init],
  )

  const reset = useCallback(() => {
    writeRaw(fullKey, null)
    cache.delete(fullKey)
    emit(fullKey)
  }, [fullKey])

  return [value, setValue, reset]
}

/** Прочитать значение вне компонента (например, в обработчике). */
export function readLocal<T>(key: string, fallback: T): T {
  return readValue(PREFIX + key, fallback)
}

/** Записать значение вне компонента; все useLocalState с этим ключом обновятся. */
export function writeLocal<T>(key: string, value: T): void {
  writeValue(PREFIX + key, value)
}

/** Удалить значение; useLocalState с этим ключом вернутся к начальному. */
export function removeLocal(key: string): void {
  const fullKey = PREFIX + key
  writeRaw(fullKey, null)
  cache.delete(fullKey)
  emit(fullKey)
}
