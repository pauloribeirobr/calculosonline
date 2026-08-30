import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { blogRegistry, findPost, formatarDataPorExtenso } from '@/lib/blog'
import { findCalculator } from '@/lib/calculators'
import { buildMetadata } from '@/lib/seo'
import { CalculatorIcon } from '@/components/common/CalculatorIcon'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { BlogContentLoader } from '@/components/BlogContentLoader'
import { ArticleJsonLd, BreadcrumbJsonLd, WebPageJsonLd } from '@/components/seo/JsonLd'

export async function generateStaticParams() {
  return blogRegistry.map((p) => ({ slug: p.slug }))
}

// ISR de 24h, como as calculadoras: os posts citam tabelas legislativas e
// datas de calendário, que mudam sem o código mudar.
export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return {}

  return buildMetadata({
    title: post.tituloSeo,
    description: post.descricao,
    keywords: post.palavrasChave,
    // Cada post tem `opengraph-image.tsx` próprio, herdando a identidade da
    // calculadora que ele alimenta (mesma mecânica do F42).
    imagemPropriaDaRota: true,
    path: `/blog/${post.slug}`,
  })
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) notFound()

  const path = `/blog/${post.slug}`
  const principal = findCalculator(post.calculadoraPrincipal)
  const relacionadas = post.calculadorasRelacionadas
    .map((s) => findCalculator(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const breadcrumbItems = [
    { name: 'Início', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.titulo, path },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <WebPageJsonLd title={post.tituloSeo} description={post.descricao} path={path} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <ArticleJsonLd
        title={post.titulo}
        description={post.descricao}
        path={path}
        datePublished={post.dataPublicacao}
        dateModified={post.dataAtualizacao}
        keywords={post.palavrasChave}
        image={path}
      />

      <Breadcrumbs
        items={[{ label: 'Início', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.titulo }]}
      />

      <header>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {post.titulo}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" aria-hidden />
            <time dateTime={post.dataPublicacao}>
              {formatarDataPorExtenso(post.dataPublicacao)}
            </time>
          </span>
          {post.dataAtualizacao !== post.dataPublicacao && (
            <span>Atualizado em {formatarDataPorExtenso(post.dataAtualizacao)}</span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" aria-hidden />
            {post.tempoLeituraMin} min de leitura
          </span>
        </div>
      </header>

      {/*
        CTA para a calculadora, acima do conteúdo. O post captura a busca
        informacional ("quando cai o 13º"); quem já sabe a data e quer o número
        não deveria ter de rolar o artigo inteiro para achar a ferramenta.
      */}
      {principal && (
        <Link
          href={`/calculadora/${principal.slug}`}
          className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4 transition-colors hover:bg-brand-100 md:p-5"
        >
          <CalculatorIcon icon={principal.icone} categoria={principal.categoria} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-gray-900">{principal.titulo}</span>
            <span className="mt-0.5 block text-sm text-gray-600">
              {principal.descricaoCurta}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
        </Link>
      )}

      <BlogContentLoader slug={post.slug} />

      {relacionadas.length > 0 && (
        <section
          className="border-t border-gray-100 pt-8"
          aria-labelledby="calculadoras-relacionadas"
        >
          <h2 id="calculadoras-relacionadas" className="text-lg font-bold text-gray-900">
            Calculadoras citadas neste artigo
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relacionadas.map((calc) => (
              <li key={calc.slug}>
                <Link
                  href={`/calculadora/${calc.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <CalculatorIcon icon={calc.icone} categoria={calc.categoria} size="md" />
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900">{calc.titulo}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {calc.descricaoCurta}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-gray-500">
        <Link href="/blog" className="text-brand-600 hover:underline">
          ← Voltar para o blog
        </Link>
      </p>
    </div>
  )
}
