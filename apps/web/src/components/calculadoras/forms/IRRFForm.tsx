'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIRRF } from '@calculosonline/core/impostos'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo'),
  numeroDependentes: z.number().min(0).default(0),
  pensaoAlimenticia: z.number().min(0).default(0),
  outrasDeducoes: z.number().min(0).default(0),
})

export function IRRFForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularIRRF(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: {
          label: 'Salário Bruto',
          prefix: 'R$',
          placeholder: '5000',
          type: 'number',
          quickAdd: QUICK_ADD_SALARIO,
        },
        numeroDependentes: { label: 'Dependentes', suffix: 'pessoas' },
        pensaoAlimenticia: { label: 'Pensão alimentícia', prefix: 'R$' },
        outrasDeducoes: {
          label: 'Outras deduções (saúde, PGBL)',
          prefix: 'R$',
          hint: 'Plano de saúde, previdência privada PGBL',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular IRRF"
      isLoading={!!isLoading}
    />
  )
}
