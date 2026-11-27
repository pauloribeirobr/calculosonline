'use client'

import { useMemo } from 'react'
import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularPoupanca } from '@calculosonline/core/investimentos'
import { QUICK_ADD_APORTE, QUICK_ADD_INVESTIMENTO, QUICK_ADD_MESES } from '@/lib/quickAddPresets'
import {
  DICA_REFERENCIA,
  REFERENCIAS_PERCENTUAL,
  migrarPoupanca,
  paraDecimal,
} from '@/lib/taxasInvestimento'
import type { FormProps } from './types'

// F84: Selic em porcentagem (antes "SELIC anual (decimal)", 0.1375).
const schema = z.object({
  valorInicial: z.number().min(0, 'Valor não pode ser negativo').default(0),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
  aporteMensal: z.number().min(0).default(0),
  selic: z.number().min(0, 'Não pode ser negativa').default(REFERENCIAS_PERCENTUAL.selic),
})

type Dados = z.infer<typeof schema>

export function PoupancaForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  const iniciais = useMemo(() => migrarPoupanca(sharedData), [sharedData])

  function handleSubmit(data: Dados) {
    const r = calcularPoupanca({
      valorInicial: data.valorInicial,
      prazoMeses: data.prazoMeses,
      aporteMensal: data.aporteMensal,
      selicAnual: paraDecimal(data.selic),
    })
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        valorInicial: {
          label: 'Valor inicial',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_INVESTIMENTO,
        },
        prazoMeses: {
          label: 'Prazo (meses)',
          type: 'stepper',
          min: 1,
          suffix: 'meses',
          quickAdd: QUICK_ADD_MESES,
        },
        aporteMensal: {
          label: 'Aporte mensal',
          prefix: 'R$',
          type: 'currency',
          hint: 'Contribuição mensal adicional (opcional)',
          quickAdd: QUICK_ADD_APORTE,
        },
        selic: {
          label: 'Selic ao ano',
          suffix: '% a.a.',
          hint: `${DICA_REFERENCIA.selic} Com a Selic em até 8,5%, a poupança passa a render 70% dela.`,
          // Sem "somar": os dois cenários que mudam a regra da poupança (Lei 12.703/2012).
          quickAdd: [
            {
              label: `${REFERENCIAS_PERCENTUAL.selic.toLocaleString('pt-BR')}% (atual)`,
              value: REFERENCIAS_PERCENTUAL.selic,
              modo: 'definir',
              titulo: 'Meta Selic de referência do Banco Central',
            },
            {
              label: '8,5%',
              value: 8.5,
              modo: 'definir',
              titulo: 'Selic em 8,5%: a poupança passa a render 70% da Selic',
            },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Poupança"
      isLoading={!!isLoading}
      defaultValues={iniciais as Partial<Dados> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
