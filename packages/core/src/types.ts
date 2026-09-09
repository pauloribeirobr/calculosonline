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

/**
 * Item de uma lista livre (descrição + valor) informada pelo usuário — ex.:
 * itens de "outras deduções"/"outros descontos"/"adicionais" no formulário.
 * Compartilhado entre calculadoras para não duplicar o shape.
 */
export interface ItemValor {
  descricao: string
  valor: number
}

/** Soma os valores de uma lista de `ItemValor`, tratando lista ausente como vazia. */
export function somarItens(itens: ItemValor[] | undefined): number {
  return (itens ?? []).reduce((total, item) => total + item.valor, 0)
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
  /**
   * Rótulo do headline, quando "Resultado" não basta.
   *
   * A página passa `titulo="Resultado"` para as 20 calculadoras, o que serve
   * enquanto o headline é óbvio pelo contexto ("salário líquido" na
   * calculadora de salário líquido). Não serve quando **a mesma calculadora
   * responde perguntas diferentes conforme a modalidade escolhida** — no FGTS,
   * o mesmo formulário devolve saldo acumulado, valor a receber na rescisão ou
   * saque-aniversário, e um número grande sem nome é ambíguo.
   *
   * Opcional e aditivo: quem não define continua com o rótulo da página.
   */
  rotuloResultado?: string
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
