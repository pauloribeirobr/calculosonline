'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularTesouroDireto } from '@calculosonline/core/investimentos'
import { QUICK_ADD_INVESTIMENTO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  valorInicial: z.number().positive('Valor deve ser positivo'),
  tipo: z
    .enum(['selic', 'prefixado', 'ipca_plus', 'prefixado_cupom', 'ipca_cupom'])
    .default('selic'),
  taxaAnual: z.number().min(0).default(0),
  prazoMeses: z.number().positive('Prazo deve ser positivo'),
})

export function TesouroDiretoForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularTesouroDireto(data)
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
          placeholder: '10000',
          type: 'number',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        tipo: {
          label: 'Tipo de título',
          type: 'select',
          options: [
            { value: 'selic', label: 'Tesouro SELIC (LFT)' },
            { value: 'prefixado', label: 'Tesouro Prefixado (LTN)' },
            { value: 'ipca_plus', label: 'Tesouro IPCA+ (NTN-B Principal)' },
            { value: 'prefixado_cupom', label: 'Prefixado com cupom (NTN-F)' },
            { value: 'ipca_cupom', label: 'IPCA+ com cupom (NTN-B)' },
          ],
        },
        taxaAnual: {
          label: 'Taxa anual (decimal)',
          hint: 'Prefixado: 0.12 = 12% a.a. | IPCA+: 0.06 = 6% real | SELIC: ignore',
          placeholder: '0.12',
        },
        prazoMeses: { label: 'Prazo', suffix: 'meses', placeholder: '24' },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Tesouro Direto"
      isLoading={!!isLoading}
    />
  )
}
