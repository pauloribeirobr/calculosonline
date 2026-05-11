/**
 * Cálculo de juros compostos com suporte a aportes mensais.
 *
 * Fórmula: M = P(1+i)^n + PMT × ((1+i)^n − 1) / i
 *
 * A taxa pode ser informada como mensal, anual ou diária — convertemos
 * internamente para mensal usando equivalência de taxas:
 *   - anual → (1+i_a)^(1/12) − 1
 *   - diária → (1+i_d)^30 − 1
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export type PeriodoTaxa = 'mensal' | 'anual' | 'diario'

export interface JurosCompostosParams {
  /** Capital inicial */
  principal: number
  /** Taxa de juros (decimal: 0.01 = 1% no período correspondente) */
  taxaJuros: number
  periodoTaxa: PeriodoTaxa
  prazoMeses: number
  /** Contribuição mensal adicional (default: 0) */
  aporteMensal?: number
}

export interface EvolucaoAnual {
  ano: number
  saldo: number
  juros: number
  aportes: number
}

export interface JurosCompostosResultado {
  montanteFinal: number
  jurosAcumulados: number
  totalAportado: number
  taxaMensalEfetiva: number
  evolucaoAnual: EvolucaoAnual[]
}

export function calcularJurosCompostos(
  params: JurosCompostosParams,
): ResultadoOuErro<JurosCompostosResultado> {
  const erros: ErroValidacao[] = []
  if (params.principal < 0 || !Number.isFinite(params.principal)) {
    erros.push({ campo: 'principal', mensagem: 'Capital não pode ser negativo' })
  }
  if (!Number.isFinite(params.taxaJuros) || params.taxaJuros <= 0 || params.taxaJuros > 10) {
    erros.push({ campo: 'taxaJuros', mensagem: 'Taxa inválida' })
  }
  if (params.prazoMeses <= 0 || !Number.isFinite(params.prazoMeses)) {
    erros.push({ campo: 'prazoMeses', mensagem: 'Prazo deve ser maior que zero' })
  }
  if ((params.aporteMensal ?? 0) < 0) {
    erros.push({ campo: 'aporteMensal', mensagem: 'Aporte mensal não pode ser negativo' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let taxaMensal: number
  if (params.periodoTaxa === 'mensal') {
    taxaMensal = params.taxaJuros
  } else if (params.periodoTaxa === 'anual') {
    taxaMensal = Math.pow(1 + params.taxaJuros, 1 / 12) - 1
  } else {
    taxaMensal = Math.pow(1 + params.taxaJuros, 30) - 1
  }

  const aporte = params.aporteMensal ?? 0
  let saldo = params.principal
  let totalAportado = params.principal
  const evolucaoAnual: EvolucaoAnual[] = []

  for (let mes = 1; mes <= params.prazoMeses; mes++) {
    saldo = saldo * (1 + taxaMensal) + aporte
    totalAportado += aporte
    if (mes % 12 === 0 || mes === params.prazoMeses) {
      const saldoArred = arredondar(saldo)
      const aportesArred = arredondar(totalAportado)
      evolucaoAnual.push({
        ano: Math.ceil(mes / 12),
        saldo: saldoArred,
        juros: arredondar(saldoArred - aportesArred),
        aportes: aportesArred,
      })
    }
  }

  const montanteFinal = arredondar(saldo)
  const totalAportadoArred = arredondar(totalAportado)
  const jurosAcumulados = arredondar(montanteFinal - totalAportadoArred)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Capital Inicial', valor: params.principal, tipo: 'credito' },
    {
      descricao: `Aportes Mensais (${params.prazoMeses}×)`,
      valor: arredondar(aporte * params.prazoMeses),
      tipo: 'credito',
    },
    {
      descricao: 'Juros Acumulados',
      valor: jurosAcumulados,
      tipo: 'credito',
      formula: 'M = P(1+i)^n + PMT × ((1+i)^n − 1) / i',
    },
    { descricao: 'Montante Final', valor: montanteFinal, tipo: 'credito' },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: montanteFinal,
      detalhamento,
      baseCalculo: `M = P(1+i)^n + PMT × ((1+i)^n − 1) / i | i ≈ ${(taxaMensal * 100).toFixed(4)}%/mês`,
      fonteJuridica: 'Matemática financeira',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        montanteFinal,
        jurosAcumulados,
        totalAportado: totalAportadoArred,
        taxaMensalEfetiva: arredondar(taxaMensal * 10000) / 10000,
        evolucaoAnual,
      },
    },
  }
}
