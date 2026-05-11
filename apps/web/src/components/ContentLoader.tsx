import { Suspense } from 'react'

/**
 * Carrega o conteúdo editorial MDX de uma calculadora de forma assíncrona.
 * Os arquivos MDX ficam em apps/web/content/calculadoras/[slug].mdx.
 * Se o arquivo não existir ainda, exibe uma mensagem placeholder.
 */
async function loadContent(slug: string) {
  try {
    // Importação dinâmica — webpack agrupa todos os .mdx de content/calculadoras/
    const mod = await import(`../../content/calculadoras/${slug}.mdx`)
    const Content = mod.default
    return (
      <article className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:text-sm">
        <Content />
      </article>
    )
  } catch {
    // Conteúdo ainda não criado — silencioso em produção
    return null
  }
}

export async function ContentLoader({ slug }: { slug: string }) {
  const content = await loadContent(slug)
  if (!content) return null

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 border-t border-gray-100 mt-4">
      <Suspense fallback={<div className="animate-pulse h-64 rounded-xl bg-gray-100" />}>
        {content}
      </Suspense>
    </section>
  )
}
