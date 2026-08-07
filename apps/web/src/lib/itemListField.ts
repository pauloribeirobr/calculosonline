import { z } from 'zod'
import { somarItens as somarItensCore, type ItemValor } from '@calculosonline/core'

/**
 * Schema Zod compartilhado pros campos `type: 'itemList'` do `CalculatorForm`
 * (lista livre de "descrição + valor", ex.: outras deduções/descontos).
 *
 * Limites defensivos p/ o link de compartilhamento (query param `?d=` em
 * base64, ver `shareLink.ts`) não crescer sem controle — 20 itens × 60 chars
 * por lista mantém o link bem abaixo de qualquer limite prático de URL/CDN
 * mesmo com várias listas cheias ao mesmo tempo. Espelha os limites já
 * aplicados na própria UI do `ItemListField` (defesa em profundidade).
 */
export const itemListItemSchema = z.object({
  descricao: z.string().max(60, 'Máximo de 60 caracteres'),
  valor: z.number().min(0),
})

/** Schema de uma lista de itens, já com `.default([])`. */
export function itemListSchema() {
  return z.array(itemListItemSchema).max(20, 'Máximo de 20 itens').default([])
}

/** Descarta linhas em branco (sem descrição ou com valor zerado) antes de calcular. */
export function limparItensVazios(itens: ItemValor[]): ItemValor[] {
  return itens.filter((item) => item.descricao.trim() !== '' && item.valor > 0)
}

/** Soma os valores de uma lista de itens, ignorando linhas em branco. */
export function somarItens(itens: ItemValor[]): number {
  return somarItensCore(limparItensVazios(itens))
}
