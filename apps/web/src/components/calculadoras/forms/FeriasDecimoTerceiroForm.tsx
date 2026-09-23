'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularFeriasDecimoTerceiro } from '@calculosonline/core/trabalhista'
import {
  QUICK_ADD_CONTADOR_CURTO,
  QUICK_ADD_DIAS,
  QUICK_ADD_SALARIO,
} from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  mesAdmissao: z.number().min(0).max(12).default(0),
  diasFaltas: z.number().min(0, 'Não pode ser negativo').default(0),
  diasAbono: z.number().min(0).max(10, 'Máximo 10 dias de abono').default(0),
  numeroDependentes: z.number().min(0).default(0),
  adiantarPrimeiraParcela: z.enum(['nao', 'sim']).default('nao'),
})

export function FeriasDecimoTerceiroForm({
  onResult,
  onError,
  isLoading,
  sharedData,
  autoSubmit,
}: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularFeriasDecimoTerceiro({
      salarioBruto: data.salarioBruto,
      mesAdmissao: data.mesAdmissao === 0 ? null : data.mesAdmissao,
      diasFaltas: data.diasFaltas,
      diasAbono: data.diasAbono,
      numeroDependentes: data.numeroDependentes,
      adiantarPrimeiraParcela: data.adiantarPrimeiraParcela === 'sim',
    })
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        salarioBruto: {
          label: 'Salário Bruto',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_SALARIO,
        },
        mesAdmissao: {
          label: 'Mês de admissão',
          type: 'select',
          options: [
            { value: '0', label: '0 — Já trabalhava antes do ano corrente' },
            ...MESES.map((mes, i) => ({ value: String(i + 1), label: `${i + 1} — ${mes}` })),
          ],
          hint: 'Define os meses de 13º; as férias não mudam',
        },
        diasFaltas: {
          label: 'Dias de faltas injustificadas',
          type: 'stepper',
          suffix: 'dias',
          quickAdd: QUICK_ADD_DIAS,
          hint: '>32 faltas perde o direito às férias',
        },
        diasAbono: {
          label: 'Dias de férias vendidos (abono)',
          type: 'stepper',
          max: 10,
          quickAdd: QUICK_ADD_DIAS,
          hint: 'Máximo 1/3 — isento de INSS e IRRF',
        },
        numeroDependentes: {
          label: 'Dependentes (IRRF)',
          type: 'stepper',
          quickAdd: QUICK_ADD_CONTADOR_CURTO,
        },
        adiantarPrimeiraParcela: {
          label: 'Receber a 1ª parcela do 13º junto das férias?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não — 13º nas datas normais' },
            { value: 'sim', label: 'Sim — pedido feito em janeiro (Lei 4.749/1965)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Férias + 13º"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
