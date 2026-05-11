import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CATEGORIAS,
  calculatorRegistry,
  getCalculatorsByCategory,
  type CategoriaCalc,
} from '@/lib/calculators'
import { siteConfig } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

export async function generateStaticParams() {
  return Object.keys(CATEGORIAS).map((categoria) => ({ categoria }))
}

export const revalidate = false

function isCategoria(value: string): value is CategoriaCalc {
  return value in CATEGORIAS
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>
}): Promise<Metadata> {
  const { categoria } = await params
  if (!isCategoria(categoria)) return {}
  const cat = CATEGORIAS[categoria]
  return {
    title: `Calculadoras ${cat.label} Online e Grátis 2026`,
    description: `${cat.descricao}. Todas as calculadoras ${cat.label.toLowerCase()} com tabelas 2026 atualizadas.`,
    alternates: { canonical: `/categoria/${categoria}` },
    openGraph: {
      title: `Calculadoras ${cat.label} Online e Grátis 2026`,
      description: cat.descricao,
      url: `${siteConfig.url}/categoria/${categoria}`,
      type: 'website',
    },
  }
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  if (!isCategoria(categoria)) notFound()
  const cat = CATEGORIAS[categoria]
  const calculadoras = getCalculatorsByCategory()[categoria]

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: cat.label },
        ]}
      />

      <header>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {cat.emoji}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Calculadoras {cat.label}
          </h1>
        </div>
        <p className="text-gray-600">
          {cat.descricao} — todas gratuitas e atualizadas para 2026.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
        {calculadoras.map((calc) => (
          <li key={calc.slug}>
            <Link
              href={`/calculadora/${calc.slug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden>{calc.icone}</span>
                <h2 className="font-semibold text-gray-900">{calc.titulo}</h2>
              </div>
              <p className="line-clamp-2 text-sm text-gray-500">{calc.descricaoCurta}</p>
              <span className="font-mono text-xs text-brand-600">
                {calc.fonteJuridica.split('|')[0]?.trim()}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-center text-sm text-gray-500">
        Quer outra categoria?{' '}
        <Link href="/categorias" className="text-brand-600 hover:underline">
          Ver todas
        </Link>{' '}
        — {calculatorRegistry.length} calculadoras no total.
      </p>
    </main>
  )
}
