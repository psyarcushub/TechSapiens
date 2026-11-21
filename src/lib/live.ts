import { useEffect, useState } from 'react'

// Живые данные из интернета: курсы валют, криптовалюты, погода и другие
// открытые сервисы без ключей. Сервис может не ответить (на сцене, в
// самолётном режиме, в проверке без интернета), поэтому страница никогда не
// ждёт его и не падает: пока ответа нет, показываются последние сохранённые
// или запасные данные с понятной пометкой.

/** JSON по адресу или null, если ответа нет за timeoutMs, код не 2xx или это не JSON. Никогда не бросает. */
export async function fetchJson(url: string, timeoutMs = 6000): Promise<unknown | null> {
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null
  const timer = setTimeout(() => ctrl?.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl?.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export interface LiveValue<T> {
  data: T
  /** live — свежий ответ сервиса, saved — прошлый ответ из телефона, fallback — запасные данные. */
  source: 'live' | 'saved' | 'fallback'
  /** Когда пришёл показанный ответ (мс с 1970 года); null для запасных данных. */
  updatedAt: number | null
}

function readSaved<T>(key: string): { data: T; at: number } | null {
  try {
    const raw = window.localStorage.getItem(`live:${key}`)
    if (!raw) return null
    const v = JSON.parse(raw) as { data?: T; at?: number }
    return v && typeof v === 'object' && 'data' in v && typeof v.at === 'number' ? { data: v.data as T, at: v.at } : null
  } catch {
    return null
  }
}

function save<T>(key: string, data: T): void {
  try {
    window.localStorage.setItem(`live:${key}`, JSON.stringify({ data, at: Date.now() }))
  } catch {
    // нет места или хранилище запрещено: просто не запоминаем
  }
}

/**
 * Живые данные с запасом. key — имя для памяти телефона (начинай с id функции),
 * url — адрес открытого API по https, fallback — запасные данные, pick — достаёт
 * нужное из ответа и возвращает null, если ответ не того вида. refreshMs — как
 * часто обновлять (не чаще раза в 10 секунд), 0 — один раз при открытии.
 *
 *   const rates = useLiveJson('fx-board:usd', 'https://open.er-api.com/v6/latest/USD',
 *     { EUR: 0.92, GEL: 2.7 }, (j) => pickRates(j), 60000)
 *   rates.source === 'live' ? 'Курс сейчас' : 'Курс на последнее обновление'
 */
export function useLiveJson<T>(
  key: string,
  url: string,
  fallback: T,
  pick: (json: unknown) => T | null,
  refreshMs = 0,
): LiveValue<T> {
  const [state, setState] = useState<LiveValue<T>>(() => {
    const saved = readSaved<T>(key)
    return saved ? { data: saved.data, source: 'saved', updatedAt: saved.at } : { data: fallback, source: 'fallback', updatedAt: null }
  })
  useEffect(() => {
    let alive = true
    const load = async () => {
      const json = await fetchJson(url)
      if (!alive || json === null) return
      let picked: T | null = null
      try {
        picked = pick(json)
      } catch {
        picked = null
      }
      if (picked === null || picked === undefined) return
      save(key, picked)
      setState({ data: picked, source: 'live', updatedAt: Date.now() })
    }
    void load()
    const timer = refreshMs > 0 ? window.setInterval(() => void load(), Math.max(10000, refreshMs)) : 0
    return () => {
      alive = false
      if (timer) window.clearInterval(timer)
    }
    // pick не в списке нарочно: его пишут прямо в вызове, и он меняется на каждой отрисовке
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url, refreshMs])
  return state
}
