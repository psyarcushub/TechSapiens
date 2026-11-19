import { createRandom } from './random'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function minutesAgo(n: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - n * MINUTE)
}

export function hoursAgo(n: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - n * HOUR)
}

export function daysAgo(n: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - n * DAY)
}

/** Дата в пределах последних maxDays дней; одно и то же зерно даёт одну и ту же «давность». */
export function randomRecentDate(seed: number | string, maxDays = 14, from: Date = new Date()): Date {
  const rnd = createRandom(seed)
  return new Date(from.getTime() - Math.floor(rnd.next() * maxDays * DAY))
}

/** Несколько дат за последние maxDays дней, от новых к старым. */
export function demoDates(count: number, seed: number | string = 'dates', maxDays = 14, from: Date = new Date()): Date[] {
  const rnd = createRandom(seed)
  const list: Date[] = []
  for (let i = 0; i < Math.max(0, count); i++) list.push(new Date(from.getTime() - Math.floor(rnd.next() * maxDays * DAY)))
  return list.sort((a, b) => b.getTime() - a.getTime())
}
