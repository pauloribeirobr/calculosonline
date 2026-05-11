/**
 * Cálculo do gasto calórico diário (TDEE) e meta calórica.
 *
 * Fórmula da Taxa Metabólica Basal (TMB) — Mifflin-St Jeor (1990):
 *  - Homens:   10 × peso + 6,25 × altura − 5 × idade + 5
 *  - Mulheres: 10 × peso + 6,25 × altura − 5 × idade − 161
 *
 * TDEE = TMB × fator de atividade física
 * Meta = TDEE ± ajuste calórico (perda, manutenção, ganho)
 *
 * Macronutrientes padrão: 25% proteína, 50% carboidrato, 25% gordura
 *  - Proteína: 4 kcal/g | Carboidrato: 4 kcal/g | Gordura: 9 kcal/g
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'
import type { SexoBiologico } from './imc'

export type NivelAtividade =
  | 'sedentario'
  | 'leve'
  | 'moderado'
  | 'intenso'
  | 'muito_intenso'

export const FATORES_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
}

export type ObjetivoCalorico = 'perda' | 'manutencao' | 'ganho'

export interface CaloriasParams {
  peso: number
  /** Altura em centímetros (não metros) */
  altura: number
  idade: number
  sexo: SexoBiologico
  nivelAtividade: NivelAtividade
  objetivo: ObjetivoCalorico
}

export interface MacroNutrientes {
  proteinas: number
  carboidratos: number
  gorduras: number
}

export interface CaloriasResultado {
  tmb: number
  tdee: number
  caloriasMeta: number
  fatorAtividade: number
  macros: MacroNutrientes
}

export function calcularCalorias(
  params: CaloriasParams,
): ResultadoOuErro<CaloriasResultado> {
  const erros: ErroValidacao[] = []
  if (params.peso <= 0 || params.peso > 500 || !Number.isFinite(params.peso)) {
    erros.push({ campo: 'peso', mensagem: 'Peso inválido (1–500 kg)' })
  }
  if (params.altura <= 100 || params.altura > 250 || !Number.isFinite(params.altura)) {
    erros.push({ campo: 'altura', mensagem: 'Altura inválida (100–250 cm)' })
  }
  if (params.idade < 15 || params.idade > 100 || !Number.isFinite(params.idade)) {
    erros.push({ campo: 'idade', mensagem: 'Idade inválida (15–100 anos)' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const tmb =
    params.sexo === 'masculino'
      ? arredondar(10 * params.peso + 6.25 * params.altura - 5 * params.idade + 5)
      : arredondar(10 * params.peso + 6.25 * params.altura - 5 * params.idade - 161)

  const fator = FATORES_ATIVIDADE[params.nivelAtividade]
  const tdee = arredondar(tmb * fator)

  const ajuste =
    params.objetivo === 'perda' ? -500 : params.objetivo === 'ganho' ? 300 : 0
  const caloriasMeta = tdee + ajuste

  const macros: MacroNutrientes = {
    proteinas: arredondar((caloriasMeta * 0.25) / 4),
    carboidratos: arredondar((caloriasMeta * 0.5) / 4),
    gorduras: arredondar((caloriasMeta * 0.25) / 9),
  }

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'TMB (Mifflin-St Jeor)', valor: tmb, tipo: 'neutro' },
    {
      descricao: `TDEE (fator ${fator})`,
      valor: tdee,
      tipo: 'neutro',
      formula: `${tmb} × ${fator}`,
    },
    { descricao: `Meta (${params.objetivo})`, valor: caloriasMeta, tipo: 'credito' },
    {
      descricao: 'Proteínas',
      valor: macros.proteinas,
      tipo: 'neutro',
      formula: `${macros.proteinas}g`,
    },
    {
      descricao: 'Carboidratos',
      valor: macros.carboidratos,
      tipo: 'neutro',
      formula: `${macros.carboidratos}g`,
    },
    {
      descricao: 'Gorduras',
      valor: macros.gorduras,
      tipo: 'neutro',
      formula: `${macros.gorduras}g`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: caloriasMeta,
      detalhamento,
      baseCalculo:
        params.sexo === 'masculino'
          ? 'TMB = 10×peso + 6,25×altura − 5×idade + 5'
          : 'TMB = 10×peso + 6,25×altura − 5×idade − 161',
      fonteJuridica: 'Mifflin-St Jeor (1990) | OMS Guidelines on Physical Activity',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: { tmb, tdee, caloriasMeta, fatorAtividade: fator, macros },
    },
  }
}
