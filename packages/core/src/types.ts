/**
 * Tipos compartilhados pelo core engine.
 * Toda função de cálculo retorna um ResultadoCalculo padronizado.
 */

export interface ItemDetalhamento {
  descricao: string
  valor: number
  tipo: 'credito' | 'debito' | 'neutro'
  formula?: string
}

export interface ResultadoCalculo<T = number> {
  /** Valor principal do cálculo */
  resultado: T
  /** Detalhamento linha a linha do cálculo */
  detalhamento: ItemDetalhamento[]
  /** Fórmula ou base de cálculo aplicada */
  baseCalculo: string
  /** Artigo de lei, portaria ou instrução normativa aplicada */
  fonteJuridica: string
  /** Data das tabelas utilizadas (INSS, IRRF, etc.) — formato ISO */
  dataReferencia: string
  /** Avisos ou observações importantes para o usuário */
  avisos?: string[]
}

export interface ErroValidacao {
  campo: string
  mensagem: string
}

export type ResultadoOuErro<T> =
  | { sucesso: true; dados: ResultadoCalculo<T> }
  | { sucesso: false; erros: ErroValidacao[] }
