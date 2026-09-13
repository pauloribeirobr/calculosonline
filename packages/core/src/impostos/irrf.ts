/**
 * Cálculo standalone do Imposto de Renda Retido na Fonte (IRRF) mensal.
 *
 * Versão completa com deduções de pensão alimentícia, outras deduções
 * e cálculo automático do INSS quando não informado.
 *
 * Atende duas origens de rendimento, ambas pela mesma tabela progressiva
 * mensal: salário e **aluguel** (F54). O que muda entre elas é o que se abate
 * antes de aplicar a tabela — não a tabela.
 *
 * Base legal:
 *  - RIR/2018 (Decreto 9.580/2018), tabela progressiva mensal
 *  - Lei 11.482/2007 — atualização das faixas
 *  - RIR/2018 art. 42 e IN RFB 1.500 art. 31 — despesas dedutíveis do aluguel
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { calcularINSSProgressivo, calcularIRRFMensal, getTabelasVigentes } from '../tabelas'
import { arredondar, formatarBRL, validarSalario } from '../utils'

/**
 * Origem do rendimento tributado. Ambas usam a mesma tabela progressiva
 * mensal — muda só o que é abatido antes dela.
 */
export type OrigemRendimentoIRRF = 'salario' | 'aluguel'

/**
 * Despesas que a lei deixa abater do aluguel recebido, quando o ônus é do
 * locador (RIR/2018 art. 42; IN RFB 1.500 art. 31). Benfeitorias e reformas
 * **não** entram — são custo do imóvel, não despesa da locação.
 */
export interface DespesasAluguel {
  /** IPTU do período, quando pago pelo locador. */
  iptu?: number
  /** Condomínio e demais taxas, quando o ônus for do locador. */
  condominio?: number
  /** Comissão/taxa da imobiliária pela administração ou cobrança. */
  taxaAdministracao?: number
}

export interface IRRFParams {
  /** Rendimento bruto do mês — salário ou aluguel, conforme `origemRendimento`. */
  salarioBruto: number
  /** Padrão `'salario'`, que é o comportamento histórico desta função. */
  origemRendimento?: OrigemRendimentoIRRF
  numeroDependentes: number
  /** Se não informado, calcula automaticamente pela tabela progressiva */
  descontoINSS?: number
  /** Dedução integral da base do IRRF */
  pensaoAlimenticia?: number
  /** Plano de saúde, previdência privada PGBL, etc. */
  outrasDeducoes?: number
  /** Só em `origemRendimento: 'aluguel'`; ignorado no salário. */
  despesasAluguel?: DespesasAluguel
}

export interface IRRFResultado {
  baseCalculo: number
  aliquota: number
  deducaoParcela: number
  deducaoDependentes: number
  irrf: number
  isento: boolean
  origemRendimento: OrigemRendimentoIRRF
  /** Soma das despesas do aluguel abatidas. 0 quando a origem é salário. */
  despesasDedutiveis: number
  /** Imposto pela tabela progressiva, antes do redutor da Lei 15.270/2025. */
  irrfSemRedutor: number
  /** Redutor da Lei 15.270/2025 aplicado (R$). */
  redutorIRRF: number
  /** true quando o desconto simplificado de R$ 607,20 venceu as deduções legais. */
  usouDescontoSimplificado: boolean
}

export function calcularIRRF(params: IRRFParams): ResultadoOuErro<IRRFResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.numeroDependentes < 0 || !Number.isFinite(params.numeroDependentes)) {
    erros.push({
      campo: 'numeroDependentes',
      mensagem: 'Número de dependentes não pode ser negativo',
    })
  }
  if ((params.pensaoAlimenticia ?? 0) < 0) {
    erros.push({ campo: 'pensaoAlimenticia', mensagem: 'Pensão alimentícia não pode ser negativa' })
  }
  if ((params.outrasDeducoes ?? 0) < 0) {
    erros.push({ campo: 'outrasDeducoes', mensagem: 'Outras deduções não podem ser negativas' })
  }
  if ((params.descontoINSS ?? 0) < 0) {
    erros.push({ campo: 'descontoINSS', mensagem: 'INSS informado não pode ser negativo' })
  }

  const origemRendimento = params.origemRendimento ?? 'salario'
  const despesas = params.despesasAluguel ?? {}
  for (const [campo, valor] of Object.entries(despesas)) {
    if ((valor ?? 0) < 0) {
      erros.push({ campo, mensagem: 'Despesa do aluguel não pode ser negativa' })
    }
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()
  const ehAluguel = origemRendimento === 'aluguel'

  // Aluguel não sofre INSS: a contribuição incide sobre rendimento do
  // trabalho, e locação é rendimento de capital. Por isso o desconto é zerado
  // aqui em vez de ser calculado pela tabela progressiva.
  const inss = ehAluguel ? 0 : (params.descontoINSS ?? calcularINSSProgressivo(params.salarioBruto).valorINSS)

  const despesasDedutiveis = ehAluguel
    ? arredondar((despesas.iptu ?? 0) + (despesas.condominio ?? 0) + (despesas.taxaAdministracao ?? 0))
    : 0

  const deducaoDependentes = arredondar(
    params.numeroDependentes * tabelas.deducaoDependenteIRRF,
  )
  const pensao = params.pensaoAlimenticia ?? 0
  const outras = params.outrasDeducoes ?? 0

  // As despesas do aluguel não são "dedução" do art. 4º — são exclusão do
  // rendimento bruto. Por isso saem antes, e o que sobra é o rendimento
  // tributável que serve de base tanto à tabela quanto ao redutor.
  const rendimentoTributavel = arredondar(
    Math.max(0, params.salarioBruto - despesasDedutiveis),
  )

  const {
    valorIRRF: irrf,
    baseCalculo,
    aliquota,
    deducao: deducaoParcela,
    deducaoAplicada,
    usouDescontoSimplificado,
    impostoApurado,
    redutor,
  } = calcularIRRFMensal({
    salarioBruto: rendimentoTributavel,
    inss,
    numeroDependentes: params.numeroDependentes,
    outrasDeducoes: arredondar(pensao + outras),
    tabelas,
  })

  const isento = irrf === 0

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: ehAluguel ? 'Aluguel Bruto Recebido' : 'Salário Bruto',
      valor: params.salarioBruto,
      tipo: 'neutro',
    },
    ...(ehAluguel || usouDescontoSimplificado
      ? []
      : [{ descricao: '(-) INSS', valor: inss, tipo: 'debito' as const }]),
    ...(ehAluguel && (despesas.iptu ?? 0) > 0
      ? [{ descricao: '(-) IPTU', valor: despesas.iptu!, tipo: 'debito' as const }]
      : []),
    ...(ehAluguel && (despesas.condominio ?? 0) > 0
      ? [{ descricao: '(-) Condomínio e taxas', valor: despesas.condominio!, tipo: 'debito' as const }]
      : []),
    ...(ehAluguel && (despesas.taxaAdministracao ?? 0) > 0
      ? [
          {
            descricao: '(-) Taxa de administração imobiliária',
            valor: despesas.taxaAdministracao!,
            tipo: 'debito' as const,
          },
        ]
      : []),
    // Com despesas abatidas, o rendimento tributável deixa de ser o bruto —
    // sem esta linha a base de cálculo apareceria sem mostrar de onde veio.
    ...(despesasDedutiveis > 0
      ? [
          {
            descricao: 'Rendimento tributável',
            valor: rendimentoTributavel,
            tipo: 'neutro' as const,
          },
        ]
      : []),
    ...(usouDescontoSimplificado
      ? [
          {
            descricao: '(-) Desconto simplificado (mais vantajoso que as deduções legais)',
            valor: deducaoAplicada,
            tipo: 'debito' as const,
          },
        ]
      : [
          ...(deducaoDependentes > 0
            ? [
                {
                  descricao: `(-) Dependentes (${params.numeroDependentes} × ${formatarBRL(
                    tabelas.deducaoDependenteIRRF,
                  )})`,
                  valor: deducaoDependentes,
                  tipo: 'debito' as const,
                },
              ]
            : []),
          ...(pensao > 0
            ? [{ descricao: '(-) Pensão Alimentícia', valor: pensao, tipo: 'debito' as const }]
            : []),
          ...(outras > 0
            ? [{ descricao: '(-) Outras Deduções', valor: outras, tipo: 'debito' as const }]
            : []),
        ]),
    { descricao: 'Base de Cálculo IRRF', valor: baseCalculo, tipo: 'neutro' },
    ...(aliquota > 0
      ? [
          {
            descricao: `Alíquota ${(aliquota * 100).toFixed(1)}%`,
            valor: arredondar(baseCalculo * aliquota),
            tipo: 'debito' as const,
          },
          {
            descricao: '(-) Parcela a Deduzir',
            valor: deducaoParcela,
            tipo: 'credito' as const,
          },
        ]
      : []),
    ...(redutor > 0
      ? [
          {
            descricao: '(-) Redutor da Lei 15.270/2025',
            valor: redutor,
            tipo: 'credito' as const,
          },
        ]
      : []),
    {
      descricao: isento ? 'IRRF (Isento)' : 'IRRF',
      valor: irrf,
      tipo: isento ? 'neutro' : 'debito',
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: irrf,
      detalhamento,
      baseCalculo: ehAluguel
        ? 'Aluguel − IPTU − condomínio − taxa de administração − (deduções legais ou desconto simplificado) − redutor'
        : 'Bruto − (INSS + dependentes + pensão + outras deduções, ou desconto simplificado) − redutor',
      fonteJuridica: ehAluguel
        ? 'RIR/2018 (Decreto 9.580/2018) arts. 42 e 776 | IN RFB 1.500 art. 31 | Lei 15.270/2025'
        : 'RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007 | Lei 15.270/2025',
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        baseCalculo,
        aliquota,
        deducaoParcela,
        deducaoDependentes,
        irrf,
        isento,
        origemRendimento,
        despesasDedutiveis,
        irrfSemRedutor: impostoApurado,
        redutorIRRF: redutor,
        usouDescontoSimplificado,
      },
    },
  }
}
