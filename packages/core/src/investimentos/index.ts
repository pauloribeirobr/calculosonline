/**
 * Cálculos de investimento (CDB, Poupança, Tesouro Direto).
 * Sprint 1.1.
 */
export * from './cdb'
export * from './poupanca'
export * from './referencias'
// Renomeamos a constante SELIC_REFERENCIA_2026 para evitar colisão de export com cdb.ts (não tem)
// e mantemos o re-export simples do tesouro-direto.
export {
  calcularTesouroDireto,
  TAXA_CUSTODIA_B3,
  LIMITE_ISENCAO_SELIC,
} from './tesouro-direto'
export {
  calcularTesouroReserva,
  aliquotaIOF,
  TABELA_IOF_REGRESSIVO,
} from './tesouro-reserva'
export type {
  TesouroReservaParams,
  TesouroReservaResultado,
  UnidadePrazo,
} from './tesouro-reserva'
export type {
  TipoTesouroDireto,
  TesouroDiretoParams,
  TesouroDiretoResultado,
} from './tesouro-direto'
