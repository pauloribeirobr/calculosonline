import type {
  ItemDetalhamento,
  MemoriaCalculo,
  PassoCalculo,
  TipoPassoCalculo,
} from '../types'

export interface MemoriaCalculoConfig {
  termosEntrada: readonly string[]
  termosResultado: readonly string[]
  termosAviso: readonly string[]
  explicacoesPorTipo: Record<ItemDetalhamento['tipo'], string>
}

export interface CriarMemoriaCalculoOptions {
  baseCalculo: string
  config?: MemoriaCalculoConfig
}

export const DEFAULT_MEMORIA_CALCULO_CONFIG = {
  termosEntrada: [
    'salario bruto',
    'salario base',
    'capital inicial',
    'valor financiado',
    'custo total',
    'peso',
    'altura',
  ],
  termosResultado: [
    'total',
    'liquido',
    'montante final',
    'montante liquido',
    'preco de venda',
    'imc',
    'meta',
    'resultado',
  ],
  termosAviso: ['atencao', 'acima do teto', 'fora do limite', 'perdeu direito'],
  explicacoesPorTipo: {
    credito: 'Valor que entra como acréscimo, verba positiva ou montante a receber.',
    debito: 'Valor tratado como desconto, imposto, custo ou parcela a pagar.',
    neutro: 'Valor usado como base, referência, indicador ou resultado intermediário.',
  },
} as const satisfies MemoriaCalculoConfig

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function criarId(descricao: string, index: number): string {
  const slug = normalizar(descricao)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

  return `passo-${String(index + 1).padStart(2, '0')}-${slug || 'calculo'}`
}

function contemTermo(descricaoNormalizada: string, termos: readonly string[]): boolean {
  return termos.some((termo) => descricaoNormalizada.includes(termo))
}

function classificarPasso(
  item: ItemDetalhamento,
  config: MemoriaCalculoConfig,
): TipoPassoCalculo {
  const descricao = normalizar(item.descricao)

  if (contemTermo(descricao, config.termosAviso)) return 'aviso'
  if (contemTermo(descricao, config.termosResultado)) return 'resultado'
  if (contemTermo(descricao, config.termosEntrada)) return 'entrada'

  return 'calculo'
}

function criarExplicacao(
  item: ItemDetalhamento,
  tipo: TipoPassoCalculo,
  config: MemoriaCalculoConfig,
): string {
  if (tipo === 'entrada') {
    return 'Comece por este valor informado ou apurado, pois ele serve de base para as próximas etapas.'
  }

  if (tipo === 'resultado') {
    return item.formula
      ? 'Aplique a fórmula indicada e confira o valor consolidado desta etapa.'
      : 'Confira o valor consolidado depois de aplicar as etapas anteriores.'
  }

  if (tipo === 'aviso') {
    return 'Compare este valor com o limite ou regra destacada antes de usar o resultado final.'
  }

  return config.explicacoesPorTipo[item.tipo]
}

export function criarMemoriaCalculo(
  detalhamento: readonly ItemDetalhamento[],
  options: CriarMemoriaCalculoOptions,
): MemoriaCalculo {
  const config = options.config ?? DEFAULT_MEMORIA_CALCULO_CONFIG

  return {
    resumo: options.baseCalculo,
    passos: detalhamento.map<PassoCalculo>((item, index) => {
      const tipo = classificarPasso(item, config)
      const passo: PassoCalculo = {
        id: criarId(item.descricao, index),
        ordem: index + 1,
        titulo: item.descricao,
        explicacao: criarExplicacao(item, tipo, config),
        tipo,
        natureza: item.tipo,
        valor: item.valor,
      }

      if (item.formula) passo.formula = item.formula

      return passo
    }),
  }
}
