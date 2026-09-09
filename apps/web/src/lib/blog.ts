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
   * Manda o CTA principal do post para o hub do F58 em vez da calculadora.
   *
   * Existe para a intenção **agregada** ("quais são todos os meus direitos"),
   * que é justamente a que nenhuma calculadora atende sozinha — mandar esse
   * leitor para a rescisão o obrigaria a abrir outras três em seguida.
   * `calculadoraPrincipal` continua preenchida mesmo assim: ela é quem define
   * a identidade visual da imagem social (F41/F42) e o link recíproco, e o
   * hub não está no `calculatorRegistry` de propósito (ver `hubTrabalhista.ts`).
   */
  ctaHub?: boolean
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
  {
    slug: 'rescisao-por-acordo-mutuo-quanto-voce-recebe',
    titulo: 'Rescisão por acordo mútuo: quanto você recebe',
    tituloSeo: 'Rescisão por Acordo Mútuo 2026 — Quanto Você Recebe',
    descricao:
      'O que muda no acerto quando a saída é combinada com a empresa (art. 484-A): aviso pela metade, multa de FGTS de 20%, saque de 80% e sem seguro-desemprego. Com tabela comparativa calculada.',
    resumo:
      'Sair por acordo rende mais que pedir demissão e bem menos que ser mandado embora. Veja a comparação lado a lado, quanto some do FGTS e a divergência do aviso prévio que pode valer R$ 1.500.',
    dataPublicacao: '2026-09-08',
    dataAtualizacao: '2026-09-08',
    palavrasChave: [
      'rescisão por acordo mútuo',
      'cálculo rescisão comum acordo',
      'demissão consensual',
      'acordo 484-A',
      'rescisão por acordo quanto recebo',
      'demissão de comum acordo',
      'multa de 20% do FGTS',
      'saque de 80% do FGTS',
    ],
    calculadoraPrincipal: 'rescisao-trabalhista',
    calculadorasRelacionadas: ['fgts', 'decimo-terceiro', 'ferias', 'salario-liquido'],
    tempoLeituraMin: 8,
  },
  {
    slug: 'acerto-trabalhista-o-que-entra-e-quando-recebo',
    titulo: 'Acerto trabalhista: o que entra e quando você recebe',
    tituloSeo: 'Acerto Trabalhista 2026 — Verbas e Prazo de Pagamento',
    descricao:
      'As verbas que compõem o acerto em cada tipo de saída, o prazo de 10 dias do art. 477 da CLT, a multa quando a empresa atrasa e o que conferir no TRCT antes de assinar.',
    resumo:
      'A empresa tem 10 dias corridos para pagar — e uma multa de um salário inteiro se atrasar. Veja o que entra no acerto em cada tipo de saída, com os valores calculados, e o que conferir antes de dar quitação.',
    dataPublicacao: '2026-09-08',
    dataAtualizacao: '2026-09-08',
    palavrasChave: [
      'acerto trabalhista',
      'verbas rescisórias',
      'prazo para pagamento da rescisão',
      'art. 477 da CLT',
      'multa do art. 477',
      'TRCT',
      'o que entra no acerto',
      'quanto tempo a empresa tem para pagar a rescisão',
    ],
    calculadoraPrincipal: 'rescisao-trabalhista',
    calculadorasRelacionadas: ['fgts', 'ferias', 'decimo-terceiro', 'salario-liquido'],
    tempoLeituraMin: 9,
  },
  {
    slug: '13-salario-proporcional-como-calcular',
    titulo: '13º proporcional: como calcular por meses trabalhados',
    tituloSeo: '13º Salário Proporcional 2026 — Como Calcular por Meses',
    descricao:
      'Quem não trabalhou o ano inteiro recebe 1/12 por mês. Veja a regra dos 15 dias, a tabela por mês de admissão, o que acontece em afastamento e licença, e como fica na demissão.',
    resumo:
      'A conta é 1/12 por mês trabalhado — mas o que decide se um mês conta são 15 dias, e um único dia de diferença na admissão chega a valer R$ 227. Tabela por mês, por faixa de salário e as regras de afastamento.',
    dataPublicacao: '2026-09-08',
    dataAtualizacao: '2026-09-08',
    palavrasChave: [
      '13º salário proporcional',
      'calcular 13º proporcional online',
      'décimo terceiro proporcional',
      '13 proporcional meses trabalhados',
      'regra dos 15 dias 13º',
      '13º de quem foi admitido durante o ano',
      '13º proporcional na demissão',
    ],
    calculadoraPrincipal: 'decimo-terceiro',
    calculadorasRelacionadas: ['rescisao-trabalhista', 'inss', 'irrf', 'salario-liquido'],
    sazonalidade: {
      picoMeses: [11, 12],
      nota:
        'Mesma janela do guia de datas do 13º, com uma diferença: a busca por "proporcional" também pica junto das demissões (jan e jul). Revisar as tabelas de INSS/IRRF em agosto, antes do pico principal.',
    },
    tempoLeituraMin: 8,
  },
  {
    slug: 'direitos-trabalhistas-na-demissao-guia-completo',
    titulo: 'Direitos trabalhistas na demissão: o guia completo',
    tituloSeo: 'Direitos Trabalhistas na Demissão 2026 — Guia Completo',
    descricao:
      'Todos os direitos de quem sai da empresa em um lugar só: rescisão, 13º, férias e FGTS, o que muda em cada tipo de saída e por que somar os quatro valores dá um número que não existe.',
    resumo:
      'Rescisão, 13º, férias e FGTS não são quatro contas independentes — a rescisão já embute três delas. Somar os quatro dá R$ 36.681 onde a pessoa recebe R$ 15.558. Veja o que realmente entra e o que é dupla contagem.',
    dataPublicacao: '2026-09-08',
    dataAtualizacao: '2026-09-08',
    palavrasChave: [
      'direitos trabalhistas na demissão',
      'calculadora trabalhista',
      'cálculo trabalhista completo',
      'como calcular direitos trabalhistas',
      'quanto vou receber na demissão',
      'todos os direitos do trabalhador demitido',
      'verbas trabalhistas',
    ],
    calculadoraPrincipal: 'rescisao-trabalhista',
    calculadorasRelacionadas: ['decimo-terceiro', 'ferias', 'fgts', 'salario-liquido'],
    // Intenção agregada: o CTA vai para o hub do F58, não para uma calculadora.
    ctaHub: true,
    tempoLeituraMin: 10,
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

/**
 * Posts de intenção agregada, que apontam para o hub do F58 em vez de uma
 * calculadora. É a metade recíproca do `ctaHub`: sem isto o post agregado
 * linkaria o hub e não receberia link de volta, nascendo órfão — exatamente o
 * que o F43 corrigiu no resto do site.
 */
export function postsDoHub(): PostBlog[] {
  return postsOrdenados().filter((p) => p.ctaHub === true)
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
