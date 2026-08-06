import { CATEGORIAS, type CalculadoraRegistro } from '@/lib/calculators'
import { getFaqFromContent } from '@/lib/faq'

/**
 * Dados de JSON-LD por página de calculadora (Sprint 1.3, migrado no F21
 * para consumir a biblioteca de componentes `components/seo/JsonLd.tsx` em
 * vez de duplicar os schemas à mão — o breadcrumb passa a ganhar `@id`,
 * igual ao resto do site). As perguntas do FAQPage vêm da seção "Perguntas
 * frequentes" do MDX de cada calculadora (ver lib/faq.ts), com fallback
 * genérico apenas se o MDX ainda não existir.
 */
export function buildCalculatorSchemaData(calc: CalculadoraRegistro) {
  const categoriaLabel = CATEGORIAS[calc.categoria].label

  const breadcrumbItems = [
    { name: 'Início', path: '/' },
    { name: categoriaLabel, path: `/categoria/${calc.categoria}` },
    { name: calc.titulo, path: `/calculadora/${calc.slug}` },
  ]

  const howToSteps = [
    {
      name: 'Preencha os dados',
      text: `Informe os valores solicitados no formulário da ${calc.titulo.toLowerCase()}.`,
    },
    {
      name: 'Clique em calcular',
      text: 'O resultado aparece instantaneamente, sem cadastro e sem envio de dados a servidores.',
    },
    {
      name: 'Veja o detalhamento',
      text: `Abra "Ver detalhamento do cálculo" para conferir cada etapa com base em ${calc.fonteJuridica}.`,
    },
  ]

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

  return { breadcrumbItems, howToSteps, faqItems }
}
