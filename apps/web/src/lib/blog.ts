/**
 * Registry canônico dos posts do blog (F22).
 *
 * Mesmo papel que `calculators.ts` cumpre para as calculadoras: é a única
 * fonte de verdade que alimenta a listagem, as páginas de post, o sitemap, os
 * schemas JSON-LD e a imagem social. O corpo editorial de cada post vive em
 * `content/blog/[slug].mdx`, exatamente como o das calculadoras vive em
 * `content/calculadoras/[slug].mdx`.
 *
 * **Por que o blog existe, e por que começou pelo 13º.** É a maior lacuna do
 * plano de negócios (seção 3.2) e nunca tinha sido implementado — tanto que
 * até o F44 o rodapé linkava `/blog`, uma rota inexistente, em 100% das
 * páginas. O 13º foi o primeiro porque é o único cluster do site com
 * **sazonalidade forte e previsível**: a busca pica em nov/dez, e o
 * `MEMORY.md` (25/07) já registrava o risco de calendário — perder a janela
 * não adia o retorno em semanas, adia em um ano. Publicar em setembro dá
 * 60-90 dias de maturação antes do pico.
 */

export interface PostBlog {
  slug: string
  /** H1 do post e título do card na listagem. */
  titulo: string
  /**
   * Title da aba/SERP. Separado do `titulo` pelo mesmo motivo do
   * `tituloLongo` das calculadoras: o H1 pode ser mais curto e direto, e o
   * title precisa carregar o ano e o termo de busca.
   */
  tituloSeo: string
  /** Meta description. */
  descricao: string
  /** Chamada do card na listagem — mais curta que a description. */
  resumo: string
  /** ISO. Vira `datePublished` do JSON-LD `Article`. */
  dataPublicacao: string
  /** ISO. Vira `dateModified` e o `<lastmod>` do sitemap. */
  dataAtualizacao: string
  palavrasChave: string[]
  /**
   * A calculadora que este post alimenta. O post não existe por si só: ele
   * captura a busca informacional ("quando cai o 13º") e entrega o usuário na
   * ferramenta transacional. Também define a identidade visual (cor e ícone
   * de categoria) da imagem social e do card, para o blog não inventar uma
   * paleta própria fora do sistema do F41.
   */
  calculadoraPrincipal: string
  /** Outras calculadoras citadas no corpo — viram o bloco de relacionadas. */
  calculadorasRelacionadas: string[]
  /**
   * Janela sazonal da busca, quando houver. Não muda comportamento nenhum:
   * documenta a intenção editorial para que a decisão de "quando republicar /
   * quando atualizar" não se perca, que é justamente o que o `MEMORY.md`
   * registrou como risco de calendário do cluster do 13º.
   */
  sazonalidade?: {
    /** Meses (1-12) em que a busca pica. */
    picoMeses: number[]
    nota: string
  }
  /** Minutos de leitura, exibido no card e no topo do post. */
  tempoLeituraMin: number
}

export const blogRegistry: PostBlog[] = [
  {
    slug: 'decimo-terceiro-2026-quando-cai-e-quanto-voce-recebe',
    titulo: 'Décimo terceiro 2026: quando cai e quanto você recebe',
    tituloSeo: 'Décimo Terceiro 2026 — Quando Cai e Quanto Você Recebe',
    descricao:
      'As datas do 13º salário em 2026, quanto cai em cada parcela e por que a 2ª parcela vem menor. Com tabela de valores por salário e exemplos calculados.',
    resumo:
      'A 2ª parcela vence num domingo em 2026, o que antecipa o pagamento para 18 de dezembro. Veja as datas, a tabela de quanto sobra por faixa de salário e por que a segunda parcela vem bem menor que a primeira.',
    dataPublicacao: '2026-08-30',
    dataAtualizacao: '2026-08-30',
    palavrasChave: [
      'décimo terceiro 2026',
      '13º salário 2026',
      'quando cai o 13º',
      'quando cai a primeira parcela do 13º',
      'décimo terceiro quando é pago',
      'calcular 13º salário',
      'segunda parcela do 13º',
      'desconto no 13º salário',
    ],
    calculadoraPrincipal: 'decimo-terceiro',
    calculadorasRelacionadas: ['salario-liquido', 'inss', 'irrf', 'ferias'],
    sazonalidade: {
      picoMeses: [11, 12],
      nota:
        'Busca pica em novembro/dezembro, com subida a partir de outubro. Publicado em agosto/setembro para maturar 60-90 dias antes do pico. Revisar as datas e a tabela de INSS/IRRF todo ano em agosto, antes da janela.',
    },
    tempoLeituraMin: 7,
  },
]

export function findPost(slug: string): PostBlog | undefined {
  return blogRegistry.find((p) => p.slug === slug)
}

/** Mais recentes primeiro — ordem da listagem e do feed. */
export function postsOrdenados(): PostBlog[] {
  return [...blogRegistry].sort(
    (a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime(),
  )
}

/** Posts que citam uma calculadora — usado para linkar da calculadora de volta ao blog. */
export function postsDaCalculadora(slug: string): PostBlog[] {
  return postsOrdenados().filter(
    (p) => p.calculadoraPrincipal === slug || p.calculadorasRelacionadas.includes(slug),
  )
}

/** Data mais recente entre todos os posts — `<lastmod>` da listagem no sitemap. */
export function ultimaAtualizacaoDoBlog(): Date {
  const datas = blogRegistry.map((p) => new Date(p.dataAtualizacao).getTime())
  return new Date(Math.max(...datas))
}

/** "30 de agosto de 2026" — usado no card e no cabeçalho do post. */
export function formatarDataPorExtenso(iso: string): string {
  // `T12:00` evita o clássico off-by-one de fuso: `new Date('2026-08-30')` é
  // meia-noite UTC, que em BRT (UTC-3) ainda é dia 29.
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
