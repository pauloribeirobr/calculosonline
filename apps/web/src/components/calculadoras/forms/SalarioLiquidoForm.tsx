'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularSalarioLiquido } from '@calculosonline/core/trabalhista'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo'),
  numeroDependentesIRRF: z.number().min(0).default(0),
  outrasDeducoes: z.number().min(0).default(0),
  outrosDescontos: z.number().min(0).default(0),
  temValeTransporte: z.enum(['sim', 'nao']).default('nao'),
})

export function SalarioLiquidoForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularSalarioLiquido({
      salarioBruto: data.salarioBruto,
      numeroDependentesIRRF: data.numeroDependentesIRRF,
      outrasDeducoes: data.outrasDeducoes,
      outrosDescontos: data.outrosDescontos,
      temValeTransporte: data.temValeTransporte === 'sim',
    })
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: { label: 'Salário Bruto', prefix: 'R$', placeholder: '3000', type: 'number' },
        numeroDependentesIRRF: {
          label: 'Dependentes (IRRF)',
          suffix: 'pessoas',
          hint: 'Cada dependente reduz a base de cálculo do IRRF',
        },
        outrasDeducoes: {
          label: 'Outras deduções (saúde, PGBL)',
          prefix: 'R$',
          hint: 'Reduzem a base do IRRF',
        },
        outrosDescontos: {
          label: 'Outros descontos (consignado, etc.)',
          prefix: 'R$',
          hint: 'Não afetam o cálculo do IRRF',
        },
        temValeTransporte: {
          label: 'Recebe vale-transporte?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não' },
            { value: 'sim', label: 'Sim — descontar 6% do salário' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Salário Líquido"
      isLoading={!!isLoading}
    />
  )
}
