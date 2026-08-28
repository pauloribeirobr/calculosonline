'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularIRRF } from '@calculosonline/core/impostos'
import { QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import { itemListSchema, somarItens } from '@/lib/itemListField'
import type { FormProps } from './types'

const schema = z.object({
  // Modo de rendimento (F54). Aluguel apareceu no painel de IA do Clarity
  // com demanda comprovada e a calculadora não atendia.
  origemRendimento: z.enum(['salario', 'aluguel']).default('salario'),
  salarioBruto: z.number().positive('Valor deve ser positivo').default(0),
  numeroDependentes: z.number().min(0).default(0),
  pensaoAlimenticia: z.number().min(0).default(0),
  iptu: z.number().min(0).default(0),
  condominio: z.number().min(0).default(0),
  taxaAdministracao: z.number().min(0).default(0),
  outrasDeducoes: itemListSchema(),
})

type FormData = z.infer<typeof schema>

export function IRRFForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: FormData) {
    const ehAluguel = data.origemRendimento === 'aluguel'
    const r = calcularIRRF({
      salarioBruto: data.salarioBruto,
      origemRendimento: data.origemRendimento,
      numeroDependentes: data.numeroDependentes,
      pensaoAlimenticia: data.pensaoAlimenticia,
      outrasDeducoes: somarItens(data.outrasDeducoes),
      ...(ehAluguel
        ? {
            despesasAluguel: {
              iptu: data.iptu,
              condominio: data.condominio,
              taxaAdministracao: data.taxaAdministracao,
            },
          }
        : {}),
    })
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        origemRendimento: {
          label: 'Origem do rendimento',
          type: 'select',
          options: [
            { value: 'salario', label: 'Salário (folha de pagamento)' },
            { value: 'aluguel', label: 'Aluguel recebido' },
          ],
        },
        salarioBruto: {
          label: 'Valor bruto do mês',
          prefix: 'R$',
          type: 'currency',
          quickAdd: QUICK_ADD_SALARIO,
          hint: 'Salário bruto ou aluguel recebido, conforme a origem escolhida acima.',
        },
        numeroDependentes: { label: 'Dependentes', type: 'stepper' },
        pensaoAlimenticia: { label: 'Pensão alimentícia', prefix: 'R$', type: 'currency' },
        // Só o locador que arca com a despesa pode abatê-la (RIR/2018 art. 42).
        // Benfeitorias e reformas não entram — são custo do imóvel.
        iptu: {
          label: 'IPTU pago pelo locador',
          prefix: 'R$',
          type: 'currency',
          showWhen: (v) => v.origemRendimento === 'aluguel',
        },
        condominio: {
          label: 'Condomínio e taxas pagos pelo locador',
          prefix: 'R$',
          type: 'currency',
          showWhen: (v) => v.origemRendimento === 'aluguel',
        },
        taxaAdministracao: {
          label: 'Taxa de administração imobiliária',
          prefix: 'R$',
          type: 'currency',
          hint: 'Comissão da imobiliária pela administração ou cobrança do aluguel.',
          showWhen: (v) => v.origemRendimento === 'aluguel',
        },
        outrasDeducoes: {
          label: 'Outras deduções',
          type: 'itemList',
          prefix: 'R$',
          itemPlaceholder: 'Ex.: Plano de Saúde',
          itemSuggestions: ['Plano de Saúde', 'Previdência Privada PGBL'],
          hint: 'Reduzem a base do cálculo do IRRF',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular IRRF"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<FormData> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
