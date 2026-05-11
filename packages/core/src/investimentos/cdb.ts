/**
 * Cálculo de rendimento líquido de CDB / RDB / LC.
 *
 * Tipos de remuneração:
 *  - cdi:        % do CDI (ex: 1.10 = 110% CDI)
 *  - prefixado:  taxa fixa anual (ex: 0.12 = 12% a.a.)
 *  - ipca_mais:  IPCA + taxa real anual
 *
 * Base legal:
 *  - Lei 11.033/2004: IR regressivo (22,5% → 15%)
 *  - Decreto 6.306/2007: IOF regressivo nos primeiros 30 dias
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export type TipoCDB = 'cdi' | 'prefixado' | 'ipca_mais'
export type PrazoIR = 'ate180' | '181_360' | '361_720' | 'acima720'

export const ALIQUOTAS_IR_REGRESSIVO: Record<PrazoIR, number> = {
  ate180: 0.225,
  '181_360': 0.2,
  '361_720': 0.175,
  acima720: 0.15,
}

/** Valores de referência 2026 (atualizáveis quando portaria/SELIC mudar). */
export const CDI_REFERENCIA_2026 = 0.1065
export const IPCA_REFERENCIA_2026 = 0.045

export function getPrazoIR(dias: number): PrazoIR {
  if (dias <= 180) return 'ate180'
  if (dias <= 360) return '181_360'
  if (dias <= 720) return '361_720'
  return 'acima720'
}

export interface CDBParams {
  valorInicial: number
  /** Taxa anual ou multiplicador do CDI (1.10 = 110% CDI) */
  taxaAnual: number
  tipo: TipoCDB
  prazoMeses: number
  /** CDI anualizado (default: 10,65% — referência 2026) */
  cdiAnual?: number
  /** IPCA acumulado em 12 meses (default: 4,50% — referência 2026) */
  ipcaAnual?: number
}

export interface CDBResultado {
  montanteBruto: number
  rendimentoBruto: number
  ir: number
  montanteLiquido: number
  rentabilidadeLiquida: number
  aliquotaIR: number
  taxaAnualEfetiva: number
}

export function calcularCDB(params: CDBParams): ResultadoOuErro<CDBResultado> {
  const erros: ErroValidacao[] = []
  if (params.valorInicial <= 0 || !Number.isFinite(params.valorInicial)) {
    erros.push({ campo: 'valorInicial', mensagem: 'Valor inicial deve ser positivo' })
  }
  if (params.prazoMeses <= 0 || !Number.isFinite(params.prazoMeses)) {
    erros.push({ campo: 'prazoMeses', mensagem: 'Prazo deve ser maior que zero' })
  }
  if (!Number.isFinite(params.taxaAnual) || params.taxaAnual <= 0) {
    erros.push({ campo: 'taxaAnual', mensagem: 'Taxa inválida' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let taxaAnualEfetiva: number
  if (params.tipo === 'cdi') {
    const cdi = params.cdiAnual ?? CDI_REFERENCIA_2026
    taxaAnualEfetiva = cdi * params.taxaAnual
  } else if (params.tipo === 'ipca_mais') {
    const ipca = params.ipcaAnual ?? IPCA_REFERENCIA_2026
    taxaAnualEfetiva = (1 + ipca) * (1 + params.taxaAnual) - 1
  } else {
    taxaAnualEfetiva = params.taxaAnual
  }

  const taxaMensal = Math.pow(1 + taxaAnualEfetiva, 1 / 12) - 1
  const montanteBruto = arredondar(
    params.valorInicial * Math.pow(1 + taxaMensal, params.prazoMeses),
  )
  const rendimentoBruto = arredondar(montanteBruto - params.valorInicial)
  const dias = params.prazoMeses * 30

  // Como o parâmetro mínimo é 1 mês (30 dias), o IOF — que incide apenas
  // nos primeiros 30 dias — não se aplica no domínio coberto pelo calculador.
  const prazoIR = getPrazoIR(dias)
  const aliquotaIR = ALIQUOTAS_IR_REGRESSIVO[prazoIR]
  const ir = arredondar(rendimentoBruto * aliquotaIR)
  const montanteLiquido = arredondar(params.valorInicial + rendimentoBruto - ir)
  const rentabilidadeLiquida = arredondar((montanteLiquido / params.valorInicial - 1) * 100)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Capital Inicial', valor: params.valorInicial, tipo: 'neutro' },
    { descricao: 'Montante Bruto', valor: montanteBruto, tipo: 'credito' },
    { descricao: 'Rendimento Bruto', valor: rendimentoBruto, tipo: 'credito' },
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
      fonteJuridica: 'Lei 11.033/2004 (IR regressivo) | Decreto 6.306/2007 (IOF)',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        montanteBruto,
        rendimentoBruto,
        ir,
        montanteLiquido,
        rentabilidadeLiquida,
        aliquotaIR,
        taxaAnualEfetiva: arredondar(taxaAnualEfetiva * 10000) / 10000,
      },
    },
  }
}
