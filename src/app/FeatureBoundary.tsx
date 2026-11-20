import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button, Icon } from '../ui'
import { recordFeatureError } from './errors'

interface Props {
  id: string
  variant?: 'page' | 'widget'
  children?: ReactNode
}

interface State {
  failed: boolean
}

/**
 * Обёртка каждой функции. Если функция падает при отрисовке или в эффекте,
 * вместо неё появляется дружелюбная карточка, а ошибка пишется в
 * window.__FEATURE_ERRORS__[id]. Остальное приложение работает дальше.
 */
export class FeatureBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown, _info: ErrorInfo): void {
    recordFeatureError(this.props.id, error)
  }

  componentDidUpdate(prev: Props): void {
    if (prev.id !== this.props.id && this.state.failed) this.setState({ failed: false })
  }

  private retry = (): void => {
    this.setState({ failed: false })
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children
    const compact = this.props.variant === 'widget'
    return (
      <div
        data-feature-broken={this.props.id}
        className={
          compact
            ? 'flex items-center gap-3 rounded-[16px] bg-warning-soft p-3'
            : 'flex flex-col items-center gap-3 rounded-card bg-warning-soft px-6 py-10 text-center'
        }
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-warning-strong">
          <Icon name="construction" size={24} fill />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-fg">Эта часть не загрузилась</div>
          <div className="mt-0.5 text-[13px] text-muted">Остальное работает как обычно.</div>
        </div>
        {compact ? (
          <Button size="sm" variant="outline" icon="refresh" aria-label="Попробовать ещё раз" onClick={this.retry} />
        ) : (
          <Button size="sm" variant="outline" icon="refresh" onClick={this.retry}>
            Повторить
          </Button>
        )}
      </div>
    )
  }
}
