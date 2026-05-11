import { BreadcrumbJsonLd, FAQJsonLd, WebPageJsonLd } from './JsonLd'

interface PageSeoProps {
  title: string
  description: string
  path: string
  breadcrumbs: { name: string; path: string }[]
  faqItems?: { question: string; answer: string }[]
}

/**
 * Bundle padronizado de JSON-LD para páginas de calculadora / institucional.
 * Inclui WebPage, BreadcrumbList e (opcional) FAQPage.
 */
export function PageSeo({ title, description, path, breadcrumbs, faqItems }: PageSeoProps) {
  return (
    <>
      <WebPageJsonLd title={title} description={description} path={path} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqItems?.length ? <FAQJsonLd items={faqItems} /> : null}
    </>
  )
}
