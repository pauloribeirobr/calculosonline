import { siteConfig } from '@/lib/seo'
import { CATEGORIAS, type CalculadoraRegistro } from '@/lib/calculators'

/**
 * Bundle de JSON-LD por página de calculadora.
 * Inclui WebApplication, BreadcrumbList e FAQPage (genéricas — o conteúdo
 * editorial MDX da Sprint 1.4 substituirá pelas perguntas reais).
 */
export function gerarSchemasCalculadora(calc: CalculadoraRegistro): unknown[] {
  const url = `${siteConfig.url}/calculadora/${calc.slug}`
  const categoriaLabel = CATEGORIAS[calc.categoria].label

  const webApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.tituloLongo,
    description: calc.descricao,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    provider: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteConfig.url },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoriaLabel,
        item: `${siteConfig.url}/categoria/${calc.categoria}`,
      },
      { '@type': 'ListItem', position: 3, name: calc.titulo, item: url },
    ],
  }

  const dataLabel = new Date(calc.dataAtualizacao + 'T12:00:00').toLocaleDateString('pt-BR')
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Como usar a ${calc.tituloLongo}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Preencha os campos com seus dados e clique em Calcular. O resultado aparece instantaneamente com detalhamento linha a linha baseado em ${calc.fonteJuridica}.`,
        },
      },
      {
        '@type': 'Question',
        name: `A ${calc.tituloLongo} está atualizada para 2026?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sim. As tabelas foram atualizadas em ${dataLabel} com base na legislação vigente: ${calc.fonteJuridica}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Os cálculos são gratuitos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. Todas as calculadoras são 100% gratuitas, sem cadastro e sem limites de uso.',
        },
      },
    ],
  }

  return [webApp, breadcrumb, faq]
}
