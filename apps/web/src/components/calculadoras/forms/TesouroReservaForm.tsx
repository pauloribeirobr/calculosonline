'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularTesouroReserva } from '@calculosonline/core/investimentos'
import { QUICK_ADD_INVESTIMENTO, QUICK_ADD_MESES } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  valorInicial: z.number().min(1, 'O mínimo do Tesouro Reserva é R$ 1,00').default(0),
  prazo: z.number().int().positive('Prazo deve ser positivo').default(12),
  // Rádio, não <select>: o heatmap de 25/11 mostrou que o <select> nativo
  // infla o clique morto do Clarity (ver MEMORY.md, Diário de 25/11).
  unidade: z.enum(['meses', 'dias']).default('meses'),
})

export function TesouroReservaForm({
  onResult,
  onError,
  isLoading,
  sharedData,
  autoSubmit,
}: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularTesouroReserva(data)
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        valorInicial: {
          label: 'Valor aplicado',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        prazo: {
          label: 'Prazo até o resgate',
          type: 'stepper',
          min: 1,
          quickAdd: QUICK_ADD_MESES,
        },
        unidade: {
          label: 'O prazo está em',
          type: 'radio',
          hint: 'Use dias para ver o IOF dos resgates feitos antes de 30 dias.',
          options: [
            { value: 'meses', label: 'Meses' },
            { value: 'dias', label: 'Dias' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Simular Tesouro Reserva"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
