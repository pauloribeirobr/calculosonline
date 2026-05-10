import Link from 'next/link'

const CALCULADORAS_DESTAQUE = [
  { slug: 'rescisao-trabalhista', titulo: 'Rescisão Trabalhista', categoria: 'Trabalhista' },
  { slug: 'ferias', titulo: 'Férias', categoria: 'Trabalhista' },
  { slug: 'decimo-terceiro', titulo: '13º Salário', categoria: 'Trabalhista' },
  { slug: 'hora-extra', titulo: 'Hora Extra', categoria: 'Trabalhista' },
  { slug: 'fgts', titulo: 'FGTS', categoria: 'Trabalhista' },
  { slug: 'salario-liquido', titulo: 'Salário Líquido', categoria: 'Trabalhista' },
] as const

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-100">
          Grátis sem cadastro
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Calculadoras Online Grátis e Atualizadas para 2026
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
          Cálculos trabalhistas, impostos, financeiros e mais. Sem cadastro, com base legal e
          tabelas atualizadas (INSS, IRRF, salário mínimo).
        </p>
      </header>

      <section aria-labelledby="calc-destaque">
        <h2 id="calc-destaque" className="text-2xl font-bold text-gray-900">
          Calculadoras em destaque (placeholder — Sprint 1.2)
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULADORAS_DESTAQUE.map((c) => (
            <li
              key={c.slug}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {c.categoria}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{c.titulo}</h3>
              <Link
                href={`/calculadora/${c.slug}`}
                className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:underline"
              >
                Abrir calculadora →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
