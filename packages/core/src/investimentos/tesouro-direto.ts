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
 *    (no Tesouro SELIC, só sobre o que passa de R$ 10.000 por CPF)
 *  - IR regressivo (Lei 11.033/2004) — mesma tabela do CDB
 *  - IOF nos primeiros 30 dias
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, hojeISO } from '../utils'
import {
  ALIQUOTAS_IR_REGRESSIVO,
  diasDoPrazo,
  rotuloIR,
  IPCA_REFERENCIA_2026,
  getPrazoIR,
} from './cdb'
import { REFERENCIAS_MERCADO } from './referencias'

export type TipoTesouroDireto =
  | 'prefixado'
  | 'selic'
  | 'ipca_plus'
  | 'prefixado_cupom'
  | 'ipca_cupom'

export const TAXA_CUSTODIA_B3 = 0.002
export const LIMITE_ISENCAO_SELIC = 10000
export const SELIC_REFERENCIA_2026 = REFERENCIAS_MERCADO.selicAnual

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

  // Custódia B3: provisionada diariamente e cobrada na venda, no vencimento ou no
  // pagamento de juros (simplificação: sobre o valor inicial). No Tesouro Selic,
  // os primeiros R$ 10.000 por CPF são isentos e a taxa incide só sobre o
  // excedente (B3, "Tarifas de Tesouro Direto"). Até a F82 o motor cobrava
  // sobre o valor inteiro de quem passava dos R$ 10.000.
  const custodiaIsenta = params.tipo === 'selic' && params.valorInicial <= LIMITE_ISENCAO_SELIC
  const baseCustodia =
    params.tipo === 'selic'
      ? Math.max(0, params.valorInicial - LIMITE_ISENCAO_SELIC)
      : params.valorInicial

  // Como o parâmetro mínimo é 1 mês (30 dias), o IOF não se aplica.
  const resgateNoMes = (mes: number) => {
    const montanteBruto = arredondar(params.valorInicial * Math.pow(1 + taxaMensal, mes))
    const rendimentoBruto = arredondar(montanteBruto - params.valorInicial)
    const custodia = arredondar(baseCustodia * TAXA_CUSTODIA_B3 * (mes / 12))
    const prazoIR = getPrazoIR(diasDoPrazo(mes))
    const aliquotaIR = ALIQUOTAS_IR_REGRESSIVO[prazoIR]
    const ir = arredondar(rendimentoBruto * aliquotaIR)
    const montanteLiquido = arredondar(params.valorInicial + rendimentoBruto - ir - custodia)
    return { montanteBruto, rendimentoBruto, custodia, prazoIR, aliquotaIR, ir, montanteLiquido }
  }

  // Mesma leitura do CDB: cada linha é a venda naquele mês, com a faixa de IR
  // e a custódia acumulada até ali.
  const linhas: Array<Record<string, number>> = []
  let brutoAnterior = params.valorInicial
  for (let mes = 1; mes <= params.prazoMeses; mes++) {
    const r = resgateNoMes(mes)
    linhas.push({
      mes,
      rendimentoMes: arredondar(r.montanteBruto - brutoAnterior),
      montanteBruto: r.montanteBruto,
      custodia: r.custodia,
      ir: r.ir,
      montanteLiquido: r.montanteLiquido,
    })
    brutoAnterior = r.montanteBruto
  }

  const { montanteBruto, rendimentoBruto, custodia, prazoIR, aliquotaIR, ir, montanteLiquido } =
    resgateNoMes(params.prazoMeses)
  const rentabilidadeLiquida = arredondar((montanteLiquido / params.valorInicial - 1) * 100)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Capital Inicial', valor: params.valorInicial, tipo: 'neutro' },
    { descricao: 'Montante Bruto', valor: montanteBruto, tipo: 'credito' },
    { descricao: 'Rendimento Bruto', valor: rendimentoBruto, tipo: 'credito' },
    {
      descricao: custodiaIsenta
        ? '(-) Custódia B3 (isenta)'
        : params.tipo === 'selic'
          ? `(-) Custódia B3 (${(TAXA_CUSTODIA_B3 * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a. sobre o que passa de R$ 10.000)`
          : `(-) Custódia B3 (${(TAXA_CUSTODIA_B3 * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a.)`,
      valor: custodia,
      tipo: 'debito',
    },
    {
      descricao: rotuloIR(aliquotaIR, prazoIR),
      valor: ir,
      tipo: 'debito',
    },
    { descricao: 'Montante Líquido', valor: montanteLiquido, tipo: 'credito' },
    {
      descricao: 'Rentabilidade Líquida',
      valor: rentabilidadeLiquida,
      tipo: 'neutro',
      formula: `${rentabilidadeLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: montanteLiquido,
      detalhamento,
      evolucao: {
        titulo: 'Evolução mês a mês (venda em cada mês)',
        colunas: [
          { chave: 'mes', rotulo: 'Mês', formato: 'integer' },
          { chave: 'rendimentoMes', rotulo: 'Rendimento no mês' },
          { chave: 'montanteBruto', rotulo: 'Saldo bruto' },
          ...(custodiaIsenta ? [] : [{ chave: 'custodia', rotulo: 'Custódia acumulada' }]),
          { chave: 'ir', rotulo: 'IR na venda' },
          { chave: 'montanteLiquido', rotulo: 'Líquido na venda' },
        ],
        linhas,
      },
      baseCalculo: `Taxa efetiva anual: ${(taxaAnualEfetiva * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a.`,
      fonteJuridica:
        'Lei 11.033/2004 (IR regressivo) | Decreto 6.306/2007 (IOF) | Resolução B3 (custódia)',
      dataReferencia: hojeISO(),
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
