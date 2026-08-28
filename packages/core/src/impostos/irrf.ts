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
import { calcularINSSProgressivo, getTabelasVigentes } from '../tabelas'
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

  const baseCalculo = arredondar(
    Math.max(
      0,
      params.salarioBruto - inss - despesasDedutiveis - deducaoDependentes - pensao - outras,
    ),
  )

  // Última faixa tem ate=null (Infinity), portanto find sempre encontra alguma faixa.
  const faixa = tabelas.irrf.find(
    (f) => baseCalculo <= (f.ate ?? Number.POSITIVE_INFINITY),
  )!
  const irrfBruto = arredondar(baseCalculo * faixa.aliquota - faixa.deducao)
  const irrf = Math.max(0, irrfBruto)
  const isento = irrf === 0

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: ehAluguel ? 'Aluguel Bruto Recebido' : 'Salário Bruto',
      valor: params.salarioBruto,
      tipo: 'neutro',
    },
    ...(ehAluguel ? [] : [{ descricao: '(-) INSS', valor: inss, tipo: 'debito' as const }]),
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
    { descricao: 'Base de Cálculo IRRF', valor: baseCalculo, tipo: 'neutro' },
    ...(faixa.aliquota > 0
      ? [
          {
            descricao: `Alíquota ${(faixa.aliquota * 100).toFixed(1)}%`,
            valor: arredondar(baseCalculo * faixa.aliquota),
            tipo: 'debito' as const,
          },
          {
            descricao: '(-) Parcela a Deduzir',
            valor: faixa.deducao,
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
        ? 'Aluguel − IPTU − condomínio − taxa de administração − dependentes − pensão − outras deduções'
        : 'Bruto − INSS − Dependentes − pensão − outras deduções',
      fonteJuridica: ehAluguel
        ? 'RIR/2018 (Decreto 9.580/2018) arts. 42 e 776 | IN RFB 1.500 art. 31'
        : 'RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007',
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        baseCalculo,
        aliquota: faixa.aliquota,
        deducaoParcela: faixa.deducao,
        deducaoDependentes,
        irrf,
        isento,
        origemRendimento,
        despesasDedutiveis,
      },
    },
  }
}
