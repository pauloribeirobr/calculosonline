'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularFGTS } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  mesesTrabalhados: z.number().min(0, 'Meses não pode ser negativo').default(12),
  saldoAtual: z.number().min(0, 'Saldo não pode ser negativo').default(0),
  modalidade: z
    .enum(['contribuicao_mensal', 'rescisao', 'saque_aniversario'])
    .default('contribuicao_mensal'),
})

export function FGTSForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularFGTS(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: {
          label: 'Salário Bruto',
          prefix: 'R$',
          type: 'number',
          quickAdd: QUICK_ADD_SALARIO,
        },
        mesesTrabalhados: {
          label: 'Meses trabalhados',
          suffix: 'meses',
          hint: 'Período projetado de contribuição',
        },
        saldoAtual: {
          label: 'Saldo atual do FGTS',
          prefix: 'R$',
          hint: 'Consulte no app FGTS ou extrato Caixa',
        },
        modalidade: {
          label: 'Modalidade',
          type: 'select',
          options: [
            { value: 'contribuicao_mensal', label: 'Depósito mensal (acúmulo)' },
            { value: 'rescisao', label: 'Rescisão (multa 40% / 20%)' },
            { value: 'saque_aniversario', label: 'Saque-aniversário (Lei 13.932/19)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular FGTS"
      isLoading={!!isLoading}
    />
  )
}
