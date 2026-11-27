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
      <article className="prose prose-gray prose-headings:scroll-mt-20 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:text-sm max-w-none">
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

  // Sem <Suspense> (27/11/2026): o MDX já foi aguardado acima, então o limite não protegia nada e
  // só fazia o HTML sair com um bloco cinza de 256 px (fallback) e o texto num bloco oculto,
  // trocados por script. Quando o navegador pintava antes da troca, o texto empurrava a página:
  // CLS de até 0,20 e LCP de 4,2–4,5 s no post do 13º proporcional (PageSpeed, celular).
  return content
}
