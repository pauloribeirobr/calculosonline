/**
 * Registry canônico das 20 calculadoras do MVP.
 * Drive de Navigation, Footer, CalculatorTypes, RelatedCalculators, sitemap e schemas JSON-LD.
 */

export type CategoriaCalc =
  | 'trabalhista'
  | 'impostos'
  | 'financeiro'
  | 'investimentos'
  | 'saude'
  | 'negocios'

export type ResultadoFormato = 'currency' | 'percent' | 'number' | 'integer' | 'kcal'

export type IconeCalculadora =
  | 'rescisao'
  | 'ferias'
  | 'decimoTerceiro'
  | 'horaExtra'
  | 'fgts'
  | 'salarioLiquido'
  | 'inss'
  | 'irrf'
  | 'irpf'
  | 'dasMei'
  | 'porcentagem'
  | 'jurosCompostos'
  | 'emprestimo'
  | 'financiamento'
  | 'cdb'
  | 'poupanca'
  | 'tesouroDireto'
  | 'imc'
  | 'calorias'
  | 'margemLucro'

export interface CalculadoraRegistro {
  slug: string
  /** Nome curto exibido no header da calculadora e em listagens */
  titulo: string
  /** Variação completa "Calculadora de X Online e Gratuita" — usada em SEO */
  tituloLongo: string
  descricaoCurta: string
  descricao: string
  categoria: CategoriaCalc
  icone: IconeCalculadora
  fonteJuridica: string
  /** Data ISO de última atualização das tabelas legislativas */
  dataAtualizacao: string
  palavrasChave: string[]
  relacionadas: string[]
  /** Aparece no bloco "Mais buscadas" da home */
  featured?: boolean
  /** Formato do valor principal exibido no resultado */
  formatoResultado?: ResultadoFormato
  /** Slot AdSense específico — fallback para variáveis de ambiente */
  adSlotTop?: string
  adSlotMid?: string
  adSlotBottom?: string
}

export const CATEGORIAS: Record<
  CategoriaCalc,
  { label: string; descricao: string }
> = {
  trabalhista: {
    label: 'Trabalhistas',
    descricao: 'CLT, rescisão, férias, 13º e mais',
  },
  impostos: {
    label: 'Impostos',
    descricao: 'INSS, IRRF, IRPF, MEI e mais',
  },
  financeiro: {
    label: 'Financeiras',
    descricao: 'Juros, empréstimos, porcentagem',
  },
  investimentos: {
    label: 'Investimentos',
    descricao: 'CDB, poupança, Tesouro Direto',
  },
  saude: {
    label: 'Saúde',
    descricao: 'IMC, calorias, peso ideal',
  },
  negocios: {
    label: 'Negócios',
    descricao: 'Margem, markup, precificação',
  },
}

/** Labels mais curtos usados em chips/badges. */
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
    tituloLongo: 'Calculadora de Rescisão Trabalhista',
    descricaoCurta: 'Saldo, aviso, férias, 13º, FGTS e multa.',
    descricao:
      'Calcule as verbas rescisórias com precisão: saldo de salário, aviso prévio, férias, 13º e multa FGTS. Atualizado com a CLT 2026.',
    categoria: 'trabalhista',
    icone: 'rescisao',
    fonteJuridica: 'CLT arts. 477–487 | Lei 12.506/2011 | Lei 8.036/1990',
    dataAtualizacao: '2026-01-01',
    palavrasChave: [
      'rescisão trabalhista',
      'calcular rescisão',
      'verbas rescisórias',
      'aviso prévio',
    ],
    relacionadas: ['ferias', 'fgts', 'salario-liquido', 'hora-extra'],
    featured: true,
  },
  {
    slug: 'ferias',
    titulo: 'Férias',
    tituloLongo: 'Calculadora de Férias',
    descricaoCurta: 'Férias + 1/3 com INSS e IRRF.',
    descricao:
      'Calcule férias com 1/3 constitucional, abono pecuniário e descontos de INSS e IRRF. Base na CLT 2026.',
    categoria: 'trabalhista',
    icone: 'ferias',
    fonteJuridica: 'CLT arts. 129–153 | CF/88 art. 7º, XVII',
    dataAtualizacao: '2026-01-01',
    palavrasChave: [
      'calcular férias',
      'férias proporcional',
      'abono pecuniário',
      '1/3 constitucional',
    ],
    relacionadas: ['rescisao-trabalhista', 'decimo-terceiro', 'salario-liquido', 'hora-extra'],
  },
  {
    slug: 'decimo-terceiro',
    titulo: '13º Salário',
    tituloLongo: 'Calculadora de Décimo Terceiro Salário (13º)',
    descricaoCurta: '1ª e 2ª parcelas com descontos.',
    descricao:
      'Calcule o décimo terceiro salário (13º) proporcional com 1ª e 2ª parcelas e descontos de INSS e IRRF. Tabelas 2026.',
    categoria: 'trabalhista',
    icone: 'decimoTerceiro',
    fonteJuridica: 'Lei 4.090/1962 | Lei 4.749/1965',
    dataAtualizacao: '2026-01-01',
    palavrasChave: [
      'décimo terceiro salário',
      'calculadora décimo terceiro',
      'calcular décimo terceiro',
      '13º salário',
      'calcular 13 salario',
      'gratificação natalina',
    ],
    relacionadas: ['salario-liquido', 'rescisao-trabalhista', 'ferias', 'inss'],
  },
  {
    slug: 'hora-extra',
    titulo: 'Hora Extra',
    tituloLongo: 'Calculadora de Hora Extra',
    descricaoCurta: 'Acréscimo de 50% / 100% sobre a hora.',
    descricao:
      'Calcule horas extras com adicional de 50% (dia útil) ou 100% (domingo/feriado).',
    categoria: 'trabalhista',
    icone: 'horaExtra',
    fonteJuridica: 'CLT art. 59 | CF/88 art. 7º, XVI',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['hora extra', 'calcular hora extra', 'adicional hora extra'],
    relacionadas: ['salario-liquido', 'rescisao-trabalhista', 'ferias', 'fgts'],
  },
  {
    slug: 'fgts',
    titulo: 'FGTS',
    tituloLongo: 'Calculadora de FGTS',
    descricaoCurta: 'Depósito, saldo, multa e saque-aniversário.',
    descricao:
      'Calcule depósitos mensais (8%), multa rescisória (40% e 20%) e saque-aniversário do FGTS.',
    categoria: 'trabalhista',
    icone: 'fgts',
    fonteJuridica: 'Lei 8.036/1990 | Lei 13.932/2019',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['FGTS', 'multa FGTS', 'saque aniversário FGTS', 'calcular FGTS'],
    relacionadas: ['rescisao-trabalhista', 'salario-liquido', 'ferias', 'decimo-terceiro'],
  },
  {
    slug: 'salario-liquido',
    titulo: 'Salário Líquido',
    tituloLongo: 'Calculadora de Salário Líquido',
    descricaoCurta: 'Bruto menos INSS, IRRF e VT.',
    descricao:
      'Descubra seu salário líquido após INSS e IRRF. Tabela progressiva 2026 com detalhamento completo.',
    categoria: 'trabalhista',
    icone: 'salarioLiquido',
    fonteJuridica: 'Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF)',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['salário líquido', 'calcular salário líquido', 'desconto INSS IRRF'],
    relacionadas: ['inss', 'irrf', 'rescisao-trabalhista', 'decimo-terceiro'],
    featured: true,
  },

  // Impostos
  {
    slug: 'inss',
    titulo: 'INSS',
    tituloLongo: 'Calculadora de INSS 2026',
    descricaoCurta: 'CLT, autônomo, facultativo e MEI.',
    descricao:
      'Calcule a contribuição ao INSS pela tabela progressiva 2026. Suporta empregado CLT, autônomo, facultativo e MEI.',
    categoria: 'impostos',
    icone: 'inss',
    fonteJuridica: 'Decreto 11.936/2024',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular INSS', 'tabela INSS 2026', 'contribuição INSS'],
    relacionadas: ['salario-liquido', 'irrf', 'irpf', 'das-mei'],
  },
  {
    slug: 'irrf',
    titulo: 'IRRF',
    tituloLongo: 'Calculadora de IRRF',
    descricaoCurta: 'Imposto retido na fonte mensal.',
    descricao:
      'Calcule o Imposto de Renda Retido na Fonte com tabela progressiva 2026, dependentes e deduções.',
    categoria: 'impostos',
    icone: 'irrf',
    fonteJuridica: 'RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['IRRF', 'imposto de renda retido', 'tabela IRRF 2026'],
    relacionadas: ['inss', 'salario-liquido', 'irpf', 'decimo-terceiro'],
  },
  {
    slug: 'irpf',
    titulo: 'IRPF',
    tituloLongo: 'Calculadora de IRPF 2026',
    descricaoCurta: 'Declaração anual: simplificado × completo.',
    descricao:
      'Simule sua declaração do Imposto de Renda 2026: simplificado vs. completo, restituição ou imposto a pagar.',
    categoria: 'impostos',
    icone: 'irpf',
    fonteJuridica: 'Lei 9.250/1995 | IN RFB 2.178/2024',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['IRPF 2026', 'declaração imposto de renda', 'restituição IR'],
    relacionadas: ['irrf', 'inss', 'cdb', 'tesouro-direto'],
    featured: true,
  },
  {
    slug: 'das-mei',
    titulo: 'DAS MEI',
    tituloLongo: 'Calculadora DAS MEI 2026',
    descricaoCurta: 'INSS + ICMS/ISS fixos do MEI.',
    descricao:
      'Calcule o DAS mensal do MEI: INSS, ICMS e ISS. Verifique se está dentro do limite anual de faturamento.',
    categoria: 'impostos',
    icone: 'dasMei',
    fonteJuridica: 'LC 123/2006 art. 18-A | Resolução CGSN 140/2018',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['DAS MEI', 'calcular MEI', 'imposto MEI', 'boleto MEI 2026'],
    relacionadas: ['inss', 'margem-lucro', 'irpf', 'juros-compostos'],
  },

  // Financeiras
  {
    slug: 'porcentagem',
    titulo: 'Porcentagem',
    tituloLongo: 'Calculadora de Porcentagem',
    descricaoCurta: '6 modos: percentual, variação, desconto.',
    descricao:
      'Calcule percentuais: valor de X%, variação percentual, acréscimo, desconto, percentual de e mais.',
    categoria: 'financeiro',
    icone: 'porcentagem',
    fonteJuridica: 'Matemática básica',
    dataAtualizacao: '2026-01-01',
    formatoResultado: 'number',
    palavrasChave: ['calcular porcentagem', 'porcentagem de um valor', 'desconto percentual'],
    relacionadas: ['juros-compostos', 'margem-lucro', 'imc', 'emprestimo'],
  },
  {
    slug: 'juros-compostos',
    titulo: 'Juros Compostos',
    tituloLongo: 'Calculadora de Juros Compostos',
    descricaoCurta: 'Capital, aporte e evolução do montante.',
    descricao:
      'Calcule o montante final com juros compostos. Suporte a aportes mensais e diferentes periodicidades.',
    categoria: 'financeiro',
    icone: 'jurosCompostos',
    fonteJuridica: 'Matemática financeira',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['juros compostos', 'calcular juros compostos', 'montante final'],
    relacionadas: ['cdb', 'poupanca', 'tesouro-direto', 'emprestimo'],
    featured: true,
  },
  {
    slug: 'emprestimo',
    titulo: 'Empréstimo',
    tituloLongo: 'Calculadora de Empréstimo',
    descricaoCurta: 'Sistemas Price e SAC com seguro.',
    descricao:
      'Simule empréstimos pela Tabela Price ou SAC. Veja parcelas, total de juros e CET (Custo Efetivo Total).',
    categoria: 'financeiro',
    icone: 'emprestimo',
    fonteJuridica: 'Res. CMN 3.517/2007 (CET)',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular empréstimo', 'simulador empréstimo', 'tabela price SAC'],
    relacionadas: ['financiamento', 'juros-compostos', 'cdb', 'porcentagem'],
  },
  {
    slug: 'financiamento',
    titulo: 'Financiamento',
    tituloLongo: 'Calculadora de Financiamento',
    descricaoCurta: 'Tabela Price/SAC e CET anual.',
    descricao:
      'Simule financiamentos imobiliários e de veículos pela Tabela Price ou SAC. Evolução completa do saldo devedor.',
    categoria: 'financeiro',
    icone: 'financiamento',
    fonteJuridica: 'Res. CMN 3.517/2007 | Circular BCB 2.905/1999',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular financiamento', 'simulador financiamento imóvel', 'CET'],
    relacionadas: ['emprestimo', 'juros-compostos', 'porcentagem', 'cdb'],
  },

  // Investimentos
  {
    slug: 'cdb',
    titulo: 'CDB',
    tituloLongo: 'Calculadora de CDB',
    descricaoCurta: '% do CDI, prefixado ou IPCA+ líquido.',
    descricao:
      'Calcule o rendimento líquido do CDB: prefixado, % CDI ou IPCA+. IR regressivo já abatido.',
    categoria: 'investimentos',
    icone: 'cdb',
    fonteJuridica: 'Lei 11.033/2004 | Decreto 6.306/2007',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular CDB', 'rendimento CDB', 'CDB CDI', 'CDB prefixado'],
    relacionadas: ['poupanca', 'tesouro-direto', 'juros-compostos', 'irpf'],
  },
  {
    slug: 'poupanca',
    titulo: 'Poupança',
    tituloLongo: 'Calculadora de Poupança',
    descricaoCurta: 'Regra antiga ou nova (SELIC + TR).',
    descricao:
      'Simule o rendimento da poupança com a regra atual (Selic > 8,5%). Compare com CDB e Tesouro Direto.',
    categoria: 'investimentos',
    icone: 'poupanca',
    fonteJuridica: 'Lei 8.177/1991 | Lei 12.703/2012',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular poupança', 'rendimento poupança 2026', 'quanto rende poupança'],
    relacionadas: ['cdb', 'tesouro-direto', 'juros-compostos', 'irpf'],
  },
  {
    slug: 'tesouro-direto',
    titulo: 'Tesouro Direto',
    tituloLongo: 'Calculadora de Tesouro Direto',
    descricaoCurta: 'SELIC, Prefixado e IPCA+ com custódia.',
    descricao:
      'Simule Tesouro Selic, Prefixado e IPCA+. Rentabilidade líquida com IR regressivo e taxa B3.',
    categoria: 'investimentos',
    icone: 'tesouroDireto',
    fonteJuridica: 'Lei 11.033/2004 | Resolução B3 — taxa de custódia',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['tesouro direto', 'tesouro selic', 'tesouro prefixado', 'tesouro IPCA'],
    relacionadas: ['cdb', 'poupanca', 'juros-compostos', 'irpf'],
  },

  // Saúde
  {
    slug: 'imc',
    titulo: 'IMC',
    tituloLongo: 'Calculadora de IMC',
    descricaoCurta: 'Índice de massa corporal e classificação.',
    descricao:
      'Calcule seu Índice de Massa Corporal e descubra o peso ideal segundo a OMS.',
    categoria: 'saude',
    icone: 'imc',
    fonteJuridica: 'OMS — World Health Organization (1997)',
    dataAtualizacao: '2026-01-01',
    formatoResultado: 'number',
    palavrasChave: ['calcular IMC', 'índice de massa corporal', 'peso ideal'],
    relacionadas: ['calorias', 'porcentagem'],
    featured: true,
  },
  {
    slug: 'calorias',
    titulo: 'Calorias',
    tituloLongo: 'Calculadora de Calorias Diárias',
    descricaoCurta: 'TMB, TDEE e meta calórica com macros.',
    descricao:
      'Calcule seu gasto calórico diário (TDEE) e a meta de calorias para perda, manutenção ou ganho de peso. Inclui macronutrientes.',
    categoria: 'saude',
    icone: 'calorias',
    fonteJuridica: 'Mifflin-St Jeor (1990) | OMS',
    dataAtualizacao: '2026-01-01',
    formatoResultado: 'kcal',
    palavrasChave: ['calcular calorias', 'TDEE', 'taxa metabólica basal', 'dieta calorias'],
    relacionadas: ['imc', 'porcentagem'],
  },

  // Negócios
  {
    slug: 'margem-lucro',
    titulo: 'Margem de Lucro',
    tituloLongo: 'Calculadora de Margem de Lucro',
    descricaoCurta: 'Preço, markup e margem sobre custo.',
    descricao:
      'Calcule margem de lucro, markup e preço de venda a partir do custo. Essencial para precificação.',
    categoria: 'negocios',
    icone: 'margemLucro',
    fonteJuridica: 'Contabilidade de custos',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['margem de lucro', 'calcular markup', 'preço de venda', 'precificação'],
    relacionadas: ['das-mei', 'porcentagem', 'juros-compostos'],
  },
]

/** Subset usado no bloco "Mais buscadas" da home. */
export const calculatorsFeatured = calculatorRegistry.filter((c) => c.featured)

export function getCalculatorsByCategory(): Record<CategoriaCalc, CalculadoraRegistro[]> {
  const grouped: Record<CategoriaCalc, CalculadoraRegistro[]> = {
    trabalhista: [],
    impostos: [],
    financeiro: [],
    investimentos: [],
    saude: [],
    negocios: [],
  }
  for (const calc of calculatorRegistry) grouped[calc.categoria].push(calc)
  return grouped
}

export function findCalculator(slug: string): CalculadoraRegistro | undefined {
  return calculatorRegistry.find((c) => c.slug === slug)
}

export function getRelacionadas(slugs: readonly string[]): CalculadoraRegistro[] {
  return slugs
    .map((s) => calculatorRegistry.find((c) => c.slug === s))
    .filter((c): c is CalculadoraRegistro => Boolean(c))
}
