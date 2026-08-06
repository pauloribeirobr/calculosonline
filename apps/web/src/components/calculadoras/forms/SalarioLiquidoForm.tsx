'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularSalarioLiquido } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

const itemSchema = z.object({
  descricao: z.string(),
  valor: z.number().min(0),
})

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  numeroDependentesIRRF: z.number().min(0).default(0),
  outrasDeducoes: z.array(itemSchema).default([]),
  outrosDescontos: z.array(itemSchema).default([]),
  adicionais: z.array(itemSchema).default([]),
  temValeTransporte: z.enum(['sim', 'nao']).default('nao'),
})

/** Descarta linhas em branco (sem descrição ou com valor zerado) antes de calcular. */
function limparItens(itens: { descricao: string; valor: number }[]) {
  return itens.filter((item) => item.descricao.trim() !== '' && item.valor > 0)
}

export function SalarioLiquidoForm({
  onResult,
  onError,
  isLoading,
  sharedData,
  autoSubmit,
}: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularSalarioLiquido({
      salarioBruto: data.salarioBruto,
      numeroDependentesIRRF: data.numeroDependentesIRRF,
      outrasDeducoes: limparItens(data.outrasDeducoes),
      outrosDescontos: limparItens(data.outrosDescontos),
      adicionais: limparItens(data.adicionais),
      temValeTransporte: data.temValeTransporte === 'sim',
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
        numeroDependentesIRRF: {
          label: 'Dependentes (IRRF)',
          type: 'stepper',
          hint: 'Cada dependente reduz a base de cálculo do IRRF',
        },
        outrasDeducoes: {
          label: 'Outras deduções',
          type: 'itemList',
          prefix: 'R$',
          itemPlaceholder: 'Ex.: Plano de Saúde',
          itemSuggestions: ['Plano de Saúde', 'Previdência Privada', 'Pensão Alimentícia'],
          hint: 'Reduzem a base do IRRF e também o salário líquido (saem do contracheque)',
        },
        outrosDescontos: {
          label: 'Outros descontos',
          type: 'itemList',
          prefix: 'R$',
          itemPlaceholder: 'Ex.: Consignado',
          itemSuggestions: ['Consignado', 'Adiantamento Salarial', 'Vale-Transporte Extra'],
          hint: 'Reduzem o salário líquido, mas não afetam o cálculo do IRRF',
        },
        temValeTransporte: {
          label: 'Recebe vale-transporte?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não' },
            { value: 'sim', label: 'Sim — descontar 6% do salário' },
          ],
        },
        adicionais: {
          label: 'Adicionais (não entram na folha)',
          type: 'itemList',
          prefix: 'R$',
          itemPlaceholder: 'Ex.: Vale Refeição',
          itemSuggestions: ['Vale Refeição', 'Vale Alimentação', 'Bônus', 'Comissão'],
          hint: 'Não afetam INSS/IRRF nem o salário líquido — aparecem à parte, como complemento',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Salário Líquido"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
