// Предсказуемый «случай»: одно и то же зерно даёт одни и те же числа,
// поэтому демо-данные не прыгают при каждой перерисовке.

export interface Random {
  /** Число от 0 до 1. */
  next(): number
  /** Целое от min до max включительно. */
  int(min: number, max: number): number
  /** Случайный элемент массива (undefined для пустого). */
  pick<T>(list: readonly T[]): T | undefined
  /** Перемешанная копия массива. */
  shuffle<T>(list: readonly T[]): T[]
  /** true с вероятностью p. */
  chance(p: number): boolean
}

export function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function createRandom(seed: number | string = 1): Random {
  let state = (typeof seed === 'string' ? hashString(seed) : Math.trunc(seed)) >>> 0 || 1
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int(min, max) {
      const lo = Math.ceil(Math.min(min, max))
      const hi = Math.floor(Math.max(min, max))
      return lo + Math.floor(next() * (hi - lo + 1))
    },
    pick(list) {
      return list.length ? list[Math.floor(next() * list.length)] : undefined
    },
    shuffle(list) {
      const copy = [...list]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
    chance(p) {
      return next() < p
    },
  }
}
