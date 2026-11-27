'use client'

import { useMemo } from 'react'
import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularTesouroDireto } from '@calculosonline/core/investimentos'
import type { ErroValidacao } from '@calculosonline/core'
import {
  QUICK_ADD_INVESTIMENTO,
  QUICK_ADD_MESES,
  QUICK_ADD_TAXA_IPCA,
  QUICK_ADD_TAXA_SELIC,
  QUICK_ADD_TAXA_PREFIXADA,
  QUICK_ADD_TAXA_REAL,
} from '@/lib/quickAddPresets'
import {
  DICA_REFERENCIA,
  REFERENCIAS_PERCENTUAL,
  migrarTesouroDireto,
  paraDecimal,
} from '@/lib/taxasInvestimento'
import type { FormProps } from './types'

// F84: taxas em porcentagem e Selic editável. Até a F84 o Tesouro Selic
// ignorava o campo de taxa e usava a referência fixa, sem dizer qual era nem
// deixar trocar. Campos escondidos ficam no estado com o default, então a taxa
// positiva é exigida por tipo, no submit (ver CDBForm).
const schema = z.object({
  valorInicial: z.number().positive('Valor deve ser positivo').default(0),
  tipo: z
    .enum(['selic', 'prefixado', 'ipca_plus', 'prefixado_cupom', 'ipca_cupom'])
    .default('selic'),
  selic: z.number().min(0, 'Não pode ser negativa').default(REFERENCIAS_PERCENTUAL.selic),
  taxaPrefixada: z.number().min(0, 'Não pode ser negativa').default(0),
  taxaReal: z.number().min(0, 'Não pode ser negativa').default(0),
  ipca: z.number().min(0, 'Não pode ser negativo').default(REFERENCIAS_PERCENTUAL.ipca),
  prazoMeses: z.number().positive('Prazo deve ser positivo').default(0),
})

type Dados = z.infer<typeof schema>

const ehPrefixado = (tipo: unknown) => tipo === 'prefixado' || tipo === 'prefixado_cupom'
const ehIPCA = (tipo: unknown) => tipo === 'ipca_plus' || tipo === 'ipca_cupom'

export function TesouroDiretoForm({
  onResult,
  onError,
  isLoading,
  sharedData,
  autoSubmit,
}: FormProps) {
  const iniciais = useMemo(() => migrarTesouroDireto(sharedData), [sharedData])

  function handleSubmit(data: Dados) {
    const erros: ErroValidacao[] = []
    if (ehPrefixado(data.tipo) && !(data.taxaPrefixada > 0))
      erros.push({ campo: 'taxaPrefixada', mensagem: 'Informe a taxa ao ano do título (ex.: 13)' })
    if (ehIPCA(data.tipo) && !(data.taxaReal > 0))
      erros.push({ campo: 'taxaReal', mensagem: 'Informe o juro acima do IPCA (ex.: 7)' })
    if (erros.length > 0) {
      onError?.(erros)
      return
    }
    const taxa = ehPrefixado(data.tipo) ? data.taxaPrefixada : ehIPCA(data.tipo) ? data.taxaReal : 0
    const r = calcularTesouroDireto({
      valorInicial: data.valorInicial,
      tipo: data.tipo,
      prazoMeses: data.prazoMeses,
      taxaAnual: paraDecimal(taxa),
      selicAnual: paraDecimal(data.selic),
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
          label: 'Tipo de título',
          type: 'select',
          options: [
            { value: 'selic', label: 'Tesouro SELIC (LFT)' },
            { value: 'prefixado', label: 'Tesouro Prefixado (LTN)' },
            { value: 'ipca_plus', label: 'Tesouro IPCA+ (NTN-B Principal)' },
            { value: 'prefixado_cupom', label: 'Prefixado com cupom (NTN-F)' },
            { value: 'ipca_cupom', label: 'IPCA+ com cupom (NTN-B)' },
          ],
        },
        selic: {
          label: 'Selic ao ano',
          suffix: '% a.a.',
          hint: DICA_REFERENCIA.selic,
          quickAdd: QUICK_ADD_TAXA_SELIC,
          showWhen: (v) => v.tipo === 'selic',
        },
        taxaPrefixada: {
          label: 'Taxa do título',
          suffix: '% a.a.',
          hint: 'A taxa que o Tesouro mostra na compra: 13 para 13% ao ano.',
          quickAdd: QUICK_ADD_TAXA_PREFIXADA,
          showWhen: (v) => ehPrefixado(v.tipo),
        },
        taxaReal: {
          label: 'Taxa acima do IPCA',
          suffix: '% a.a.',
          hint: 'O "7" de "IPCA + 7%", como o Tesouro mostra na compra.',
          quickAdd: QUICK_ADD_TAXA_REAL,
          showWhen: (v) => ehIPCA(v.tipo),
        },
        ipca: {
          label: 'IPCA ao ano',
          suffix: '% a.a.',
          hint: DICA_REFERENCIA.ipca,
          quickAdd: QUICK_ADD_TAXA_IPCA,
          showWhen: (v) => ehIPCA(v.tipo),
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
      submitLabel="Calcular Tesouro Direto"
      isLoading={!!isLoading}
      defaultValues={iniciais as Partial<Dados> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
