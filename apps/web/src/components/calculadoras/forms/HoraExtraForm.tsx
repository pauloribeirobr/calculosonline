'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularHoraExtra } from '@calculosonline/core/trabalhista'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo'),
  jornadaMensalHoras: z.enum(['44h', '40h', '36h', '30h']).default('44h'),
  quantidadeHoras: z.number().positive('Quantidade deve ser positiva'),
  tipoHora: z.enum(['util', 'domingo', 'feriado', 'noturna']).default('util'),
})

export function HoraExtraForm({ onResult, onError, isLoading }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularHoraExtra(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: { label: 'Salário Bruto', prefix: 'R$', placeholder: '3000', type: 'number' },
        jornadaMensalHoras: {
          label: 'Jornada contratual',
          type: 'select',
          options: [
            { value: '44h', label: '44 horas/semana (padrão CLT)' },
            { value: '40h', label: '40 horas/semana' },
            { value: '36h', label: '36 horas/semana' },
            { value: '30h', label: '30 horas/semana' },
          ],
        },
        quantidadeHoras: {
          label: 'Quantidade de horas extras',
          suffix: 'horas',
          placeholder: '10',
        },
        tipoHora: {
          label: 'Tipo de hora extra',
          type: 'select',
          options: [
            { value: 'util', label: 'Dia útil (+50%)' },
            { value: 'domingo', label: 'Domingo (+100%)' },
            { value: 'feriado', label: 'Feriado (+100%)' },
            { value: 'noturna', label: 'Noturna (+50% sobre hora reduzida)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Hora Extra"
      isLoading={!!isLoading}
    />
  )
}
