/**
 * Cálculo standalone da contribuição previdenciária ao INSS.
 *
 * Cobre quatro categorias:
 *  - Empregado (CLT): tabela progressiva (Decreto 11.936/2024)
 *  - Autônomo / Contribuinte Individual: 20% sobre salário-base (Lei 8.212/1991 art. 21)
 *  - Facultativo: mesma alíquota de 20%
 *  - MEI: 5% do salário mínimo (LC 123/2006)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { calcularINSSProgressivo, getTabelasVigentes } from '../tabelas'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export type CategoriaINSS = 'empregado' | 'autonomo' | 'facultativo' | 'mei'

export interface INSSParams {
  salarioBruto: number
  categoria: CategoriaINSS
}

export interface INSSResultado {
  contribuicao: number
  aliquotaEfetiva: number
  categoria: CategoriaINSS
  /** true quando o salário atinge o teto da última faixa do INSS */
  teto: boolean
}

/** Teto da última faixa do INSS em 2026 (Portaria Interministerial MPS/MF nº 2/2024). */
export const TETO_INSS_2026 = 8157.41

export function calcularINSS(params: INSSParams): ResultadoOuErro<INSSResultado> {
  const erros: ErroValidacao[] = []
  if (params.categoria !== 'mei') {
    const erroSalario = validarSalario(params.salarioBruto)
    if (erroSalario) erros.push(erroSalario)
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()
  const sm = tabelas.salarioMinimo

  let contribuicao: number
  let fonteJuridica: string
  let formula: string
  let salarioBase: number

  if (params.categoria === 'mei') {
    salarioBase = sm
    contribuicao = arredondar(sm * 0.05)
    fonteJuridica = 'LC 123/2006 art. 18-A | Resolução CGSN 140/2018'
    formula = `5% × ${formatarBRL(sm)} (SM ${tabelas.vigenciaInicio.slice(0, 4)})`
  } else if (params.categoria === 'empregado') {
    salarioBase = params.salarioBruto
    const baseLimitada = Math.min(params.salarioBruto, TETO_INSS_2026)
    const { valorINSS } = calcularINSSProgressivo(baseLimitada)
    contribuicao = valorINSS
    fonteJuridica = 'Decreto 11.936/2024'
    formula = 'Tabela progressiva por faixa salarial (cap no teto)'
  } else {
    // autonomo / facultativo
    salarioBase = params.salarioBruto
    const base = Math.min(params.salarioBruto, TETO_INSS_2026)
    contribuicao = arredondar(base * 0.2)
    fonteJuridica = 'Lei 8.212/1991 art. 21 | IN RFB 2.110/2022'
    formula = `20% × ${formatarBRL(base)}`
  }

  const aliquotaEfetiva =
    params.categoria === 'mei'
      ? 0.05
      : arredondar((contribuicao / params.salarioBruto) * 10000) / 10000

  const teto = params.categoria !== 'mei' && params.salarioBruto >= TETO_INSS_2026

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Salário Base', valor: salarioBase, tipo: 'neutro' },
    {
      descricao: `INSS (${params.categoria})`,
      valor: contribuicao,
      tipo: 'debito',
      formula,
    },
    {
      descricao: 'Alíquota efetiva',
      valor: arredondar(aliquotaEfetiva * 100),
      tipo: 'neutro',
      formula: `${(aliquotaEfetiva * 100).toFixed(2)}%`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: contribuicao,
      detalhamento,
      baseCalculo: formula,
      fonteJuridica,
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        contribuicao,
        aliquotaEfetiva,
        categoria: params.categoria,
        teto,
      },
    },
  }
}
