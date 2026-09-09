'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIRPF } from '@calculosonline/core/impostos'
import {
  QUICK_ADD_CONTADOR_CURTO,
  QUICK_ADD_SALARIO,
  QUICK_ADD_VALOR_GRANDE,
  QUICK_ADD_VALOR_PEQUENO,
} from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const schema = z.object({
  rendimentosTributaveis: z.number().min(0, 'Rendimentos não podem ser negativos').default(0),
  irrfRetidoFonte: z.number().min(0).default(0),
  numeroDependentes: z.number().min(0).default(0),
  despesasMedicas: z.number().min(0).default(0),
  despesasEducacao: z.number().min(0).default(0),
  contribuicaoINSS: z.number().min(0).default(0),
  pensaoAlimenticia: z.number().min(0).default(0),
  contribuicaoPrevidenciaPrivada: z.number().min(0).default(0),
})

export function IRPFForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularIRPF(data)
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        rendimentosTributaveis: {
          label: 'Rendimentos tributáveis (anual)',
          prefix: 'R$',
          type: 'currency',
          hint: 'Total bruto recebido no ano',
          quickAdd: QUICK_ADD_VALOR_GRANDE,
        },
        irrfRetidoFonte: {
          label: 'IRRF retido na fonte (anual)',
          prefix: 'R$',
          type: 'currency',
          hint: 'Total já descontado nos contracheques',
          quickAdd: QUICK_ADD_SALARIO,
        },
        numeroDependentes: {
          label: 'Dependentes',
          type: 'stepper',
          quickAdd: QUICK_ADD_CONTADOR_CURTO,
        },
        despesasMedicas: {
          label: 'Despesas médicas',
          prefix: 'R$',
          type: 'currency',
          hint: 'Dedutíveis integralmente (modelo completo)',
          quickAdd: QUICK_ADD_VALOR_PEQUENO,
        },
        despesasEducacao: {
          label: 'Despesas com educação',
          prefix: 'R$',
          type: 'currency',
          hint: 'Limite anual de R$ 3.561,50 por pessoa',
          quickAdd: QUICK_ADD_VALOR_PEQUENO,
        },
        contribuicaoINSS: {
          label: 'INSS pago no ano',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_VALOR_PEQUENO,
        },
        pensaoAlimenticia: {
          label: 'Pensão alimentícia (anual)',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_VALOR_PEQUENO,
        },
        contribuicaoPrevidenciaPrivada: {
          label: 'Previdência privada PGBL',
          prefix: 'R$',
          type: 'currency',
          hint: 'Dedutível até 12% dos rendimentos',
          quickAdd: QUICK_ADD_VALOR_PEQUENO,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Comparar modelos"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
