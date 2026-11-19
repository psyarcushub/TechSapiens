import { Icon, cn } from '../ui'
import { product } from '../lib/product'

/** Квадратик с иконкой продукта на градиенте бренда. */
export function ProductMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center text-on-hero shadow-card', className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: 'linear-gradient(135deg, var(--brand), var(--hero-to))',
      }}
      aria-hidden
    >
      <Icon name={product.icon} size={Math.round(size * 0.58)} fill />
    </span>
  )
}

/** Главный баннер: иконка, название и фраза продукта из product.json. */
export function ProductHero() {
  return (
    <section
      className="relative overflow-hidden rounded-sheet px-6 pt-6 pb-7 text-on-hero shadow-float sm:px-8 sm:pt-8 sm:pb-9 lg:px-10 lg:pt-10 lg:pb-12"
      style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--hero-to) 100%)' }}
    >
      <span className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-white/15" aria-hidden />
      <span className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-white/10" aria-hidden />
      <div className="relative">
        <span className="mb-5 flex size-16 items-center justify-center rounded-[20px] bg-white/20 ring-1 ring-white/30 lg:size-20">
          <Icon name={product.icon} size={36} fill />
        </span>
        <h1 className="text-[30px] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-[36px] lg:text-[44px]">
          {product.name}
        </h1>
        <p className="mt-2.5 max-w-xl text-[17px] leading-snug opacity-90 sm:text-[19px]">{product.tagline}</p>
      </div>
    </section>
  )
}
