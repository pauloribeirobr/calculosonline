/**
 * Cálculo do Fundo de Garantia por Tempo de Serviço (FGTS).
 *
 * Base legal:
 *  - Lei 8.036/1990: depósito de 8% sobre a remuneração mensal
 *  - Lei 8.036/1990 art. 18: multa rescisória (40% sem justa causa, 20% acordo)
 *  - Lei 13.932/2019: saque-aniversário (tabela progressiva)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export type ModalidadeFGTS = 'rescisao' | 'saque_aniversario' | 'contribuicao_mensal'

export interface FGTSParams {
  salarioBruto: number
  mesesTrabalhados: number
  modalidade: ModalidadeFGTS
  /** Saldo atual do FGTS (necessário para rescisão e saque-aniversário) */
  saldoAtual?: number
  /** Para saque-aniversário: mês de aniversário (1-12) — apenas informativo */
  mesAniversario?: number
}

export interface FGTSResultado {
  depositoMensal: number
  depositosNoPeriodo: number
  saldoProjetado: number
  multaRescisoria40: number
  multaRescisoria20: number
  saqueAniversarioValor?: number
  saqueAniversarioAliquota?: number
}

/**
 * Tabela do saque-aniversário (Lei 13.932/2019, anexo único).
 * Estrutura: até `ate` reais, aplica `aliquota` somada de `parcela` adicional.
 */
const TABELA_SAQUE_ANIVERSARIO: Array<{
  ate: number | null
  aliquota: number
  parcela: number
}> = [
  { ate: 500, aliquota: 0.5, parcela: 0 },
  { ate: 1000, aliquota: 0.4, parcela: 50 },
  { ate: 5000, aliquota: 0.3, parcela: 150 },
  { ate: 10000, aliquota: 0.2, parcela: 650 },
  { ate: 15000, aliquota: 0.15, parcela: 1150 },
  { ate: 20000, aliquota: 0.1, parcela: 1900 },
  { ate: null, aliquota: 0.05, parcela: 2900 },
]

export function calcularFGTS(params: FGTSParams): ResultadoOuErro<FGTSResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.mesesTrabalhados < 0 || !Number.isFinite(params.mesesTrabalhados)) {
    erros.push({
      campo: 'mesesTrabalhados',
      mensagem: 'Meses trabalhados não pode ser negativo',
    })
  }
  if ((params.saldoAtual ?? 0) < 0) {
    erros.push({ campo: 'saldoAtual', mensagem: 'Saldo atual não pode ser negativo' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const depositoMensal = arredondar(params.salarioBruto * 0.08)
  const depositosNoPeriodo = arredondar(depositoMensal * params.mesesTrabalhados)
  const saldoAtual = params.saldoAtual ?? 0
  const saldoProjetado = arredondar(saldoAtual + depositosNoPeriodo)

  const multaRescisoria40 = arredondar(saldoProjetado * 0.4)
  const multaRescisoria20 = arredondar(saldoProjetado * 0.2)

  let saqueAniversarioValor: number | undefined
  let saqueAniversarioAliquota: number | undefined

  if (params.modalidade === 'saque_aniversario' && saldoAtual > 0) {
    const faixa = TABELA_SAQUE_ANIVERSARIO.find(
      (f) => saldoAtual <= (f.ate ?? Number.POSITIVE_INFINITY),
    )
    if (faixa) {
      saqueAniversarioAliquota = faixa.aliquota
      saqueAniversarioValor = arredondar(saldoAtual * faixa.aliquota + faixa.parcela)
    }
  }

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: 'Depósito Mensal (8%)',
      valor: depositoMensal,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} × 8%`,
    },
    {
      descricao: `Depósitos em ${params.mesesTrabalhados} ${
        params.mesesTrabalhados === 1 ? 'mês' : 'meses'
      }`,
      valor: depositosNoPeriodo,
      tipo: 'credito',
    },
    { descricao: 'Saldo Projetado', valor: saldoProjetado, tipo: 'credito' },
    { descricao: 'Multa Rescisória 40% (sem justa causa)', valor: multaRescisoria40, tipo: 'neutro' },
    { descricao: 'Multa Rescisória 20% (acordo mútuo)', valor: multaRescisoria20, tipo: 'neutro' },
    ...(saqueAniversarioValor !== undefined && saqueAniversarioAliquota !== undefined
      ? [
          {
            descricao: `Saque-Aniversário (${(saqueAniversarioAliquota * 100).toFixed(0)}%)`,
            valor: saqueAniversarioValor,
            tipo: 'credito' as const,
            formula: `${formatarBRL(saldoAtual)} × ${(saqueAniversarioAliquota * 100).toFixed(0)}% + parcela`,
          },
        ]
      : []),
  ]

  return {
    sucesso: true,
    dados: {
      resultado: depositoMensal,
      detalhamento,
      baseCalculo: '8% sobre salário bruto por competência (não incide sobre INSS/IRRF)',
      fonteJuridica: 'Lei 8.036/1990 | Lei 13.932/2019 (Saque-Aniversário)',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        depositoMensal,
        depositosNoPeriodo,
        saldoProjetado,
        multaRescisoria40,
        multaRescisoria20,
        ...(saqueAniversarioValor !== undefined ? { saqueAniversarioValor } : {}),
        ...(saqueAniversarioAliquota !== undefined ? { saqueAniversarioAliquota } : {}),
      },
    },
  }
}
