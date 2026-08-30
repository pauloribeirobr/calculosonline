import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline'
import { postsOrdenados, formatarDataPorExtenso } from '@/lib/blog'
import { findCalculator } from '@/lib/calculators'
import { buildMetadata } from '@/lib/seo'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ItemListJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd'

const titulo = 'Blog — Guias de Cálculo Trabalhista, Impostos e Finanças'
const descricao =
  'Guias práticos sobre 13º salário, férias, rescisão, INSS e imposto de renda, com tabelas e exemplos calculados. Todos os números saem das nossas calculadoras.'

export const metadata: Metadata = buildMetadata({
  title: titulo,
  description: descricao,
  path: '/blog',
  keywords: ['blog calculadoras', 'guia 13º salário', 'guia trabalhista', 'como calcular'],
})

export default function BlogPage() {
  const posts = postsOrdenados()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <WebPageJsonLd title={titulo} description={descricao} path="/blog" />
      <ItemListJsonLd
        items={posts.map((p) => ({
          name: p.titulo,
          path: `/blog/${p.slug}`,
          description: p.resumo,
        }))}
      />

      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Blog' }]} />

      <header>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">Blog</h1>
        <p className="mt-3 text-base text-gray-600 md:text-lg">
          Guias práticos sobre direitos trabalhistas, impostos e finanças pessoais. Cada
          artigo traz tabelas e exemplos com números fechados — todos gerados pelas mesmas
          calculadoras do site, não estimados à mão.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-gray-600">Nenhum artigo publicado ainda.</p>
      ) : (
        <ul className="space-y-5">
          {posts.map((post) => {
            const calc = findCalculator(post.calculadoraPrincipal)
            return (
              <li key={post.slug}>
                <article className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-sm md:p-6">
                  <div className="flex items-start gap-4">
                    {calc && (
                      <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="lg" />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-brand-700 hover:underline"
                        >
                          {post.titulo}
                        </Link>
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 md:text-base">
                        {post.resumo}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-4 w-4" aria-hidden />
                          <time dateTime={post.dataPublicacao}>
                            {formatarDataPorExtenso(post.dataPublicacao)}
                          </time>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <ClockIcon className="h-4 w-4" aria-hidden />
                          {post.tempoLeituraMin} min de leitura
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
