/**
 * Primitivas de calendário em UTC, compartilhadas por `datas.ts` (F68) e
 * `feriados.ts` (F72). Interno ao módulo: não sai pelo `index.ts`.
 *
 * **Tudo em UTC, de propósito.** `new Date('2026-09-23')` é meia-noite *UTC*,
 * e ler `.getFullYear()` disso no Brasil (UTC-3) devolve o dia anterior. Todo
 * acesso a componentes de data usa os getters `getUTC*`, e toda data
 * construída passa por `Date.UTC`. Como UTC não tem horário de verão, a
 * diferença entre duas meia-noites é sempre múltiplo exato de 86.400.000 ms.
 */

export const MS_DIA = 86_400_000

/** Limites de sanidade: fora disso o pedido é erro de digitação, não cálculo. */
export const ANO_MIN = 1000
export const ANO_MAX = 3000

export const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const

export const MESES_NOME = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

/** "AAAA-MM-DD" → timestamp UTC da meia-noite. `null` se a data não existe. */
export function parseIso(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  if (ano < ANO_MIN || ano > ANO_MAX || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null

  const ts = Date.UTC(ano, mes - 1, dia)
  const d = new Date(ts)
  // Rejeita 31/02 e afins, que o `Date.UTC` normalizaria em silêncio para 03/03.
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    return null
  }
  return ts
}

/** Timestamp UTC → "AAAA-MM-DD". */
export function paraIso(ts: number): string {
  const d = new Date(ts)
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(d.getUTCDate()).padStart(2, '0')
  return `${d.getUTCFullYear()}-${mes}-${dia}`
}

/** Dias no mês (mês 1-12). */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

/** 0 = domingo … 6 = sábado. */
export function diaDaSemana(ts: number): number {
  return new Date(ts).getUTCDay()
}

export function ehFimDeSemana(ts: number): boolean {
  const d = diaDaSemana(ts)
  return d === 0 || d === 6
}

export function somarDias(ts: number, n: number): number {
  return ts + n * MS_DIA
}

/** Dias corridos entre duas meia-noites UTC (fim − início). */
export function diasEntre(inicio: number, fim: number): number {
  return Math.round((fim - inicio) / MS_DIA)
}

/** Nome do dia da semana de um timestamp UTC. */
export function nomeDiaSemana(ts: number): string {
  return DIAS_SEMANA[diaDaSemana(ts)] ?? ''
}
