'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularPoupanca, REFERENCIAS_MERCADO } from '@calculosonline/core/investimentos'
import {
  QUICK_ADD_APORTE,
  QUICK_ADD_INVESTIMENTO,
  QUICK_ADD_MESES,
  QUICK_ADD_TAXA_ANUAL,
} from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  valorInicial: z.number().min(0, 'Valor não pode ser negativo').default(0),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
  aporteMensal: z.number().min(0).default(0),
  selicAnual: z.number().min(0).default(REFERENCIAS_MERCADO.selicAnual),
})

export function PoupancaForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularPoupanca(data)
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
          type: 'currency',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        prazoMeses: {
          label: 'Prazo (meses)',
          type: 'stepper',
          min: 1,
          suffix: 'meses',
          quickAdd: QUICK_ADD_MESES,
        },
        aporteMensal: {
          label: 'Aporte mensal',
          prefix: 'R$',
          type: 'currency',
          hint: 'Contribuição mensal adicional (opcional)',
          quickAdd: QUICK_ADD_APORTE,
        },
        selicAnual: {
          label: 'SELIC anual (decimal)',
          hint: `Meta Selic do Banco Central em ${REFERENCIAS_MERCADO.dataConsulta.split('-').reverse().join('/')}: ${(REFERENCIAS_MERCADO.selicAnual * 100).toLocaleString('pt-BR')}%`,
          quickAdd: QUICK_ADD_TAXA_ANUAL,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Poupança"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
