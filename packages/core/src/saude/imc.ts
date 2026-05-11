/**
 * Cálculo do Índice de Massa Corporal (IMC).
 *
 * IMC = peso (kg) / altura² (m)
 *
 * Classificação segundo a Organização Mundial da Saúde (1997):
 *  - < 16,0:    Magreza grau III   (muito alto)
 *  - 16,0–17,0: Magreza grau II    (alto)
 *  - 17,0–18,5: Magreza grau I     (moderado)
 *  - 18,5–25,0: Peso normal        (muito baixo)
 *  - 25,0–30,0: Sobrepeso          (baixo)
 *  - 30,0–35,0: Obesidade grau I   (moderado)
 *  - 35,0–40,0: Obesidade grau II  (alto)
 *  - > 40,0:    Obesidade grau III (muito alto)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'

export type SexoBiologico = 'masculino' | 'feminino'

export type RiscoIMC = 'muito_baixo' | 'baixo' | 'moderado' | 'alto' | 'muito_alto'

export interface IMCParams {
  peso: number
  altura: number
  idade?: number
  sexo?: SexoBiologico
}

export interface IMCResultado {
  imc: number
  classificacao: string
  risco: RiscoIMC
  pesoIdeal: { min: number; max: number }
  /** Negativo = ganhar peso para chegar à faixa saudável */
  pesoParaPerder: number
}

const CLASSIFICACOES_IMC: Array<{ ate: number; label: string; risco: RiscoIMC }> = [
  { ate: 16.0, label: 'Magreza grau III', risco: 'muito_alto' },
  { ate: 17.0, label: 'Magreza grau II', risco: 'alto' },
  { ate: 18.5, label: 'Magreza grau I', risco: 'moderado' },
  { ate: 25.0, label: 'Peso normal', risco: 'muito_baixo' },
  { ate: 30.0, label: 'Sobrepeso', risco: 'baixo' },
  { ate: 35.0, label: 'Obesidade grau I', risco: 'moderado' },
  { ate: 40.0, label: 'Obesidade grau II', risco: 'alto' },
  { ate: Number.POSITIVE_INFINITY, label: 'Obesidade grau III', risco: 'muito_alto' },
]

export function calcularIMC(params: IMCParams): ResultadoOuErro<IMCResultado> {
  const erros: ErroValidacao[] = []
  if (params.peso <= 0 || params.peso > 500 || !Number.isFinite(params.peso)) {
    erros.push({ campo: 'peso', mensagem: 'Peso inválido (1–500 kg)' })
  }
  if (params.altura <= 0 || params.altura > 3 || !Number.isFinite(params.altura)) {
    erros.push({ campo: 'altura', mensagem: 'Altura inválida (0,5–3,0 m)' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const imc = arredondar(params.peso / (params.altura * params.altura))
  const classif = CLASSIFICACOES_IMC.find((c) => imc <= c.ate)!
  const pesoMinIdeal = arredondar(18.5 * params.altura * params.altura)
  const pesoMaxIdeal = arredondar(24.9 * params.altura * params.altura)
  const pesoParaPerder = arredondar(params.peso - pesoMaxIdeal)

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Peso', valor: params.peso, tipo: 'neutro' },
    { descricao: 'Altura', valor: params.altura, tipo: 'neutro' },
    {
      descricao: 'IMC',
      valor: imc,
      tipo: 'neutro',
      formula: `${params.peso} ÷ ${params.altura}²`,
    },
    { descricao: classif.label, valor: 0, tipo: 'neutro' },
    { descricao: 'Peso ideal (mín)', valor: pesoMinIdeal, tipo: 'neutro' },
    { descricao: 'Peso ideal (máx)', valor: pesoMaxIdeal, tipo: 'neutro' },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: imc,
      detalhamento,
      baseCalculo: 'IMC = peso (kg) ÷ altura² (m)',
      fonteJuridica: 'OMS — World Health Organization (Classificação 1997)',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        imc,
        classificacao: classif.label,
        risco: classif.risco,
        pesoIdeal: { min: pesoMinIdeal, max: pesoMaxIdeal },
        pesoParaPerder,
      },
    },
  }
}
