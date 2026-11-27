'use client'

import { useMemo } from 'react'
import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularCDB } from '@calculosonline/core/investimentos'
import type { ErroValidacao } from '@calculosonline/core'
import {
  QUICK_ADD_INVESTIMENTO,
  QUICK_ADD_MESES,
  QUICK_ADD_TAXA_CDI,
  QUICK_ADD_TAXA_IPCA,
  QUICK_ADD_TAXA_PERCENTUAL_CDI,
  QUICK_ADD_TAXA_PREFIXADA,
  QUICK_ADD_TAXA_REAL,
} from '@/lib/quickAddPresets'
import {
  DICA_REFERENCIA,
  REFERENCIAS_PERCENTUAL,
  migrarCDB,
  paraDecimal,
} from '@/lib/taxasInvestimento'
import type { FormProps } from './types'

// F84: taxas em porcentagem, um campo por indexador (antes era um campo só, em
// decimal, que mudava de escala com o tipo). Os campos escondidos continuam no
// estado com o default, então nenhum deles pode ser obrigatório no Zod: a
// exigência de taxa positiva é por tipo, no submit.
const schema = z.object({
  valorInicial: z.number().positive('Valor deve ser positivo').default(0),
  tipo: z.enum(['cdi', 'prefixado', 'ipca_mais']).default('cdi'),
  percentualCDI: z.number().min(0, 'Não pode ser negativo').default(100),
  cdi: z.number().min(0, 'Não pode ser negativo').default(REFERENCIAS_PERCENTUAL.cdi),
  taxaPrefixada: z.number().min(0, 'Não pode ser negativa').default(0),
  taxaReal: z.number().min(0, 'Não pode ser negativa').default(0),
  ipca: z.number().min(0, 'Não pode ser negativo').default(REFERENCIAS_PERCENTUAL.ipca),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
})

type Dados = z.infer<typeof schema>

function taxaDoTipo(data: Dados): { campo: keyof Dados; valor: number; mensagem: string } {
  if (data.tipo === 'prefixado')
    return {
      campo: 'taxaPrefixada',
      valor: data.taxaPrefixada,
      mensagem: 'Informe a taxa ao ano (ex.: 12)',
    }
  if (data.tipo === 'ipca_mais')
    return {
      campo: 'taxaReal',
      valor: data.taxaReal,
      mensagem: 'Informe o juro acima do IPCA (ex.: 6)',
    }
  return {
    campo: 'percentualCDI',
    valor: data.percentualCDI,
    mensagem: 'Informe o percentual do CDI (ex.: 110)',
  }
}

export function CDBForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  const iniciais = useMemo(() => migrarCDB(sharedData), [sharedData])

  function handleSubmit(data: Dados) {
    const taxa = taxaDoTipo(data)
    if (!(taxa.valor > 0)) {
      const erros: ErroValidacao[] = [{ campo: taxa.campo, mensagem: taxa.mensagem }]
      onError?.(erros)
      return
    }
    const r = calcularCDB({
      valorInicial: data.valorInicial,
      tipo: data.tipo,
      prazoMeses: data.prazoMeses,
      taxaAnual: paraDecimal(taxa.valor),
      cdiAnual: paraDecimal(data.cdi),
      ipcaAnual: paraDecimal(data.ipca),
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
        tipo: {
          label: 'Tipo de remuneração',
          type: 'select',
          options: [
            { value: 'cdi', label: '% do CDI (pós-fixado)' },
            { value: 'prefixado', label: 'Prefixado (% ao ano)' },
            { value: 'ipca_mais', label: 'IPCA + taxa' },
          ],
        },
        percentualCDI: {
          label: 'Percentual do CDI',
          suffix: '% do CDI',
          hint: 'Digite como aparece na oferta: 110 para 110% do CDI.',
          quickAdd: QUICK_ADD_TAXA_PERCENTUAL_CDI,
          showWhen: (v) => v.tipo === 'cdi',
        },
        cdi: {
          label: 'CDI ao ano',
          suffix: '% a.a.',
          hint: DICA_REFERENCIA.cdi,
          quickAdd: QUICK_ADD_TAXA_CDI,
          showWhen: (v) => v.tipo === 'cdi',
        },
        taxaPrefixada: {
          label: 'Taxa prefixada',
          suffix: '% a.a.',
          hint: 'Digite como aparece na oferta: 12 para 12% ao ano.',
          quickAdd: QUICK_ADD_TAXA_PREFIXADA,
          showWhen: (v) => v.tipo === 'prefixado',
        },
        taxaReal: {
          label: 'Taxa acima do IPCA',
          suffix: '% a.a.',
          hint: 'O "6" de "IPCA + 6%".',
          quickAdd: QUICK_ADD_TAXA_REAL,
          showWhen: (v) => v.tipo === 'ipca_mais',
        },
        ipca: {
          label: 'IPCA ao ano',
          suffix: '% a.a.',
          hint: DICA_REFERENCIA.ipca,
          quickAdd: QUICK_ADD_TAXA_IPCA,
          showWhen: (v) => v.tipo === 'ipca_mais',
        },
        prazoMeses: {
          label: 'Prazo (meses)',
          type: 'stepper',
          min: 1,
          suffix: 'meses',
          quickAdd: QUICK_ADD_MESES,
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular CDB"
      isLoading={!!isLoading}
      defaultValues={iniciais as Partial<Dados> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
