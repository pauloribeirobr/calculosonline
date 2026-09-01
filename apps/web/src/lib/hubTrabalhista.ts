/**
 * Registry do hub "Calculadora Trabalhista Completa" (F58).
 *
 * **Por que é um hub e não a 21ª calculadora.** O `calculatorRegistry` descreve
 * ferramentas de uma conta só — cada entrada casa com um formulário em
 * `components/calculadoras/forms/` e um MDX em `content/calculadoras/`. O hub
 * não é isso: ele encadeia quatro delas a partir de um input só e mostra
 * quatro resultados lado a lado. Entrar no registry o colocaria na listagem de
 * `/categoria/trabalhista` como se fosse mais uma opção concorrente das que
 * ele agrega, e mudaria a contagem de "20 calculadoras" que o site declara em
 * home, `/sobre`, FAQ e og-image.
 *
 * **Por que existe.** O GSC mostra queries de intenção agregada (`calculo
 * trabalhista completo`, `como calcular direitos trabalhistas`) que nenhuma
 * das calculadoras trabalhistas atende sozinha — cada uma responde um pedaço.
 * O único candidato que o site já tinha para essa busca era
 * `/categoria/trabalhista`, que é um índice de links e teve **1 pageview** em
 * 3 meses. Ver `MEMORY.md` §P1.
 */

import type { CategoriaCalc } from './identidadeVisual'

export const HUB_TRABALHISTA = {
  slug: 'calculadora-trabalhista-completa',
  path: '/calculadora-trabalhista-completa',
  titulo: 'Calculadora Trabalhista Completa',
  tituloSeo: 'Calculadora Trabalhista Completa 2026 — Rescisão, 13º, Férias e FGTS',
  h1: 'Calculadora Trabalhista Completa',
  descricao:
    'Preencha seus dados uma vez e veja de uma só vez a rescisão, o 13º salário, as férias e o FGTS. Cálculo trabalhista completo pela CLT 2026, grátis e sem cadastro.',
  descricaoCurta:
    'Rescisão, 13º, férias e FGTS a partir dos mesmos dados, num fluxo só.',
  categoria: 'trabalhista' as CategoriaCalc,
  fonteJuridica:
    'CLT arts. 129–153 e 477–487 | Lei 4.090/1962 | Lei 4.749/1965 | Lei 8.036/1990 | Lei 12.506/2011',
  /** Mesma data das tabelas trabalhistas do registry — o hub não tem tabela própria. */
  dataAtualizacao: '2026-01-01',
  palavrasChave: [
    'calculadora trabalhista completa',
    'cálculo trabalhista completo',
    'como calcular direitos trabalhistas',
    'calcular direitos trabalhistas',
    'calculadora trabalhista 2026',
    'quanto vou receber na rescisão',
    'cálculo de verbas trabalhistas',
    'simulador trabalhista',
  ],
  /**
   * Vocabulário alternativo, na mesma disciplina do campo `sinonimos` do
   * registry (F38/F53): precisa aparecer no corpo do MDX e na FAQ, não só aqui.
   */
  sinonimos: [
    'acerto trabalhista completo',
    'todos os meus direitos trabalhistas',
    'quanto tenho a receber da empresa',
    'conta de saída da empresa',
  ],
  /**
   * As quatro calculadoras que o hub encadeia, na ordem em que os blocos do
   * resultado aparecem. É a lista que decide onde o CTA recíproco é exibido
   * (`HubTrabalhistaCta`) — a metade que dá PageRank ao hub. Sem isso ele
   * nasceria órfão, recebendo link só do rodapé, que é o erro que o F43
   * corrigiu no sentido oposto.
   */
  calculadorasEncadeadas: [
    'rescisao-trabalhista',
    'decimo-terceiro',
    'ferias',
    'fgts',
  ] as const,
} as const

/** `true` nas calculadoras que o hub agrega — decide o CTA recíproco. */
export function fazParteDoHub(slug: string): boolean {
  return (HUB_TRABALHISTA.calculadorasEncadeadas as readonly string[]).includes(slug)
}
