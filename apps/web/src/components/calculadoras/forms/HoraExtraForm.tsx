'use client'

import { z } from 'zod'
import { CalculatorForm } from '@calculosonline/ui'
import { calcularHoraExtra } from '@calculosonline/core/trabalhista'
import { QUICK_ADD_HORAS, QUICK_ADD_SALARIO } from '@/lib/quickAddPresets'
import type { FormProps } from './types'

/**
 * Adicionais que aparecem em CCT/ACT com frequência suficiente para virarem
 * busca própria ("hora extra 60", "hora extra 70" estão no GSC). "legal" usa o
 * mínimo do tipo escolhido (50% em dia útil, 100% em domingo/feriado).
 */
const ADICIONAIS_PRESET = { '60': 0.6, '70': 0.7, '80': 0.8, '100': 1.0 } as const

const schema = z.object({
  salarioBruto: z.number().positive('Salário deve ser positivo').default(0),
  jornadaMensalHoras: z.enum(['44h', '40h', '36h', '30h']).default('44h'),
  quantidadeHoras: z.number().min(0, 'Não pode ser negativo').default(0),
  quantidadeMinutos: z
    .number()
    .min(0, 'Não pode ser negativo')
    .max(59, 'Use no máximo 59 minutos — o resto vira hora')
    .default(0),
  tipoHora: z.enum(['util', 'domingo', 'feriado', 'noturna']).default('util'),
  adicional: z.enum(['legal', '60', '70', '80', '100', 'outro']).default('legal'),
  adicionalPersonalizado: z
    .number()
    .min(0, 'Não pode ser negativo')
    .max(300, 'Percentual acima de 300% é improvável — confira a CCT')
    .default(50),
  horaNoturnaReduzida: z.enum(['nao', 'sim']).default('nao'),
  calcularDsr: z.enum(['nao', 'sim']).default('nao'),
  diasUteis: z.number().min(1, 'Precisa de ao menos 1 dia útil').max(31).default(25),
  diasDescanso: z.number().min(0, 'Não pode ser negativo').max(31).default(5),
})

type FormData = z.infer<typeof schema>

export function HoraExtraForm({ onResult, onError, isLoading, sharedData, autoSubmit }: FormProps) {
  function handleSubmit(data: FormData) {
    // "legal" = deixa o core aplicar o mínimo do tipo. Nos demais, o valor
    // negociado sobe como fração; o core ainda garante o piso legal, então
    // digitar 30% em dia útil continua rendendo os 50% de lei.
    const adicionalNegociado =
      data.adicional === 'legal'
        ? undefined
        : data.adicional === 'outro'
          ? data.adicionalPersonalizado / 100
          : ADICIONAIS_PRESET[data.adicional]

    const r = calcularHoraExtra({
      salarioBruto: data.salarioBruto,
      jornadaMensalHoras: data.jornadaMensalHoras,
      quantidadeHoras: data.quantidadeHoras,
      quantidadeMinutos: data.quantidadeMinutos,
      tipoHora: data.tipoHora,
      ...(adicionalNegociado !== undefined ? { adicionalNegociado } : {}),
      ...(data.tipoHora === 'noturna' && data.horaNoturnaReduzida === 'sim'
        ? { horaNoturnaReduzida: true }
        : {}),
      ...(data.calcularDsr === 'sim'
        ? { dsr: { diasUteis: data.diasUteis, diasDescanso: data.diasDescanso } }
        : {}),
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
        jornadaMensalHoras: {
          label: 'Jornada contratual',
          type: 'select',
          options: [
            { value: '44h', label: '44 horas/semana (padrão CLT)' },
            { value: '40h', label: '40 horas/semana' },
            { value: '36h', label: '36 horas/semana' },
            { value: '30h', label: '30 horas/semana' },
          ],
        },
        quantidadeHoras: {
          label: 'Horas extras',
          type: 'stepper',
          min: 0,
          suffix: 'horas',
          quickAdd: QUICK_ADD_HORAS,
        },
        // Cartão de ponto marca "1h30", não "1,5". Antes do F48 a conversão
        // para decimal ficava por conta do usuário.
        quantidadeMinutos: {
          label: 'Minutos',
          suffix: 'min',
          hint: 'Some os minutos quebrados: "1h30" é 1 hora + 30 minutos.',
          quickAdd: [
            { label: '+5', value: 5 },
            { label: '+10', value: 10 },
            { label: '+15', value: 15 },
            { label: '+30', value: 30 },
          ],
        },
        tipoHora: {
          label: 'Tipo de hora extra',
          type: 'select',
          options: [
            { value: 'util', label: 'Dia útil (mínimo +50%)' },
            { value: 'domingo', label: 'Domingo (mínimo +100%)' },
            { value: 'feriado', label: 'Feriado (mínimo +100%)' },
            { value: 'noturna', label: 'Noturna, 22h–5h (+20% noturno sobre a hora extra)' },
          ],
        },
        adicional: {
          label: 'Adicional aplicado',
          type: 'select',
          hint: 'Acordo ou convenção coletiva pode fixar percentual acima do mínimo legal.',
          options: [
            { value: 'legal', label: 'Mínimo legal do tipo escolhido' },
            { value: '60', label: '60% (CCT/ACT)' },
            { value: '70', label: '70% (CCT/ACT)' },
            { value: '80', label: '80% (CCT/ACT)' },
            { value: '100', label: '100% (CCT/ACT)' },
            { value: 'outro', label: 'Outro percentual…' },
          ],
        },
        adicionalPersonalizado: {
          label: 'Percentual do adicional',
          suffix: '%',
          hint: 'O mínimo legal continua valendo se o percentual informado for menor.',
          showWhen: (v) => v.adicional === 'outro',
        },
        horaNoturnaReduzida: {
          label: 'Aplicar hora noturna reduzida (52min30s = 1h)',
          type: 'select',
          hint: 'Marque "sim" se as horas vieram do cartão de ponto (horas de relógio).',
          showWhen: (v) => v.tipoHora === 'noturna',
          options: [
            { value: 'nao', label: 'Não — já são horas noturnas convertidas' },
            { value: 'sim', label: 'Sim — converter (CLT art. 73 §1º)' },
          ],
        },
        calcularDsr: {
          label: 'Incluir reflexo no DSR',
          type: 'select',
          hint: 'Horas extras habituais refletem no descanso semanal remunerado (Súmula 172 do TST).',
          options: [
            { value: 'nao', label: 'Não' },
            { value: 'sim', label: 'Sim — calcular o reflexo' },
          ],
        },
        diasUteis: {
          label: 'Dias úteis no mês',
          type: 'stepper',
          min: 1,
          max: 31,
          hint: 'Conte o sábado como útil quando ele não for dia de repouso no seu contrato.',
          showWhen: (v) => v.calcularDsr === 'sim',
        },
        diasDescanso: {
          label: 'Domingos e feriados no mês',
          type: 'stepper',
          min: 0,
          max: 31,
          showWhen: (v) => v.calcularDsr === 'sim',
        },
      }}
      onSubmit={handleSubmit}
      submitLabel="Calcular Hora Extra"
      isLoading={!!isLoading}
      defaultValues={sharedData as Partial<FormData> | undefined}
      autoSubmit={autoSubmit}
    />
  )
}
