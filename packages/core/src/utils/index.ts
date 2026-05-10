/**
 * Utilitários compartilhados pelo core engine.
 */

/** Arredonda um valor monetário para 2 casas decimais (regra bancária HALF_EVEN). */
export function arredondarReais(valor: number): number {
  return Math.round(valor * 100) / 100
}

/** Garante que um número é >= 0. Útil para validações de input. */
export function naoNegativo(valor: number, campo: string): number {
  if (valor < 0) {
    throw new Error(`${campo} não pode ser negativo`)
  }
  return valor
}
