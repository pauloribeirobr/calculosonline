/**
 * Sistema de tabelas legislativas com versionamento por data de vigência.
 * Atualizadas via PR automático quando há mudança em portarias oficiais
 * (Receita Federal, MTE, INSS).
 */

import { arredondar } from '../utils'

export interface FaixaINSS {
  /** Limite inferior da faixa (R$) */
  de: number
  /** Limite superior da faixa (R$) — null = sem limite (último piso) */
  ate: number | null
  /** Alíquota efetiva da faixa (decimal: 0.075 = 7,5%) */
  aliquota: number
}

export interface FaixaIRRF {
  de: number
  ate: number | null
  aliquota: number
  /** Parcela a deduzir do imposto apurado (R$) */
  deducao: number
}

export interface TabelasLegislativas {
  /** Data de início da vigência (ISO date "AAAA-MM-DD") */
  vigenciaInicio: string
  /** Data de fim da vigência — null = ainda vigente */
  vigenciaFim: string | null
  /** Salário mínimo nacional (R$) */
  salarioMinimo: number
  /** Tabela progressiva do INSS */
  inss: FaixaINSS[]
  /** Tabela progressiva mensal do IRRF */
  irrf: FaixaIRRF[]
  /** Dedução por dependente no IRRF (R$) */
  deducaoDependenteIRRF: number
  /** Limite de isenção mensal do IRRF (R$) */
  limiteIsencaoIRRF: number
}

export interface PisoRegional {
  uf: string
  nome: string
  valor: number
  lei: string
  vigencia: string
}

/**
 * Tabelas vigentes em 2026.
 * Fontes:
 *  - INSS: Portaria Interministerial MPS/MF nº 2 de 11/01/2024
 *  - IRRF: Lei 14.848/2024 (faixas mensais a partir de fev/2024)
 *  - Salário Mínimo 2026: Decreto a ser publicado em dezembro/2025
 *
 * IMPORTANTE: estes valores são os melhores conhecidos em março/2026 e devem
 * ser atualizados pelo workflow automático em packages/core quando publicada
 * portaria nova.
 */
export const TABELAS_2026: TabelasLegislativas = {
  vigenciaInicio: '2026-01-01',
  vigenciaFim: null,
  salarioMinimo: 1518.0,
  inss: [
    { de: 0, ate: 1518.0, aliquota: 0.075 },
    { de: 1518.01, ate: 2793.88, aliquota: 0.09 },
    { de: 2793.89, ate: 4190.83, aliquota: 0.12 },
    { de: 4190.84, ate: 8157.41, aliquota: 0.14 },
  ],
  irrf: [
    { de: 0, ate: 2428.8, aliquota: 0, deducao: 0 },
    { de: 2428.81, ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { de: 2826.66, ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
    { de: 3751.06, ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { de: 4664.69, ate: null, aliquota: 0.275, deducao: 908.73 },
  ],
  deducaoDependenteIRRF: 189.59,
  limiteIsencaoIRRF: 2428.8,
}

/**
 * Pisos regionais por UF para 2026.
 * Estados sem piso próprio aplicam o salário mínimo federal.
 */
export const PISOS_REGIONAIS_2026: PisoRegional[] = [
  { uf: 'SP', nome: 'São Paulo', valor: 1700.0, lei: 'Lei Estadual 17.373/2021', vigencia: '2026-01-01' },
  { uf: 'RJ', nome: 'Rio de Janeiro', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MG', nome: 'Minas Gerais', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'RS', nome: 'Rio Grande do Sul', valor: 1636.94, lei: 'Lei Estadual 15.567/2021', vigencia: '2026-01-01' },
  { uf: 'SC', nome: 'Santa Catarina', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PR', nome: 'Paraná', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'BA', nome: 'Bahia', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PE', nome: 'Pernambuco', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'CE', nome: 'Ceará', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'DF', nome: 'Distrito Federal', valor: 2824.29, lei: 'Lei Distrital 6.983/2021', vigencia: '2026-01-01' },
  { uf: 'GO', nome: 'Goiás', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MT', nome: 'Mato Grosso', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PA', nome: 'Pará', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'AM', nome: 'Amazonas', valor: 1518.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
]

/** Retorna o piso regional da UF informada, ou o salário mínimo federal como fallback. */
export function getPisoRegional(uf: string): number {
  const piso = PISOS_REGIONAIS_2026.find((p) => p.uf === uf.toUpperCase())
  return piso?.valor ?? TABELAS_2026.salarioMinimo
}

/**
 * Lista cronológica de tabelas legislativas conhecidas.
 * Exposta para permitir testes com tabelas históricas/hipotéticas.
 */
export const TABELAS_HISTORICAS: TabelasLegislativas[] = [TABELAS_2026]

/**
 * Retorna as tabelas vigentes na data informada.
 * `historico` é injetável para testar cenários com tabelas com vigência encerrada.
 */
export function getTabelasVigentes(
  data: Date = new Date(),
  historico: TabelasLegislativas[] = TABELAS_HISTORICAS,
): TabelasLegislativas {
  const iso = data.toISOString().slice(0, 10)
  const vigente = historico.find((t) => {
    const dentro = iso >= t.vigenciaInicio
    const aindaValida = t.vigenciaFim === null || iso <= t.vigenciaFim
    return dentro && aindaValida
  })

  // Fallback determinístico: a lista de tabelas é não-vazia por construção.
  return vigente ?? (historico[historico.length - 1] as TabelasLegislativas)
}

export interface DetalheFaixaINSS {
  faixa: string
  base: number
  aliquota: number
  valor: number
}

/**
 * Calcula o INSS pelo regime progressivo (Decreto 11.936/2024).
 * Cada faixa incide apenas sobre a parcela do salário dentro dela —
 * o teto da última faixa funciona como cap natural da contribuição.
 *
 * `tabelas` é injetável para testar tabelas históricas ou hipotéticas
 * (ex.: faixa final aberta sem teto).
 */
export function calcularINSSProgressivo(
  salarioBruto: number,
  tabelas: TabelasLegislativas = getTabelasVigentes(),
): {
  valorINSS: number
  detalhamento: DetalheFaixaINSS[]
} {
  let totalINSS = 0
  const detalhamento: DetalheFaixaINSS[] = []

  for (const faixa of tabelas.inss) {
    const limite = faixa.ate ?? Number.POSITIVE_INFINITY
    const baseNaFaixa = Math.min(salarioBruto, limite) - faixa.de
    if (baseNaFaixa <= 0) continue

    const valorFaixa = arredondar(baseNaFaixa * faixa.aliquota)
    totalINSS += valorFaixa

    detalhamento.push({
      faixa: faixa.ate === null ? 'teto' : `Até R$ ${faixa.ate.toFixed(2)}`,
      base: arredondar(baseNaFaixa),
      aliquota: faixa.aliquota,
      valor: valorFaixa,
    })
  }

  return { valorINSS: arredondar(totalINSS), detalhamento }
}

/**
 * Calcula o IRRF pela tabela progressiva mensal.
 * Base = salário bruto − INSS − (dependentes × dedução) − outras deduções.
 */
export function calcularIRRFMensal(params: {
  salarioBruto: number
  inss: number
  numeroDependentes: number
  outrasDeducoes?: number
}): {
  valorIRRF: number
  baseCalculo: number
  aliquota: number
  deducao: number
} {
  const tabelas = getTabelasVigentes()
  const deducaoDep = params.numeroDependentes * tabelas.deducaoDependenteIRRF
  const baseCalculo = arredondar(
    Math.max(0, params.salarioBruto - params.inss - deducaoDep - (params.outrasDeducoes ?? 0)),
  )

  const faixa = tabelas.irrf.find((f) => {
    const limite = f.ate ?? Number.POSITIVE_INFINITY
    return baseCalculo >= f.de && baseCalculo <= limite
  })

  if (!faixa || faixa.aliquota === 0) {
    return { valorIRRF: 0, baseCalculo, aliquota: 0, deducao: 0 }
  }

  const valorIRRF = arredondar(baseCalculo * faixa.aliquota - faixa.deducao)
  return {
    valorIRRF: Math.max(0, valorIRRF),
    baseCalculo,
    aliquota: faixa.aliquota,
    deducao: faixa.deducao,
  }
}
