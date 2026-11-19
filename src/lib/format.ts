// Русские числа и даты: склонение, «5 минут назад», «20 ноября».

/** Форма слова для числа: plural(5, ['идея', 'идеи', 'идей']) → 'идей'. */
export function plural(n: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(Math.trunc(n))
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}

/** Число со словом: countLabel(3, ['голос', 'голоса', 'голосов']) → '3 голоса'. */
export function countLabel(n: number, forms: [one: string, few: string, many: string]): string {
  return `${formatNumber(n)} ${plural(n, forms)}`
}

const numberFormat = new Intl.NumberFormat('ru-RU')

/** 12345 → '12 345'. */
export function formatNumber(n: number): string {
  return Number.isFinite(n) ? numberFormat.format(n) : '0'
}

function toDate(value: Date | number | string): Date | null {
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const hourMinute = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })

/** '20 ноября'. */
export function formatDate(value: Date | number | string): string {
  const d = toDate(value)
  return d ? dayMonth.format(d) : ''
}

/** '14:05'. */
export function formatTime(value: Date | number | string): string {
  const d = toDate(value)
  return d ? hourMinute.format(d) : ''
}

/** 'только что', '5 минут назад', 'вчера', '3 дня назад', '20 ноября'. */
export function timeAgo(value: Date | number | string, now: Date = new Date()): string {
  const d = toDate(value)
  if (!d) return ''
  const sec = Math.round((now.getTime() - d.getTime()) / 1000)
  if (sec < 0) return formatDate(d)
  if (sec < 45) return 'только что'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} ${plural(min, ['минуту', 'минуты', 'минут'])} назад`
  const hours = Math.round(min / 60)
  if (hours < 24) return `${hours} ${plural(hours, ['час', 'часа', 'часов'])} назад`
  const days = Math.round(hours / 24)
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} ${plural(days, ['день', 'дня', 'дней'])} назад`
  return formatDate(d)
}
