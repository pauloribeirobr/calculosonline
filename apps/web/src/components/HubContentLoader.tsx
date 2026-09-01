import { Suspense } from 'react'

/**
 * Carrega o corpo editorial do hub trabalhista (F58), em `content/hub/`.
 *
 * Terceiro loader do projeto, e pelo mesmo motivo do `BlogContentLoader`: o
 * `import()` dinâmico do webpack agrupa por **diretório literal**, então cada
 * pasta de conteúdo precisa do seu. Um loader genérico com o diretório em
 * variável juntaria os chunks e carregaria os 20 MDX de calculadora aqui.
 *
 * O MDX é o formato certo mesmo para uma página só: as tabelas herdam o
 * wrapper rolável de `mdx-components.tsx`, que é o que impede a página de
 * rolar na horizontal no celular (F56). Conteúdo escrito como JSX nasceria com
 * exatamente o bug que o F56 corrigiu.
 */
async function loadHub(slug: string) {
  try {
    const mod = await import(`../../content/hub/${slug}.mdx`)
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

export async function HubContentLoader({ slug }: { slug: string }) {
  const content = await loadHub(slug)
  if (!content) return null

  return (
    <section className="mt-4 border-t border-gray-100 pt-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-gray-100" />}>
        {content}
      </Suspense>
    </section>
  )
}
