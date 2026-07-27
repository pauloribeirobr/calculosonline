'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularINSS } from '@calculosonline/core/impostos'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().min(0, 'Salário não pode ser negativo').default(0),
  categoria: z.enum(['empregado', 'autonomo', 'facultativo', 'mei']).default('empregado'),
})

export function INSSForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularINSS(data)
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
          type: 'number',
          hint: 'Ignorado para MEI (usa o salário mínimo)',
          quickAdd: QUICK_ADD_SALARIO,
        },
        categoria: {
          label: 'Categoria',
          type: 'select',
          options: [
            { value: 'empregado', label: 'Empregado CLT (progressivo)' },
            { value: 'autonomo', label: 'Autônomo / Contribuinte individual (20%)' },
            { value: 'facultativo', label: 'Facultativo (20%)' },
            { value: 'mei', label: 'MEI (5% do salário mínimo)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular INSS"
      isLoading={!!isLoading}
    />
  )
}
