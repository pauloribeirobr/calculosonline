import type { MetadataRoute } from 'next'
import { CATEGORIAS, calculatorRegistry, type CategoriaCalc } from '@/lib/calculators'
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
const seoRefreshDate = new Date('2026-08-20')
const staticLastModified = new Date('2026-05-11')

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

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
  ]

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

  return [...mainPages, ...calculatorPages, ...categoryPages, ...institutionalPages]
}
