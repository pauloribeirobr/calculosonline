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
