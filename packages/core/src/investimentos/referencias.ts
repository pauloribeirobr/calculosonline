/**
 * Referências de mercado usadas quando o formulário não pede a taxa
 * (CDB "% do CDI", Tesouro Selic, poupança, IPCA+).
 *
 * Fonte única para as três calculadoras de investimento (F82). Antes cada
 * módulo tinha a sua, e elas divergiram: o CDB simulava com CDI de 10,65%
 * enquanto o CDI real estava em 13,65%.
 *
 * Fonte: Banco Central, SGS (api.bcb.gov.br/dados/serie/bcdata.sgs.<série>):
 *  - 432:   meta Selic definida pelo Copom (% a.a.)
 *  - 4389:  CDI anualizado base 252 (% a.a.)
 *  - 13522: IPCA acumulado em 12 meses (%)
 *
 * Para atualizar: consultar as três séries com `/dados/ultimos/1?formato=json`,
 * trocar os valores e a data abaixo, e regerar os exemplos dos MDX de CDB,
 * poupança e Tesouro Direto pelo motor (disciplina do F47).
 */
export const REFERENCIAS_MERCADO = {
  dataConsulta: '2026-10-26',
  selicAnual: 0.1375,
  cdiAnual: 0.1365,
  /** IPCA de 12 meses até set/2026, o último publicado na data da consulta. */
  ipcaAnual: 0.0458,
} as const
