/**
 * Fonte única da identidade visual por categoria (F41).
 *
 * Antes desta consolidação as mesmas 6 categorias eram descritas em **quatro**
 * lugares que não se conheciam — `CATEGORIAS` e `CATEGORIAS_LABEL` (labels,
 * em `calculators.ts`), `categoryStyles` (`CalculatorIcon.tsx`) e
 * `categoriaCor` (`CalculatorTypes.tsx`) —, os dois últimos com as mesmas
 * cores em formatos incompatíveis (`ring` vs `border`), já divergentes entre si.
 * Mudar a cor de uma categoria exigia editar dois arquivos; agora é uma linha
 * aqui e propaga para home, /categorias, página de calculadora, relacionadas
 * e /meus-calculos.
 *
 * **Este arquivo não importa React nem Heroicons de propósito** — ele é lido
 * por `sitemap.ts` e `schema.ts` (server), onde arrastar componentes de ícone
 * para o bundle seria desperdício. O mapa de ícones (que são componentes) vive
 * em `components/common/CalculatorIcon.tsx` e lê as cores daqui.
 *
 * As classes são strings literais completas porque o purge do Tailwind não
 * enxerga interpolação (`bg-${cor}-50` não sobrevive ao build).
 */

export type CategoriaCalc =
  | 'trabalhista'
  | 'impostos'
  | 'financeiro'
  | 'investimentos'
  | 'saude'
  | 'negocios'

export type IconeCalculadora =
  | 'rescisao'
  | 'ferias'
  | 'decimoTerceiro'
  | 'horaExtra'
  | 'fgts'
  | 'salarioLiquido'
  | 'inss'
  | 'irrf'
  | 'irpf'
  | 'dasMei'
  | 'porcentagem'
  | 'jurosCompostos'
  | 'emprestimo'
  | 'financiamento'
  | 'cdb'
  | 'poupanca'
  | 'tesouroDireto'
  | 'imc'
  | 'calorias'
  | 'margemLucro'

export interface IdentidadeCategoria {
  label: string
  descricao: string
  /**
   * Família de cor do Tailwind da categoria. É a única declaração de "impostos
   * é âmbar" no projeto: as classes abaixo derivam dela manualmente (o purge
   * exige string literal) e o gerador de og-image deriva os hexes dela via
   * `tailwindcss/colors`, em vez de manter uma segunda paleta em hexadecimal.
   */
  familia: 'blue' | 'amber' | 'emerald' | 'purple' | 'pink' | 'cyan'
  /** Fundo da superfície clara da categoria. */
  fundo: string
  /** Anel de 1px sobre a superfície — o padrão do projeto para cards e ícones. */
  anel: string
  /** Borda, para os poucos casos que usam `border` em vez de `ring`. */
  borda: string
  /**
   * Cor do glifo do ícone. Tom `-600`: é objeto gráfico decorativo
   * (`aria-hidden`), então o piso é 3:1 sobre o fundo — todas as 6 famílias
   * passam, com a âmbar no limite (3,07:1).
   */
  icone: string
  /**
   * Cor de texto legível sobre o fundo claro. Tom `-700` porque texto exige
   * 4,5:1, que o `-600` do ícone não entrega em âmbar, esmeralda nem ciano.
   * Por isso ícone e texto são tokens separados, e não um só.
   */
  texto: string
  /** Realce de borda no hover de cards clicáveis. */
  hover: string
}

export const IDENTIDADE_CATEGORIA: Record<CategoriaCalc, IdentidadeCategoria> = {
  trabalhista: {
    label: 'Trabalhistas',
    descricao: 'CLT, rescisão, férias, 13º e mais',
    familia: 'blue',
    fundo: 'bg-blue-50',
    anel: 'ring-blue-100',
    borda: 'border-blue-100',
    icone: 'text-blue-600',
    texto: 'text-blue-700',
    hover: 'hover:border-blue-300',
  },
  impostos: {
    label: 'Impostos',
    descricao: 'INSS, IRRF, IRPF, MEI e mais',
    familia: 'amber',
    fundo: 'bg-amber-50',
    anel: 'ring-amber-100',
    borda: 'border-amber-100',
    icone: 'text-amber-600',
    texto: 'text-amber-700',
    hover: 'hover:border-amber-300',
  },
  financeiro: {
    label: 'Financeiras',
    descricao: 'Juros, empréstimos, porcentagem',
    familia: 'emerald',
    fundo: 'bg-emerald-50',
    anel: 'ring-emerald-100',
    borda: 'border-emerald-100',
    icone: 'text-emerald-600',
    texto: 'text-emerald-700',
    hover: 'hover:border-emerald-300',
  },
  investimentos: {
    label: 'Investimentos',
    descricao: 'CDB, poupança, Tesouro Direto',
    familia: 'purple',
    fundo: 'bg-purple-50',
    anel: 'ring-purple-100',
    borda: 'border-purple-100',
    icone: 'text-purple-600',
    texto: 'text-purple-700',
    hover: 'hover:border-purple-300',
  },
  saude: {
    label: 'Saúde',
    descricao: 'IMC, calorias, peso ideal',
    familia: 'pink',
    fundo: 'bg-pink-50',
    anel: 'ring-pink-100',
    borda: 'border-pink-100',
    icone: 'text-pink-600',
    texto: 'text-pink-700',
    hover: 'hover:border-pink-300',
  },
  negocios: {
    label: 'Negócios',
    descricao: 'Margem, markup, precificação',
    familia: 'cyan',
    fundo: 'bg-cyan-50',
    anel: 'ring-cyan-100',
    borda: 'border-cyan-100',
    icone: 'text-cyan-600',
    texto: 'text-cyan-700',
    hover: 'hover:border-cyan-300',
  },
}

export const CATEGORIAS_ORDEM = Object.keys(IDENTIDADE_CATEGORIA) as CategoriaCalc[]

/** Atalho para o par fundo + anel, que é como o quadro do ícone é montado. */
export function superficieDe(categoria: CategoriaCalc): string {
  const { fundo, anel } = IDENTIDADE_CATEGORIA[categoria]
  return `${fundo} ${anel}`
}

export function identidadeDe(categoria: CategoriaCalc): IdentidadeCategoria {
  return IDENTIDADE_CATEGORIA[categoria]
}
