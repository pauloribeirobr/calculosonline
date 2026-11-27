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
      <article className="prose prose-gray prose-headings:scroll-mt-20 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-table:text-sm max-w-none">
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

  // Sem <Suspense> (27/11/2026): o MDX já foi aguardado acima, então o limite não protegia nada e
  // só fazia o HTML sair com um bloco cinza de 256 px (fallback) e o texto num bloco oculto,
  // trocados por script. Quando o navegador pintava antes da troca, o texto empurrava a página:
  // CLS de até 0,20 e LCP de 4,2–4,5 s no post do 13º proporcional (PageSpeed, celular).
  return (
    <section className="mx-auto mt-4 max-w-4xl border-t border-gray-100 px-4 py-8">
      {content}
    </section>
  )
}
