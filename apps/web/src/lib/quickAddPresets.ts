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
