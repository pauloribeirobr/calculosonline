'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularCDB } from '@calculosonline/core/investimentos'
import { QUICK_ADD_INVESTIMENTO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  valorInicial: z.number().positive('Valor deve ser positivo').default(0),
  taxaAnual: z.number().positive('Taxa deve ser positiva').default(0),
  tipo: z.enum(['cdi', 'prefixado', 'ipca_mais']).default('cdi'),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
})

export function CDBForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularCDB(data)
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        valorInicial: {
          label: 'Valor inicial',
          prefix: 'R$',
          type: 'number',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        tipo: {
          label: 'Tipo de remuneração',
          type: 'select',
          options: [
            { value: 'cdi', label: '% do CDI (ex.: 110%)' },
            { value: 'prefixado', label: 'Prefixado (% a.a. fixo)' },
            { value: 'ipca_mais', label: 'IPCA + taxa real' },
          ],
        },
        taxaAnual: {
          label: 'Taxa',
          hint: 'CDI: 1.10 = 110% do CDI | Prefixado: 0.12 = 12% a.a. | IPCA+: 0.06 = 6% real',
        },
        prazoMeses: { label: 'Prazo', suffix: 'meses' },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular CDB"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
