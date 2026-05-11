import Link from 'next/link'
import {
  CATEGORIAS_LABEL,
  calculatorRegistry,
  calculatorsFeatured,
  type CategoriaCalc,
} from '@/lib/calculators'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'

const categoriaCor: Record<CategoriaCalc, { bg: string; border: string; text: string }> = {
  trabalhista: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
  },
  impostos: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
  financeiro: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
  investimentos: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-700',
  },
  saude: { bg: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-700' },
  negocios: { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-700' },
}

export function CalculatorTypes() {
  return (
    <section id="calculadoras" className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            20 calculadoras disponíveis
          </span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Escolha a calculadora que você precisa
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Todas grátis, sem cadastro, com tabelas oficiais atualizadas para 2026 e base legal
            explícita em cada resultado.
          </p>
        </div>

        {/* Destaques (3 mais buscadas) */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Mais buscadas
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {calculatorsFeatured.map((calc) => {
              const cor = categoriaCor[calc.categoria]
              return (
                <Link
                  key={calc.slug}
                  href={`/calculadora/${calc.slug}`}
                  className={`group rounded-xl border-2 ${cor.border} ${cor.bg} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="lg" />
                  <h4 className="mt-3 text-lg font-bold text-gray-900">{calc.titulo}</h4>
                  <p className="mt-1 text-sm text-gray-600">{calc.descricaoCurta}</p>
                  <span
                    className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${cor.text}`}
                  >
                    Abrir calculadora →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Grid completo */}
        <div className="mt-16">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Todas as calculadoras
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {calculatorRegistry.map((calc) => {
              const cor = categoriaCor[calc.categoria]
              return (
                <Link
                  key={calc.slug}
                  href={`/calculadora/${calc.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="md" />
                    <span
                      className={`rounded-full ${cor.bg} px-2 py-0.5 text-[10px] font-semibold uppercase ${cor.text}`}
                    >
                      {CATEGORIAS_LABEL[calc.categoria]}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-gray-900 group-hover:text-brand-700">
                    {calc.titulo}
                  </h4>
                  <p className="text-xs text-gray-500">{calc.descricaoCurta}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
