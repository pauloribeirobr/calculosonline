/**
 * Taxas dos formulários de investimento em **porcentagem** (F84).
 *
 * Até a F84 o CDB, o Tesouro Direto e a poupança pediam a taxa em decimal
 * (`1.10` = 110% do CDI, `0.12` = 12% ao ano), e o mesmo campo do CDB mudava de
 * escala conforme o indexador. Agora o usuário digita o número que lê no
 * extrato ou no site do emissor ("110", "12", "13,75"), e o formulário divide
 * por 100 antes de chamar o motor, que continua em decimal.
 *
 * **Links antigos.** O `?d=` guarda os campos do formulário como estavam. Os
 * campos em porcentagem ganharam nomes novos (`percentualCDI`, `taxaPrefixada`,
 * `taxaReal`, `cdi`, `selic`, `ipca`) justamente para não haver ambiguidade: se
 * o link traz `taxaAnual` ou `selicAnual`, é decimal e vem do formato antigo;
 * as funções `migrar*` abaixo convertem. Nenhum palpite pelo tamanho do número.
 */

import { REFERENCIAS_MERCADO } from '@calculosonline/core/investimentos'

/** Decimal → porcentagem, sem o lixo de ponto flutuante (0.1365 × 100 = 13.650000000000002). */
export function paraPercentual(decimal: number): number {
  return Math.round(decimal * 100 * 10000) / 10000
}

/** Porcentagem → decimal, para o motor. */
export function paraDecimal(percentual: number): number {
  return Math.round((percentual / 100) * 1e8) / 1e8
}

/** Referências do Banco Central em porcentagem, para pré-preencher os campos. */
export const REFERENCIAS_PERCENTUAL = {
  selic: paraPercentual(REFERENCIAS_MERCADO.selicAnual),
  cdi: paraPercentual(REFERENCIAS_MERCADO.cdiAnual),
  ipca: paraPercentual(REFERENCIAS_MERCADO.ipcaAnual),
} as const

const DATA_REFERENCIA = REFERENCIAS_MERCADO.dataConsulta.split('-').reverse().join('/')

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

/** Dica dos campos de referência: o valor do Banco Central e a data da consulta. */
export const DICA_REFERENCIA = {
  selic: `Meta Selic do Banco Central em ${DATA_REFERENCIA}: ${fmt(REFERENCIAS_PERCENTUAL.selic)}%. Troque para simular outro cenário.`,
  cdi: `CDI do Banco Central em ${DATA_REFERENCIA}: ${fmt(REFERENCIAS_PERCENTUAL.cdi)}%. Troque para simular outro cenário.`,
  // A série 13522 do SGS é o IPCA acumulado em 12 meses até o último mês publicado (ver referencias.ts).
  ipca: `IPCA de 12 meses no Banco Central em ${DATA_REFERENCIA}: ${fmt(REFERENCIAS_PERCENTUAL.ipca)}%. Troque para simular outro cenário.`,
} as const

type Dados = Record<string, unknown> | undefined

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined

/** Link antigo do CDB: `taxaAnual` decimal no campo único → o campo do indexador, em %. */
export function migrarCDB(dados: Dados): Dados {
  if (!dados || !('taxaAnual' in dados)) return dados
  const { taxaAnual, ...resto } = dados
  const taxa = num(taxaAnual)
  if (taxa === undefined) return resto
  const campo =
    resto.tipo === 'prefixado'
      ? 'taxaPrefixada'
      : resto.tipo === 'ipca_mais'
        ? 'taxaReal'
        : 'percentualCDI'
  return { ...resto, [campo]: paraPercentual(taxa) }
}

/** Link antigo do Tesouro Direto: `taxaAnual` decimal (o Selic ignorava o campo). */
export function migrarTesouroDireto(dados: Dados): Dados {
  if (!dados || !('taxaAnual' in dados)) return dados
  const { taxaAnual, ...resto } = dados
  const taxa = num(taxaAnual)
  if (taxa === undefined || resto.tipo === 'selic') return resto
  const campo =
    resto.tipo === 'ipca_plus' || resto.tipo === 'ipca_cupom' ? 'taxaReal' : 'taxaPrefixada'
  return { ...resto, [campo]: paraPercentual(taxa) }
}

/** Link antigo da poupança: `selicAnual` decimal → `selic` em %. */
export function migrarPoupanca(dados: Dados): Dados {
  if (!dados || !('selicAnual' in dados)) return dados
  const { selicAnual, ...resto } = dados
  const selic = num(selicAnual)
  return selic === undefined ? resto : { ...resto, selic: paraPercentual(selic) }
}
