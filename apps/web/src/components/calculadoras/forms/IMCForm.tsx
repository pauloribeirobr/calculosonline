'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIMC } from '@calculosonline/core/saude'
import {
  QUICK_ADD_ALTURA_M,
  QUICK_ADD_PESO,
} from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  peso: z.number().positive('Peso deve ser positivo').default(0),
  altura: z.number().positive('Altura deve ser positiva').default(0),
})

export function IMCForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularIMC(data)
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        peso: {
          label: 'Peso',
          suffix: 'kg',
          type: 'number',
          quickAdd: QUICK_ADD_PESO,
        },
        altura: {
          label: 'Altura',
          suffix: 'm',
          hint: 'Em metros, com ponto decimal (ex.: 1.75)',
          quickAdd: QUICK_ADD_ALTURA_M,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular IMC"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
