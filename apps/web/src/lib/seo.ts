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
