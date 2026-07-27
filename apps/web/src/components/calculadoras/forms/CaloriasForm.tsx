'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularCalorias } from '@calculosonline/core/saude'
import type { FormProps } from './types'

const schema = z.object({
  peso: z.number().positive('Peso deve ser positivo').default(0),
  altura: z.number().positive('Altura deve ser positiva').default(0),
  idade: z.number().positive('Idade deve ser positiva').default(0),
  sexo: z.enum(['masculino', 'feminino']).default('masculino'),
  nivelAtividade: z
    .enum(['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'])
    .default('moderado'),
  objetivo: z.enum(['perda', 'manutencao', 'ganho']).default('manutencao'),
})

export function CaloriasForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularCalorias(data)
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        peso: { label: 'Peso', suffix: 'kg', type: 'number' },
        altura: {
          label: 'Altura',
          suffix: 'cm',
          hint: 'Em centímetros (ex.: 175)',
        },
        idade: { label: 'Idade', suffix: 'anos' },
        sexo: {
          label: 'Sexo biológico',
          type: 'radio',
          options: [
            { value: 'masculino', label: 'Masculino' },
            { value: 'feminino', label: 'Feminino' },
          ],
        },
        nivelAtividade: {
          label: 'Nível de atividade',
          type: 'select',
          options: [
            { value: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)' },
            { value: 'leve', label: 'Leve (1-3 dias/semana)' },
            { value: 'moderado', label: 'Moderado (3-5 dias/semana)' },
            { value: 'intenso', label: 'Intenso (6-7 dias/semana)' },
            { value: 'muito_intenso', label: 'Muito intenso (2× por dia)' },
          ],
        },
        objetivo: {
          label: 'Objetivo',
          type: 'select',
          options: [
            { value: 'perda', label: 'Perda de peso (-500 kcal)' },
            { value: 'manutencao', label: 'Manutenção' },
            { value: 'ganho', label: 'Ganho de massa (+300 kcal)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Calorias"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
