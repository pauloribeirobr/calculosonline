'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularJurosCompostos } from '@calculosonline/core/financeiro'
import { QUICK_ADD_INVESTIMENTO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  principal: z.number().min(0, 'Capital não pode ser negativo').default(0),
  taxaJuros: z.number().positive('Taxa deve ser positiva').default(0),
  periodoTaxa: z.enum(['mensal', 'anual', 'diario']).default('mensal'),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
  aporteMensal: z.number().min(0).default(0),
})

export function JurosCompostosForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularJurosCompostos(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        principal: {
          label: 'Capital inicial',
          prefix: 'R$',
          type: 'number',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        taxaJuros: {
          label: 'Taxa de juros',
          suffix: '(decimal)',
          hint: '0.01 = 1%; 0.1265 = 12,65%',
        },
        periodoTaxa: {
          label: 'Período da taxa',
          type: 'select',
          options: [
            { value: 'mensal', label: 'Mensal (% a.m.)' },
            { value: 'anual', label: 'Anual (% a.a.)' },
            { value: 'diario', label: 'Diário (% a.d.)' },
          ],
        },
        prazoMeses: {
          label: 'Prazo',
          suffix: 'meses',
        },
        aporteMensal: {
          label: 'Aporte mensal',
          prefix: 'R$',
          hint: 'Contribuição mensal adicional (opcional)',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Montante"
      isLoading={!!isLoading}
    />
  )
}
