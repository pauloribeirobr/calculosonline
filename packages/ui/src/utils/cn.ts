import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classnames com `clsx` (suporte a condicionais/arrays) e resolve
 * conflitos do Tailwind com `twMerge` (ex.: `px-2` + `px-4` mantém apenas o último).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
