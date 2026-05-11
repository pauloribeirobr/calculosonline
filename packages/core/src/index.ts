/**
 * @calculosonline/core
 *
 * Biblioteca TypeScript pura com todas as funções de cálculo do calculosonline.com.br.
 * Não depende de UI, DOM, React ou Next.js — pode ser consumida em qualquer ambiente
 * (web, desktop Tauri, TWA Android, plugin Google Sheets, API).
 */

export * from './types'
export * as Tabelas from './tabelas'
export * as Utils from './utils'
export * as Explainability from './explainability'

// Reservados para sprints futuras (mantém o tree-shaking funcionando)
export * as Trabalhista from './trabalhista'
export * as Impostos from './impostos'
export * as Financeiro from './financeiro'
export * as Investimentos from './investimentos'
export * as Saude from './saude'
export * as Negocios from './negocios'
