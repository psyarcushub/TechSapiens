import type { ComponentType } from 'react'
import type { ProductScreen } from '../lib/product'
import { ScreenBlocks } from './ScreenBlocks'

// Первая версия продукта. Гермес выбирает стартап и описывает 3–5 экранов в
// src/product.json вместе с их содержимым (блоки с демо-данными). Пока у экрана
// нет своей функции, сайт рисует его из этих блоков; функция с тем же id
// заменяет экран сама (см. registry.ts). На сайте только сам продукт: об игре,
// боте и промптах участникам рассказывают бот и канал.

/** Компонент страницы для экрана первой версии. */
export function wireframeComponent(screen: ProductScreen): ComponentType {
  function WireframePage() {
    return <WireframeScreen screen={screen} />
  }
  return WireframePage
}

/** Экран первой версии: его содержимое из блоков. */
export function WireframeScreen({ screen }: { screen: ProductScreen }) {
  if (screen.blocks.length > 0) {
    return <ScreenBlocks blocks={screen.blocks} screenId={screen.id} />
  }
  return <p className="text-[17px] leading-relaxed text-muted">{screen.purpose}</p>
}
