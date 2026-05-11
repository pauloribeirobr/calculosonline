/**
 * Cálculo de rendimento da Poupança (caderneta de poupança).
 *
 * Regra de remuneração (Lei 12.703/2012):
 *  - Quando SELIC > 8,5% a.a.: 0,5%/mês + TR
 *  - Quando SELIC ≤ 8,5% a.a.: 70% da SELIC + TR
 *
 * Por simplificação consideramos TR ≈ 0 (cenário recente da TR zerada).
 * Isenta de IR para pessoa física (Lei 11.033/2004 art. 3º, V).
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export const SELIC_REFERENCIA_2026 = 0.1325
export const LIMITE_REGRA_NOVA = 0.085

export interface PoupancaParams {
  valorInicial: number
  prazoMeses: number
  aporteMensal?: number
  /** SELIC anual atual (default: 13,25% — referência 2026) */
  selicAnual?: number
  /** TR (Taxa Referencial) mensal — default: 0 */
  trMensal?: number
}

export interface PoupancaResultado {
  montanteFinal: number
  rendimentoTotal: number
  totalAportado: number
  taxaMensalEfetiva: number
  regraAplicada: 'antiga' | 'nova'
  evolucao: Array<{ mes: number; saldo: number; rendimento: number }>
}

export function calcularPoupanca(params: PoupancaParams): ResultadoOuErro<PoupancaResultado> {
  const erros: ErroValidacao[] = []
  if (params.valorInicial < 0 || !Number.isFinite(params.valorInicial)) {
    erros.push({ campo: 'valorInicial', mensagem: 'Valor inicial não pode ser negativo' })
  }
  if (params.prazoMeses <= 0 || !Number.isFinite(params.prazoMeses)) {
    erros.push({ campo: 'prazoMeses', mensagem: 'Prazo deve ser maior que zero' })
  }
  if ((params.aporteMensal ?? 0) < 0) {
    erros.push({ campo: 'aporteMensal', mensagem: 'Aporte mensal não pode ser negativo' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const selic = params.selicAnual ?? SELIC_REFERENCIA_2026
  const tr = params.trMensal ?? 0
  const regra: 'antiga' | 'nova' = selic > LIMITE_REGRA_NOVA ? 'antiga' : 'nova'

  const taxaMensal =
    regra === 'antiga' ? 0.005 + tr : Math.pow(1 + selic * 0.7, 1 / 12) - 1 + tr

  const aporte = params.aporteMensal ?? 0
  let saldo = params.valorInicial
  let totalAportado = params.valorInicial
  const evolucao: Array<{ mes: number; saldo: number; rendimento: number }> = []

  for (let mes = 1; mes <= params.prazoMeses; mes++) {
    saldo = saldo * (1 + taxaMensal) + aporte
    totalAportado += aporte
    evolucao.push({
      mes,
      saldo: arredondar(saldo),
      rendimento: arredondar(saldo - totalAportado),
    })
  }

  const montanteFinal = arredondar(saldo)
  const totalAportadoArred = arredondar(totalAportado)
  const rendimentoTotal = arredondar(montanteFinal - totalAportadoArred)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Capital Inicial', valor: params.valorInicial, tipo: 'credito' },
    {
      descricao: `Aportes Mensais (${params.prazoMeses}×)`,
      valor: arredondar(aporte * params.prazoMeses),
      tipo: 'credito',
    },
    { descricao: 'Rendimento Total', valor: rendimentoTotal, tipo: 'credito' },
    { descricao: 'Montante Final', valor: montanteFinal, tipo: 'credito' },
    {
      descricao: `Regra aplicada: ${regra}`,
      valor: arredondar(taxaMensal * 100),
      tipo: 'neutro',
      formula:
        regra === 'antiga'
          ? '0,5%/mês + TR (SELIC > 8,5% a.a.)'
          : '70% × SELIC + TR (SELIC ≤ 8,5% a.a.)',
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: montanteFinal,
      detalhamento,
      baseCalculo: `Taxa mensal efetiva: ${(taxaMensal * 100).toFixed(4)}% (isenta de IR)`,
      fonteJuridica: 'Lei 12.703/2012 | Lei 11.033/2004 art. 3º, V (isenção IR PF)',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        montanteFinal,
        rendimentoTotal,
        totalAportado: totalAportadoArred,
        taxaMensalEfetiva: arredondar(taxaMensal * 10000) / 10000,
        regraAplicada: regra,
        evolucao,
      },
    },
  }
}
