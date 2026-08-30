import { Suspense } from 'react'

/**
 * Carrega o corpo editorial de um post do blog (F22).
 *
 * Gêmeo do `ContentLoader` das calculadoras, e separado dele de propósito: o
 * import dinâmico do webpack agrupa por diretório literal, então `content/blog`
 * e `content/calculadoras` precisam de dois `import()` distintos — um loader
 * genérico com o diretório em variável agruparia os dois chunks juntos e
 * carregaria os 20 MDX de calculadora em toda página de post.
 *
 * A diferença de estilo em relação ao das calculadoras é intencional: no post
 * o texto **é** a página (medida de leitura mais estreita, tipografia maior),
 * enquanto na calculadora ele é apoio abaixo do formulário.
 */
async function loadPost(slug: string) {
  try {
    const mod = await import(`../../content/blog/${slug}.mdx`)
    const Content = mod.default
    return (
      <article className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:text-sm">
        <Content />
      </article>
    )
  } catch {
    return null
  }
}

export async function BlogContentLoader({ slug }: { slug: string }) {
  const content = await loadPost(slug)
  if (!content) return null

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
      {content}
    </Suspense>
  )
}
