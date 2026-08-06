import { siteConfig } from '@/lib/seo'

interface JsonLdProps {
  data: Record<string, unknown>
}

interface BreadcrumbItem {
  name: string
  path: string
}

function toAbsoluteUrl(value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${siteConfig.url}${value.startsWith('/') ? value : `/${value}`}`
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteConfig.url}#website`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: { '@id': `${siteConfig.url}#organization` },
        inLanguage: 'pt-BR',
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteConfig.url}#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/images/logo.svg`,
        description: siteConfig.description,
        sameAs: [siteConfig.url],
      }}
    />
  )
}

export function WebPageJsonLd({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  const url = toAbsoluteUrl(path)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        name: title,
        description,
        url,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': `${siteConfig.url}#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      }}
    />
  )
}

/**
 * JSON-LD para páginas de calculadora individual (Sprint 1.3).
 * Tipo `WebApplication` com `applicationCategory: UtilitiesApplication` e
 * preço zero, sinalizando ao Google que é uma ferramenta gratuita.
 */
export function CalculatorJsonLd({
  path,
  name,
  description,
}: {
  path: string
  name: string
  description: string
}) {
  const url = toAbsoluteUrl(path)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${url}#webapp`,
        name,
        description,
        url,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'BRL',
        },
        publisher: { '@id': `${siteConfig.url}#organization` },
      }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const normalized = items.map((item) => ({
    name: item.name,
    url: toAbsoluteUrl(item.path),
  }))
  const lastUrl = normalized[normalized.length - 1]?.url ?? siteConfig.url
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${lastUrl}#breadcrumb`,
        itemListElement: normalized.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}

export function FAQJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  )
}

/**
 * JSON-LD `HowTo` (F21). Antes vivia hardcoded em `lib/schema.ts` só para as
 * páginas de calculadora — movido pra cá para compor com o resto da
 * biblioteca (mesmo `@id`/`mainEntityOfPage` linkado ao `WebPage`) e ficar
 * reutilizável por outras páginas passo-a-passo no futuro.
 */
export function HowToJsonLd({
  name,
  description,
  path,
  steps,
  totalTime,
}: {
  name: string
  description: string
  path: string
  steps: { name: string; text: string }[]
  totalTime?: string
}) {
  const url = toAbsoluteUrl(path)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name,
        description,
        url,
        inLanguage: 'pt-BR',
        isAccessibleForFree: true,
        totalTime,
        mainEntityOfPage: { '@id': `${url}#webpage` },
        step: steps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }}
    />
  )
}

/**
 * JSON-LD `ItemList` (F21). Para páginas de listagem (`/categorias`,
 * `/categoria/[categoria]`) — sinaliza ao Google a ordem e o total de itens
 * de uma coleção, útil para rich results de lista e para GEO (IA lendo a
 * estrutura da página).
 */
export function ItemListJsonLd({
  items,
}: {
  items: { name: string; path: string; description?: string }[]
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: toAbsoluteUrl(item.path),
          description: item.description,
        })),
      }}
    />
  )
}

/**
 * JSON-LD `Article` (F21). Ainda sem consumidor (blog é o F22, backlog),
 * mas entra agora para fechar a paridade com a biblioteca do Recibo Fácil
 * e não bloquear o F22 numa nova rodada de JsonLd.tsx.
 */
export function ArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  keywords,
  image,
}: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  keywords?: string[]
  image?: string
}) {
  const url = toAbsoluteUrl(path)
  const imageUrl = toAbsoluteUrl(image ?? siteConfig.defaultOgImage)
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: title,
        description,
        url,
        datePublished,
        dateModified: dateModified ?? datePublished,
        inLanguage: 'pt-BR',
        author: { '@id': `${siteConfig.url}#organization` },
        publisher: { '@id': `${siteConfig.url}#organization` },
        image: { '@type': 'ImageObject', url: imageUrl },
        mainEntityOfPage: { '@id': `${url}#webpage` },
        keywords: keywords?.join(', '),
      }}
    />
  )
}
