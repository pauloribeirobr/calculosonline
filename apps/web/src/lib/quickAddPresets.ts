import type { QuickAddButton } from '@calculosonline/ui'

/**
 * Presets de chips de valor rápido (mesmo padrão visual do Recibo Fácil,
 * ver CalculatorForm em @calculosonline/ui). Cada chip SOMA ao valor atual
 * do campo; "Zerar" é sempre adicionado automaticamente pelo CalculatorForm.
 * Escalas diferentes por tipo de campo: salário mensal, aporte/valor de
 * investimento e valores anuais/financiados (maiores).
 */

export const QUICK_ADD_SALARIO: QuickAddButton[] = [
  { label: '+100', value: 100 },
  { label: '+500', value: 500 },
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
]

export const QUICK_ADD_INVESTIMENTO: QuickAddButton[] = [
  { label: '+100', value: 100 },
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
  { label: '+10.000', value: 10000 },
]

export const QUICK_ADD_VALOR_GRANDE: QuickAddButton[] = [
  { label: '+1.000', value: 1000 },
  { label: '+5.000', value: 5000 },
  { label: '+10.000', value: 10000 },
  { label: '+50.000', value: 50000 },
]

/**
 * Presets para campos `stepper` (F50). Diferente dos presets de valor, aqui o
 * chip existe porque o +/− do stepper cobra um clique por unidade: o heatmap
 * do Clarity de 25-27/08 registrou **64 de 133 cliques** da página de CDB no
 * stepper `prazoMeses` — sair de 12 para 24 meses são 12 cliques. Só entram em
 * campos de faixa larga; contadores curtos (dependentes 0-5, férias vencidas
 * 0-2) continuam sem chip, onde eles seriam ruído.
 */

export const QUICK_ADD_MESES: QuickAddButton[] = [
  { label: '+6', value: 6 },
  { label: '+12', value: 12 },
  { label: '+24', value: 24 },
  { label: '+60', value: 60 },
]

export const QUICK_ADD_DIAS: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
]

export const QUICK_ADD_HORAS: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
  { label: '+20', value: 20 },
]

export const QUICK_ADD_IDADE: QuickAddButton[] = [
  { label: '+1', value: 1 },
  { label: '+5', value: 5 },
  { label: '+10', value: 10 },
]
