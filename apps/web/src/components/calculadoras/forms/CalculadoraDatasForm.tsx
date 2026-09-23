'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularDatas } from '@calculosonline/core/tempo'
import { QUICK_ADD_DIAS_LONGO, QUICK_ADD_MESES, QUICK_ADD_IDADE } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

/**
 * Calculadora de datas (F68) — três modos num formulário só.
 *
 * **Uma página, não três.** O concorrente que domina este mercado
 * (`supercalendario.com.br`) faz 20.416 visitas/mês com **uma** página, que
 * sozinha rankeia para 35 keywords. "Diferença entre datas", "somar dias" e
 * "subtrair dias" são a mesma pergunta com o sinal trocado, e separá-las
 * dividiria os sinais de SEO em vez de somá-los — por isso o modo é um campo,
 * e os campos de cada modo aparecem via `showWhen`.
 */

const schema = z.object({
  modo: z.enum(['diferenca', 'somar', 'subtrair']).default('diferenca'),
  dataInicial: z.string().min(10, 'Informe a data inicial').default(''),
  dataFinal: z.string().default(''),
  dias: z.number().int('Use um número inteiro de dias').default(0),
  meses: z.number().int('Use um número inteiro de meses').default(0),
  anos: z.number().int('Use um número inteiro de anos').default(0),
  apenasDiasUteis: z.enum(['nao', 'sim']).default('nao'),
  incluirDataInicial: z.enum(['nao', 'sim']).default('nao'),
})

export function CalculadoraDatasForm({
  onResult,
  onError,
  isLoading,
  sharedData,
  autoSubmit,
}: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularDatas({
      modo: data.modo,
      dataInicial: data.dataInicial,
      dataFinal: data.dataFinal,
      dias: data.dias,
      meses: data.meses,
      anos: data.anos,
      apenasDiasUteis: data.apenasDiasUteis === 'sim',
      incluirDataInicial: data.incluirDataInicial === 'sim',
    })
    if (r.sucesso) onResult(r.dados, data)
    else onError?.(r.erros)
  }

  const ehDeslocamento = (v: Record<string, unknown>) => v.modo === 'somar' || v.modo === 'subtrair'

  return (
    <CalculatorForm
      schema={schema}
      fields={{
        modo: {
          label: 'O que você quer calcular?',
          type: 'radio',
          options: [
            { value: 'diferenca', label: 'Diferença entre duas datas' },
            { value: 'somar', label: 'Somar dias a uma data' },
            { value: 'subtrair', label: 'Subtrair dias de uma data' },
          ],
        },
        dataInicial: {
          label: 'Data inicial',
          type: 'date',
          hint: 'Digite direto: 01012026 vira 01/01/2026.',
          dateShortcuts: [
            { label: 'Hoje', kind: 'hoje' },
            { label: 'Fim do mês', kind: 'fimDoMes' },
          ],
        },
        dataFinal: {
          label: 'Data final',
          type: 'date',
          showWhen: (v) => v.modo === 'diferenca',
          dateShortcuts: [
            { label: 'Hoje', kind: 'hoje' },
            { label: 'Fim do mês', kind: 'fimDoMes' },
            { label: 'Fim do ano', kind: 'fimDoAno' },
          ],
        },
        dias: {
          label: 'Dias',
          type: 'stepper',
          suffix: 'dias',
          quickAdd: QUICK_ADD_DIAS_LONGO,
          showWhen: ehDeslocamento,
        },
        meses: {
          label: 'Meses',
          type: 'stepper',
          suffix: 'meses',
          quickAdd: QUICK_ADD_MESES,
          showWhen: ehDeslocamento,
          hint: 'Fim de mês é ajustado: 31/01 + 1 mês = 28/02.',
        },
        anos: {
          label: 'Anos',
          type: 'stepper',
          suffix: 'anos',
          quickAdd: QUICK_ADD_IDADE,
          showWhen: ehDeslocamento,
        },
        apenasDiasUteis: {
          label: 'Contar apenas dias úteis?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não — dias corridos' },
            { value: 'sim', label: 'Sim — só de segunda a sexta' },
          ],
          hint: 'Feriados não são descontados.',
        },
        incluirDataInicial: {
          label: 'Incluir o dia inicial na contagem?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não — conta a partir do dia seguinte' },
            { value: 'sim', label: 'Sim — conta o próprio dia inicial' },
          ],
          showWhen: (v) => v.modo === 'diferenca',
          hint: 'Prazos costumam incluir o dia inicial.',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
