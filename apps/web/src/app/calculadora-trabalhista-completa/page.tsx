import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalBadge, UpdatedBadge } from '@calculosonline/ui'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { CATEGORIAS, findCalculator } from '@/lib/calculators'
import { getFaqDoHub } from '@/lib/faq'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CalculatorIcon, CategoryIcon } from '@/components/common/CalculatorIcon'
import { HubContentLoader } from '@/components/HubContentLoader'
import { PanoramaTrabalhistaClient } from './PanoramaTrabalhistaClient'
import {
  BreadcrumbJsonLd,
  CalculatorJsonLd,
  FAQJsonLd,
  ItemListJsonLd,
  WebPageJsonLd,
} from '@/components/seo/JsonLd'

// ISR de 24h, como as calculadoras e o blog: o conteúdo cita tabelas de INSS e
// IRRF, que mudam sem o código mudar.
export const revalidate = 86400

export const metadata: Metadata = buildMetadata({
  title: HUB_TRABALHISTA.tituloSeo,
  description: HUB_TRABALHISTA.descricao,
  keywords: [...HUB_TRABALHISTA.palavrasChave, ...HUB_TRABALHISTA.sinonimos],
  imagemPropriaDaRota: true,
  path: HUB_TRABALHISTA.path,
})

export default function HubTrabalhistaPage() {
  const encadeadas = HUB_TRABALHISTA.calculadorasEncadeadas
    .map((slug) => findCalculator(slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const breadcrumbItems = [
    { name: 'Início', path: '/' },
    { name: CATEGORIAS[HUB_TRABALHISTA.categoria].label, path: '/categoria/trabalhista' },
    { name: HUB_TRABALHISTA.titulo, path: HUB_TRABALHISTA.path },
  ]

  // As perguntas saem do próprio MDX, como nas 20 calculadoras (F10) — sem
  // fallback genérico: se a seção sumir do conteúdo, o schema some junto, em
  // vez de declarar um FAQ que a página não tem.
  const faqItems = getFaqDoHub('trabalhista-completa')

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <WebPageJsonLd
        title={HUB_TRABALHISTA.tituloSeo}
        description={HUB_TRABALHISTA.descricao}
        path={HUB_TRABALHISTA.path}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <CalculatorJsonLd
        path={HUB_TRABALHISTA.path}
        name={HUB_TRABALHISTA.titulo}
        description={HUB_TRABALHISTA.descricao}
      />
      {faqItems.length > 0 && <FAQJsonLd items={faqItems} />}
      {/*
        `ItemList` das quatro calculadoras encadeadas: é o vocabulário que diz
        "esta página agrega estas outras", que é exatamente a relação que o
        Google e um modelo de IA precisam entender para não tratar o hub como
        duplicata da rescisão.
      */}
      <ItemListJsonLd
        items={encadeadas.map((calc) => ({
          name: calc.tituloLongo,
          path: `/calculadora/${calc.slug}`,
          description: calc.descricaoCurta,
        }))}
      />

      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: CATEGORIAS[HUB_TRABALHISTA.categoria].label, href: '/categoria/trabalhista' },
          { label: HUB_TRABALHISTA.titulo },
        ]}
      />

      <header>
        <div className="flex items-start gap-3 md:gap-4">
          <CategoryIcon categoria={HUB_TRABALHISTA.categoria} size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
              {HUB_TRABALHISTA.h1}
            </h1>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {HUB_TRABALHISTA.descricao}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <LegalBadge fonteJuridica={HUB_TRABALHISTA.fonteJuridica} />
          <UpdatedBadge dataAtualizacao={HUB_TRABALHISTA.dataAtualizacao} />
        </div>
      </header>

      <PanoramaTrabalhistaClient />

      <HubContentLoader slug="trabalhista-completa" />

      <section aria-labelledby="calculadoras-do-hub" className="border-t border-gray-100 pt-8">
        <h2 id="calculadoras-do-hub" className="text-lg font-bold text-gray-900">
          As calculadoras deste cálculo, uma a uma
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Cada uma tem parâmetros que o fluxo único não cabe — faltas no período
          aquisitivo, abono pecuniário, parcela do 13º, saque-aniversário.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {encadeadas.map((calc) => (
            <li key={calc.slug}>
              <Link
                href={`/calculadora/${calc.slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="md" />
                <span className="min-w-0">
                  <span className="block font-medium text-gray-900">{calc.tituloLongo}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {calc.descricaoCurta}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
