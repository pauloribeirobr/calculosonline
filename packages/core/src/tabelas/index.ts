/**
 * Sistema de tabelas legislativas com versionamento por data de vigência.
 * Atualizadas via PR automático quando há mudança em portarias oficiais
 * (Receita Federal, MTE, INSS).
 */

import { arredondar, formatarBRL } from '../utils'

export interface FaixaINSS {
  /**
   * Limite da faixa anterior (R$) — a largura tributada nesta faixa é
   * `ate − de`.
   *
   * Usa o limite **exato** da faixa anterior, não `limite + 0,01`: a tabela
   * oficial trata as faixas como intervalos contínuos, e somar um centavo em
   * cada piso encurta as faixas e faz a contribuição no teto fechar em
   * R$ 988,10 em vez dos R$ 988,09 da Portaria MPS/MF nº 13/2026.
   */
  de: number
  /** Limite superior da faixa (R$) — null = sem limite (último piso) */
  ate: number | null
  /** Alíquota efetiva da faixa (decimal: 0.075 = 7,5%) */
  aliquota: number
}

/**
 * Redutor do IRPF instituído pela Lei 15.270/2025 (art. 3º-A da Lei
 * 9.250/1995), vigente desde 1º/01/2026.
 *
 * **Não é uma faixa nova de isenção.** É um desconto aplicado *depois* do
 * imposto apurado pela tabela progressiva, calculado sobre o **rendimento
 * tributável bruto do mês** (não sobre a base de cálculo já líquida de INSS).
 *
 * Os dois extremos da faixa provam qual é a entrada da fórmula:
 *  - em R$ 5.000,00 → `978,62 − 0,133145 × 5.000 = 312,89`, exatamente o
 *    redutor máximo;
 *  - em R$ 7.350,00 → `978,62 − 0,133145 × 7.350 = 0,00`, exatamente o fim
 *    da faixa.
 *
 * Com a base após INSS a função seria descontínua em 5.000 e não zeraria em
 * 7.350 — ver `calcularRedutorIRRF`.
 */
export interface RedutorIRRF {
  /** Até este rendimento o redutor é integral (`valorMaximo`). */
  limiteIntegral: number
  /** Acima deste rendimento não há redutor. */
  limiteParcial: number
  /** Redutor máximo, aplicado na faixa integral (R$). */
  valorMaximo: number
  /** Termo constante da fórmula da faixa decrescente (R$). */
  constante: number
  /** Coeficiente do rendimento na fórmula da faixa decrescente. */
  fator: number
}

export interface FaixaIRRF {
  de: number
  ate: number | null
  aliquota: number
  /** Parcela a deduzir do imposto apurado (R$) */
  deducao: number
}

export interface TabelasLegislativas {
  /** Data de início da vigência (ISO date "AAAA-MM-DD") */
  vigenciaInicio: string
  /** Data de fim da vigência — null = ainda vigente */
  vigenciaFim: string | null
  /** Salário mínimo nacional (R$) */
  salarioMinimo: number
  /** Tabela progressiva do INSS */
  inss: FaixaINSS[]
  /** Tabela progressiva mensal do IRRF */
  irrf: FaixaIRRF[]
  /** Dedução por dependente no IRRF (R$) */
  deducaoDependenteIRRF: number
  /** Limite de isenção mensal do IRRF (R$) */
  limiteIsencaoIRRF: number
  /**
   * Desconto simplificado mensal (R$) — 25% do limite de isenção, aplicado
   * **em substituição** a todas as deduções legais quando for mais vantajoso
   * (art. 4º, IX da Lei 9.250/1995, incluído pela Lei 14.848/2024).
   *
   * É a chave da isenção até R$ 5.000: o redutor máximo de R$ 312,89 foi
   * calibrado exatamente sobre ele — `(5.000 − 607,20) × 22,5% − 675,49 =
   * 312,89`. Sem o desconto simplificado, um 13º de R$ 5.000 com apenas o
   * INSS abatido sobraria com R$ 23,78 de imposto e a isenção prometida pela
   * lei não fecharia.
   */
  descontoSimplificadoIRRF: number
  /** Redutor da Lei 15.270/2025 — null em tabelas anteriores a 2026. */
  redutorIRRF: RedutorIRRF | null
}

export interface PisoRegional {
  uf: string
  nome: string
  valor: number
  lei: string
  vigencia: string
}

/**
 * Tabelas vigentes em 2026.
 * Fontes:
 *  - Salário mínimo: R$ 1.621,00 (reajuste de 2026)
 *  - INSS: Portaria Interministerial MPS/MF nº 13, de 09/01/2026 — teto de
 *    R$ 8.475,55 (+3,9% sobre os R$ 8.157,41 de 2025) e contribuição máxima
 *    de R$ 988,09
 *  - IRRF: tabela progressiva mensal mantida (faixas e alíquotas de 2025)
 *  - Redutor do IRPF: Lei 15.270/2025, art. 3º-A da Lei 9.250/1995
 *  - Desconto simplificado mensal: art. 4º, IX da Lei 9.250/1995 (Lei
 *    14.848/2024) — 25% × R$ 2.428,80 = R$ 607,20
 *
 * IMPORTANTE: ao publicar portaria nova, atualizar aqui e **rodar os testes de
 * conteúdo** — os números dos MDX de calculadora e dos posts do blog são
 * gerados por estas tabelas e travados em e2e (disciplina F47/F49).
 */
export const TABELAS_2026: TabelasLegislativas = {
  vigenciaInicio: '2026-01-01',
  vigenciaFim: null,
  salarioMinimo: 1621.0,
  inss: [
    { de: 0, ate: 1621.0, aliquota: 0.075 },
    { de: 1621.0, ate: 2902.84, aliquota: 0.09 },
    { de: 2902.84, ate: 4354.27, aliquota: 0.12 },
    { de: 4354.27, ate: 8475.55, aliquota: 0.14 },
  ],
  irrf: [
    { de: 0, ate: 2428.8, aliquota: 0, deducao: 0 },
    { de: 2428.81, ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { de: 2826.66, ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
    { de: 3751.06, ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { de: 4664.69, ate: null, aliquota: 0.275, deducao: 908.73 },
  ],
  deducaoDependenteIRRF: 189.59,
  limiteIsencaoIRRF: 2428.8,
  descontoSimplificadoIRRF: 607.2,
  redutorIRRF: {
    limiteIntegral: 5000.0,
    limiteParcial: 7350.0,
    valorMaximo: 312.89,
    constante: 978.62,
    fator: 0.133145,
  },
}

/**
 * Pisos regionais por UF para 2026.
 * Estados sem piso próprio aplicam o salário mínimo federal (R$ 1.621,00).
 *
 * Ressalva: SP, RS e DF trazem o valor da última lei estadual conhecida e
 * podem estar defasados — os três seguem acima do mínimo federal, então o
 * fallback nunca fica ilegal, mas o número exato pede conferência antes de
 * virar conteúdo publicado.
 */
export const PISOS_REGIONAIS_2026: PisoRegional[] = [
  { uf: 'SP', nome: 'São Paulo', valor: 1700.0, lei: 'Lei Estadual 17.373/2021', vigencia: '2026-01-01' },
  { uf: 'RJ', nome: 'Rio de Janeiro', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MG', nome: 'Minas Gerais', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'RS', nome: 'Rio Grande do Sul', valor: 1636.94, lei: 'Lei Estadual 15.567/2021', vigencia: '2026-01-01' },
  { uf: 'SC', nome: 'Santa Catarina', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PR', nome: 'Paraná', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'BA', nome: 'Bahia', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PE', nome: 'Pernambuco', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'CE', nome: 'Ceará', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'DF', nome: 'Distrito Federal', valor: 2824.29, lei: 'Lei Distrital 6.983/2021', vigencia: '2026-01-01' },
  { uf: 'GO', nome: 'Goiás', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MT', nome: 'Mato Grosso', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'PA', nome: 'Pará', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
  { uf: 'AM', nome: 'Amazonas', valor: 1621.0, lei: 'Salário mínimo federal', vigencia: '2026-01-01' },
]

/** Retorna o piso regional da UF informada, ou o salário mínimo federal como fallback. */
export function getPisoRegional(uf: string): number {
  const piso = PISOS_REGIONAIS_2026.find((p) => p.uf === uf.toUpperCase())
  return piso?.valor ?? TABELAS_2026.salarioMinimo
}

/**
 * Lista cronológica de tabelas legislativas conhecidas.
 * Exposta para permitir testes com tabelas históricas/hipotéticas.
 */
export const TABELAS_HISTORICAS: TabelasLegislativas[] = [TABELAS_2026]

/**
 * Retorna as tabelas vigentes na data informada.
 * `historico` é injetável para testar cenários com tabelas com vigência encerrada.
 */
export function getTabelasVigentes(
  data: Date = new Date(),
  historico: TabelasLegislativas[] = TABELAS_HISTORICAS,
): TabelasLegislativas {
  const iso = data.toISOString().slice(0, 10)
  const vigente = historico.find((t) => {
    const dentro = iso >= t.vigenciaInicio
    const aindaValida = t.vigenciaFim === null || iso <= t.vigenciaFim
    return dentro && aindaValida
  })

  // Fallback determinístico: a lista de tabelas é não-vazia por construção.
  return vigente ?? (historico[historico.length - 1] as TabelasLegislativas)
}

export interface DetalheFaixaINSS {
  faixa: string
  base: number
  aliquota: number
  valor: number
}

/**
 * Calcula o INSS pelo regime progressivo (Decreto 11.936/2024).
 * Cada faixa incide apenas sobre a parcela do salário dentro dela —
 * o teto da última faixa funciona como cap natural da contribuição.
 *
 * `tabelas` é injetável para testar tabelas históricas ou hipotéticas
 * (ex.: faixa final aberta sem teto).
 */
export function calcularINSSProgressivo(
  salarioBruto: number,
  tabelas: TabelasLegislativas = getTabelasVigentes(),
): {
  valorINSS: number
  detalhamento: DetalheFaixaINSS[]
} {
  const detalhamento: DetalheFaixaINSS[] = []
  // Arredonda o acumulado, não cada faixa isolada: arredondar por faixa soma
  // até 4 erros de meio centavo e fecha o teto em R$ 988,10 em vez de
  // R$ 988,09. Cada linha do detalhamento recebe a diferença entre dois
  // acumulados já arredondados, então as linhas continuam somando exatamente
  // o total exibido.
  let exato = 0
  let arredondadoAnterior = 0

  for (const faixa of tabelas.inss) {
    const limite = faixa.ate ?? Number.POSITIVE_INFINITY
    const baseNaFaixa = Math.min(salarioBruto, limite) - faixa.de
    if (baseNaFaixa <= 0) continue

    exato += baseNaFaixa * faixa.aliquota
    const acumulado = arredondar(exato)

    detalhamento.push({
      // `formatarBRL` e não `toFixed(2)`: até 22/09/2026 o rótulo saía
      // "Até R$ 1621.00", com ponto decimal e sem separador de milhar, em toda
      // calculadora que lista as faixas do INSS (salário líquido, rescisão,
      // 13º, INSS e agora férias). É texto que o usuário lê e que a IA cita.
      faixa: faixa.ate === null ? 'teto' : `Até ${formatarBRL(faixa.ate)}`,
      base: arredondar(baseNaFaixa),
      aliquota: faixa.aliquota,
      valor: arredondar(acumulado - arredondadoAnterior),
    })
    arredondadoAnterior = acumulado
  }

  return { valorINSS: arredondadoAnterior, detalhamento }
}

/**
 * Redutor do IRPF da Lei 15.270/2025, vigente desde 1º/01/2026.
 *
 * Aplica-se **depois** do imposto apurado pela tabela progressiva e vale
 * também para o 13º salário, que é tributado exclusivamente na fonte — a
 * Receita Federal confirmou esse ponto na orientação de dez/2025.
 *
 * @param rendimentoTributavel Rendimento tributável **bruto** do mês (antes do
 *   INSS e das demais deduções). É essa a entrada da fórmula legal, não a base
 *   de cálculo: em R$ 5.000 ela devolve exatamente o redutor máximo de
 *   R$ 312,89 e em R$ 7.350 devolve exatamente zero. No 13º, é o 13º bruto.
 * @param impostoApurado Imposto pela tabela progressiva — o redutor é limitado
 *   a ele: zera o imposto, nunca gera crédito.
 */
export function calcularRedutorIRRF(
  rendimentoTributavel: number,
  impostoApurado: number,
  tabelas: TabelasLegislativas = getTabelasVigentes(),
): number {
  const redutor = tabelas.redutorIRRF
  if (!redutor || impostoApurado <= 0) return 0
  if (rendimentoTributavel > redutor.limiteParcial) return 0

  const bruto =
    rendimentoTributavel <= redutor.limiteIntegral
      ? redutor.valorMaximo
      : redutor.constante - redutor.fator * rendimentoTributavel

  return arredondar(Math.max(0, Math.min(bruto, impostoApurado)))
}

export interface IRRFMensalParams {
  /**
   * Rendimento tributável **bruto** do mês. É também a entrada do redutor da
   * Lei 15.270/2025, salvo quando `rendimentoTributavel` for informado
   * separadamente (caso do aluguel, onde despesas dedutíveis são excluídas do
   * rendimento antes da tabela).
   */
  salarioBruto: number
  inss: number
  numeroDependentes: number
  /** Pensão alimentícia, previdência privada, plano de saúde etc. */
  outrasDeducoes?: number
  /**
   * Rendimento que serve de base ao redutor, quando diferente de
   * `salarioBruto`. Default: `salarioBruto`.
   */
  rendimentoTributavel?: number
  tabelas?: TabelasLegislativas
}

export interface IRRFMensalResultado {
  /** IRRF final: imposto apurado menos o redutor, nunca negativo. */
  valorIRRF: number
  baseCalculo: number
  aliquota: number
  /** Parcela a deduzir da faixa aplicada (R$). */
  deducao: number
  /** Soma das deduções legais: INSS + dependentes + outras. */
  deducoesLegais: number
  /** O que foi efetivamente abatido — a maior entre legais e simplificado. */
  deducaoAplicada: number
  /** true quando o desconto simplificado venceu as deduções legais. */
  usouDescontoSimplificado: boolean
  /** Imposto pela tabela progressiva, antes do redutor. */
  impostoApurado: number
  /** Redutor da Lei 15.270/2025 aplicado (R$). */
  redutor: number
}

/**
 * Calcula o IRRF pela tabela progressiva mensal, na ordem que a lei impõe
 * desde 1º/01/2026:
 *
 * 1. deduções legais (INSS + dependentes + outras) **ou** o desconto
 *    simplificado de R$ 607,20 — o que for maior (Lei 14.848/2024);
 * 2. tabela progressiva sobre a base resultante;
 * 3. redutor da Lei 15.270/2025 sobre o rendimento tributável bruto, limitado
 *    ao imposto apurado.
 *
 * Pular o passo 1 quebra o passo 3: o redutor máximo de R$ 312,89 foi
 * calibrado sobre o desconto simplificado, e sem ele a isenção até R$ 5.000
 * prometida pela lei deixa R$ 23,78 de imposto residual.
 */
export function calcularIRRFMensal(params: IRRFMensalParams): IRRFMensalResultado {
  const tabelas = params.tabelas ?? getTabelasVigentes()
  const deducaoDep = params.numeroDependentes * tabelas.deducaoDependenteIRRF
  const deducoesLegais = arredondar(params.inss + deducaoDep + (params.outrasDeducoes ?? 0))

  const usouDescontoSimplificado = tabelas.descontoSimplificadoIRRF > deducoesLegais
  const deducaoAplicada = usouDescontoSimplificado
    ? tabelas.descontoSimplificadoIRRF
    : deducoesLegais

  const baseCalculo = arredondar(Math.max(0, params.salarioBruto - deducaoAplicada))

  const faixa = tabelas.irrf.find((f) => {
    const limite = f.ate ?? Number.POSITIVE_INFINITY
    return baseCalculo >= f.de && baseCalculo <= limite
  })

  const impostoApurado =
    !faixa || faixa.aliquota === 0
      ? 0
      : Math.max(0, arredondar(baseCalculo * faixa.aliquota - faixa.deducao))

  const redutor = calcularRedutorIRRF(
    params.rendimentoTributavel ?? params.salarioBruto,
    impostoApurado,
    tabelas,
  )

  return {
    valorIRRF: arredondar(Math.max(0, impostoApurado - redutor)),
    baseCalculo,
    aliquota: faixa?.aliquota ?? 0,
    deducao: faixa?.deducao ?? 0,
    deducoesLegais,
    deducaoAplicada,
    usouDescontoSimplificado,
    impostoApurado,
    redutor,
  }
}
