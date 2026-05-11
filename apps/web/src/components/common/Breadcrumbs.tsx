import Link from 'next/link'
import { siteConfig } from '@/lib/seo'

export interface BreadcrumbItem {
  label: string
  href?: string
}

function toAbsoluteUrl(href: string): string {
  if (/^https?:\/\//.test(href)) return href
  return `${siteConfig.url}${href.startsWith('/') ? href : `/${href}`}`
}

/**
 * Breadcrumbs com microdata Schema.org embutida (script JSON-LD).
 * Para a versão de microdata em-inline veja `@calculosonline/ui` Breadcrumb.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
      }
      if (item.href) listItem.item = toAbsoluteUrl(item.href)
      return listItem
    }),
  }

  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">{'>'}</span>}
              {item.href ? (
                <Link href={item.href} className="text-brand-600 hover:text-brand-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-600" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  )
}
