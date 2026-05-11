/**
 * Calculadora de porcentagens com seis modos.
 *
 * Modos suportados:
 *  - percentual_de:        quantos % `valorA` é de `valorB`
 *  - valor_de_percent:     quanto vale `valorB`% de `valorA`
 *  - variacao_percentual:  variação de `valorA` para `valorB` (%)
 *  - valor_acrescimo:      `valorA` somado de `valorB`%
 *  - valor_desconto:       `valorA` subtraído de `valorB`%
 *  - porcentagem_inversa:  se `valorA` é `valorB`% de X, retorna X
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export type TipoPorcentagem =
  | 'percentual_de'
  | 'valor_de_percent'
  | 'variacao_percentual'
  | 'valor_acrescimo'
  | 'valor_desconto'
  | 'porcentagem_inversa'

export interface PorcentagemParams {
  tipo: TipoPorcentagem
  valorA: number
  valorB: number
}

export interface PorcentagemResultado {
  resultado: number
  formula: string
  descricao: string
}

export function calcularPorcentagem(
  params: PorcentagemParams,
): ResultadoOuErro<PorcentagemResultado> {
  const erros: ErroValidacao[] = []
  if (!Number.isFinite(params.valorA)) {
    erros.push({ campo: 'valorA', mensagem: 'Valor A inválido' })
  }
  if (!Number.isFinite(params.valorB)) {
    erros.push({ campo: 'valorB', mensagem: 'Valor B inválido' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  let resultado = 0
  let formula = ''
  let descricao = ''

  switch (params.tipo) {
    case 'percentual_de':
      if (params.valorB === 0) {
        return {
          sucesso: false,
          erros: [{ campo: 'valorB', mensagem: 'Divisor não pode ser zero' }],
        }
      }
      resultado = arredondar((params.valorA / params.valorB) * 100)
      formula = `(${params.valorA} ÷ ${params.valorB}) × 100`
      descricao = `${params.valorA} é ${resultado}% de ${params.valorB}`
      break
    case 'valor_de_percent':
      resultado = arredondar((params.valorB / 100) * params.valorA)
      formula = `${params.valorB}% × ${params.valorA}`
      descricao = `${params.valorB}% de ${params.valorA} = ${resultado}`
      break
    case 'variacao_percentual':
      if (params.valorA === 0) {
        return {
          sucesso: false,
          erros: [{ campo: 'valorA', mensagem: 'Valor inicial não pode ser zero' }],
        }
      }
      resultado = arredondar(((params.valorB - params.valorA) / params.valorA) * 100)
      formula = `((${params.valorB} − ${params.valorA}) ÷ ${params.valorA}) × 100`
      descricao = `Variação de ${params.valorA} para ${params.valorB}: ${resultado > 0 ? '+' : ''}${resultado}%`
      break
    case 'valor_acrescimo':
      resultado = arredondar(params.valorA * (1 + params.valorB / 100))
      formula = `${params.valorA} × (1 + ${params.valorB}%)`
      descricao = `${params.valorA} com acréscimo de ${params.valorB}% = ${resultado}`
      break
    case 'valor_desconto':
      resultado = arredondar(params.valorA * (1 - params.valorB / 100))
      formula = `${params.valorA} × (1 − ${params.valorB}%)`
      descricao = `${params.valorA} com desconto de ${params.valorB}% = ${resultado}`
      break
    case 'porcentagem_inversa':
      if (params.valorB === 0) {
        return {
          sucesso: false,
          erros: [{ campo: 'valorB', mensagem: 'Percentual não pode ser zero' }],
        }
      }
      resultado = arredondar((params.valorA / params.valorB) * 100)
      formula = `${params.valorA} ÷ (${params.valorB}% / 100)`
      descricao = `${params.valorA} é ${params.valorB}% de ${resultado}`
      break
  }

  const detalhamento: ItemDetalhamento[] = [
    { descricao, valor: resultado, tipo: 'neutro', formula },
  ]

  return {
    sucesso: true,
    dados: {
      resultado,
      detalhamento,
      baseCalculo: formula,
      fonteJuridica: 'Matemática básica',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { resultado, formula, descricao },
    },
  }
}
