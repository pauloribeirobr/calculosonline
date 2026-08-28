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
          type: 'currency',
          quickAdd: QUICK_ADD_SALARIO,
        },
        // Campo mascarado DD/MM/AAAA em vez do picker nativo, e atalhos ao
        // lado (F51): 11 dos 24 cliques desta página no heatmap do Clarity
        // foram nestes dois campos — o maior atrito medido do site.
        dataAdmissao: {
          label: 'Data de Admissão',
          type: 'date',
          hint: 'Digite direto: 01011990 vira 01/01/1990.',
          dateShortcuts: [
            { label: 'Há 1 ano', kind: 'anosAtras', anos: 1 },
            { label: 'Há 2 anos', kind: 'anosAtras', anos: 2 },
            { label: 'Há 5 anos', kind: 'anosAtras', anos: 5 },
            { label: 'Há 10 anos', kind: 'anosAtras', anos: 10 },
          ],
        },
        dataRescisao: {
          label: 'Data de Rescisão',
          type: 'date',
          dateShortcuts: [
            { label: 'Hoje', kind: 'hoje' },
            { label: 'Fim do mês', kind: 'fimDoMes' },
          ],
        },
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
          type: 'currency',
          hint: 'Consulte no app FGTS ou extrato Caixa',
        },
        feriasVencidas: {
          label: 'Períodos de férias vencidas',
          type: 'stepper',
          min: 0,
          max: 2,
          hint: '0, 1 ou 2 períodos completos não gozados',
        },
        numeroDependentesIRRF: {
          label: 'Dependentes (IRRF)',
          type: 'stepper',
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
