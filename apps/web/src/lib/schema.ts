import { siteConfig } from '@/lib/seo'
import { CATEGORIAS, type CalculadoraRegistro } from '@/lib/calculators'
import { getFaqFromContent } from '@/lib/faq'

/**
 * Bundle de JSON-LD por página de calculadora.
 * Inclui WebApplication, BreadcrumbList, HowTo e FAQPage — as perguntas do
 * FAQPage vêm da seção "Perguntas frequentes" do MDX de cada calculadora
 * (ver lib/faq.ts), com fallback genérico apenas se o MDX ainda não existir.
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

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Como usar a ${calc.tituloLongo}`,
    description: calc.descricao,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    totalTime: 'PT1M',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Preencha os dados',
        text: `Informe os valores solicitados no formulário da ${calc.titulo.toLowerCase()}.`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Clique em calcular',
        text: 'O resultado aparece instantaneamente, sem cadastro e sem envio de dados a servidores.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Veja o detalhamento',
        text: `Abra "Ver detalhamento do cálculo" para conferir cada etapa com base em ${calc.fonteJuridica}.`,
      },
    ],
  }

  const dataLabel = new Date(calc.dataAtualizacao + 'T12:00:00').toLocaleDateString('pt-BR')
  const faqFromContent = getFaqFromContent(calc.slug)
  const faqItems =
    faqFromContent.length > 0
      ? faqFromContent
      : [
          {
            question: `A ${calc.tituloLongo} está atualizada para 2026?`,
            answer: `Sim. As tabelas foram atualizadas em ${dataLabel} com base na legislação vigente: ${calc.fonteJuridica}.`,
          },
          {
            question: 'Os cálculos são gratuitos?',
            answer: 'Sim. Todas as calculadoras são 100% gratuitas, sem cadastro e sem limites de uso.',
          },
        ]

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return [webApp, breadcrumb, howTo, faq]
}
