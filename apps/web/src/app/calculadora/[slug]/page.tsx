import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  calculatorRegistry,
  findCalculator,
  getRelacionadas,
} from '@/lib/calculators'
import { gerarSchemasCalculadora } from '@/lib/schema'
import { siteConfig } from '@/lib/seo'
import { CalculadoraPageClient } from '@/components/calculadoras/CalculadoraPageClient'
import { ContentLoader } from '@/components/ContentLoader'

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

  const title = `${calc.tituloLongo} Online e Gratuita 2026`
  const url = `${siteConfig.url}/calculadora/${calc.slug}`

  return {
    title,
    description: calc.descricao,
    keywords: calc.palavrasChave,
    openGraph: {
      title,
      description: calc.descricao,
      url,
      siteName: siteConfig.name,
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: calc.descricao,
    },
    alternates: {
      canonical: `/calculadora/${calc.slug}`,
    },
  }
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
  const schemas = gerarSchemasCalculadora(calc)

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <CalculadoraPageClient config={calc} relacionadas={relacionadas} />
      <ContentLoader slug={slug} />
    </>
  )
}
