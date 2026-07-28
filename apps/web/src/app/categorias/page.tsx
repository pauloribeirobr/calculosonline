import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CATEGORIAS,
  calculatorRegistry,
  getCalculatorsByCategory,
  type CategoriaCalc,
} from '@/lib/calculators'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CalculatorIcon, CategoryIcon } from '@/components/common/CalculatorIcon'

export const metadata: Metadata = {
  title: 'Todas as Categorias de Calculadoras',
  description: `Navegue pelas ${calculatorRegistry.length} calculadoras agrupadas por categoria: trabalhistas, impostos, financeiras, investimentos, saúde e negócios.`,
  alternates: { canonical: '/categorias' },
}

export const revalidate = false

export default function CategoriasPage() {
  const grouped = getCalculatorsByCategory()
  const categorias = Object.entries(CATEGORIAS) as [
    CategoriaCalc,
    (typeof CATEGORIAS)[CategoriaCalc],
  ][]

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: 'Categorias' },
        ]}
      />

      <header>
        <h1 className="text-3xl font-bold text-gray-900">Todas as Categorias</h1>
        <p className="mt-2 text-gray-600">
          As {calculatorRegistry.length} calculadoras agrupadas por nicho. Clique numa categoria
          para ver todas as ferramentas dela.
        </p>
      </header>

      <div className="space-y-10">
        {categorias.map(([slug, cat]) => (
          <section key={slug}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                <Link
                  href={`/categoria/${slug}`}
                  className="inline-flex items-center gap-2 hover:text-brand-700"
                >
                  <CategoryIcon categoria={slug} size="sm" />
                  {cat.label}
                </Link>
              </h2>
              <Link
                href={`/categoria/${slug}`}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                Ver todas ({grouped[slug].length}) →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grouped[slug].map((calc) => (
                <li key={calc.slug}>
                  <Link
                    href={`/calculadora/${calc.slug}`}
                    className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-900">
                      <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="sm" />
                      {calc.titulo}
                    </span>
                    <span className="line-clamp-2 text-xs text-gray-500">
                      {calc.descricaoCurta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
