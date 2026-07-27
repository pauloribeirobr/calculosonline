'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularPoupanca } from '@calculosonline/core/investimentos'
import { QUICK_ADD_INVESTIMENTO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  valorInicial: z.number().min(0, 'Valor não pode ser negativo').default(0),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
  aporteMensal: z.number().min(0).default(0),
  selicAnual: z.number().min(0).default(0.1325),
})

export function PoupancaForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularPoupanca(data)
    if (r.sucesso) onResult(r.dados)
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
        prazoMeses: { label: 'Prazo', suffix: 'meses' },
        aporteMensal: {
          label: 'Aporte mensal',
          prefix: 'R$',
          hint: 'Contribuição mensal adicional (opcional)',
        },
        selicAnual: {
          label: 'SELIC anual (decimal)',
          hint: 'Default 0,1325 (13,25% — referência 2026)',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Poupança"
      isLoading={!!isLoading}
    />
  )
}
