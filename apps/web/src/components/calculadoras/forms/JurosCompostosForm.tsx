'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularJurosCompostos } from '@calculosonline/core/financeiro'
import type { FormProps } from './types'

const schema = z.object({
  principal: z.number().min(0, 'Capital não pode ser negativo'),
  taxaJuros: z.number().positive('Taxa deve ser positiva'),
  periodoTaxa: z.enum(['mensal', 'anual', 'diario']).default('mensal'),
  prazoMeses: z.number().positive('Prazo deve ser positivo'),
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
        principal: { label: 'Capital inicial', prefix: 'R$', placeholder: '10000', type: 'number' },
        taxaJuros: {
          label: 'Taxa de juros',
          suffix: '(decimal)',
          placeholder: '0.01',
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
          placeholder: '12',
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
