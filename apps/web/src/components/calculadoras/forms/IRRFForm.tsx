'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIRRF } from '@calculosonline/core/impostos'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import { itemListSchema, somarItens } from '@/lib/itemListField'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  numeroDependentes: z.number().min(0).default(0),
  pensaoAlimenticia: z.number().min(0).default(0),
  outrasDeducoes: itemListSchema(),
})

export function IRRFForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularIRRF({
      salarioBruto: data.salarioBruto,
      numeroDependentes: data.numeroDependentes,
      pensaoAlimenticia: data.pensaoAlimenticia,
      outrasDeducoes: somarItens(data.outrasDeducoes),
    })
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: {
          label: 'Salário Bruto',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_SALARIO,
        },
        numeroDependentes: { label: 'Dependentes', type: 'stepper' },
        pensaoAlimenticia: { label: 'Pensão alimentícia', prefix: 'R$', type: 'currency' },
        outrasDeducoes: {
          label: 'Outras deduções',
          type: 'itemList',
          prefix: 'R$',
          itemPlaceholder: 'Ex.: Plano de Saúde',
          itemSuggestions: ['Plano de Saúde', 'Previdência Privada PGBL'],
          hint: 'Reduzem a base do cálculo do IRRF',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular IRRF"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
