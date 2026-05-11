export interface BreadcrumbItem {
  label: string
  /** `undefined` indica o item atual (sem link, com `aria-current="page"`) */
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb com microdata Schema.org (BreadcrumbList) para SEO.
 * Use o último item sem `href` para indicar a página atual.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Navegação estrutural">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            className="flex items-center gap-1"
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            {i > 0 && (
              <span aria-hidden className="text-gray-300">
                /
              </span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-brand-600 hover:underline"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </a>
            ) : (
              <span
                className="font-medium text-gray-700"
                aria-current="page"
                itemProp="name"
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
