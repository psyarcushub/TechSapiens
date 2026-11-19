import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import './ui/icons/icons.css'
import './index.css'
import { App } from './app/App'
import { initFeatureErrors } from './app/errors'
import { loadFeatures } from './app/registry'
import { applyTheme } from './app/theme'
import { product } from './lib/product'

initFeatureErrors()
applyTheme(product)
document.title = product.name

// Иконки показываются, только когда загрузился их шрифт: иначе вместо них были бы видны слова.
// Если шрифт не загрузился вовсе, иконки остаются пустыми местами, а не обрывками слов.
function markIconsReady(): void {
  document.documentElement.classList.add('icons-ready')
}
try {
  if (document.fonts?.load) {
    document.fonts.load('24px "Material Symbols Rounded"', 'home').then(
      (faces) => {
        if (faces.length > 0) markIconsReady()
      },
      () => undefined,
    )
  } else {
    markIconsReady()
  }
} catch {
  markIconsReady()
}

function render(root: HTMLElement): void {
  createRoot(root, {
    // Ошибки функций ловит FeatureBoundary; в консоль они идут предупреждением,
    // чтобы прогон отличал их от настоящих аварий.
    onCaughtError(error) {
      console.warn('[feature] ошибка перехвачена', error)
    },
  }).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const root = document.getElementById('root')
if (root) {
  // сначала загружаем функции (каждую отдельно), потом рисуем оболочку
  loadFeatures()
    .catch((error: unknown) => console.warn('[features] загрузка не удалась', error))
    .finally(() => render(root))
}
