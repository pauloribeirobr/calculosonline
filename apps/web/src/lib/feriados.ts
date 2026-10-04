/**
 * Páginas de feriados (F72): `/feriados` e `/feriados/[ano]`.
 *
 * **Por que existem.** Semrush de 21/09 (`MEMORY.md`, diário de 22/09, parte
 * 14): `feriados 2027` 22,2K buscas/mês com **KD 16**, `feriados` 74K/KD 25 e
 * `hoje é feriado` 110K/KD 29, com o líder do nicho em 5º, 10º e 22º. É dado
 * estruturado, que a calculadora de datas (F68) já precisava para os dias
 * úteis — o custo marginal é a página, não o dado.
 *
 * **Só os anos com busca.** 2026 é o ano corrente e 2027 é o alvo de KD 16.
 * Um ano a mais é uma página fina a mais com o mesmo template; quando a busca
 * de 2028 aparecer (fim de 2027), basta acrescentar aqui.
 */

export const ANOS_FERIADOS = [2026, 2027] as const

export type AnoFeriados = (typeof ANOS_FERIADOS)[number]

export function ehAnoPublicado(ano: number): ano is AnoFeriados {
  return (ANOS_FERIADOS as readonly number[]).includes(ano)
}

export const FERIADOS_PATH = '/feriados'

export function pathDoAno(ano: number): string {
  return `${FERIADOS_PATH}/${ano}`
}

/**
 * Data da última revisão do conteúdo e das fontes. As leis e a portaria de
 * 2026 foram conferidas no texto oficial (Planalto e DOU) nesta data.
 */
export const FERIADOS_DATA_ATUALIZACAO = '2026-10-04'
