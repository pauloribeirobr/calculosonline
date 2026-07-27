'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIRPF } from '@calculosonline/core/impostos'
import { QUICK_ADD_VALOR_GRANDE } from '@/lib/quickAddPresets'
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
          hint: 'Total bruto recebido no ano',
          quickAdd: QUICK_ADD_VALOR_GRANDE,
        },
        irrfRetidoFonte: {
          label: 'IRRF retido na fonte (anual)',
          prefix: 'R$',
          hint: 'Total já descontado nos contracheques',
        },
        numeroDependentes: { label: 'Dependentes', suffix: 'pessoas' },
        despesasMedicas: {
          label: 'Despesas médicas',
          prefix: 'R$',
          hint: 'Dedutíveis integralmente (modelo completo)',
        },
        despesasEducacao: {
          label: 'Despesas com educação',
          prefix: 'R$',
          hint: 'Limite anual de R$ 3.561,50 por pessoa',
        },
        contribuicaoINSS: { label: 'INSS pago no ano', prefix: 'R$' },
        pensaoAlimenticia: { label: 'Pensão alimentícia (anual)', prefix: 'R$' },
        contribuicaoPrevidenciaPrivada: {
          label: 'Previdência privada PGBL',
          prefix: 'R$',
          hint: 'Dedutível até 12% dos rendimentos',
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
