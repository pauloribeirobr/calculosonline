/**
 * Cálculo de salário líquido CLT.
 *
 * Base legal:
 *  - INSS progressivo: Decreto 11.936/2024
 *  - IRRF: RIR/2018 (Decreto 9.580/2018), tabela mensal vigente em 2026
 *  - Vale-transporte: Lei 7.418/1985, art. 9º, II (desconto máx. 6%)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import {
  calcularINSSProgressivo,
  calcularIRRFMensal,
  getTabelasVigentes,
} from '../tabelas'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export interface SalarioLiquidoParams {
  salarioBruto: number
  numeroDependentesIRRF: number
  /** Plano de saúde, previdência privada, etc. — deduzidos antes do IRRF */
  outrasDeducoes?: number
  /** Se true, desconta 6% do salário (limite legal) a título de vale-transporte */
  temValeTransporte?: boolean
  /** Outros descontos que NÃO afetam a base do IRRF (ex.: empréstimo consignado) */
  outrosDescontos?: number
}

export interface SalarioLiquidoResultado {
  salarioBruto: number
  descontoINSS: number
  descontoIRRF: number
  descontoVT: number
  outrosDescontos: number
  totalDescontos: number
  salarioLiquido: number
  /** Alíquota efetiva real do INSS sobre o salário bruto */
  aliquotaEfetivaINSS: number
  /** Alíquota efetiva real do IRRF sobre o salário bruto */
  aliquotaEfetivaIRRF: number
}

export function calcularSalarioLiquido(
  params: SalarioLiquidoParams,
): ResultadoOuErro<SalarioLiquidoResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.numeroDependentesIRRF < 0 || !Number.isFinite(params.numeroDependentesIRRF)) {
    erros.push({
      campo: 'numeroDependentesIRRF',
      mensagem: 'Número de dependentes não pode ser negativo',
    })
  }
  if ((params.outrasDeducoes ?? 0) < 0) {
    erros.push({ campo: 'outrasDeducoes', mensagem: 'Outras deduções não podem ser negativas' })
  }
  if ((params.outrosDescontos ?? 0) < 0) {
    erros.push({ campo: 'outrosDescontos', mensagem: 'Outros descontos não podem ser negativos' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const { valorINSS, detalhamento: detINSS } = calcularINSSProgressivo(params.salarioBruto)

  const {
    valorIRRF,
    baseCalculo: baseIRRF,
    aliquota,
  } = calcularIRRFMensal({
    salarioBruto: params.salarioBruto,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF,
    outrasDeducoes: params.outrasDeducoes ?? 0,
  })

  const descontoVT = params.temValeTransporte ? arredondar(params.salarioBruto * 0.06) : 0
  const outrosDescontos = params.outrosDescontos ?? 0
  const totalDescontos = arredondar(valorINSS + valorIRRF + descontoVT + outrosDescontos)
  const salarioLiquido = arredondar(params.salarioBruto - totalDescontos)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Salário Bruto', valor: params.salarioBruto, tipo: 'credito' },
    ...detINSS.map<ItemDetalhamento>((d) => ({
      descricao: `INSS ${(d.aliquota * 100).toFixed(1)}% (${d.faixa})`,
      valor: d.valor,
      tipo: 'debito',
      formula: `${formatarBRL(d.base)} × ${(d.aliquota * 100).toFixed(1)}%`,
    })),
    {
      descricao: 'IRRF',
      valor: valorIRRF,
      tipo: 'debito',
      formula:
        aliquota === 0
          ? `Base ${formatarBRL(baseIRRF)} — isento`
          : `Base ${formatarBRL(baseIRRF)} × ${(aliquota * 100).toFixed(1)}%`,
    },
    ...(descontoVT > 0
      ? [
          {
            descricao: 'Vale-Transporte (6%)',
            valor: descontoVT,
            tipo: 'debito' as const,
            formula: `${formatarBRL(params.salarioBruto)} × 6%`,
          },
        ]
      : []),
    ...(outrosDescontos > 0
      ? [{ descricao: 'Outros Descontos', valor: outrosDescontos, tipo: 'debito' as const }]
      : []),
    { descricao: 'Salário Líquido', valor: salarioLiquido, tipo: 'neutro' },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: salarioLiquido,
      detalhamento,
      baseCalculo: `Salário Bruto (${formatarBRL(params.salarioBruto)}) − INSS − IRRF − descontos`,
      fonteJuridica:
        'Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF) | Lei 7.418/1985 (vale-transporte)',
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: {
        salarioBruto: params.salarioBruto,
        descontoINSS: valorINSS,
        descontoIRRF: valorIRRF,
        descontoVT,
        outrosDescontos,
        totalDescontos,
        salarioLiquido,
        aliquotaEfetivaINSS: arredondar((valorINSS / params.salarioBruto) * 10000) / 10000,
        aliquotaEfetivaIRRF: arredondar((valorIRRF / params.salarioBruto) * 10000) / 10000,
      },
    },
  }
}
