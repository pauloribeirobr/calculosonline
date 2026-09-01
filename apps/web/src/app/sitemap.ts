import type { MetadataRoute } from 'next'
import { CATEGORIAS, calculatorRegistry, type CategoriaCalc } from '@/lib/calculators'
import { blogRegistry, ultimaAtualizacaoDoBlog } from '@/lib/blog'
import { HUB_TRABALHISTA } from '@/lib/hubTrabalhista'
import { siteConfig } from '@/lib/seo'

// <lastmod> é sinal de freshness para o Google recrawlear. `dataAtualizacao` do
// registry é a data de revisão das tabelas legislativas (também exibida ao
// usuário como selo de confiança) — não pode ser usada sozinha como lastmod,
// senão mudança de SEO (title/FAQ/schema) sem alteração das tabelas não
// sinaliza recrawl nenhum. `seoRefreshDate` é bumpada manualmente sempre que
// title/description/schema muda em todas as calculadoras (2026-07-19: title
// único + FAQPage real, ver AGENTS.md Sprint 1.4.2); o lastmod de cada
// calculadora usa a mais recente entre as duas. Páginas institucionais/
// categoria usam `staticLastModified`; bump manual ao editar o conteúdo delas.
// 2026-08-20: F38/F39 (title, H1, description e MDX de 6 calculadoras) e
// F41/F42 (ícone no header das 20, og-image própria por calculadora).
// 2026-08-27: F43 (escultura de link interno — `relacionadas` reordenadas nas
// 20, rodapé reduzido a 8 destaques + categorias, e 20 links contextuais novos
// dentro dos MDX) e F44 (redirects de URLs quebradas). Muda a estrutura de
// links de todas as páginas, que é justamente o que o Google precisa recrawlear.
// 2026-08-27 (mesma data): F47/F49 acrescentaram 8 tabelas de referência e 14
// exemplos resolvidos em 5 MDX, e F48 mudou o formulário da hora extra.
// 2026-08-31: F58 (hub trabalhista) acrescentou um link novo ao rodapé de
// todas as páginas e um CTA no fim das quatro calculadoras que ele encadeia —
// muda a estrutura de links do site inteiro, que é o que o Google recrawleia.
const seoRefreshDate = new Date('2026-08-31')
const staticLastModified = new Date('2026-05-11')

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url
  const hubLastModified = new Date(
    Math.max(
      new Date(HUB_TRABALHISTA.dataAtualizacao).getTime(),
      seoRefreshDate.getTime(),
    ),
  )

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      // Hub do blog (F22). `lastModified` sai do post mais recente, não de uma
      // constante: publicar um post novo tem de mover o lastmod do hub sozinho.
      url: `${baseUrl}/blog`,
      lastModified: ultimaAtualizacaoDoBlog(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      // Hub trabalhista (F58). Prioridade 0.9, o mesmo patamar de uma
      // calculadora não-featured: ele é ferramenta, não índice — a `/categorias`
      // e a `/blog` ficam abaixo porque só listam.
      url: `${baseUrl}${HUB_TRABALHISTA.path}`,
      lastModified: hubLastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]

  // Posts do blog (F22). Prioridade 0.7: abaixo das calculadoras, que são o
  // produto, e no mesmo patamar das categorias. `changeFrequency: 'yearly'`
  // seria mentira para conteúdo sazonal — o post do 13º é revisado todo ano
  // antes da janela de nov/dez —, então 'monthly'.
  const blogPages: MetadataRoute.Sitemap = blogRegistry.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.dataAtualizacao),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const calculatorPages: MetadataRoute.Sitemap = calculatorRegistry.map((calc) => ({
    url: `${baseUrl}/calculadora/${calc.slug}`,
    lastModified: new Date(Math.max(new Date(calc.dataAtualizacao).getTime(), seoRefreshDate.getTime())),
    changeFrequency: 'monthly',
    priority: calc.featured ? 0.95 : 0.9,
  }))

  const categoryPages: MetadataRoute.Sitemap = (Object.keys(CATEGORIAS) as CategoriaCalc[]).map(
    (categoria) => ({
      url: `${baseUrl}/categoria/${categoria}`,
      lastModified: staticLastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  )

  const institutionalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/sobre`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: staticLastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      // Canônica de /privacidade (que apenas redireciona) — só a canônica entra no sitemap.
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified: staticLastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  return [...mainPages, ...calculatorPages, ...blogPages, ...categoryPages, ...institutionalPages]
}
