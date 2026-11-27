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
 *
 * Uma trilha por página, sempre com `@id` (27/11/2026). O `WebPage` aponta para
 * `<url>#breadcrumb`; sem o `@id` aqui, o Google criava um `BreadcrumbList` vazio
 * só com o id e acusava "O campo itemListElement não foi encontrado" (teste de
 * resultados aprimorados do `/blog`). E a maioria das páginas publicava a trilha
 * duas vezes: aqui e no `BreadcrumbJsonLd` (direto ou pelo `PageSeo`).
 * - `jsonLd={false}`: a página já publica a trilha pelo `BreadcrumbJsonLd`/`PageSeo`;
 *   este componente só desenha.
 * - `path`: a página não tem `BreadcrumbJsonLd`; a trilha daqui ganha o `@id`.
 */
export function Breadcrumbs({
  items,
  path,
  jsonLd = true,
}: {
  items: BreadcrumbItem[]
  path?: string
  jsonLd?: boolean
}) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    ...(path ? { '@id': `${toAbsoluteUrl(path)}#breadcrumb` } : {}),
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
                <Link
                  href={item.href}
                  className="text-brand-600 hover:text-brand-700 hover:underline"
                >
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
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
    </>
  )
}
