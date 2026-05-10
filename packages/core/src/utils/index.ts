/**
 * Utilitários compartilhados pelo core engine.
 */

import type { ErroValidacao } from '../types'

/** Arredonda um valor monetário para 2 casas decimais (padrão monetário brasileiro). */
export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Divide e arredonda corretamente para evitar floating-point issues.
 * Ex: arredondar(1518 / 30) = 50.60 sem dízima.
 */
export function dividir(dividendo: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Divisão por zero')
  }
  return arredondar(dividendo / divisor)
}

/** Quantidade de meses inteiros entre duas datas (fim - inicio). */
export function mesesEntre(inicio: Date, fim: Date): number {
  const anos = fim.getFullYear() - inicio.getFullYear()
  const meses = fim.getMonth() - inicio.getMonth()
  return anos * 12 + meses
}

/** Anos completos trabalhados entre duas datas (usado para aviso prévio Lei 12.506/2011). */
export function anosCompletos(inicio: Date, fim: Date): number {
  const anos = fim.getFullYear() - inicio.getFullYear()
  const mesAjuste =
    fim.getMonth() < inicio.getMonth() ||
    (fim.getMonth() === inicio.getMonth() && fim.getDate() < inicio.getDate())
  return Math.max(0, anos - (mesAjuste ? 1 : 0))
}

/** Quantidade de dias do mês de uma data específica. */
export function diasNoMes(data: Date): number {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate()
}

/** Valida se um salário é positivo e finito. Retorna null quando válido. */
export function validarSalario(salario: number, campo = 'salario'): ErroValidacao | null {
  if (!Number.isFinite(salario) || salario <= 0) {
    return { campo, mensagem: 'Salário deve ser um valor positivo' }
  }
  return null
}

/** Formata número como moeda BRL (R$ 1.234,56). */
export function formatarBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
