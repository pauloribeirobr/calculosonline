/**
 * Cálculo da Declaração Anual de IRPF (modelo simplificado × completo).
 *
 * O ajuste anual permite ao contribuinte optar pelo modelo que resulta em
 * maior restituição (ou menor imposto a pagar). Esta calculadora roda os
 * dois modelos e recomenda o mais vantajoso.
 *
 * Simula a **declaração 2027 (exercício 2027, ano-calendário 2026)**, a primeira
 * com a redução anual da Lei 15.270/2025 (F81).
 *
 * Base legal:
 *  - Lei 9.250/1995: deduções e tabela anual; art. 10, X (desconto simplificado
 *    de R$ 17.640,00) e art. 11-A (redução anual), ambos na redação da
 *    Lei 15.270/2025
 *  - Tabela anual do exercício 2027 publicada pela Receita Federal em
 *    gov.br/receitafederal/.../meu-imposto-de-renda/tabelas/2026
 *  - RIR/2018 (Decreto 9.580/2018)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { getTabelasVigentes } from '../tabelas'
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
  /** Redução anual da Lei 15.270/2025 aplicada em cada modelo (já descontada do imposto devido). */
  reducaoSimplificado: number
  reducaoCompleto: number
}

/**
 * Limites do ano-calendário 2026. O desconto simplificado era R$ 16.754,34 até
 * o ano-calendário 2025 e passou a R$ 17.640,00 (Lei 9.250/1995, art. 10, X).
 */
export const DEDUCAO_SIMPLIFICADA_MAX_2026 = 17640
export const DEDUCAO_SIMPLIFICADA_PERC = 0.2
export const DEDUCAO_EDUCACAO_MAX_2026 = 3561.5
export const DEDUCAO_DEPENDENTE_ANUAL_2026 = 2275.08

/**
 * Tabela anual do exercício 2027, transcrita da Receita. Não é a mensal × 12:
 * as parcelas a deduzir oficiais diferem dela por centavos (4.729,91 contra
 * 4.729,92, 8.105,85 contra 8.105,88, 10.904,66 contra 10.904,76).
 */
export const TABELA_IRPF_ANUAL_2026 = [
  { ate: 29145.6, aliquota: 0, deducao: 0 },
  { ate: 33919.8, aliquota: 0.075, deducao: 2185.92 },
  { ate: 45012.6, aliquota: 0.15, deducao: 4729.91 },
  { ate: 55976.16, aliquota: 0.225, deducao: 8105.85 },
  { ate: Infinity, aliquota: 0.275, deducao: 10904.66 },
] as const

/** Redução anual (Lei 9.250/1995, art. 11-A, incluído pela Lei 15.270/2025). */
export const REDUCAO_ANUAL_2026 = {
  limiteIsencao: 60000,
  reducaoMaxima: 2694.15,
  limiteFinal: 88200,
  constante: 8429.73,
  coeficiente: 0.095575,
} as const

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
  const impostoTabelaSimplificado = calcularImpostoAnual(baseSimplificada)
  const reducaoSimplificado = calcularReducaoAnual(
    params.rendimentosTributaveis,
    impostoTabelaSimplificado,
  )
  const impostoSimplificado = arredondar(impostoTabelaSimplificado - reducaoSimplificado)
  const impostoDevolvidoSimplificado = arredondar(params.irrfRetidoFonte - impostoSimplificado)

  // Modelo Completo: soma de deduções legais
  const deducaoDependentes = arredondar(params.numeroDependentes * DEDUCAO_DEPENDENTE_ANUAL_2026)
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
  const impostoTabelaCompleto = calcularImpostoAnual(baseCompleta)
  const reducaoCompleto = calcularReducaoAnual(params.rendimentosTributaveis, impostoTabelaCompleto)
  const impostoCompleto = arredondar(impostoTabelaCompleto - reducaoCompleto)
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
    ...(reducaoSimplificado > 0
      ? [
          {
            descricao: 'Simplificado — Redução da Lei 15.270/2025',
            valor: reducaoSimplificado,
            tipo: 'neutro' as const,
          },
        ]
      : []),
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
    ...(reducaoCompleto > 0
      ? [
          {
            descricao: 'Completo — Redução da Lei 15.270/2025',
            valor: reducaoCompleto,
            tipo: 'neutro' as const,
          },
        ]
      : []),
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
      baseCalculo:
        'Rendimentos tributáveis − deduções → tabela progressiva anual → redução da Lei 15.270/2025',
      fonteJuridica: 'Lei 9.250/1995 | Lei 15.270/2025 | RIR/2018',
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
        reducaoSimplificado,
        reducaoCompleto,
      },
    },
  }
}

/**
 * Imposto anual pela tabela oficial do exercício 2027. O sistema brasileiro usa
 * "parcela a deduzir" — apenas a alíquota da faixa em que a base se encaixa é
 * aplicada (já é progressiva por construção).
 */
function calcularImpostoAnual(base: number): number {
  // A última faixa vai até Infinity, então qualquer base encontra uma faixa.
  const faixa = TABELA_IRPF_ANUAL_2026.find((f) => base <= f.ate)!
  if (faixa.aliquota === 0) return 0
  return Math.max(0, arredondar(base * faixa.aliquota - faixa.deducao))
}

/**
 * Redução anual do art. 11-A. Incide sobre os rendimentos tributáveis **brutos**
 * (não sobre a base depois das deduções), como o redutor mensal da F64, e fica
 * limitada ao imposto apurado na tabela (§1º).
 */
function calcularReducaoAnual(rendimentosTributaveis: number, impostoTabela: number): number {
  const r = REDUCAO_ANUAL_2026
  let reducao = 0
  if (rendimentosTributaveis <= r.limiteIsencao) reducao = r.reducaoMaxima
  else if (rendimentosTributaveis < r.limiteFinal) {
    reducao = r.constante - r.coeficiente * rendimentosTributaveis
  }
  return arredondar(Math.min(Math.max(0, reducao), impostoTabela))
}
