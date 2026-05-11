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
