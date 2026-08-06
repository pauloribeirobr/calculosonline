import type { Metadata } from 'next'
import type { CalculadoraRegistro } from './calculators'

/**
 * Configurações globais de SEO para o calculosonline.com.br.
 * Utilizado por PageSeo, JsonLd, Breadcrumbs e sitemap.
 */

export const siteConfig = {
  name: 'Calculos Online',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calculosonline.com.br').replace(/\/$/, ''),
  defaultOgImage: '/images/og-image.png',
  description:
    'Calculadoras online grátis e atualizadas para 2026 — trabalhistas, impostos, financeiras, investimentos, saúde e negócios.',
  twitter: '@calculosonline',
} as const

function toAbsoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`
}

interface BuildMetadataInput {
  title: string
  description: string
  path: string
  keywords?: string[]
  /**
   * Canonical alternativo (path ou URL absoluta). Use quando esta página deve
   * consolidar sinais de SEO em outra (ex.: variação de cauda longa do F23
   * apontando para a calculadora canônica), evitando canibalização entre
   * páginas do mesmo cluster de busca.
   */
  canonical?: string
  ogImage?: string
  socialTitle?: string
  socialDescription?: string
}

/**
 * Builder central de `Metadata` (F21). Usado por toda página interna (não o
 * root layout, que tem campos únicos como `metadataBase`/`icons`/título com
 * template) — garante canonical, OpenGraph e Twitter card consistentes sem
 * repetir a mesma estrutura em cada `generateMetadata`/`export const metadata`.
 * Mesmo padrão do `buildMetadata()` do Recibo Fácil (`frontend/src/lib/seo.ts`).
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  canonical,
  ogImage,
  socialTitle,
  socialDescription,
}: BuildMetadataInput): Metadata {
  const url = toAbsoluteUrl(path)
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : toAbsoluteUrl(canonical)
    : url
  const ogImageUrl = toAbsoluteUrl(ogImage ?? siteConfig.defaultOgImage)
  const ogTitle = socialTitle ?? title
  const ogDescription = socialDescription ?? description

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url,
      siteName: siteConfig.name,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  }
}

/**
 * Title da página de calculadora. `tituloLongo` já vem com "2026" para
 * algumas categorias (INSS, IRPF, DAS MEI) — remove o sufixo antes de
 * reaplicar para não duplicar o ano no title (ex: "...2026 ... 2026").
 * "Grátis, sem Cadastro" é o USP real do produto (ver Plano de Negócios,
 * seção 1.2) e diferencia o snippet do padrão genérico "Online e Gratuita"
 * repetido em todas as páginas.
 */
export function buildCalculatorTitle(calc: CalculadoraRegistro): string {
  const base = calc.tituloLongo.replace(/\s*2026$/, '')
  return `${base} 2026 — Grátis, sem Cadastro`
}
