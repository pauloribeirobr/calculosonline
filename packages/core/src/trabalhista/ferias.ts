/**
 * Cálculo de férias.
 *
 * Base legal:
 *  - CLT arts. 129–153
 *  - CLT art. 130: dias por faltas no período aquisitivo
 *  - CF/88 art. 7º, XVII: terço constitucional
 *  - CLT art. 143: abono pecuniário (até 1/3 vendido)
 *  - CLT art. 137: férias em atraso pagas em dobro
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, dividir, formatarBRL, validarSalario } from '../utils'

export interface FeriasParams {
  salarioBruto: number
  /** Faltas injustificadas no período aquisitivo */
  diasFaltas: number
  /** Dias convertidos em abono pecuniário (máx. 1/3 do direito) */
  diasAbono?: number
  /** Férias pagas em atraso → CLT art. 137 (dobro) */
  emAtraso?: boolean
}

export interface FeriasResultado {
  diasDireito: number
  diasGozados: number
  diasAbono: number
  /** Salário proporcional aos dias gozados (sem 1/3) */
  salarioFerias: number
  /** Adicional de 1/3 sobre o salário de férias */
  adicionalTerco: number
  /** Valor do abono pecuniário (já com 1/3) */
  valorAbono: number
  /** Total bruto = salário + 1/3 + abono (× 2 se em atraso) */
  totalBruto: number
  perdeuDireito: boolean
}

/**
 * Tabela de redução de dias por faltas injustificadas (CLT art. 130).
 * >32 faltas → perde o direito ao período.
 */
function diasFeriasPorFaltas(faltas: number): number {
  if (faltas <= 5) return 30
  if (faltas <= 14) return 24
  if (faltas <= 23) return 18
  if (faltas <= 32) return 12
  return 0
}

export function calcularFerias(params: FeriasParams): ResultadoOuErro<FeriasResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.diasFaltas < 0 || params.diasFaltas > 365) {
    erros.push({ campo: 'diasFaltas', mensagem: 'Número de faltas inválido (0–365)' })
  }
  if ((params.diasAbono ?? 0) < 0) {
    erros.push({ campo: 'diasAbono', mensagem: 'Dias de abono não podem ser negativos' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const diasDireito = diasFeriasPorFaltas(params.diasFaltas)
  const dataReferencia = new Date().toISOString().slice(0, 10)

  if (diasDireito === 0) {
    return {
      sucesso: true,
      dados: {
        resultado: 0,
        detalhamento: [
          {
            descricao: 'Perdeu o direito às férias',
            valor: 0,
            tipo: 'neutro',
            formula: `${params.diasFaltas} faltas > 32 — CLT art. 133`,
          },
        ],
        baseCalculo: 'Mais de 32 faltas injustificadas no período aquisitivo',
        fonteJuridica: 'CLT art. 133 | CLT arts. 129–130',
        dataReferencia,
        dados: {
          diasDireito: 0,
          diasGozados: 0,
          diasAbono: 0,
          salarioFerias: 0,
          adicionalTerco: 0,
          valorAbono: 0,
          totalBruto: 0,
          perdeuDireito: true,
        },
      },
    }
  }

  const maxAbono = Math.floor(diasDireito / 3)
  const diasAbono = Math.min(params.diasAbono ?? 0, maxAbono)
  const diasGozados = diasDireito - diasAbono

  const valorDiario = dividir(params.salarioBruto, 30)
  const salarioFerias = arredondar(valorDiario * diasGozados)
  const adicionalTerco = arredondar(salarioFerias / 3)
  const valorAbono = arredondar(valorDiario * diasAbono * (1 + 1 / 3))

  const subTotal = arredondar(salarioFerias + adicionalTerco + valorAbono)
  const totalBruto = params.emAtraso ? arredondar(subTotal * 2) : subTotal

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: `Salário de Férias (${diasGozados} dias)`,
      valor: salarioFerias,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} ÷ 30 × ${diasGozados}`,
    },
    {
      descricao: 'Adicional 1/3 Constitucional',
      valor: adicionalTerco,
      tipo: 'credito',
      formula: `${formatarBRL(salarioFerias)} ÷ 3`,
    },
    ...(diasAbono > 0
      ? [
          {
            descricao: `Abono Pecuniário (${diasAbono} dias + 1/3)`,
            valor: valorAbono,
            tipo: 'credito' as const,
            formula: `${formatarBRL(valorDiario)} × ${diasAbono} × 1,333`,
          },
        ]
      : []),
    ...(params.emAtraso
      ? [
          {
            descricao: 'Dobro — Férias em Atraso (CLT art. 137)',
            valor: subTotal,
            tipo: 'credito' as const,
          },
        ]
      : []),
    { descricao: 'Total Bruto', valor: totalBruto, tipo: 'credito' },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: totalBruto,
      detalhamento,
      baseCalculo: `Salário ÷ 30 × ${diasGozados} dias + 1/3${params.emAtraso ? ' (em dobro)' : ''}`,
      fonteJuridica: 'CLT arts. 129–137 | CF/88 art. 7º, XVII',
      dataReferencia,
      dados: {
        diasDireito,
        diasGozados,
        diasAbono,
        salarioFerias,
        adicionalTerco,
        valorAbono,
        totalBruto,
        perdeuDireito: false,
      },
    },
  }
}
