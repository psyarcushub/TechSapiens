import type { ComponentType } from 'react'
import { Link } from 'react-router'
import { Icon, cn } from '../ui'
import { gameLinks } from '../lib/links'
import { product, type ProductScreen } from '../lib/product'
import { pathFor, useFeatures } from './features-context'
import { ScreenBlocks } from './ScreenBlocks'

// Первая версия продукта. Гермес выбирает стартап и описывает 3–5 экранов в
// src/product.json вместе с их содержимым (блоки с демо-данными); пока у
// экрана нет своей функции, сайт рисует его из этих блоков, а ниже подсказывает,
// какой промпт прислать. Функция с тем же id заменяет экран сама (см. registry.ts).

/** Компонент страницы-заготовки для одного экрана. */
export function wireframeComponent(screen: ProductScreen): ComponentType {
  function WireframePage() {
    return <WireframeScreen screen={screen} />
  }
  return WireframePage
}

/** Фраза с точкой в конце, если Гермес её не поставил. */
function sentence(text: string): string {
  const t = text.trim()
  return t && !/[.!?…]$/.test(t) ? t + '.' : t
}

function Label({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('text-[12px] leading-4 font-semibold tracking-[0.16em] text-muted uppercase', className)}>
      {children}
    </span>
  )
}

/** Серые блоки на месте будущего интерфейса. */
function Sketch() {
  return (
    <div
      className="flex flex-col gap-4 rounded-card border-2 border-dashed border-line bg-surface p-4"
      aria-label="Заготовка экрана: здесь появится интерфейс"
    >
      <Label>Набросок экрана</Label>
      <div className="h-28 rounded-[12px] bg-surface-2" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="size-11 shrink-0 rounded-full bg-surface-2" />
          <span className="flex flex-1 flex-col gap-2">
            <span className={cn('h-3 rounded-full bg-surface-3', i === 1 ? 'w-1/2' : 'w-3/4')} />
            <span className="h-3 w-1/3 rounded-full bg-surface-2" />
          </span>
        </div>
      ))}
      <div className="flex gap-3">
        <span className="h-11 flex-1 rounded-full border-2 border-dashed border-line" />
        <span className="h-11 flex-1 rounded-full bg-surface-2" />
      </div>
    </div>
  )
}

/** Кнопки «прислать промпт» и «смотреть канал». */
export function SendPrompt({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row', className)}>
      <a
        href={gameLinks.bot}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-[16px] font-semibold text-on-brand transition-transform active:scale-[0.98]"
      >
        <Icon name="send" size={20} />
        Прислать промпт боту
      </a>
      <a
        href={gameLinks.channel}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[16px] font-semibold text-fg ring-2 ring-line transition-transform ring-inset active:scale-[0.98]"
      >
        Промпты участников в канале
      </a>
    </div>
  )
}

function Examples({ screen }: { screen: ProductScreen }) {
  if (screen.examples.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <Label>Примеры промптов для этого экрана</Label>
      {screen.examples.map((example) => (
        <p key={example} className="rounded-[12px] bg-surface-2 px-4 py-3 text-[15px] leading-snug text-fg">
          «{example}»
        </p>
      ))}
    </div>
  )
}

/** Как развить экран: примеры промптов и куда их присылать. */
function Grow({ screen }: { screen: ProductScreen }) {
  return (
    <section className="flex flex-col gap-4 rounded-card bg-surface-2 p-5">
      <Label>Как развить этот экран</Label>
      <p className="text-[15px] leading-snug text-fg">Это первая версия экрана. Пришлите боту промпт: что здесь добавить или изменить.</p>
      <Examples screen={screen} />
      <SendPrompt />
    </section>
  )
}

/** Экран первой версии: содержимое из блоков, а ниже подсказка, как его развить. */
export function WireframeScreen({ screen }: { screen: ProductScreen }) {
  if (screen.blocks.length > 0) {
    return (
      <div className="flex flex-col gap-10">
        <ScreenBlocks blocks={screen.blocks} screenId={screen.id} />
        <Grow screen={screen} />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[17px] leading-relaxed text-muted">
        {sentence(screen.purpose) || 'Здесь пока пусто.'} Гермес наполнит этот экран по промптам участников.
      </p>
      <Sketch />
      <Examples screen={screen} />
      <SendPrompt />
    </div>
  )
}

/** «Обновлено в 12:40»: время сборки этой версии по часам телефона зрителя. */
export function BuiltAt({ className }: { className?: string }) {
  let label = ''
  try {
    const at = new Date(typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '')
    if (!Number.isNaN(at.getTime())) {
      label = at.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
  } catch {
    label = ''
  }
  if (!label) return null
  return <p className={cn('text-[13px] text-muted', className)}>Сайт обновлён в {label}</p>
}

/** Доска экранов на главной: все экраны первой версии и какие уже доработаны промптами. */
export function ScreensBoard() {
  const { pages } = useFeatures()
  const screens = product.screens
  if (screens.length === 0) return null
  const placeholderIds = new Set(pages.filter((p) => p.placeholder).map((p) => p.id))
  const ready = screens.filter((s) => !placeholderIds.has(s.id)).length

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label>Ход работы</Label>
        <h2 className="text-[24px] leading-tight font-semibold text-fg">Экраны продукта</h2>
        <p className="text-[15px] text-muted">
          Первая версия уже работает. Доработано промптами участников: {ready} из {screens.length}.
        </p>
        <BuiltAt />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {screens.map((screen) => {
          const empty = placeholderIds.has(screen.id)
          return (
            <Link
              key={screen.id}
              to={pathFor(screen.id)}
              className={cn(
                'flex flex-col gap-3 rounded-card bg-surface p-4 transition-transform active:scale-[0.99]',
                'shadow-card ring-1 ring-line/70',
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-full',
                    empty ? 'bg-surface-2 text-muted' : 'bg-brand text-on-brand',
                  )}
                >
                  <Icon name={screen.icon} size={22} />
                </span>
                <span className="min-w-0 flex-1 text-[17px] leading-snug font-semibold text-fg">{screen.title}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.08em] uppercase',
                    empty ? 'bg-surface-2 text-muted' : 'bg-brand text-on-brand',
                  )}
                >
                  {empty ? 'Первая версия' : 'С промптами'}
                </span>
              </span>
              {screen.purpose && <span className="text-[15px] leading-snug text-muted">{screen.purpose}</span>}
              {empty && screen.examples[0] && (
                <span className="text-[14px] leading-snug text-fg">Например: «{screen.examples[0]}»</span>
              )}
            </Link>
          )
        })}
      </div>
      <SendPrompt />
    </section>
  )
}
