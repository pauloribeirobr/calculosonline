/**
 * Registry canônico das 20 calculadoras do MVP (Sprint 1.1).
 * Drive de Navigation, Footer, CalculatorTypes e RelatedCalculators.
 *
 * Cada entrada define o slug (URL), título exibido, descrição curta e a
 * categoria. Marcações `featured: true` aparecem em destaque na home.
 */

export type CategoriaCalc =
  | 'trabalhista'
  | 'impostos'
  | 'financeiro'
  | 'investimentos'
  | 'saude'
  | 'negocios'

export interface CalculadoraRegistro {
  slug: string
  titulo: string
  descricaoCurta: string
  categoria: CategoriaCalc
  /** Emoji ou ícone descritivo curto */
  icone: string
  featured?: boolean
}

export const CATEGORIAS_LABEL: Record<CategoriaCalc, string> = {
  trabalhista: 'Trabalhistas',
  impostos: 'Impostos',
  financeiro: 'Financeiras',
  investimentos: 'Investimentos',
  saude: 'Saúde',
  negocios: 'Negócios',
}

export const calculatorRegistry: CalculadoraRegistro[] = [
  // Trabalhistas
  {
    slug: 'rescisao-trabalhista',
    titulo: 'Rescisão Trabalhista',
    descricaoCurta: 'Saldo, aviso, férias, 13º, FGTS e multa.',
    categoria: 'trabalhista',
    icone: '🧾',
    featured: true,
  },
  {
    slug: 'ferias',
    titulo: 'Férias',
    descricaoCurta: 'Férias + 1/3 com INSS e IRRF.',
    categoria: 'trabalhista',
    icone: '🏖️',
  },
  {
    slug: 'decimo-terceiro',
    titulo: '13º Salário',
    descricaoCurta: '1ª e 2ª parcelas com descontos.',
    categoria: 'trabalhista',
    icone: '🎁',
  },
  {
    slug: 'hora-extra',
    titulo: 'Hora Extra',
    descricaoCurta: 'Acréscimo de 50% / 100% sobre a hora.',
    categoria: 'trabalhista',
    icone: '⏱️',
  },
  {
    slug: 'fgts',
    titulo: 'FGTS',
    descricaoCurta: 'Depósito, saldo, multa e saque-aniversário.',
    categoria: 'trabalhista',
    icone: '🏦',
  },
  {
    slug: 'salario-liquido',
    titulo: 'Salário Líquido',
    descricaoCurta: 'Bruto menos INSS, IRRF e VT.',
    categoria: 'trabalhista',
    icone: '💼',
    featured: true,
  },

  // Impostos
  {
    slug: 'inss',
    titulo: 'INSS',
    descricaoCurta: 'CLT, autônomo, facultativo e MEI.',
    categoria: 'impostos',
    icone: '🇧🇷',
  },
  {
    slug: 'irrf',
    titulo: 'IRRF',
    descricaoCurta: 'Imposto retido na fonte mensal.',
    categoria: 'impostos',
    icone: '📊',
  },
  {
    slug: 'irpf',
    titulo: 'IRPF',
    descricaoCurta: 'Declaração anual: simplificado × completo.',
    categoria: 'impostos',
    icone: '📑',
    featured: true,
  },
  {
    slug: 'das-mei',
    titulo: 'DAS MEI',
    descricaoCurta: 'INSS + ICMS/ISS fixos do MEI.',
    categoria: 'impostos',
    icone: '🪪',
  },

  // Financeiras
  {
    slug: 'porcentagem',
    titulo: 'Porcentagem',
    descricaoCurta: '6 modos: percentual, variação, desconto.',
    categoria: 'financeiro',
    icone: '％',
  },
  {
    slug: 'juros-compostos',
    titulo: 'Juros Compostos',
    descricaoCurta: 'Capital, aporte e evolução do montante.',
    categoria: 'financeiro',
    icone: '📈',
    featured: true,
  },
  {
    slug: 'emprestimo',
    titulo: 'Empréstimo',
    descricaoCurta: 'Sistemas Price e SAC com seguro.',
    categoria: 'financeiro',
    icone: '💳',
  },
  {
    slug: 'financiamento',
    titulo: 'Financiamento',
    descricaoCurta: 'Tabela Price/SAC e CET anual.',
    categoria: 'financeiro',
    icone: '🏠',
  },

  // Investimentos
  {
    slug: 'cdb',
    titulo: 'CDB',
    descricaoCurta: '% do CDI, prefixado ou IPCA+ líquido.',
    categoria: 'investimentos',
    icone: '💰',
  },
  {
    slug: 'poupanca',
    titulo: 'Poupança',
    descricaoCurta: 'Regra antiga ou nova (SELIC + TR).',
    categoria: 'investimentos',
    icone: '🐷',
  },
  {
    slug: 'tesouro-direto',
    titulo: 'Tesouro Direto',
    descricaoCurta: 'SELIC, Prefixado e IPCA+ com custódia.',
    categoria: 'investimentos',
    icone: '🏛️',
  },

  // Saúde
  {
    slug: 'imc',
    titulo: 'IMC',
    descricaoCurta: 'Índice de massa corporal e classificação.',
    categoria: 'saude',
    icone: '⚖️',
    featured: true,
  },
  {
    slug: 'calorias',
    titulo: 'Calorias',
    descricaoCurta: 'TMB, TDEE e meta calórica com macros.',
    categoria: 'saude',
    icone: '🥗',
  },

  // Negócios
  {
    slug: 'margem-lucro',
    titulo: 'Margem de Lucro',
    descricaoCurta: 'Preço, markup e margem sobre custo.',
    categoria: 'negocios',
    icone: '🏷️',
  },
]

/** Calculadoras em destaque na home (3 mais buscadas). */
export const calculatorsFeatured = calculatorRegistry.filter((c) => c.featured)

/** Todas as calculadoras agrupadas por categoria, na ordem do registry. */
export function getCalculatorsByCategory(): Record<CategoriaCalc, CalculadoraRegistro[]> {
  const grouped = {
    trabalhista: [] as CalculadoraRegistro[],
    impostos: [] as CalculadoraRegistro[],
    financeiro: [] as CalculadoraRegistro[],
    investimentos: [] as CalculadoraRegistro[],
    saude: [] as CalculadoraRegistro[],
    negocios: [] as CalculadoraRegistro[],
  }
  for (const calc of calculatorRegistry) {
    grouped[calc.categoria].push(calc)
  }
  return grouped
}

export function findCalculator(slug: string): CalculadoraRegistro | undefined {
  return calculatorRegistry.find((c) => c.slug === slug)
}
