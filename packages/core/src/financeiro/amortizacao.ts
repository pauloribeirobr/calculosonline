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
import { arredondar, hojeISO } from '../utils'

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
      // A última parcela quita o saldo que sobrou. Com a PMT arredondada, a
      // soma das amortizações escorregava alguns centavos (ou reais, em 360
      // meses) do valor financiado, e o `Math.max(0, …)` escondia o saldo
      // negativo: R$ 300 mil em 360 meses a 0,9% amortizavam R$ 300.011,72
      // (F86, visto na tabela de parcelas).
      const amortizacao = k === n ? saldo : arredondar(pmt - juros)
      const seguro = arredondar(saldo * segTaxa)
      saldo = arredondar(saldo - amortizacao)
      const parcela = arredondar(amortizacao + juros + seguro)

      tabela.push({
        numero: k,
        parcela,
        amortizacao,
        juros,
        seguro,
        saldoDevedor: saldo,
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
      // Mesmo ajuste do Price: R$ 100 mil / 120 = R$ 833,33 por mês deixava
      // R$ 0,40 de dívida depois da última parcela.
      const amortizacao = k === n ? saldo : amortizacaoFixa
      const parcela = arredondar(amortizacao + juros + seguro)
      saldo = arredondar(saldo - amortizacao)

      tabela.push({
        numero: k,
        parcela,
        amortizacao,
        juros,
        seguro,
        saldoDevedor: saldo,
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
      evolucao: {
        titulo: `Tabela de parcelas (${params.sistema === 'price' ? 'Price' : 'SAC'})`,
        colunas: [
          { chave: 'numero', rotulo: 'Parcela', formato: 'integer' },
          { chave: 'parcela', rotulo: 'Valor da parcela' },
          { chave: 'juros', rotulo: 'Juros' },
          { chave: 'amortizacao', rotulo: 'Amortização' },
          ...(totalSeguro > 0 ? [{ chave: 'seguro', rotulo: 'Seguro' }] : []),
          { chave: 'saldoDevedor', rotulo: 'Saldo devedor' },
        ],
        linhas: tabela.map((p) => ({ ...p })),
      },
      baseCalculo:
        params.sistema === 'price'
          ? 'PMT = PV × i × (1+i)^n / ((1+i)^n − 1)'
          : 'Amortização = PV / n | parcela decrescente',
      fonteJuridica: 'Res. CMN 3.517/2007 (CET) | Circular BCB 2.905/1999',
      dataReferencia: hojeISO(),
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
