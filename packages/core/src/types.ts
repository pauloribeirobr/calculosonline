/**
 * Tipos compartilhados pelo core engine.
 * Toda função de cálculo retorna um ResultadoOuErro padronizado.
 */

export interface ItemDetalhamento {
  descricao: string
  valor: number
  tipo: 'credito' | 'debito' | 'neutro'
  formula?: string
}

export type TipoPassoCalculo = 'entrada' | 'calculo' | 'resultado' | 'aviso'

export interface PassoCalculo {
  /** Identificador estavel para exibir, auditar ou expor em API */
  id: string
  /** Ordem humana do passo, iniciando em 1 */
  ordem: number
  titulo: string
  explicacao: string
  tipo: TipoPassoCalculo
  natureza: ItemDetalhamento['tipo']
  valor: number
  formula?: string
}

export interface MemoriaCalculo {
  /** Resumo da regra/fórmula geral aplicada */
  resumo: string
  /** Passos reproduzíveis para validar o cálculo */
  passos: PassoCalculo[]
}

export interface ResultadoCalculo<T = unknown> {
  /** Valor numérico principal exibido como headline para o usuário */
  resultado: number
  /** Estrutura completa com todos os campos calculados */
  dados: T
  /** Detalhamento linha a linha do cálculo */
  detalhamento: ItemDetalhamento[]
  /** Memória de cálculo pronta para UI, auditoria e futura API pública */
  memoriaCalculo?: MemoriaCalculo
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
