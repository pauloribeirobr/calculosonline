'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularDASMEI } from '@calculosonline/core/impostos'
import { QUICK_ADD_VALOR_GRANDE } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  atividadePrincipal: z
    .enum(['comercio', 'industria', 'servico', 'comercio_servico'])
    .default('servico'),
  faturamentoAnual: z.number().min(0).default(0),
})

export function DASMEIForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const params: Parameters<typeof calcularDASMEI>[0] = {
      atividadePrincipal: data.atividadePrincipal,
    }
    if (data.faturamentoAnual > 0) params.faturamentoAnual = data.faturamentoAnual
    const r = calcularDASMEI(params)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        atividadePrincipal: {
          label: 'Atividade principal',
          type: 'select',
          options: [
            { value: 'servico', label: 'Serviços (INSS + ISS R$5)' },
            { value: 'comercio', label: 'Comércio (INSS + ICMS R$1)' },
            { value: 'industria', label: 'Indústria (INSS + ICMS R$1)' },
            { value: 'comercio_servico', label: 'Comércio + Serviço (INSS + ICMS + ISS)' },
          ],
        },
        faturamentoAnual: {
          label: 'Faturamento anual (opcional)',
          prefix: 'R$',
          hint: 'Para verificar se está dentro do teto MEI (R$ 81.000)',
          quickAdd: QUICK_ADD_VALOR_GRANDE,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular DAS"
      isLoading={!!isLoading}
    />
  )
}
