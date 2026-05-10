/**
 * Sistema de tabelas legislativas com versionamento por data de vigência.
 * Atualizadas via PR automático quando há mudança em portarias oficiais
 * (Receita Federal, MTE, INSS).
 */

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

const TABELAS_HISTORICAS: TabelasLegislativas[] = [TABELAS_2026]

/**
 * Retorna as tabelas vigentes na data informada.
 * Em caso de empate (data === vigenciaInicio), retorna a tabela com vigência
 * que inclui essa data.
 */
export function getTabelasVigentes(data: Date = new Date()): TabelasLegislativas {
  const iso = data.toISOString().slice(0, 10)
  const vigente = TABELAS_HISTORICAS.find((t) => {
    const dentro = iso >= t.vigenciaInicio
    const aindaValida = t.vigenciaFim === null || iso <= t.vigenciaFim
    return dentro && aindaValida
  })

  if (!vigente) {
    // Fallback: retorna a mais recente conhecida.
    const ultima = TABELAS_HISTORICAS[TABELAS_HISTORICAS.length - 1]
    if (!ultima) {
      throw new Error('Nenhuma tabela legislativa cadastrada')
    }
    return ultima
  }

  return vigente
}
