'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularFerias } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_DIAS, QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  diasFaltas: z.number().min(0, 'Não pode ser negativo').default(0),
  diasAbono: z.number().min(0).max(10, 'Máximo 10 dias de abono').default(0),
  emAtraso: z.enum(['nao', 'sim']).default('nao'),
})

export function FeriasForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularFerias({
      salarioBruto: data.salarioBruto,
      diasFaltas: data.diasFaltas,
      diasAbono: data.diasAbono,
      emAtraso: data.emAtraso === 'sim',
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
        diasFaltas: {
          label: 'Dias de faltas injustificadas',
          type: 'stepper',
          suffix: 'dias',
          quickAdd: QUICK_ADD_DIAS,
          hint: '>32 faltas perde o direito ao período',
        },
        diasAbono: {
          label: 'Dias vendidos (abono)',
          type: 'stepper',
          max: 10,
          hint: 'Máximo 1/3 dos dias de direito',
        },
        emAtraso: {
          label: 'Férias pagas em atraso?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não — pagamento no prazo' },
            { value: 'sim', label: 'Sim — pagar em dobro (CLT art. 137)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Férias"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
