/**
 * Utilitários compartilhados pelo core engine.
 */

import type { ErroValidacao } from '../types'

/**
 * Arredonda um valor monetário para 2 casas decimais (padrão monetário
 * brasileiro), em meio-para-cima.
 *
 * `valor * 100` carrega erro binário: `1621 × 7,5%` dá 121.57499999999999 em
 * float, e `Math.round` derruba para R$ 121,57 quando a tabela do INSS publica
 * R$ 121,58 na primeira faixa. Normalizar a 12 dígitos significativos antes do
 * round recupera o meio centavo e não altera valores que já eram exatos.
 */
export function arredondar(valor: number): number {
  if (!Number.isFinite(valor)) return valor
  return Math.round(Number((valor * 100).toPrecision(12))) / 100
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

/**
 * Data de hoje em São Paulo, no formato ISO "AAAA-MM-DD".
 *
 * **Existe porque `new Date().toISOString().slice(0, 10)` é UTC.** O site é
 * inteiramente brasileiro e o servidor roda em UTC: a partir das 21h de
 * Brasília (meia-noite UTC), a data devolvida é a de *amanhã*. Foi assim que a
 * calculadora de FGTS exibiu "Tabelas: 2026-09-09" numa tela tirada às 22h do
 * dia 08/09 — data no futuro, num rótulo que o usuário lê como garantia de
 * atualização.
 *
 * `en-CA` porque é o locale cujo formato de data curta já é `AAAA-MM-DD`, o
 * que evita remontar a string a partir das partes.
 */
export function hojeISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
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
