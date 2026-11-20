import { Icon, cn } from '../ui'
import { product } from '../lib/product'

/** Кружок с иконкой продукта в цвете бренда. */
export function ProductMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-brand text-on-brand', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon name={product.icon} size={Math.round(size * 0.56)} fill />
    </span>
  )
}

/** Главный баннер: тёмный фон с розовым свечением, название и фраза продукта из product.json. */
export function ProductHero() {
  return (
    <section className="poster relative overflow-hidden rounded-sheet px-6 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10 lg:px-12 lg:pt-12 lg:pb-14">
      {/* кольца, как круглые фото с розовой обводкой на афишах сайта */}
      <span
        className="pointer-events-none absolute -top-10 -right-12 size-44 rounded-full ring-2 ring-brand/70 lg:size-64"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute top-24 -right-6 size-16 rounded-full ring-2 ring-brand/50 lg:top-40 lg:right-24 lg:size-20"
        aria-hidden
      />
      <div className="relative">
        <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-white/10 ring-2 ring-brand lg:size-20">
          <Icon name={product.icon} size={34} fill />
        </span>
        <h1 className="max-w-2xl text-[34px] leading-[1.05] font-semibold tracking-tight text-balance sm:text-[48px] lg:text-[60px]">
          {product.name}
        </h1>
        <p className="mt-3 max-w-xl text-[18px] leading-normal font-light text-white/85 sm:text-[20px]">
          {product.tagline}
        </p>
      </div>
    </section>
  )
}
