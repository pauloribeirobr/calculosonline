'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularMargemLucro } from '@calculosonline/core/negocios'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  custoTotal: z.number().positive('Custo deve ser positivo').default(0),
  modo: z.enum(['preco', 'markup']).default('preco'),
  precoVenda: z.number().min(0).default(0),
  markupPercent: z.number().min(0).default(0),
})

export function MargemLucroForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const params: Parameters<typeof calcularMargemLucro>[0] = {
      custoTotal: data.custoTotal,
    }
    if (data.modo === 'preco') params.precoVenda = data.precoVenda
    if (data.modo === 'markup') params.markupPercent = data.markupPercent
    const r = calcularMargemLucro(params)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        custoTotal: {
          label: 'Custo total',
          prefix: 'R$',
          type: 'number',
          quickAdd: QUICK_ADD_SALARIO,
        },
        modo: {
          label: 'Calcular a partir de',
          type: 'select',
          options: [
            { value: 'preco', label: 'Preço de venda (calcular margem)' },
            { value: 'markup', label: 'Markup desejado (calcular preço)' },
          ],
        },
        precoVenda: {
          label: 'Preço de venda',
          prefix: 'R$',
          hint: 'Use quando modo = Preço de venda',
        },
        markupPercent: {
          label: 'Markup desejado',
          suffix: '%',
          hint: 'Use quando modo = Markup',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Margem"
      isLoading={!!isLoading}
    />
  )
}
