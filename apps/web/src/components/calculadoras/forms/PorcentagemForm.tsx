'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularPorcentagem } from '@calculosonline/core/financeiro'
import type { FormProps } from './types'

const schema = z.object({
  tipo: z
    .enum([
      'percentual_de',
      'valor_de_percent',
      'variacao_percentual',
      'valor_acrescimo',
      'valor_desconto',
      'porcentagem_inversa',
    ])
    .default('valor_de_percent'),
  valorA: z.number().default(0),
  valorB: z.number().default(0),
})

export function PorcentagemForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularPorcentagem(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        tipo: {
          label: 'O que você quer calcular?',
          type: 'select',
          options: [
            { value: 'valor_de_percent', label: 'Quanto é X% de um valor?' },
            { value: 'percentual_de', label: 'Quantos % X é de outro valor?' },
            { value: 'variacao_percentual', label: 'Variação percentual entre dois valores' },
            { value: 'valor_acrescimo', label: 'Acrescentar X% a um valor' },
            { value: 'valor_desconto', label: 'Aplicar X% de desconto' },
            { value: 'porcentagem_inversa', label: 'Se X é Y% de algo, qual o total?' },
          ],
        },
        valorA: { label: 'Valor A' },
        valorB: { label: 'Valor B (ou %)' },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular"
      isLoading={!!isLoading}
    />
  )
}
