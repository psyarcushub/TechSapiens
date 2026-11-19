import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icon'
import { cn } from './cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  /** Кнопки внизу окна. */
  footer?: ReactNode
  className?: string
}

let openCount = 0
let savedOverflow = ''

/** На телефоне выезжает снизу, на широком экране — окно по центру. Закрывается по фону и Esc. */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    if (openCount === 0) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openCount += 1
    panelRef.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      openCount = Math.max(0, openCount - 1)
      if (openCount === 0) document.body.style.overflow = savedOverflow
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="anim-fade absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'anim-sheet relative flex max-h-[88dvh] w-full flex-col overflow-hidden bg-surface text-fg shadow-pop outline-none',
          'rounded-t-sheet sm:max-w-md sm:rounded-sheet',
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-surface-3 sm:hidden" aria-hidden />
        <div className="flex shrink-0 items-center gap-3 px-5 pt-3 pb-2 sm:pt-5">
          <div className="min-w-0 flex-1 text-[18px] leading-snug font-extrabold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition hover:text-fg active:scale-95"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-5">{children}</div>
        {footer ? (
          <div className="flex shrink-0 gap-2 border-t border-line px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        ) : (
          <div className="pb-safe shrink-0" />
        )}
      </div>
    </div>,
    document.body,
  )
}
