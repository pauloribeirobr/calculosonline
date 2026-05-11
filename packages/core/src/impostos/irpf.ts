/**
 * Cálculo da Declaração Anual de IRPF (modelo simplificado × completo).
 *
 * O ajuste anual permite ao contribuinte optar pelo modelo que resulta em
 * maior restituição (ou menor imposto a pagar). Esta calculadora roda os
 * dois modelos e recomenda o mais vantajoso.
 *
 * Base legal:
 *  - Lei 9.250/1995: deduções e tabela anual
 *  - RIR/2018 (Decreto 9.580/2018)
 *  - IN RFB 2.178/2024: limites de dedução para o exercício 2025/2026
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { type TabelasLegislativas, getTabelasVigentes } from '../tabelas'
import { arredondar } from '../utils'

export interface IRPFParams {
  /** Total anual de rendimentos tributáveis */
  rendimentosTributaveis: number
  rendimentosIsentos?: number
  /** Total já retido na fonte ao longo do ano */
  irrfRetidoFonte: number
  numeroDependentes: number
  /** Dedutíveis integralmente */
  despesasMedicas?: number
  /** Dedutíveis até R$3.561,50/ano por pessoa (contribuinte + dependentes) em 2026 */
  despesasEducacao?: number
  /** Total anual de INSS pago */
  contribuicaoINSS?: number
  pensaoAlimenticia?: number
  /** PGBL: limitada a 12% dos rendimentos tributáveis (não aplicada aqui — informar valor líquido já apurado) */
  contribuicaoPrevidenciaPrivada?: number
}

export interface IRPFResultado {
  modeloIndicado: 'simplificado' | 'completo'
  // Simplificado
  deducaoSimplificada: number
  baseSimplificada: number
  impostoDevidoSimplificado: number
  impostoDevolvidoSimplificado: number
  // Completo
  totalDeducoesCompleto: number
  baseCompleta: number
  impostoDevidoCompleto: number
  impostoDevolvidoCompleto: number
  /** Positivo quando o completo é mais vantajoso */
  diferencaEntreModelos: number
}

/** Limites 2026 (IN RFB 2.178/2024 — exercício 2025/calendário 2024). */
export const DEDUCAO_SIMPLIFICADA_MAX_2026 = 16754.34
export const DEDUCAO_SIMPLIFICADA_PERC = 0.2
export const DEDUCAO_EDUCACAO_MAX_2026 = 3561.5

export function calcularIRPF(params: IRPFParams): ResultadoOuErro<IRPFResultado> {
  const erros: ErroValidacao[] = []
  if (params.rendimentosTributaveis < 0 || !Number.isFinite(params.rendimentosTributaveis)) {
    erros.push({
      campo: 'rendimentosTributaveis',
      mensagem: 'Rendimentos não podem ser negativos',
    })
  }
  if (params.irrfRetidoFonte < 0 || !Number.isFinite(params.irrfRetidoFonte)) {
    erros.push({ campo: 'irrfRetidoFonte', mensagem: 'IRRF retido não pode ser negativo' })
  }
  if (params.numeroDependentes < 0 || !Number.isFinite(params.numeroDependentes)) {
    erros.push({ campo: 'numeroDependentes', mensagem: 'Dependentes não pode ser negativo' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()

  // Modelo Simplificado: dedução padrão de 20% (capped)
  const deducaoSimplificada = arredondar(
    Math.min(
      params.rendimentosTributaveis * DEDUCAO_SIMPLIFICADA_PERC,
      DEDUCAO_SIMPLIFICADA_MAX_2026,
    ),
  )
  const baseSimplificada = arredondar(
    Math.max(0, params.rendimentosTributaveis - deducaoSimplificada),
  )
  const impostoSimplificado = calcularImpostoAnual(baseSimplificada, tabelas)
  const impostoDevolvidoSimplificado = arredondar(params.irrfRetidoFonte - impostoSimplificado)

  // Modelo Completo: soma de deduções legais
  const deducaoDependentes = arredondar(
    params.numeroDependentes * tabelas.deducaoDependenteIRRF * 12,
  )
  const limiteEducacao = DEDUCAO_EDUCACAO_MAX_2026 * (params.numeroDependentes + 1)
  const deducaoEducacao = arredondar(Math.min(params.despesasEducacao ?? 0, limiteEducacao))
  const totalDeducoesCompleto = arredondar(
    (params.contribuicaoINSS ?? 0) +
      deducaoDependentes +
      (params.despesasMedicas ?? 0) +
      deducaoEducacao +
      (params.pensaoAlimenticia ?? 0) +
      (params.contribuicaoPrevidenciaPrivada ?? 0),
  )
  const baseCompleta = arredondar(
    Math.max(0, params.rendimentosTributaveis - totalDeducoesCompleto),
  )
  const impostoCompleto = calcularImpostoAnual(baseCompleta, tabelas)
  const impostoDevolvidoCompleto = arredondar(params.irrfRetidoFonte - impostoCompleto)

  const modeloIndicado =
    impostoDevolvidoCompleto >= impostoDevolvidoSimplificado ? 'completo' : 'simplificado'

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: 'Rendimentos Tributáveis (anual)',
      valor: params.rendimentosTributaveis,
      tipo: 'neutro',
    },
    { descricao: 'IRRF Retido na Fonte', valor: params.irrfRetidoFonte, tipo: 'credito' },
    {
      descricao: 'Simplificado — Dedução padrão (20%)',
      valor: deducaoSimplificada,
      tipo: 'neutro',
    },
    {
      descricao: 'Simplificado — Imposto Devido',
      valor: impostoSimplificado,
      tipo: 'debito',
    },
    {
      descricao: 'Simplificado — Restituição',
      valor: impostoDevolvidoSimplificado,
      tipo: modeloIndicado === 'simplificado' ? 'credito' : 'neutro',
    },
    {
      descricao: 'Completo — Total de Deduções',
      valor: totalDeducoesCompleto,
      tipo: 'neutro',
    },
    { descricao: 'Completo — Imposto Devido', valor: impostoCompleto, tipo: 'debito' },
    {
      descricao: 'Completo — Restituição',
      valor: impostoDevolvidoCompleto,
      tipo: modeloIndicado === 'completo' ? 'credito' : 'neutro',
    },
    {
      descricao: `Modelo indicado: ${modeloIndicado.toUpperCase()}`,
      valor: 0,
      tipo: 'neutro',
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: Math.max(impostoDevolvidoSimplificado, impostoDevolvidoCompleto),
      detalhamento,
      baseCalculo: 'Rendimentos tributáveis − deduções → tabela progressiva anual',
      fonteJuridica: 'Lei 9.250/1995 | RIR/2018 | IN RFB 2.178/2024',
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        modeloIndicado,
        deducaoSimplificada,
        baseSimplificada,
        impostoDevidoSimplificado: impostoSimplificado,
        impostoDevolvidoSimplificado,
        totalDeducoesCompleto,
        baseCompleta,
        impostoDevidoCompleto: impostoCompleto,
        impostoDevolvidoCompleto,
        diferencaEntreModelos: arredondar(
          impostoDevolvidoCompleto - impostoDevolvidoSimplificado,
        ),
      },
    },
  }
}

/**
 * Calcula o imposto anual aplicando a tabela mensal multiplicada por 12.
 * O sistema brasileiro usa "parcela a deduzir" — apenas a alíquota da faixa
 * em que a base se encaixa é aplicada (já é progressiva por construção).
 */
function calcularImpostoAnual(base: number, tabelas: TabelasLegislativas): number {
  // A primeira faixa tem de=0; portanto qualquer base não-negativa cai em alguma faixa
  // ao iterarmos do topo para a base. O `!` reflete a invariante: sempre encontra.
  const faixa = [...tabelas.irrf].reverse().find((f) => base >= f.de * 12)!
  if (faixa.aliquota === 0) return 0
  return Math.max(0, arredondar(base * faixa.aliquota - faixa.deducao * 12))
}
