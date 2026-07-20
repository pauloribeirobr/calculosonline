'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularDecimoTerceiro } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo'),
  mesAdmissao: z.number().min(0).max(12).default(0),
  parcela: z.enum(['primeira', 'segunda', 'total']).default('total'),
  numeroDependentesIRRF: z.number().min(0).default(0),
})

export function DecimoTerceiroForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularDecimoTerceiro({
      salarioBruto: data.salarioBruto,
      mesAdmissao: data.mesAdmissao === 0 ? null : data.mesAdmissao,
      parcela: data.parcela,
      numeroDependentesIRRF: data.numeroDependentesIRRF,
    })
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
          placeholder: '3000',
          type: 'number',
          quickAdd: QUICK_ADD_SALARIO,
        },
        mesAdmissao: {
          label: 'Mês de admissão (1-12)',
          hint: '0 se já trabalhava antes do ano corrente',
        },
        parcela: {
          label: 'Parcela',
          type: 'select',
          options: [
            { value: 'total', label: 'Total (1ª + 2ª)' },
            { value: 'primeira', label: '1ª parcela (até 30/nov)' },
            { value: 'segunda', label: '2ª parcela (até 20/dez)' },
          ],
        },
        numeroDependentesIRRF: { label: 'Dependentes (IRRF)', suffix: 'pessoas' },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular 13º"
      isLoading={!!isLoading}
    />
  )
}
