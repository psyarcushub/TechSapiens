import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge знает стандартные классы Tailwind; свои скругления и тени темы
// (rounded-card, shadow-float и т. д.) добавлены, чтобы последний класс побеждал.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["control", "card", "sheet"],
      shadow: ["card", "float", "pop"],
    },
  },
})

/** Склеивает классы и убирает конфликтующие: cn("px-2", active && "px-4") → "px-4". */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
