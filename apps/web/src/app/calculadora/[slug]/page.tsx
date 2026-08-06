import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  calculatorRegistry,
  findCalculator,
  getRelacionadas,
} from '@/lib/calculators'
import { buildCalculatorSchemaData } from '@/lib/schema'
import { buildCalculatorTitle, buildMetadata } from '@/lib/seo'
import { CalculadoraPageClient } from '@/components/calculadoras/CalculadoraPageClient'
import { ContentLoader } from '@/components/ContentLoader'
import {
  CalculatorJsonLd,
  BreadcrumbJsonLd,
  HowToJsonLd,
  FAQJsonLd,
} from '@/components/seo/JsonLd'

// SSG — gera todas as páginas em build time
export async function generateStaticParams() {
  return calculatorRegistry.map((c) => ({ slug: c.slug }))
}

// ISR — revalida a cada 24h para refletir mudanças nas tabelas legislativas
export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const calc = findCalculator(slug)
  if (!calc) return {}

  return buildMetadata({
    title: buildCalculatorTitle(calc),
    description: calc.descricao,
    keywords: calc.palavrasChave,
    path: `/calculadora/${calc.slug}`,
  })
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const calc = findCalculator(slug)
  if (!calc) notFound()

  const relacionadas = getRelacionadas(calc.relacionadas)
  const path = `/calculadora/${calc.slug}`
  const { breadcrumbItems, howToSteps, faqItems } = buildCalculatorSchemaData(calc)

  return (
    <>
      <CalculatorJsonLd path={path} name={calc.tituloLongo} description={calc.descricao} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <HowToJsonLd
        name={`Como usar a ${calc.tituloLongo}`}
        description={calc.descricao}
        path={path}
        steps={howToSteps}
        totalTime="PT1M"
      />
      <FAQJsonLd items={faqItems} />
      <CalculadoraPageClient config={calc} relacionadas={relacionadas} />
      <ContentLoader slug={slug} />
    </>
  )
}
