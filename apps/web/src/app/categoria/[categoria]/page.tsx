import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CATEGORIAS,
  calculatorRegistry,
  getCalculatorsByCategory,
  type CategoriaCalc,
} from '@/lib/calculators'
import { Squares2X2Icon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CalculatorIcon, CategoryIcon } from '@/components/common/CalculatorIcon'
import { PageSeo } from '@/components/seo/PageSeo'
import { ItemListJsonLd } from '@/components/seo/JsonLd'

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
  return buildMetadata({
    title: `Calculadoras ${cat.label} Online e Grátis 2026`,
    description: `${cat.descricao}. Todas as calculadoras ${cat.label.toLowerCase()} com tabelas 2026 atualizadas.`,
    path: `/categoria/${categoria}`,
  })
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
      <PageSeo
        title={`Calculadoras ${cat.label}`}
        description={`${cat.descricao} — todas gratuitas e atualizadas para 2026.`}
        path={`/categoria/${categoria}`}
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: cat.label, path: `/categoria/${categoria}` },
        ]}
      />
      <ItemListJsonLd
        items={calculadoras.map((calc) => ({
          name: calc.titulo,
          path: `/calculadora/${calc.slug}`,
          description: calc.descricaoCurta,
        }))}
      />
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: cat.label },
        ]}
      />

      <header>
        <div className="mb-2 flex items-center gap-3">
          <CategoryIcon categoria={categoria} size="xl" />
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
                <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="sm" />
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

      {/*
        O hub (F58) é a resposta para a intenção agregada que trouxe a pessoa
        até aqui: `/categoria/trabalhista` é um índice, e um índice não calcula
        nada — teve 1 pageview em 3 meses. Só na categoria que ele cobre.
      */}
      {categoria === HUB_TRABALHISTA.categoria && (
        <Link
          href={HUB_TRABALHISTA.path}
          className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5 transition-colors hover:bg-brand-100"
        >
          <Squares2X2Icon className="h-8 w-8 shrink-0 text-brand-600" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-gray-900">{HUB_TRABALHISTA.titulo}</span>
            <span className="mt-1 block text-sm text-gray-600">
              {HUB_TRABALHISTA.descricaoCurta}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
        </Link>
      )}

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
