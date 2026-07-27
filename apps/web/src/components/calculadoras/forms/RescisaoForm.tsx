'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularRescisao } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  dataAdmissao: z.string().min(10, 'Data inválida'),
  dataRescisao: z.string().min(10, 'Data inválida'),
  motivoRescisao: z.enum([
    'sem_justa_causa',
    'justa_causa',
    'com_justa_causa_emp',
    'pedido_demissao',
    'acordo_mutuo',
    'aposentadoria',
  ]),
  saldoFGTS: z.number().min(0, 'FGTS não pode ser negativo').default(0),
  numeroDependentesIRRF: z.number().min(0).default(0),
  feriasVencidas: z.number().min(0).max(2).default(0),
})

export function RescisaoForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularRescisao(data)
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
          type: 'number',
          quickAdd: QUICK_ADD_SALARIO,
        },
        dataAdmissao: { label: 'Data de Admissão', type: 'date' },
        dataRescisao: { label: 'Data de Rescisão', type: 'date' },
        motivoRescisao: {
          label: 'Motivo da Rescisão',
          type: 'select',
          options: [
            { value: 'sem_justa_causa', label: 'Demissão sem justa causa' },
            {
              value: 'com_justa_causa_emp',
              label: 'Rescisão indireta (justa causa do empregador)',
            },
            { value: 'justa_causa', label: 'Justa causa do empregado' },
            { value: 'pedido_demissao', label: 'Pedido de demissão' },
            { value: 'acordo_mutuo', label: 'Acordo mútuo (art. 484-A)' },
            { value: 'aposentadoria', label: 'Aposentadoria' },
          ],
        },
        saldoFGTS: {
          label: 'Saldo do FGTS',
          prefix: 'R$',
          hint: 'Consulte no app FGTS ou extrato Caixa',
        },
        feriasVencidas: {
          label: 'Períodos de férias vencidas',
          suffix: 'períodos',
          hint: '0, 1 ou 2 períodos completos não gozados',
        },
        numeroDependentesIRRF: {
          label: 'Dependentes (IRRF)',
          suffix: 'pessoas',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Rescisão"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
