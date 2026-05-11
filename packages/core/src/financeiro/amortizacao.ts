/**
 * Cálculo de amortização de empréstimo / financiamento.
 *
 * Sistemas suportados:
 *  - Price (parcela fixa): PMT = PV × i × (1+i)^n / ((1+i)^n − 1)
 *  - SAC (amortização constante): parcela decrescente, juros sobre saldo
 *
 * Suporta seguro mensal proporcional ao saldo devedor (MIP+DFI).
 * O CET (Custo Efetivo Total) é aproximado pela taxa média paga, anualizada.
 *
 * Base legal:
 *  - Resolução CMN 3.517/2007: obrigatoriedade de divulgação do CET
 *  - Circular BCB 2.905/1999
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export type SistemaAmortizacao = 'price' | 'sac'

export interface AmortizacaoParams {
  valorFinanciado: number
  /** Taxa nominal mensal de juros (decimal: 0.015 = 1,5% a.m.) */
  taxaMensalJuros: number
  prazoMeses: number
  sistema: SistemaAmortizacao
  /** Taxa de seguro (decimal) aplicada sobre o saldo devedor — opcional */
  taxaSeguroMensal?: number
}

export interface ParcelaAmortizacao {
  numero: number
  parcela: number
  amortizacao: number
  juros: number
  seguro: number
  saldoDevedor: number
}

export interface AmortizacaoResultado {
  primeiraParcela: number
  ultimaParcela: number
  totalPago: number
  totalJuros: number
  totalSeguro: number
  /** Custo Efetivo Total anual aproximado */
  cet: number
  tabela: ParcelaAmortizacao[]
}

export function calcularAmortizacao(
  params: AmortizacaoParams,
): ResultadoOuErro<AmortizacaoResultado> {
  const erros: ErroValidacao[] = []
  if (params.valorFinanciado <= 0 || !Number.isFinite(params.valorFinanciado)) {
    erros.push({
      campo: 'valorFinanciado',
      mensagem: 'Valor financiado deve ser maior que zero',
    })
  }
  if (params.taxaMensalJuros <= 0 || !Number.isFinite(params.taxaMensalJuros)) {
    erros.push({ campo: 'taxaMensalJuros', mensagem: 'Taxa deve ser maior que zero' })
  }
  if (params.prazoMeses <= 0 || !Number.isFinite(params.prazoMeses)) {
    erros.push({ campo: 'prazoMeses', mensagem: 'Prazo deve ser maior que zero' })
  }
  if ((params.taxaSeguroMensal ?? 0) < 0) {
    erros.push({ campo: 'taxaSeguroMensal', mensagem: 'Taxa de seguro inválida' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const i = params.taxaMensalJuros
  const n = params.prazoMeses
  const PV = params.valorFinanciado
  const segTaxa = params.taxaSeguroMensal ?? 0
  const tabela: ParcelaAmortizacao[] = []

  let totalPago = 0
  let totalJuros = 0
  let totalSeguro = 0

  if (params.sistema === 'price') {
    const fator = Math.pow(1 + i, n)
    const pmt = arredondar((PV * i * fator) / (fator - 1))
    let saldo = PV

    for (let k = 1; k <= n; k++) {
      const juros = arredondar(saldo * i)
      const amortizacao = arredondar(pmt - juros)
      const seguro = arredondar(saldo * segTaxa)
      saldo = arredondar(saldo - amortizacao)
      const parcela = arredondar(pmt + seguro)

      tabela.push({
        numero: k,
        parcela,
        amortizacao,
        juros,
        seguro,
        saldoDevedor: Math.max(0, saldo),
      })
      totalPago += parcela
      totalJuros += juros
      totalSeguro += seguro
    }
  } else {
    const amortizacaoFixa = arredondar(PV / n)
    let saldo = PV

    for (let k = 1; k <= n; k++) {
      const juros = arredondar(saldo * i)
      const seguro = arredondar(saldo * segTaxa)
      const parcela = arredondar(amortizacaoFixa + juros + seguro)
      saldo = arredondar(saldo - amortizacaoFixa)

      tabela.push({
        numero: k,
        parcela,
        amortizacao: amortizacaoFixa,
        juros,
        seguro,
        saldoDevedor: Math.max(0, saldo),
      })
      totalPago += parcela
      totalJuros += juros
      totalSeguro += seguro
    }
  }

  // CET anualizado (aproximação pela taxa média paga, depois anualizada)
  const cetMensal = totalPago / PV / n - 1 / n
  const cet = arredondar(Math.pow(1 + cetMensal, 12) - 1)

  const primeiraParcela = tabela[0]!.parcela
  const ultimaParcela = tabela[tabela.length - 1]!.parcela

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Valor Financiado', valor: PV, tipo: 'neutro' },
    { descricao: 'Total de Juros', valor: arredondar(totalJuros), tipo: 'debito' },
    ...(totalSeguro > 0
      ? [
          {
            descricao: 'Total de Seguros',
            valor: arredondar(totalSeguro),
            tipo: 'debito' as const,
          },
        ]
      : []),
    { descricao: 'Total Pago', valor: arredondar(totalPago), tipo: 'debito' },
    { descricao: '1ª Parcela', valor: primeiraParcela, tipo: 'neutro' },
    { descricao: 'Última Parcela', valor: ultimaParcela, tipo: 'neutro' },
    {
      descricao: 'CET anual',
      valor: arredondar(cet * 100),
      tipo: 'neutro',
      formula: `${(cet * 100).toFixed(2)}% a.a.`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: arredondar(totalPago),
      detalhamento,
      baseCalculo:
        params.sistema === 'price'
          ? 'PMT = PV × i × (1+i)^n / ((1+i)^n − 1)'
          : 'Amortização = PV / n | parcela decrescente',
      fonteJuridica: 'Res. CMN 3.517/2007 (CET) | Circular BCB 2.905/1999',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        primeiraParcela,
        ultimaParcela,
        totalPago: arredondar(totalPago),
        totalJuros: arredondar(totalJuros),
        totalSeguro: arredondar(totalSeguro),
        cet,
        tabela,
      },
    },
  }
}

/** Alias amigável: chamada igual à `calcularAmortizacao`. */
export const calcularEmprestimo = calcularAmortizacao
/** Alias amigável: chamada igual à `calcularAmortizacao`. */
export const calcularFinanciamento = calcularAmortizacao
