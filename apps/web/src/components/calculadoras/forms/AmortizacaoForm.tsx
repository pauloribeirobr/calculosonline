'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularAmortizacao } from '@calculosonline/core/financeiro'
import { QUICK_ADD_VALOR_GRANDE } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

interface AmortizacaoFormProps extends FormProps {
  /** Rótulo do campo de valor e do botão (Empréstimo vs Financiamento) */
  contexto?: 'emprestimo' | 'financiamento'
}

const schema = z.object({
  valorFinanciado: z.number().positive('Valor deve ser positivo').default(0),
  taxaMensalJuros: z.number().positive('Taxa deve ser positiva').default(0),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
  sistema: z.enum(['price', 'sac']).default('price'),
  taxaSeguroMensal: z.number().min(0).default(0),
})

export function AmortizacaoForm({
  onResult,
  onError,
  isLoading,
  contexto = 'emprestimo',
}: AmortizacaoFormProps) {
  const isFinanciamento = contexto === 'financiamento'

  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularAmortizacao(data)
    if (r.sucesso) onResult(r.dados)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        valorFinanciado: {
          label: isFinanciamento ? 'Valor financiado' : 'Valor do empréstimo',
          prefix: 'R$',
          type: 'number',
          quickAdd: QUICK_ADD_VALOR_GRANDE,
        },
        taxaMensalJuros: {
          label: 'Taxa mensal de juros',
          suffix: '(decimal)',
          hint: '0.015 = 1,5% ao mês',
        },
        prazoMeses: {
          label: 'Prazo',
          suffix: 'meses',
        },
        sistema: {
          label: 'Sistema de amortização',
          type: 'select',
          options: [
            { value: 'price', label: 'Price (parcelas fixas)' },
            { value: 'sac', label: 'SAC (parcelas decrescentes)' },
          ],
        },
        taxaSeguroMensal: {
          label: 'Taxa de seguro mensal (MIP+DFI)',
          suffix: '(decimal)',
          hint: isFinanciamento
            ? 'Comum em financiamento imobiliário (ex: 0.0005)'
            : 'Deixe 0 se o contrato não tem seguro',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel={isFinanciamento ? 'Simular Financiamento' : 'Simular Empréstimo'}
      isLoading={!!isLoading}
    />
  )
}

export function EmprestimoForm(props: FormProps) {
  return <AmortizacaoForm {...props} contexto="emprestimo" />
}

export function FinanciamentoForm(props: FormProps) {
  return <AmortizacaoForm {...props} contexto="financiamento" />
}
