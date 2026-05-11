/**
 * Cálculo de margem de lucro e markup.
 *
 * Diferença entre os dois conceitos:
 *  - Margem de lucro = Lucro ÷ Preço de Venda × 100
 *  - Markup          = Lucro ÷ Custo × 100
 *
 * Recebe um dos dois (preço ou markup) e calcula o restante.
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export interface MargemLucroParams {
  custoTotal: number
  /** Se informado, calcula margem/markup a partir do preço */
  precoVenda?: number
  /** Se informado e precoVenda não, calcula o preço a partir do markup */
  markupPercent?: number
}

export interface MargemLucroResultado {
  precoVenda: number
  lucro: number
  margemLucro: number
  markup: number
}

export function calcularMargemLucro(
  params: MargemLucroParams,
): ResultadoOuErro<MargemLucroResultado> {
  const erros: ErroValidacao[] = []
  if (params.custoTotal <= 0 || !Number.isFinite(params.custoTotal)) {
    erros.push({ campo: 'custoTotal', mensagem: 'Custo deve ser maior que zero' })
  }
  const temPreco =
    params.precoVenda !== undefined &&
    Number.isFinite(params.precoVenda) &&
    params.precoVenda > 0
  const temMarkup =
    params.markupPercent !== undefined && Number.isFinite(params.markupPercent)
  if (!temPreco && !temMarkup) {
    erros.push({
      campo: 'precoVenda',
      mensagem: 'Informe o preço de venda ou o markup desejado',
    })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let precoVenda: number
  let lucro: number
  let margemLucro: number
  let markup: number

  if (temPreco) {
    precoVenda = params.precoVenda!
    lucro = arredondar(precoVenda - params.custoTotal)
    margemLucro = arredondar((lucro / precoVenda) * 100)
    markup = arredondar((lucro / params.custoTotal) * 100)
  } else {
    markup = params.markupPercent!
    precoVenda = arredondar(params.custoTotal * (1 + markup / 100))
    lucro = arredondar(precoVenda - params.custoTotal)
    margemLucro = precoVenda === 0 ? 0 : arredondar((lucro / precoVenda) * 100)
  }

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Custo Total', valor: params.custoTotal, tipo: 'debito' },
    { descricao: 'Preço de Venda', valor: precoVenda, tipo: 'credito' },
    { descricao: 'Lucro', valor: lucro, tipo: lucro >= 0 ? 'credito' : 'debito' },
    {
      descricao: 'Margem de Lucro',
      valor: margemLucro,
      tipo: 'neutro',
      formula: `(Lucro ÷ Preço) × 100 = ${margemLucro.toFixed(2)}%`,
    },
    {
      descricao: 'Markup',
      valor: markup,
      tipo: 'neutro',
      formula: `(Lucro ÷ Custo) × 100 = ${markup.toFixed(2)}%`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: precoVenda,
      detalhamento,
      baseCalculo: 'Margem = Lucro ÷ Preço | Markup = Lucro ÷ Custo',
      fonteJuridica: 'Conceitos de contabilidade de custos',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { precoVenda, lucro, margemLucro, markup },
    },
  }
}
