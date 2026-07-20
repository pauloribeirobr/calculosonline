import type { MetadataRoute } from 'next'
import { CATEGORIAS, calculatorRegistry, type CategoriaCalc } from '@/lib/calculators'
import { siteConfig } from '@/lib/seo'

// <lastmod> é sinal de freshness para o Google recrawlear. Páginas de
// calculadora usam `dataAtualizacao` do registry — a data real da última
// revisão das tabelas legislativas de cada uma, já mantida em
// lib/calculators.ts. Páginas institucionais/categoria usam uma data fixa;
// bump manual ao editar o conteúdo delas.
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
    lastModified: new Date(calc.dataAtualizacao),
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
