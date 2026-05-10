import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const CALCULADORAS = [
  'rescisao-trabalhista',
  'ferias',
  'decimo-terceiro',
  'hora-extra',
  'fgts',
  'salario-liquido',
] as const

type Slug = (typeof CALCULADORAS)[number]

function isSlug(value: string): value is Slug {
  return (CALCULADORAS as readonly string[]).includes(value)
}

export async function generateStaticParams() {
  return CALCULADORAS.map((slug) => ({ slug }))
}

// ISR: revalida a cada 24h para refletir mudanças nas tabelas legislativas
export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const titulo = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
  return {
    title: `Calculadora de ${titulo} Online e Gratuita`,
    description: `Calcule ${titulo.toLowerCase()} online de forma gratuita, precisa e atualizada com a legislação vigente em 2026.`,
  }
}

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!isSlug(slug)) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Calculadora: <span className="text-brand-700">{slug}</span>
      </h1>
      <p className="mt-4 text-gray-600">
        Em desenvolvimento — implementação completa na Sprint 1.2 (UI) e Sprint 1.3 (página).
      </p>
    </main>
  )
}
