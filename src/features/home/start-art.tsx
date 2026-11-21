import { useId } from 'react'

export function StartArt() {
  const skyId = useId()

  return (
    <svg
      className="pointer-events-none block h-full w-full"
      viewBox="0 0 560 440"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={skyId} x2="0" y2="1">
          <stop stopColor="var(--chart-4)" />
          <stop offset=".56" stopColor="var(--chart-2)" />
          <stop offset="1" stopColor="var(--warning-soft)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${skyId})`} d="M0 0h560v440H0z" />
      <circle cx="388" cy="157" r="83" fill="var(--warning-soft)" />
      <path d="M323 106h131M311 127h155M305 148h166" stroke="var(--chart-2)" strokeWidth="2" opacity=".45" />
      <g fill="var(--on-ink)" opacity=".85">
        <path d="M32 126c30-8 26-23 48-25 13-2 22 5 30 12 26-9 42-5 63 13H32z" />
        <path d="M405 220c27-8 34-23 58-25 17-1 21 6 28 12 23-4 35 4 42 13H405z" />
        <path d="M164 82h78c-10-10-20-13-31-9-10-13-25-11-32 2-8 0-12 3-15 7z" />
      </g>
      <g stroke="var(--on-ink)" strokeLinecap="round">
        <path strokeWidth="2" d="M68 70h22m-11-11v22M277 64h14m-7-7v14M493 108h21m-10-10v21M96 227h14m-7-7v14" />
        <path opacity=".4" d="M35 143c162-55 354-48 483 27M45 152c128-34 303-27 437 30" />
      </g>

      {/* Дальние холмы и дорожка, которая изгибается в воздухе. */}
      <path d="M0 296 58 268l55 13 66-33 80 32 72-27 59 16 60-43 110 47v167H0z" fill="var(--chart-4)" />
      <path d="m179 248 35 34 45-2-30-12zm271-22-21 38 55-17z" fill="var(--chart-3)" />
      <path d="M0 316c97-40 186-17 274-20 118-3 190-52 286-23v167H0z" fill="var(--chart-1)" />
      <path d="M173 440c-50-49-9-88 105-108 127-22 173-18 198-58 42-2 54 0 84 6v31c-42 37-99 56-184 76-66 15-70 34-55 53z" fill="var(--chart-4)" />
      <g stroke="var(--accent-line)" strokeWidth="2" opacity=".8">
        <path d="M220 440c-55-65 44-89 119-101 95-15 142-30 163-65" />
        <path d="M267 440c-34-54 27-73 98-86 93-17 142-41 165-79" />
      </g>
      <ellipse cx="285" cy="300" rx="83" ry="8" fill="var(--chart-4)" opacity=".45" />

      <g transform="translate(320 87) rotate(-16) scale(.52)" fill="var(--warning-soft)" color="var(--chart-3)">
        <FlyingShoe />
      </g>
      <g transform="translate(98 158) rotate(-12 145 60)" fill="var(--on-ink)" color="var(--chart-2)">
        <FlyingShoe />
        <path d="M9 77C-10 87-24 86-38 80m53 13c-19 10-38 13-53 8" stroke="var(--on-ink)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Циферблаты свисают с края, как мягкая ткань. */}
      <path d="m0 345 69-18 48 12-72 22z" fill="var(--chart-2)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M0 345l45 16 72-22v101H0z" fill="var(--ink-2)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M45 361v79" stroke="var(--chart-3)" strokeWidth="2" />
      <g transform="translate(56 312) rotate(-9)">
        <SoftClock />
      </g>
      <g transform="translate(475 324) rotate(18) scale(.67)">
        <SoftClock />
      </g>
    </svg>
  )
}

function FlyingShoe() {
  return (
    <g stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 86 33 35c3-13 14-18 24-11l18 12c13 8 33 4 44-5l10-9c8-8 19-8 24 4l29 44c20 7 48 6 72 14 22 7 33 20 30 31l-8 13-246-10z" />
      <path d="M25 82 35 47l32 12-9 38M107 38l38-19 41 54-29 15-38-41z" fill="currentColor" />
      <path d="M67 95c28-23 49-23 68-17 16 5 27 16 49 14l-2 11c-25 5-36-7-51-11-15-4-33 0-55 13z" fill="currentColor" />
      <path d="M133 38l24-7m-16 19 24-7m-17 19 25-7m-17 19 25-7M215 89l2 1m10 1 2 1m10 1 2 1" />
      <path d="M20 102c33 3 59 13 96 15 50 3 106 10 166-6 5 7 4 18-4 21-40 18-116 12-161 8-40-3-75-11-94-16-9-2-11-14-3-22z" fill="var(--warning-soft)" />
      <path d="m39 124 4-8m12 12 4-8m13 11 4-7m132 14 3-7m12 6 3-8m13 6 3-8" strokeWidth="2" />
    </g>
  )
}

function SoftClock() {
  return (
    <g stroke="var(--ink)" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12C15-1 45-3 66 6c16 7 18 20 13 31-5 12-22 16-26 29-5 13 5 35-12 39-16 3-25-17-24-34 1-17-2-22-10-31-9-10-10-18-2-28z" transform="translate(4 4)" fill="var(--ink)" strokeWidth="3" />
      <path d="M5 12C15-1 45-3 66 6c16 7 18 20 13 31-5 12-22 16-26 29-5 13 5 35-12 39-16 3-25-17-24-34 1-17-2-22-10-31-9-10-10-18-2-28z" fill="var(--warning-soft)" strokeWidth="3" />
      <path d="m42 12 1 5m25 9-5 2M13 25l5 2m5 19 4-2m30-4-4-3M37 79l1 7m-2-52 9-11m-9 11 3 23" strokeWidth="2.5" />
      <circle cx="36" cy="34" r="3" fill="var(--chart-1)" />
    </g>
  )
}
