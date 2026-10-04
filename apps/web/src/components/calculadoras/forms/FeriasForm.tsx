'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularFerias } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_CONTADOR_CURTO, QUICK_ADD_DIAS, QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

/**
 * **Férias fracionadas (F76).** A pergunta logo depois do salário é a que
 * mais aparece em linguagem natural no relatório do Bing ("vou tirar 10 dias
 * de férias somente, quanto receberia…"), e o mapa de cliques do Clarity de
 * 02-04/10 mostrou 20 cliques no "+" do abono, acima do máximo de 10, numa
 * página sem campo para os dias a tirar. O padrão continua sendo o período
 * inteiro: quem não fraciona não vê o stepper.
 */
const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  fracionar: z.enum(['nao', 'sim']).default('nao'),
  diasGozo: z
    .number()
    .int('Use um número inteiro de dias')
    .min(5, 'Mínimo de 5 dias por período')
    .default(10),
  diasFaltas: z.number().min(0, 'Não pode ser negativo').default(0),
  diasAbono: z.number().min(0).max(10, 'Máximo 10 dias de abono').default(0),
  numeroDependentes: z.number().min(0, 'Não pode ser negativo').default(0),
  emAtraso: z.enum(['nao', 'sim']).default('nao'),
})

export function FeriasForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: z.infer<typeof schema>) {
    const r = calcularFerias({
      salarioBruto: data.salarioBruto,
      diasFaltas: data.diasFaltas,
      diasAbono: data.diasAbono,
      ...(data.fracionar === 'sim' ? { diasGozo: data.diasGozo } : {}),
      numeroDependentes: data.numeroDependentes,
      emAtraso: data.emAtraso === 'sim',
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
        fracionar: {
          label: 'Vai tirar todos os dias de uma vez?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Sim — o período inteiro' },
            { value: 'sim', label: 'Não — vou dividir as férias (ex.: 10 dias agora)' },
          ],
          hint: 'Até 3 períodos: um com 14 dias ou mais, os outros com 5 ou mais (CLT art. 134).',
        },
        diasGozo: {
          label: 'Dias de férias que vai tirar agora',
          type: 'stepper',
          suffix: 'dias',
          min: 5,
          max: 25,
          showWhen: (v) => v.fracionar === 'sim',
          hint: 'O recibo paga só estes dias + 1/3.',
          // Partindo dos 10 do padrão, um clique chega a 15 ou 20 — as
          // divisões mais comuns. "Zerar" volta ao mínimo de 5.
          quickAdd: QUICK_ADD_DIAS,
        },
        diasFaltas: {
          label: 'Dias de faltas injustificadas',
          type: 'stepper',
          suffix: 'dias',
          quickAdd: QUICK_ADD_DIAS,
          hint: '>32 faltas perde o direito ao período',
        },
        diasAbono: {
          label: 'Dias vendidos (abono)',
          type: 'stepper',
          max: 10,
          // F76: o "+" deste campo levou 20 cliques em 2 pageviews — o
          // suspeito é quem procura "quantos dias vou tirar" e só acha este.
          hint: 'Dias vendidos, não os que você vai tirar. Máximo 1/3 do direito, isento de INSS e IRRF.',
          quickAdd: QUICK_ADD_DIAS,
        },
        numeroDependentes: {
          label: 'Dependentes (IRRF)',
          type: 'stepper',
          hint: 'Reduzem a base do IRRF das férias',
          quickAdd: QUICK_ADD_CONTADOR_CURTO,
        },
        emAtraso: {
          label: 'Férias pagas em atraso?',
          type: 'select',
          options: [
            { value: 'nao', label: 'Não — pagamento no prazo' },
            { value: 'sim', label: 'Sim — pagar em dobro (CLT art. 137)' },
          ],
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Férias"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<z.infer<typeof schema>> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
