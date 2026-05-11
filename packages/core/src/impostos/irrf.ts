/**
 * Cálculo standalone do Imposto de Renda Retido na Fonte (IRRF) mensal.
 *
 * Versão completa com deduções de pensão alimentícia, outras deduções
 * e cálculo automático do INSS quando não informado.
 *
 * Base legal:
 *  - RIR/2018 (Decreto 9.580/2018), tabela progressiva mensal
 *  - Lei 11.482/2007 — atualização das faixas
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { calcularINSSProgressivo, getTabelasVigentes } from '../tabelas'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export interface IRRFParams {
  salarioBruto: number
  numeroDependentes: number
  /** Se não informado, calcula automaticamente pela tabela progressiva */
  descontoINSS?: number
  /** Dedução integral da base do IRRF */
  pensaoAlimenticia?: number
  /** Plano de saúde, previdência privada PGBL, etc. */
  outrasDeducoes?: number
}

export interface IRRFResultado {
  baseCalculo: number
  aliquota: number
  deducaoParcela: number
  deducaoDependentes: number
  irrf: number
  isento: boolean
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
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()
  const inss = params.descontoINSS ?? calcularINSSProgressivo(params.salarioBruto).valorINSS
  const deducaoDependentes = arredondar(
    params.numeroDependentes * tabelas.deducaoDependenteIRRF,
  )
  const pensao = params.pensaoAlimenticia ?? 0
  const outras = params.outrasDeducoes ?? 0

  const baseCalculo = arredondar(
    Math.max(0, params.salarioBruto - inss - deducaoDependentes - pensao - outras),
  )

  // Última faixa tem ate=null (Infinity), portanto find sempre encontra alguma faixa.
  const faixa = tabelas.irrf.find(
    (f) => baseCalculo <= (f.ate ?? Number.POSITIVE_INFINITY),
  )!
  const irrfBruto = arredondar(baseCalculo * faixa.aliquota - faixa.deducao)
  const irrf = Math.max(0, irrfBruto)
  const isento = irrf === 0

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Salário Bruto', valor: params.salarioBruto, tipo: 'neutro' },
    { descricao: '(-) INSS', valor: inss, tipo: 'debito' },
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
      baseCalculo: 'Bruto − INSS − Dependentes − pensão − outras deduções',
      fonteJuridica: 'RIR/2018 (Decreto 9.580/2018) | Lei 11.482/2007',
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        baseCalculo,
        aliquota: faixa.aliquota,
        deducaoParcela: faixa.deducao,
        deducaoDependentes,
        irrf,
        isento,
      },
    },
  }
}
