import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Icon, List, Modal, cn } from '../ui'
import { product } from '../lib/product'
import { pathFor } from './features-context'
import { ProductMark } from './ProductHero'
import { pages } from './registry'
import type { FeatureEntry } from './types'

const MAX_TABS = 4

// Пункт «Главная» есть в меню всегда, даже если функцию home выключили:
// тогда на '/' показывается запасная главная из App.tsx.
const HOME_ENTRY: FeatureEntry = {
  id: 'home',
  title: 'Главная',
  short: 'Главная',
  icon: 'home',
  kind: 'page',
  order: 0,
  component: () => null,
  authors: [],
}
function navPagesNow(): FeatureEntry[] {
  return pages.some((p) => p.id === 'home') ? pages : [HOME_ENTRY, ...pages]
}

function activeIdFrom(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home'
  const match = /^\/f\/([^/]+)/.exec(pathname)
  if (!match) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

function TabLink({ feature, active }: { feature: FeatureEntry; active: boolean }) {
  return (
    <Link
      to={pathFor(feature.id)}
      aria-current={active ? 'page' : undefined}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1"
    >
      <TabIcon icon={feature.icon} active={active} />
      <TabLabel active={active}>{feature.short}</TabLabel>
    </Link>
  )
}

function TabIcon({ icon, active }: { icon: string; active: boolean }) {
  return (
    <span
      className={cn(
        'flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200',
        active ? 'bg-brand text-on-brand' : 'text-muted',
      )}
    >
      <Icon name={icon} size={22} fill={active} />
    </span>
  )
}

function TabLabel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    // long names wrap to a second line instead of being cut off
    <span
      className={cn(
        'line-clamp-2 max-w-full px-0.5 text-center text-[11px] leading-[13px] font-semibold break-words',
        active ? 'text-fg' : 'text-muted',
      )}
    >
      {children}
    </span>
  )
}

function SideNav({ activeId }: { activeId: string }) {
  const navPages = navPagesNow()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-w)] flex-col bg-header text-on-header lg:flex">
      <Link to="/" className="flex items-center gap-3 px-6 pt-7 pb-6">
        <ProductMark size={44} />
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[18px] leading-tight font-semibold break-words">{product.name}</span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug font-light text-on-header/65">
            {product.tagline}
          </span>
        </span>
      </Link>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Разделы">
        {navPages.map((page) => {
          const active = page.id === activeId
          return (
            <Link
              key={page.id}
              to={pathFor(page.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors',
                active ? 'bg-brand text-on-brand' : 'text-on-header/70 hover:bg-on-header/10 hover:text-on-header',
              )}
            >
              <Icon name={page.icon} size={22} fill={active} />
              <span className="min-w-0 truncate">{page.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function MobileHeader() {
  return (
    <header className="pt-safe sticky top-0 z-20 bg-header text-on-header lg:hidden">
      <Link to="/" className="flex h-14 items-center gap-2.5 px-4">
        <ProductMark size={32} />
        <span className="min-w-0 truncate text-[17px] font-semibold">{product.name}</span>
      </Link>
    </header>
  )
}

/** Каркас приложения: чёрная шапка и нижняя панель на телефоне, чёрное боковое меню от 1024px. */
export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const activeId = activeIdFrom(pathname)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    setMoreOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  const navPages = navPagesNow()
  const overflow = navPages.length > MAX_TABS
  const tabPages = overflow ? navPages.slice(0, MAX_TABS) : navPages
  const morePages = overflow ? navPages.slice(MAX_TABS) : []
  const moreActive = morePages.some((p) => p.id === activeId)

  return (
    // TooltipProvider нужен подсказкам shadcn (Tooltip) во всех функциях
    <TooltipProvider>
      <div data-shell className="min-h-dvh overflow-x-clip lg:pl-[var(--sidebar-w)]">
        <SideNav activeId={activeId} />
        <MobileHeader />

        <main className="mx-auto w-full max-w-[var(--content-max)] px-4 pt-4 pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+28px)] sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </main>

        <nav
          aria-label="Разделы"
          className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex h-[var(--tabbar-h)] max-w-xl items-stretch px-1">
            {tabPages.map((page) => (
              <TabLink key={page.id} feature={page} active={page.id === activeId} />
            ))}
            {overflow && (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1"
              >
                <TabIcon icon="more_horiz" active={moreActive} />
                <TabLabel active={moreActive}>Ещё</TabLabel>
              </button>
            )}
          </div>
        </nav>

        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Ещё">
          <List>
            {morePages.map((page) => (
              <MoreLink key={page.id} feature={page} active={page.id === activeId} />
            ))}
          </List>
        </Modal>
      </div>
    </TooltipProvider>
  )
}

function MoreLink({ feature, active }: { feature: FeatureEntry; active: boolean }) {
  return (
    <div role="listitem">
      <Link
        to={pathFor(feature.id)}
        aria-current={active ? 'page' : undefined}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 active:bg-surface-3"
      >
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full',
            active ? 'bg-brand text-on-brand' : 'bg-brand-soft text-brand-strong',
          )}
        >
          <Icon name={feature.icon} size={22} fill />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">{feature.title}</span>
        <Icon name="chevron_right" size={22} className="shrink-0 text-subtle" />
      </Link>
    </div>
  )
}
