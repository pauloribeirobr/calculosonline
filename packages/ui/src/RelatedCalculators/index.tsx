import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface RelatedItem {
  slug: string
  titulo: string
  categoria: string
  descricaoCurta: string
  /** Ícone da calculadora — ver nota em `CalculatorLayoutProps.icone` (F41). */
  icone?: ReactNode
}

export interface RelatedCalculatorsProps {
  items: RelatedItem[]
  className?: string
}

export function RelatedCalculators({ items, className }: RelatedCalculatorsProps) {
  if (items.length === 0) return null

  return (
    <aside className={cn('space-y-3', className)} aria-label="Calculadoras relacionadas">
      <h2 className="text-lg font-semibold text-gray-900">Calculadoras relacionadas</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`/calculadora/${item.slug}`}
              className={cn(
                'flex gap-3 rounded-lg border border-gray-200 bg-white p-4',
                'transition-all duration-150 hover:border-brand-400 hover:shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-brand-500',
              )}
            >
              {item.icone}
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  {item.categoria}
                </span>
                <span className="font-medium text-gray-900">{item.titulo}</span>
                <span className="line-clamp-2 text-xs text-gray-500">{item.descricaoCurta}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
