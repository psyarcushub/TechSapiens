const MAX_PER_FEATURE = 20
const MAX_LENGTH = 500

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || 'Error'
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error) ?? String(error)
  } catch {
    return String(error)
  }
}

/** Записывает ошибку функции в window.__FEATURE_ERRORS__[id]; её читает прогон в браузере. */
export function recordFeatureError(id: string, error: unknown): void {
  try {
    const store = (window.__FEATURE_ERRORS__ ??= {})
    const list = (store[id] ??= [])
    if (list.length < MAX_PER_FEATURE) list.push(messageOf(error).slice(0, MAX_LENGTH))
  } catch {
    // запись ошибки не должна ронять оболочку
  }
}

export function initFeatureErrors(): void {
  try {
    window.__FEATURE_ERRORS__ ??= {}
  } catch {
    // ничего
  }
}
