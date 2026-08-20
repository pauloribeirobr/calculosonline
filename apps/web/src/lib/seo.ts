import type { Metadata } from 'next'
import type { CalculadoraRegistro } from './calculators'

/**
 * Configurações globais de SEO para o calculosonline.com.br.
 * Utilizado por PageSeo, JsonLd, Breadcrumbs e sitemap.
 */

export const siteConfig = {
  name: 'Calculos Online',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://calculosonline.com.br').replace(/\/$/, ''),
  description:
    'Calculadoras online grátis e atualizadas para 2026 — trabalhistas, impostos, financeiras, investimentos, saúde e negócios.',
  twitter: '@calculosonline',
  /**
   * Imagem social padrão, servida pela convenção `app/opengraph-image.tsx`
   * (F42). Usada só onde é preciso uma URL explícita — hoje, o `image` do
   * JSON-LD de `Article`. As metatags OpenGraph/Twitter não passam por aqui:
   * quem as preenche é a própria convenção. Ver `buildMetadata`.
   */
  defaultOgImage: '/opengraph-image',
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
  /** Imagem social específica desta página. Por padrão, a do site. */
  ogImage?: string
  /**
   * `true` nas rotas que têm o próprio `opengraph-image.tsx` — hoje, as 20
   * calculadoras. Nesse caso o campo sai do objeto e quem preenche é a
   * convenção do App Router (que cobre `twitter:image` junto).
   *
   * As duas metades importam, e as duas machucaram o site:
   * - definir `openGraph.images` **sobrescreve** a convenção — foi assim que
   *   todas as páginas apontaram por meses para um `/images/og-image.png`
   *   que nunca existiu;
   * - declarar `openGraph` **sem** `images` *suprime* a herança da imagem do
   *   segmento pai — por isso `/sobre`, `/categorias` e `/contato` ficaram
   *   sem imagem nenhuma, enquanto a home (que não exporta `metadata`) tinha.
   */
  imagemPropriaDaRota?: boolean
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
  imagemPropriaDaRota,
  socialTitle,
  socialDescription,
}: BuildMetadataInput): Metadata {
  const url = toAbsoluteUrl(path)
  const canonicalUrl = canonical
    ? canonical.startsWith('http')
      ? canonical
      : toAbsoluteUrl(canonical)
    : url
  const ogTitle = socialTitle ?? title
  const ogDescription = socialDescription ?? description
  const images = imagemPropriaDaRota
    ? undefined
    : [
        {
          url: toAbsoluteUrl(ogImage ?? siteConfig.defaultOgImage),
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ]

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
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(images ? { images: images.map((i) => i.url) } : {}),
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
 *
 * Calculadoras marcadas como `atemporal` saem sem o ano — o resultado não
 * muda de um ano para o outro e o "2026" só ocupa espaço no snippet.
 */
/**
 * Teto de caracteres do title **já contando** o template do root layout
 * (" | Calculos Online", 18 caracteres). Acima disso o Google trunca o
 * snippet — e, pior, tende a reescrever o title sozinho.
 */
const TITLE_MAX = 78
const TITLE_TEMPLATE_LEN = ' | Calculos Online'.length

export function buildCalculatorTitle(calc: CalculadoraRegistro): string {
  const base = calc.tituloLongo.replace(/\s*2026$/, '')
  const nome = calc.atemporal ? base : `${base} 2026`

  // "sem Cadastro" é o USP do produto (Plano de Negócios, 1.2) e fica sempre
  // que couber. Quando não cabe, sai — custa 14 caracteres e rendeu 4
  // impressões em 3 meses (GSC 2026-08-20), enquanto o que disputa o mesmo
  // espaço nas páginas longas é o nome da calculadora e o sinônimo pelo qual
  // ela é de fato buscada (`simulação tesouro direto`, 2.9K buscas/mês).
  // Ver diário 2026-08-20 no `MEMORY.md`.
  const completo = `${nome} — Grátis, sem Cadastro`
  return completo.length + TITLE_TEMPLATE_LEN <= TITLE_MAX ? completo : `${nome} — Grátis`
}
