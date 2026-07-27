'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIMC } from '@calculosonline/core/saude'
import type { FormProps } from './types'

const schema = z.object({
  peso: z.number().positive('Peso deve ser positivo').default(0),
  altura: z.number().positive('Altura deve ser positiva').default(0),
})

export function IMCForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularIMC(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        peso: { label: 'Peso', suffix: 'kg', type: 'number' },
        altura: {
          label: 'Altura',
          suffix: 'm',
          hint: 'Em metros, com ponto decimal (ex.: 1.75)',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular IMC"
      isLoading={!!isLoading}
    />
  )
}
