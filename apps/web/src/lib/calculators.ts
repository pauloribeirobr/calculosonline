/**
 * Registry canônico das 20 calculadoras do MVP.
 * Drive de Navigation, Footer, CalculatorTypes, RelatedCalculators, sitemap e schemas JSON-LD.
 */

import { IDENTIDADE_CATEGORIA } from './identidadeVisual'
import type { CategoriaCalc, IconeCalculadora } from './identidadeVisual'

// `CategoriaCalc` e `IconeCalculadora` moraram aqui até o F41; hoje são
// definidos em `identidadeVisual.ts` (junto das cores e labels de cada
// categoria) e re-exportados daqui para não quebrar os imports existentes.
export type { CategoriaCalc, IconeCalculadora }

export type ResultadoFormato = 'currency' | 'percent' | 'number' | 'integer' | 'kcal'


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
  /**
   * Vocabulário alternativo com que o usuário busca a mesma calculadora
   * ("simulador"/"simulação" nas financeiras, "acerto trabalhista"/"pedido
   * de demissão" na rescisão). Entra no `keywords` da página e serve de
   * referência editorial: o mesmo vocabulário precisa aparecer no MDX e na
   * FAQ, que é onde o Google efetivamente lê (o `keywords` sozinho não
   * ranqueia nada desde 2009).
   *
   * Origem: export do GSC de 2026-08-20 cruzado com o Semrush. O cluster
   * "simulador/simulação" somava 180 impressões em 97 queries com posição
   * média 83, e `simulação tesouro direto` tem 2.9K buscas/mês — sem que a
   * palavra aparecesse em um único title, H1, MDX ou FAQ do site.
   * Ver diário 2026-08-20 no `MEMORY.md`.
   */
  sinonimos?: string[]
  /**
   * Declara que a página publica uma tabela legislativa, e alimenta o JSON-LD
   * `Dataset` (F55). Só faz sentido em calculadora cujo conteúdo editorial
   * traz a tabela em si (faixas do IRRF, do INSS, valores do DAS) — não em
   * calculadora que só aplica uma fórmula.
   */
  dataset?: {
    nome: string
    descricao: string
    /** Início da vigência legal da tabela (ISO). */
    vigenciaInicio: string
    /** O que a tabela mede — vira `variableMeasured`. */
    variaveis: string[]
  }
  relacionadas: string[]
  /** Aparece no bloco "Mais buscadas" da home */
  featured?: boolean
  /**
   * Cálculo que não depende de tabela/legislação anual (matemática pura:
   * porcentagem, margem de lucro). O ano sai do title — "2026" só faz
   * sentido onde o resultado muda de um ano para o outro, e nas SERPs
   * dessas queries nenhum concorrente relevante usa ano.
   * Ver diário 2026-08-09 no `MEMORY.md`.
   */
  atemporal?: boolean
  /** Formato do valor principal exibido no resultado */
  formatoResultado?: ResultadoFormato
  /** Slot AdSense específico — fallback para variáveis de ambiente */
  adSlotTop?: string
  adSlotMid?: string
  adSlotBottom?: string
}

/**
 * Label + descrição de cada categoria. Derivado de `IDENTIDADE_CATEGORIA`
 * (F41) — antes era uma tabela literal aqui, mantida em paralelo com as cores
 * em outros dois arquivos.
 */
export const CATEGORIAS: Record<CategoriaCalc, { label: string; descricao: string }> =
  Object.fromEntries(
    Object.entries(IDENTIDADE_CATEGORIA).map(([categoria, { label, descricao }]) => [
      categoria,
      { label, descricao },
    ]),
  ) as Record<CategoriaCalc, { label: string; descricao: string }>

/**
 * Labels curtos usados em chips/badges. Eram uma segunda tabela literal,
 * idêntica aos `label` de `CATEGORIAS` nas 6 categorias — agora é um alias.
 */
export const CATEGORIAS_LABEL: Record<CategoriaCalc, string> = Object.fromEntries(
  Object.entries(IDENTIDADE_CATEGORIA).map(([categoria, { label }]) => [categoria, label]),
) as Record<CategoriaCalc, string>

export const calculatorRegistry: CalculadoraRegistro[] = [
  // Trabalhistas
  {
    slug: 'rescisao-trabalhista',
    titulo: 'Rescisão Trabalhista',
    tituloLongo: 'Calculadora de Rescisão Trabalhista',
    descricaoCurta: 'Acerto de demissão: saldo, aviso e FGTS.',
    descricao:
      'Calcule o acerto trabalhista de qualquer demissão: sem justa causa, pedido de demissão, acordo mútuo, rescisão indireta ou justa causa. Verbas rescisórias completas pela CLT 2026.',
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
    sinonimos: [
      'calcular demissão',
      'acerto trabalhista',
      'cálculo de pedido de demissão',
      'rescisão por comum acordo',
      'cálculo de desligamento',
      'direitos trabalhistas na saída da empresa',
    ],
    relacionadas: ['ferias', 'fgts', 'decimo-terceiro', 'hora-extra'],
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
    sinonimos: [
      'calcular férias 2026',
      'cálculo de férias 2026',
      'quanto vou receber de férias',
    ],
    relacionadas: ['decimo-terceiro', 'fgts', 'hora-extra', 'rescisao-trabalhista'],
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
    relacionadas: ['ferias', 'fgts', 'hora-extra', 'rescisao-trabalhista'],
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
    relacionadas: ['salario-liquido', 'fgts', 'ferias', 'rescisao-trabalhista'],
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
    relacionadas: ['rescisao-trabalhista', 'hora-extra', 'ferias', 'decimo-terceiro'],
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
    palavrasChave: [
      'salário líquido',
      'calcular salário líquido',
      'cálculo do salário líquido',
      'cálculo de salário líquido',
      'como calcular salário líquido',
      'desconto INSS IRRF',
    ],
    relacionadas: ['irrf', 'hora-extra', 'fgts', 'rescisao-trabalhista'],
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
    dataset: {
      nome: 'Tabela progressiva de contribuição do INSS 2026',
      descricao:
        'Faixas de salário de contribuição e alíquotas progressivas do INSS vigentes no Brasil em 2026, com o teto de contribuição do segurado empregado.',
      vigenciaInicio: '2026-01-01',
      variaveis: [
        'Faixa de salário de contribuição (R$)',
        'Alíquota do INSS (%)',
        'Teto do salário de contribuição (R$)',
      ],
    },
    sinonimos: [
      'cálculo do INSS online 2026',
      'calcular contribuição do INSS',
      'tabela do INSS 2026',
    ],
    relacionadas: ['salario-liquido', 'irrf', 'fgts', 'das-mei'],
  },
  {
    slug: 'irrf',
    titulo: 'IRRF',
    tituloLongo: 'Calculadora de IRRF',
    descricaoCurta: 'Imposto retido na fonte mensal.',
    descricao:
      'Calcule o IR na folha de pagamento ou sobre aluguel recebido: tabela progressiva do IRRF 2026, dedução por dependente, pensão e despesas dedutíveis, com a base de cálculo aberta passo a passo.',
    categoria: 'impostos',
    icone: 'irrf',
    fonteJuridica: 'RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['IRRF', 'imposto de renda retido', 'tabela IRRF 2026'],
    dataset: {
      nome: 'Tabela progressiva mensal do IRRF 2026',
      descricao:
        'Faixas de base de cálculo, alíquotas e parcelas a deduzir do Imposto de Renda Retido na Fonte vigentes no Brasil em 2026, com a dedução por dependente e o limite de isenção mensal.',
      vigenciaInicio: '2026-01-01',
      variaveis: [
        'Faixa de base de cálculo mensal (R$)',
        'Alíquota do IRRF (%)',
        'Parcela a deduzir (R$)',
        'Dedução por dependente (R$)',
        'Limite de isenção mensal (R$)',
      ],
    },
    sinonimos: [
      'calcular IR 2026',
      'calculadora do IRRF 2026',
      'cálculo de IR na folha de pagamento',
      'cálculo de dependente no IR',
      'tabela de desconto do IRRF 2026',
      'base de cálculo do IRRF',
      'calculadora de IRRF sobre aluguel',
    ],
    relacionadas: ['inss', 'salario-liquido', 'ferias', 'decimo-terceiro'],
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
    dataset: {
      nome: 'Tabela do Imposto de Renda Pessoa Física 2026',
      descricao:
        'Faixas anuais, alíquotas e parcelas a deduzir do IRPF vigentes no Brasil em 2026, com os limites do desconto simplificado e das deduções legais.',
      vigenciaInicio: '2026-01-01',
      variaveis: [
        'Faixa de base de cálculo anual (R$)',
        'Alíquota do IRPF (%)',
        'Parcela a deduzir (R$)',
        'Limite do desconto simplificado (R$)',
      ],
    },
    sinonimos: [
      'calcular IRPF 2026',
      'calcular IR 2026',
      'calculadora do imposto de renda anual',
      'declaração de IR simplificada ou completa',
    ],
    relacionadas: ['irrf', 'inss', 'tesouro-direto', 'poupanca'],
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
    dataset: {
      nome: 'Valores do DAS MEI 2026',
      descricao:
        'Valores mensais do Documento de Arrecadação do Simples Nacional para o Microempreendedor Individual em 2026, por atividade (comércio, serviços e misto), e o limite de faturamento anual.',
      vigenciaInicio: '2026-01-01',
      variaveis: [
        'Contribuição ao INSS (R$)',
        'ICMS para comércio e indústria (R$)',
        'ISS para prestação de serviços (R$)',
        'Limite anual de faturamento (R$)',
      ],
    },
    relacionadas: ['inss', 'margem-lucro', 'irpf', 'financiamento'],
  },

  // Financeiras
  {
    slug: 'porcentagem',
    titulo: 'Porcentagem',
    tituloLongo: 'Calculadora de Porcentagem',
    descricaoCurta: '6 modos: percentual, variação, desconto.',
    descricao:
      'Calcule porcentagem online e grátis, sem cadastro: quanto é X% de um valor, ' +
      'quanto X representa de Y, variação percentual, acréscimo e desconto.',
    atemporal: true,
    categoria: 'financeiro',
    icone: 'porcentagem',
    fonteJuridica: 'Matemática básica',
    dataAtualizacao: '2026-01-01',
    formatoResultado: 'number',
    palavrasChave: ['calcular porcentagem', 'porcentagem de um valor', 'desconto percentual'],
    relacionadas: ['margem-lucro', 'financiamento', 'emprestimo'],
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
    relacionadas: ['financiamento', 'emprestimo', 'cdb', 'tesouro-direto'],
    featured: true,
  },
  {
    slug: 'emprestimo',
    titulo: 'Empréstimo',
    tituloLongo: 'Calculadora e Simulador de Empréstimo',
    descricaoCurta: 'Simulador Price e SAC com seguro.',
    descricao:
      'Simulador de empréstimo grátis: faça a simulação pela Tabela Price ou SAC e veja parcelas, total de juros e o CET (Custo Efetivo Total).',
    categoria: 'financeiro',
    icone: 'emprestimo',
    fonteJuridica: 'Res. CMN 3.517/2007 (CET)',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular empréstimo', 'simulador empréstimo', 'tabela price SAC'],
    sinonimos: [
      'simulador de empréstimo',
      'simulação de empréstimo',
      'simular empréstimo',
      'simulador de parcelas',
    ],
    relacionadas: ['financiamento', 'juros-compostos', 'porcentagem', 'cdb'],
  },
  {
    slug: 'financiamento',
    titulo: 'Financiamento',
    tituloLongo: 'Calculadora e Simulador de Financiamento',
    descricaoCurta: 'Simulador Price/SAC com CET anual.',
    descricao:
      'Simulador de financiamento imobiliário e de veículos: simule pela Tabela Price ou SAC e veja parcela, CET e a evolução completa do saldo devedor.',
    categoria: 'financeiro',
    icone: 'financiamento',
    fonteJuridica: 'Res. CMN 3.517/2007 | Circular BCB 2.905/1999',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular financiamento', 'simulador financiamento imóvel', 'CET'],
    sinonimos: [
      'simulador de financiamento',
      'simulação de financiamento',
      'simular financiamento',
      'simulador de crédito imobiliário',
    ],
    relacionadas: ['emprestimo', 'juros-compostos', 'poupanca', 'cdb'],
  },

  // Investimentos
  {
    slug: 'cdb',
    titulo: 'CDB',
    tituloLongo: 'Calculadora e Simulador de CDB',
    descricaoCurta: 'Simulador de % do CDI, pré ou IPCA+.',
    descricao:
      'Simulador de CDB grátis: faça a simulação do rendimento líquido de CDB prefixado, % do CDI ou IPCA+, com IR regressivo já abatido.',
    categoria: 'investimentos',
    icone: 'cdb',
    fonteJuridica: 'Lei 11.033/2004 | Decreto 6.306/2007',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular CDB', 'rendimento CDB', 'CDB CDI', 'CDB prefixado'],
    sinonimos: [
      'simulador de CDB',
      'simulação de CDB',
      'simulador CDB prefixado',
      'simular CDB',
      // F53: "benchmark do cdb" apareceu no painel de IA do Clarity com 50%
      // de share — vocabulário de comparação, que o F38 não cobriu.
      'benchmark de CDB',
      'comparar CDB com a poupança',
      'quanto rende o CDB',
    ],
    relacionadas: ['tesouro-direto', 'poupanca', 'irpf', 'juros-compostos'],
  },
  {
    slug: 'poupanca',
    titulo: 'Poupança',
    tituloLongo: 'Calculadora e Simulador de Poupança',
    descricaoCurta: 'Simulador de rendimento (SELIC + TR).',
    descricao:
      'Simulador de poupança grátis: faça a simulação do rendimento pela regra atual (Selic acima de 8,5% + TR) e compare com CDB e Tesouro Direto.',
    categoria: 'investimentos',
    icone: 'poupanca',
    fonteJuridica: 'Lei 8.177/1991 | Lei 12.703/2012',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['calcular poupança', 'rendimento poupança 2026', 'quanto rende poupança'],
    sinonimos: [
      'simulador de poupança',
      'simulação de poupança',
      'rendimento poupança simulador',
      'simulador poupança Caixa',
    ],
    relacionadas: ['cdb', 'tesouro-direto', 'financiamento', 'irpf'],
  },
  {
    slug: 'tesouro-direto',
    titulo: 'Tesouro Direto',
    tituloLongo: 'Calculadora e Simulador de Tesouro Direto',
    descricaoCurta: 'Simulador de SELIC, Prefixado e IPCA+.',
    descricao:
      'Simulador de Tesouro Direto grátis: faça a simulação de Tesouro Selic, Prefixado e IPCA+ e veja a rentabilidade líquida com IR regressivo e taxa de custódia da B3.',
    categoria: 'investimentos',
    icone: 'tesouroDireto',
    fonteJuridica: 'Lei 11.033/2004 | Resolução B3 — taxa de custódia',
    dataAtualizacao: '2026-01-01',
    palavrasChave: ['tesouro direto', 'tesouro selic', 'tesouro prefixado', 'tesouro IPCA'],
    sinonimos: [
      'simulador de tesouro direto',
      'simulação tesouro direto',
      'tesouro direto simulador',
      'simular tesouro direto',
      // Acrescentados no F53: foi este o vocabulário que gerou as 47 citações
      // de IA da página em 7 dias no Clarity, não o "simulação" do F38.
      'calculadora de investimento em tesouro direto',
      'calculadora de investimentos tesouro direto',
      'investir no tesouro direto',
    ],
    relacionadas: ['cdb', 'poupanca', 'irpf', 'juros-compostos'],
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
    sinonimos: [
      'calorias diárias recomendadas',
      'quantas calorias devo comer por dia',
      'gasto calórico diário',
    ],
    relacionadas: ['imc', 'porcentagem'],
  },

  // Negócios
  {
    slug: 'margem-lucro',
    titulo: 'Margem de Lucro',
    tituloLongo: 'Calculadora de Margem de Lucro',
    descricaoCurta: 'Preço, markup e margem sobre custo.',
    descricao:
      'Calcule margem de lucro, markup e preço de venda grátis, sem cadastro: ' +
      'descubra o preço ideal a partir do custo e da margem desejada.',
    atemporal: true,
    categoria: 'negocios',
    icone: 'margemLucro',
    fonteJuridica: 'Contabilidade de custos',
    dataAtualizacao: '2026-01-01',
    palavrasChave: [
      'margem de lucro',
      'calcular markup',
      'preço de venda',
      'precificação',
      // Query de maior impressão do cluster no GSC (12m até 09/08/2026),
      // atendida pelo modo "margem desejada → preço".
      'calcular valor baseado na margem de lucro',
    ],
    relacionadas: ['das-mei', 'porcentagem', 'financiamento'],
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
