/**
 * Cálculo do DAS-MEI (Documento de Arrecadação Simplificada).
 *
 * Base legal:
 *  - LC 123/2006 art. 18-A: regime do Microempreendedor Individual
 *  - Resolução CGSN 140/2018: valores fixos do DAS
 *  - Lei 14.442/2022: limite anual atualizado para R$ 81.000
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { getTabelasVigentes } from '../tabelas'
import { arredondar, formatarBRL } from '../utils'

export type AtividadeMEI = 'comercio' | 'industria' | 'servico' | 'comercio_servico'

export interface DASMEIParams {
  atividadePrincipal: AtividadeMEI
  /** Faturamento anual para verificar se permanece dentro do limite MEI */
  faturamentoAnual?: number
}

export interface DASMEIResultado {
  inss: number
  icms: number
  iss: number
  total: number
  dentroLimite: boolean
  tetoAnual: number
  tetoMensal: number
}

export const TETO_MEI_ANUAL = 81000
export const ICMS_FIXO = 1.0
export const ISS_FIXO = 5.0

export function calcularDASMEI(params: DASMEIParams): ResultadoOuErro<DASMEIResultado> {
  const erros: ErroValidacao[] = []
  if ((params.faturamentoAnual ?? 0) < 0) {
    erros.push({
      campo: 'faturamentoAnual',
      mensagem: 'Faturamento anual não pode ser negativo',
    })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const tabelas = getTabelasVigentes()
  const sm = tabelas.salarioMinimo
  const inss = arredondar(sm * 0.05)

  let icms = 0
  let iss = 0
  if (params.atividadePrincipal === 'comercio' || params.atividadePrincipal === 'industria') {
    icms = ICMS_FIXO
  } else if (params.atividadePrincipal === 'servico') {
    iss = ISS_FIXO
  } else {
    // comercio_servico — ambos
    icms = ICMS_FIXO
    iss = ISS_FIXO
  }

  const total = arredondar(inss + icms + iss)
  const dentroLimite = (params.faturamentoAnual ?? 0) <= TETO_MEI_ANUAL

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: 'INSS (5% do Salário Mínimo)',
      valor: inss,
      tipo: 'debito',
      formula: `5% × ${formatarBRL(sm)}`,
    },
    ...(icms > 0
      ? [{ descricao: 'ICMS (fixo)', valor: icms, tipo: 'debito' as const }]
      : []),
    ...(iss > 0 ? [{ descricao: 'ISS (fixo)', valor: iss, tipo: 'debito' as const }] : []),
    { descricao: 'Total DAS mensal', valor: total, tipo: 'debito' },
    { descricao: 'Teto anual MEI', valor: TETO_MEI_ANUAL, tipo: 'neutro' },
    ...(params.faturamentoAnual !== undefined
      ? [
          {
            descricao: dentroLimite
              ? 'Dentro do limite MEI'
              : 'ATENÇÃO: faturamento acima do teto MEI',
            valor: params.faturamentoAnual,
            tipo: dentroLimite ? ('neutro' as const) : ('debito' as const),
          },
        ]
      : []),
  ]

  return {
    sucesso: true,
    dados: {
      resultado: total,
      detalhamento,
      baseCalculo: 'INSS 5% SM + ICMS R$1 (comércio/indústria) + ISS R$5 (serviços)',
      fonteJuridica: 'LC 123/2006 art. 18-A | Resolução CGSN 140/2018',
      dataReferencia: tabelas.vigenciaInicio,
      dados: {
        inss,
        icms,
        iss,
        total,
        dentroLimite,
        tetoAnual: TETO_MEI_ANUAL,
        tetoMensal: arredondar(TETO_MEI_ANUAL / 12),
      },
    },
  }
}
