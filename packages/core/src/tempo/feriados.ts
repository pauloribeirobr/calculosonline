/**
 * Feriados nacionais (F72) — o dado que faltava aos dias úteis da F68.
 *
 * **Por que este dado existe aqui.** O Semrush de 21/09 (ver `MEMORY.md`,
 * diário de 22/09, parte 14) mostrou `feriados 2027` com 22,2K buscas/mês e
 * **KD 16**, `feriados` 74K/KD 25 e `hoje é feriado` 110K/KD 29, sem ninguém
 * forte no topo. E a calculadora de datas já precisava da lista: desde a F68
 * ela declara em aviso que os dias úteis não descontam feriado.
 *
 * **Feriado e ponto facultativo são coisas diferentes, e o código separa.**
 * Feriado nacional é o que está em lei federal: o comércio pode fechar e quem
 * trabalha recebe em dobro. Carnaval e Corpus Christi **não estão em lei
 * federal**: são ponto facultativo da portaria anual do governo federal, que
 * vale para o serviço público federal e que bancos e muitas empresas seguem.
 * O padrão da calculadora é a lei; os facultativos entram por opção.
 *
 * **O que não entra:** feriados estaduais (como o 9 de julho em São Paulo) e
 * municipais (aniversário da cidade, padroeiro). São centenas de listas, e a
 * página declara isso em vez de deixar o número parecer completo.
 *
 * **Datas móveis saem da Páscoa**, calculada pelo algoritmo de Meeus/Jones/
 * Butcher para o calendário gregoriano: Carnaval 47 dias antes (terça) e 48
 * (segunda), Paixão de Cristo 2 dias antes e Corpus Christi 60 depois.
 *
 * **Fontes, conferidas no texto oficial em 04/10/2026** (Planalto e DOU):
 * Lei 662/1949, art. 1º, na redação da Lei 10.607/2002 (os sete fixos); Lei
 * 6.802/1980 (12/10); Lei 14.759/2023 (20/11, publicada em 21/12/2023, por
 * isso vale a partir de 2024); Lei 9.093/1995, art. 2º (Sexta-Feira da
 * Paixão). Os nomes seguem a Portaria MGI nº 11.460/2025, que lista os
 * mesmos 10 feriados nacionais para 2026. Cada feriado carrega o link da sua
 * lei em `fonteUrl`, para a página citar a fonte em vez de pedir confiança.
 */

import {
  ANO_MAX,
  ANO_MIN,
  diaDaSemana,
  diasEntre,
  nomeDiaSemana,
  paraIso,
  parseIso,
  somarDias,
} from './calendario'

/** `nacional`: lei federal. `facultativo`: portaria anual do governo federal. */
export type TipoFeriado = 'nacional' | 'facultativo'

/**
 * Quais datas a contagem de dias úteis desconta:
 * - `nenhum`: só sábado e domingo (o comportamento da F68);
 * - `nacionais`: os feriados da lei federal;
 * - `nacionais-facultativos`: também Carnaval e Corpus Christi.
 */
export type CalendarioFeriados = 'nenhum' | 'nacionais' | 'nacionais-facultativos'

export interface Feriado {
  /** ISO "AAAA-MM-DD". */
  data: string
  nome: string
  tipo: TipoFeriado
  /** Data que muda todo ano, por depender da Páscoa. */
  movel: boolean
  /** Lei ou ato que cria a data. */
  fundamento: string
  /** Texto oficial do fundamento (Planalto ou DOU). */
  fonteUrl: string
  diaSemana: string
  /** Cai em sábado ou domingo, e por isso não tira nenhum dia útil. */
  fimDeSemana: boolean
}

/** Ano a partir do qual o 20 de novembro é feriado nacional. */
export const ANO_INICIO_CONSCIENCIA_NEGRA = 2024

interface Fonte {
  fundamento: string
  fonteUrl: string
}

const LEI_662: Fonte = {
  fundamento: 'Lei 662/1949, art. 1º (redação da Lei 10.607/2002)',
  fonteUrl: 'https://www.planalto.gov.br/ccivil_03/leis/l0662.htm',
}
const LEI_6802: Fonte = {
  fundamento: 'Lei 6.802/1980',
  fonteUrl: 'https://www.planalto.gov.br/ccivil_03/leis/l6802.htm',
}
const LEI_14759: Fonte = {
  fundamento: 'Lei 14.759/2023',
  fonteUrl: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm',
}
const LEI_9093: Fonte = {
  fundamento: 'Lei 9.093/1995, art. 2º',
  fonteUrl: 'https://www.planalto.gov.br/ccivil_03/leis/l9093.htm',
}

/**
 * Portaria anual do governo federal com os feriados e pontos facultativos do
 * ano. Sai no fim de dezembro do ano anterior, então o ano seguinte fica sem
 * ela até lá — e a página diz isso, em vez de adivinhar as "pontes".
 */
export interface PortariaAnual {
  ano: number
  titulo: string
  publicacao: string
  url: string
  /**
   * Pontos facultativos como a portaria os lista, incluindo os que nenhuma
   * fórmula prevê (pontes, meio expediente, Dia do Servidor).
   */
  facultativos: { data: string; nome: string; observacao?: string }[]
}

export const PORTARIAS_ANUAIS: Readonly<Record<number, PortariaAnual>> = {
  2026: {
    ano: 2026,
    titulo: 'Portaria MGI nº 11.460, de 29 de dezembro de 2025',
    publicacao: 'Diário Oficial da União de 30/12/2025, seção 1, página 59',
    url: 'https://www.in.gov.br/web/dou/-/portaria-mgi-n-11.460-de-29-de-dezembro-de-2025-678388627',
    facultativos: [
      { data: '2026-02-16', nome: 'Carnaval' },
      { data: '2026-02-17', nome: 'Carnaval' },
      { data: '2026-02-18', nome: 'Quarta-feira de Cinzas', observacao: 'até as 14h' },
      { data: '2026-04-20', nome: 'Véspera de Tiradentes' },
      { data: '2026-06-04', nome: 'Corpus Christi' },
      { data: '2026-06-05', nome: 'Dia seguinte a Corpus Christi' },
      { data: '2026-10-28', nome: 'Dia do Servidor Público Federal' },
      { data: '2026-12-24', nome: 'Véspera de Natal', observacao: 'a partir das 13h' },
      { data: '2026-12-31', nome: 'Véspera de Ano-Novo', observacao: 'a partir das 13h' },
    ],
  },
}

const PORTARIA_FACULTATIVO: Fonte = {
  fundamento:
    'Ponto facultativo — portaria anual do Ministério da Gestão e da Inovação em Serviços Públicos',
  fonteUrl: PORTARIAS_ANUAIS[2026]?.url ?? '',
}

interface DefinicaoFixa {
  mes: number
  dia: number
  nome: string
  fonte: Fonte
  desde?: number
}

/** Nomes como na Portaria MGI nº 11.460/2025. */
const FIXOS: readonly DefinicaoFixa[] = [
  { mes: 1, dia: 1, nome: 'Confraternização Universal', fonte: LEI_662 },
  { mes: 4, dia: 21, nome: 'Tiradentes', fonte: LEI_662 },
  { mes: 5, dia: 1, nome: 'Dia Mundial do Trabalho', fonte: LEI_662 },
  { mes: 9, dia: 7, nome: 'Independência do Brasil', fonte: LEI_662 },
  { mes: 10, dia: 12, nome: 'Nossa Senhora Aparecida', fonte: LEI_6802 },
  { mes: 11, dia: 2, nome: 'Finados', fonte: LEI_662 },
  { mes: 11, dia: 15, nome: 'Proclamação da República', fonte: LEI_662 },
  {
    mes: 11,
    dia: 20,
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    fonte: LEI_14759,
    desde: ANO_INICIO_CONSCIENCIA_NEGRA,
  },
  { mes: 12, dia: 25, nome: 'Natal', fonte: LEI_662 },
]

/** Domingo de Páscoa (calendário gregoriano), em ISO. */
export function calcularPascoa(ano: number): string {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return paraIso(Date.UTC(ano, mes - 1, dia))
}

function montar(
  ts: number,
  nome: string,
  tipo: TipoFeriado,
  movel: boolean,
  fonte: Fonte,
): Feriado {
  const dow = diaDaSemana(ts)
  return {
    data: paraIso(ts),
    nome,
    tipo,
    movel,
    fundamento: fonte.fundamento,
    fonteUrl: fonte.fonteUrl,
    diaSemana: nomeDiaSemana(ts),
    fimDeSemana: dow === 0 || dow === 6,
  }
}

/**
 * Feriados nacionais do ano, em ordem de data. Com `incluirFacultativos`,
 * entram também Carnaval (segunda e terça) e Corpus Christi.
 *
 * Aplica a lei atual a qualquer ano, com uma exceção: o 20 de novembro só
 * existe a partir de 2024.
 */
export function listarFeriados(
  ano: number,
  { incluirFacultativos = false }: { incluirFacultativos?: boolean } = {},
): Feriado[] {
  if (!Number.isInteger(ano) || ano < ANO_MIN || ano > ANO_MAX) return []

  const lista: Feriado[] = FIXOS.filter((f) => f.desde === undefined || ano >= f.desde).map((f) =>
    montar(Date.UTC(ano, f.mes - 1, f.dia), f.nome, 'nacional', false, f.fonte),
  )

  const pascoa = parseIso(calcularPascoa(ano)) as number
  lista.push(montar(somarDias(pascoa, -2), 'Paixão de Cristo', 'nacional', true, LEI_9093))

  if (incluirFacultativos) {
    lista.push(
      montar(
        somarDias(pascoa, -48),
        'Segunda-feira de Carnaval',
        'facultativo',
        true,
        PORTARIA_FACULTATIVO,
      ),
      montar(
        somarDias(pascoa, -47),
        'Terça-feira de Carnaval',
        'facultativo',
        true,
        PORTARIA_FACULTATIVO,
      ),
      montar(somarDias(pascoa, 60), 'Corpus Christi', 'facultativo', true, PORTARIA_FACULTATIVO),
    )
  }

  return lista.sort((x, y) => x.data.localeCompare(y.data))
}

/** Lista do ano conforme o calendário escolhido na calculadora. */
export function feriadosDoCalendario(ano: number, calendario: CalendarioFeriados): Feriado[] {
  if (calendario === 'nenhum') return []
  return listarFeriados(ano, { incluirFacultativos: calendario === 'nacionais-facultativos' })
}

export interface ProximoFeriado {
  feriado: Feriado
  /** 0 quando o feriado é hoje. */
  diasAte: number
}

/**
 * O feriado de hoje, se houver, ou o próximo. `hoje` em ISO — quem chama
 * passa a data de Brasília (`hojeISO`), porque o fuso do servidor não é o
 * do leitor.
 */
export function proximoFeriado(
  hoje: string,
  { incluirFacultativos = false }: { incluirFacultativos?: boolean } = {},
): ProximoFeriado | null {
  const ts = parseIso(hoje)
  if (ts === null) return null
  const ano = new Date(ts).getUTCFullYear()
  for (const a of [ano, ano + 1]) {
    for (const feriado of listarFeriados(a, { incluirFacultativos })) {
      const tsFeriado = parseIso(feriado.data) as number
      if (tsFeriado >= ts) {
        return { feriado, diasAte: diasEntre(ts, tsFeriado) }
      }
    }
  }
  return null
}
