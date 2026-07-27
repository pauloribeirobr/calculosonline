/**
 * Cálculo do 13º salário (gratificação natalina).
 *
 * Base legal:
 *  - Lei 4.090/1962: direito ao 13º
 *  - Lei 4.749/1965: pagamento em duas parcelas (até 30/11 e até 20/12)
 *  - Mês com ≥15 dias trabalhados conta inteiro
 *  - 1ª parcela: 50% do bruto, sem descontos
 *  - 2ª parcela: complemento, com INSS + IRRF sobre o total
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import {
  calcularINSSProgressivo,
  calcularIRRFMensal,
  getTabelasVigentes,
} from '../tabelas'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export type ParcelaDecimoTerceiro = 'primeira' | 'segunda' | 'total'

export interface DecimoTerceiroParams {
  salarioBruto: number
  /** Mês de admissão (1–12) se admitido no ano corrente, ou null se já estava antes */
  mesAdmissao: number | null
  /** Mês de referência para o cálculo (1–12). Default: mês atual */
  mesReferencia?: number
  anoReferencia?: number
  numeroDependentesIRRF: number
  parcela: ParcelaDecimoTerceiro
  /** Dias trabalhados no mês de admissão (≥15 → mês conta inteiro) */
  diasTrabalhados?: number
}

export interface DecimoTerceiroResultado {
  valorBruto: number
  mesesDireito: number
  descontoINSS: number
  descontoIRRF: number
  valorLiquido: number
  parcela: ParcelaDecimoTerceiro
}

function calcularMesesDireito(mesAdmissao: number | null, diasTrabalhados: number): number {
  if (mesAdmissao === null) return 12
  const mesContaInteiro = diasTrabalhados >= 15
  const meses = 12 - mesAdmissao + 1 - (mesContaInteiro ? 0 : 1)
  return Math.max(0, Math.min(12, meses))
}

export function calcularDecimoTerceiro(
  params: DecimoTerceiroParams,
): ResultadoOuErro<DecimoTerceiroResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.numeroDependentesIRRF < 0) {
    erros.push({
      campo: 'numeroDependentesIRRF',
      mensagem: 'Número de dependentes não pode ser negativo',
    })
  }
  if (params.mesAdmissao !== null && (params.mesAdmissao < 1 || params.mesAdmissao > 12)) {
    erros.push({ campo: 'mesAdmissao', mensagem: 'Mês de admissão deve estar entre 1 e 12' })
  }
  if (
    params.mesReferencia !== undefined &&
    (params.mesReferencia < 1 || params.mesReferencia > 12)
  ) {
    erros.push({ campo: 'mesReferencia', mensagem: 'Mês de referência deve estar entre 1 e 12' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const mesRef = params.mesReferencia ?? new Date().getMonth() + 1
  const anoRef = params.anoReferencia ?? new Date().getFullYear()
  const diasTrab = params.diasTrabalhados ?? 30

  const mesesDireito = calcularMesesDireito(params.mesAdmissao, diasTrab)
  const valorBruto = arredondar((params.salarioBruto / 12) * mesesDireito)

  if (params.parcela === 'primeira') {
    const valorPrimeira = arredondar(valorBruto / 2)
    const detalhamento: ItemDetalhamento[] = [
      {
        descricao: `13º proporcional (${mesesDireito}/12)`,
        valor: valorBruto,
        tipo: 'credito',
        formula: `${formatarBRL(params.salarioBruto)} ÷ 12 × ${mesesDireito}`,
      },
      { descricao: '1ª Parcela (50%)', valor: valorPrimeira, tipo: 'credito' },
    ]
    return {
      sucesso: true,
      dados: {
        resultado: valorPrimeira,
        detalhamento,
        baseCalculo: `(Salário ÷ 12) × ${mesesDireito} meses ÷ 2`,
        fonteJuridica: 'Lei 4.749/1965 art. 2º | Lei 4.090/1962',
        dataReferencia: `${anoRef}-${String(mesRef).padStart(2, '0')}-01`,
        dados: {
          valorBruto: valorPrimeira,
          mesesDireito,
          descontoINSS: 0,
          descontoIRRF: 0,
          valorLiquido: valorPrimeira,
          parcela: 'primeira',
        },
      },
    }
  }

  // 2ª parcela ou total: INSS e IRRF incidem sobre o valor integral do 13º
  const { valorINSS } = calcularINSSProgressivo(valorBruto)
  const { valorIRRF, baseCalculo: baseIRRF } = calcularIRRFMensal({
    salarioBruto: valorBruto,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF,
  })

  const valorLiquidoTotal = arredondar(valorBruto - valorINSS - valorIRRF)
  const primeiraParcelaJaPaga = arredondar(valorBruto / 2)
  const valorPagar =
    params.parcela === 'segunda'
      ? arredondar(valorLiquidoTotal - primeiraParcelaJaPaga)
      : valorLiquidoTotal

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: `13º proporcional (${mesesDireito}/12)`,
      valor: valorBruto,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} ÷ 12 × ${mesesDireito}`,
    },
    { descricao: 'Desconto INSS', valor: valorINSS, tipo: 'debito' },
    {
      descricao: 'Desconto IRRF',
      valor: valorIRRF,
      tipo: 'debito',
      formula: `Base ${formatarBRL(baseIRRF)}`,
    },
    ...(params.parcela === 'segunda'
      ? [
          {
            descricao: '1ª Parcela (já recebida)',
            valor: primeiraParcelaJaPaga,
            tipo: 'debito' as const,
          },
        ]
      : []),
    {
      descricao: params.parcela === 'segunda' ? '2ª Parcela líquida' : '13º Líquido',
      valor: valorPagar,
      tipo: 'credito',
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: valorPagar,
      detalhamento,
      baseCalculo: `(Salário ÷ 12) × ${mesesDireito} meses`,
      fonteJuridica:
        'Lei 4.090/1962 | Lei 4.749/1965 | Decreto 11.936/2024 (INSS) | RIR/2018 (IRRF)',
      dataReferencia: getTabelasVigentes().vigenciaInicio,
      dados: {
        valorBruto,
        mesesDireito,
        descontoINSS: valorINSS,
        descontoIRRF: valorIRRF,
        valorLiquido: valorPagar,
        parcela: params.parcela,
      },
    },
  }
}
