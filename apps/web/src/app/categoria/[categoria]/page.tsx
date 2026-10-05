import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CATEGORIAS,
  calculatorRegistry,
  getCalculatorsByCategory,
  type CategoriaCalc,
} from '@/lib/calculators'
import { Squares2X2Icon, ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { FERIADOS_PATH } from '@/lib/feriados'
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

/** Acima disso o snippet é cortado na SERP. */
const DESCRICAO_MAX = 160

/**
 * Meta description da categoria (F77). O template anterior ("Todas as
 * calculadoras tempo com tabelas 2026 atualizadas") ficava em 84-99
 * caracteres — o SEO Analysis do BWT de 04/10 apontou "meta description curta"
 * em 8 páginas, 7 delas categorias — e prometia tabela onde não há nenhuma
 * (Tempo, Saúde, Negócios). Agora lista as calculadoras do registry, que se
 * atualiza sozinho quando uma entra (a lição do rodapé na F68), e fica com a
 * variante mais completa que cabe em 160 caracteres.
 */
function descricaoDaCategoria(categoria: CategoriaCalc): string {
  const cat = CATEGORIAS[categoria]
  const titulos = getCalculatorsByCategory()[categoria].map((c) => c.titulo)
  const lista =
    titulos.length > 1
      ? `${titulos.slice(0, -1).join(', ')} e ${titulos[titulos.length - 1]}`
      : (titulos[0] ?? '')
  const quantas =
    titulos.length === 1 ? 'Calculadora grátis' : `${titulos.length} calculadoras grátis`
  const nucleo = `${quantas} e sem cadastro: ${lista}`
  const candidatas = [
    `${cat.descricao}. ${nucleo}, com o cálculo feito no seu navegador.`,
    `${nucleo}, com o cálculo feito no seu navegador.`,
    `${cat.descricao}. ${nucleo}.`,
    `${nucleo}.`,
  ]
  return candidatas.find((d) => d.length <= DESCRICAO_MAX) ?? `${nucleo}.`
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
    description: descricaoDaCategoria(categoria),
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
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: cat.label }]} />

      <header>
        <div className="mb-2 flex items-center gap-3">
          <CategoryIcon categoria={categoria} size="xl" />
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Calculadoras {cat.label}</h1>
        </div>
        <p className="text-gray-600">{cat.descricao} — todas gratuitas e atualizadas para 2026.</p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
        {calculadoras.map((calc) => (
          <li key={calc.slug}>
            <Link
              href={`/calculadora/${calc.slug}`}
              className="hover:border-brand-400 focus:ring-brand-500 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-sm focus:outline-none focus:ring-2"
            >
              <div className="flex items-center gap-2">
                <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="sm" />
                <h2 className="font-semibold text-gray-900">{calc.titulo}</h2>
              </div>
              <p className="line-clamp-2 text-sm text-gray-500">{calc.descricaoCurta}</p>
              <span className="text-brand-600 font-mono text-xs">
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
          className="border-brand-200 bg-brand-50 hover:bg-brand-100 flex items-center gap-4 rounded-xl border p-5 transition-colors"
        >
          <Squares2X2Icon className="text-brand-600 h-8 w-8 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-gray-900">{HUB_TRABALHISTA.titulo}</span>
            <span className="mt-1 block text-sm text-gray-600">
              {HUB_TRABALHISTA.descricaoCurta}
            </span>
          </span>
          <ArrowRightIcon className="text-brand-600 h-5 w-5 shrink-0" aria-hidden />
        </Link>
      )}

      {/* Feriados (F72): o dado que os dias úteis da calculadora de datas usam. */}
      {categoria === 'tempo' && (
        <Link
          href={FERIADOS_PATH}
          className="border-brand-200 bg-brand-50 hover:bg-brand-100 flex items-center gap-4 rounded-xl border p-5 transition-colors"
        >
          <CalendarDaysIcon className="text-brand-600 h-8 w-8 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-gray-900">Feriados nacionais</span>
            <span className="mt-1 block text-sm text-gray-600">
              Se hoje é feriado, o próximo e o calendário de 2026 e 2027, com a lei de cada data.
            </span>
          </span>
          <ArrowRightIcon className="text-brand-600 h-5 w-5 shrink-0" aria-hidden />
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
