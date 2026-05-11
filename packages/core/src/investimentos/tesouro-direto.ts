/**
 * Cálculo de rendimento líquido de títulos do Tesouro Direto.
 *
 * Tipos:
 *  - prefixado:         taxa fixa anual (LTN)
 *  - selic:             100% da SELIC (LFT)
 *  - ipca_plus:         IPCA + taxa real (NTN-B Principal)
 *  - prefixado_cupom:   prefixado com cupom semestral (NTN-F)
 *  - ipca_cupom:        IPCA+ com cupom semestral (NTN-B)
 *
 * Custos:
 *  - Taxa de custódia B3: 0,20% a.a. sobre o valor investido
 *    (isenta para Tesouro SELIC até R$ 10.000)
 *  - IR regressivo (Lei 11.033/2004) — mesma tabela do CDB
 *  - IOF nos primeiros 30 dias
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'
import {
  ALIQUOTAS_IR_REGRESSIVO,
  IPCA_REFERENCIA_2026,
  getPrazoIR,
} from './cdb'

export type TipoTesouroDireto =
  | 'prefixado'
  | 'selic'
  | 'ipca_plus'
  | 'prefixado_cupom'
  | 'ipca_cupom'

export const TAXA_CUSTODIA_B3 = 0.002
export const LIMITE_ISENCAO_SELIC = 10000
export const SELIC_REFERENCIA_2026 = 0.1325

export interface TesouroDiretoParams {
  valorInicial: number
  tipo: TipoTesouroDireto
  /** Para prefixado: taxa anual (0.12 = 12% a.a.); para ipca_plus: taxa real (0.06 = 6% real) */
  taxaAnual: number
  prazoMeses: number
  ipcaAnual?: number
  selicAnual?: number
}

export interface TesouroDiretoResultado {
  montanteBruto: number
  rendimentoBruto: number
  custodia: number
  ir: number
  montanteLiquido: number
  rentabilidadeLiquida: number
  aliquotaIR: number
  taxaAnualEfetiva: number
  custodiaIsenta: boolean
}

export function calcularTesouroDireto(
  params: TesouroDiretoParams,
): ResultadoOuErro<TesouroDiretoResultado> {
  const erros: ErroValidacao[] = []
  if (params.valorInicial <= 0 || !Number.isFinite(params.valorInicial)) {
    erros.push({ campo: 'valorInicial', mensagem: 'Valor inicial deve ser positivo' })
  }
  if (params.prazoMeses <= 0 || !Number.isFinite(params.prazoMeses)) {
    erros.push({ campo: 'prazoMeses', mensagem: 'Prazo deve ser maior que zero' })
  }
  if (!Number.isFinite(params.taxaAnual) || params.taxaAnual < 0) {
    erros.push({ campo: 'taxaAnual', mensagem: 'Taxa inválida' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let taxaAnualEfetiva: number
  if (params.tipo === 'selic') {
    taxaAnualEfetiva = params.selicAnual ?? SELIC_REFERENCIA_2026
  } else if (params.tipo === 'ipca_plus' || params.tipo === 'ipca_cupom') {
    const ipca = params.ipcaAnual ?? IPCA_REFERENCIA_2026
    taxaAnualEfetiva = (1 + ipca) * (1 + params.taxaAnual) - 1
  } else {
    // prefixado e prefixado_cupom
    taxaAnualEfetiva = params.taxaAnual
  }

  const taxaMensal = Math.pow(1 + taxaAnualEfetiva, 1 / 12) - 1
  const montanteBruto = arredondar(
    params.valorInicial * Math.pow(1 + taxaMensal, params.prazoMeses),
  )
  const rendimentoBruto = arredondar(montanteBruto - params.valorInicial)
  const dias = params.prazoMeses * 30
  const anos = params.prazoMeses / 12

  // Custódia B3: cobrada anualmente sobre o valor médio investido (simplificação: sobre o valor inicial)
  const custodiaIsenta = params.tipo === 'selic' && params.valorInicial <= LIMITE_ISENCAO_SELIC
  const custodia = custodiaIsenta
    ? 0
    : arredondar(params.valorInicial * TAXA_CUSTODIA_B3 * anos)

  // Como o parâmetro mínimo é 1 mês (30 dias), o IOF não se aplica.
  const prazoIR = getPrazoIR(dias)
  const aliquotaIR = ALIQUOTAS_IR_REGRESSIVO[prazoIR]
  const ir = arredondar(rendimentoBruto * aliquotaIR)

  const montanteLiquido = arredondar(
    params.valorInicial + rendimentoBruto - ir - custodia,
  )
  const rentabilidadeLiquida = arredondar((montanteLiquido / params.valorInicial - 1) * 100)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Capital Inicial', valor: params.valorInicial, tipo: 'neutro' },
    { descricao: 'Montante Bruto', valor: montanteBruto, tipo: 'credito' },
    { descricao: 'Rendimento Bruto', valor: rendimentoBruto, tipo: 'credito' },
    {
      descricao: custodiaIsenta
        ? '(-) Custódia B3 (isenta)'
        : `(-) Custódia B3 (${(TAXA_CUSTODIA_B3 * 100).toFixed(2)}% a.a.)`,
      valor: custodia,
      tipo: 'debito',
    },
    {
      descricao: `(-) IR ${(aliquotaIR * 100).toFixed(1)}% (${prazoIR})`,
      valor: ir,
      tipo: 'debito',
    },
    { descricao: 'Montante Líquido', valor: montanteLiquido, tipo: 'credito' },
    {
      descricao: 'Rentabilidade Líquida',
      valor: rentabilidadeLiquida,
      tipo: 'neutro',
      formula: `${rentabilidadeLiquida.toFixed(2)}%`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: montanteLiquido,
      detalhamento,
      baseCalculo: `Taxa efetiva anual: ${(taxaAnualEfetiva * 100).toFixed(2)}% a.a.`,
      fonteJuridica:
        'Lei 11.033/2004 (IR regressivo) | Decreto 6.306/2007 (IOF) | Resolução B3 (custódia)',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        montanteBruto,
        rendimentoBruto,
        custodia,
        ir,
        montanteLiquido,
        rentabilidadeLiquida,
        aliquotaIR,
        taxaAnualEfetiva: arredondar(taxaAnualEfetiva * 10000) / 10000,
        custodiaIsenta,
      },
    },
  }
}
