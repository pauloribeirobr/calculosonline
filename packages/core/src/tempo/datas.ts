/**
 * Aritmética de datas (F68) — a primeira calculadora do site sem legislação
 * por trás.
 *
 * **Por que esta categoria existe.** As medições de 22/09 (ver `MEMORY.md`,
 * diário parte 14) mostraram que a cauda de cálculo de data tem KD 16-25 —
 * `diferença entre datas` 4,4K/mês com KD 16, `dias entre datas` 3,6K/21,
 * `calcular dias` 6,6K/24, `somar dias` 3,6K/25 —, que é a faixa que um site
 * de Authority Score 2 alcança, enquanto a cabeça do cluster trabalhista trava
 * três sites independentes em 26-58. Some-se que data é aritmética pura: não
 * há tabela anual para manter, e portanto não há como repetir o F64 (o motor
 * ficar em 2025 enquanto a copy dizia 2026).
 *
 * **Tudo roda em UTC, de propósito.** `new Date('2026-09-23')` é meia-noite
 * *UTC*, e ler `.getFullYear()` disso no Brasil (UTC-3) devolve o dia
 * anterior. É a mesma classe de bug que fez a calculadora de FGTS exibir uma
 * data no futuro e que obrigou a criação de `Utils.hojeISO` — aqui ela seria
 * pior, porque a data não é um rótulo, é o resultado. Todo acesso a
 * componentes de data usa os getters `getUTC*`, e toda data construída passa
 * por `Date.UTC`. Como UTC não tem horário de verão, a diferença entre duas
 * meia-noites é sempre múltiplo exato de 86.400.000 ms.
 *
 * **Dias úteis são segunda a sexta.** Feriados entram pelo parâmetro
 * `feriados` (lista ISO), que existe porque a F72 — calendário de feriados —
 * é quem vai ter o dado. O motor já desconta; o que falta é a lista. Enquanto
 * ela não existe, o resultado declara em aviso que feriados não foram
 * descontados, em vez de deixar quem calcula prazo achar que foram.
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'

const MS_DIA = 86_400_000

/** Limites de sanidade: fora disso o pedido é erro de digitação, não cálculo. */
const ANO_MIN = 1000
const ANO_MAX = 3000

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const

const MESES_NOME = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const

export type ModoCalculoData = 'diferenca' | 'somar' | 'subtrair'

export interface CalculoDatasParams {
  modo: ModoCalculoData
  /** Data base, ISO "AAAA-MM-DD". */
  dataInicial: string
  /** Só no modo `diferenca`. ISO "AAAA-MM-DD". */
  dataFinal?: string
  /** Modos `somar`/`subtrair`. */
  dias?: number
  meses?: number
  anos?: number
  /**
   * `diferenca`: destaca os dias úteis como resultado principal.
   * `somar`/`subtrair`: conta **apenas dias úteis** ao deslocar a data — é o
   * cálculo de prazo (o dia 5 útil não é o dia 5 corrido).
   */
  apenasDiasUteis?: boolean
  /**
   * Conta o próprio dia inicial. Desligado por padrão, porque "de 1º a 2 de
   * janeiro" é 1 dia para quase todo mundo; ligado, é o jeito que prazo e
   * diária contam ("a partir de hoje, incluindo hoje").
   */
  incluirDataInicial?: boolean
  /**
   * Feriados em ISO "AAAA-MM-DD" a descontar dos dias úteis (F72). Fora da
   * lista, o motor considera só sábado e domingo.
   */
  feriados?: string[]
}

export interface CalculoDatasResultado {
  modo: ModoCalculoData
  /** ISO "AAAA-MM-DD" das duas pontas, já na ordem cronológica. */
  dataInicial: string
  dataFinal: string
  diaSemanaInicial: string
  diaSemanaFinal: string
  /** `true` quando a data final informada era anterior à inicial e foi trocada. */
  invertido: boolean
  diasCorridos: number
  diasUteis: number
  diasFimDeSemana: number
  /** Feriados que caíram em dia útil dentro do intervalo (0 sem a lista da F72). */
  feriadosEmDiaUtil: number
  /** Decomposição de calendário: X anos, Y meses e Z dias. */
  anos: number
  meses: number
  dias: number
  /** Meses inteiros no intervalo (o mesmo que `anos * 12 + meses`). */
  totalMeses: number
  totalSemanas: number
  diasRestantesSemana: number
  totalHoras: number
  totalMinutos: number
  incluiDataInicial: boolean
}

/* -------------------------------------------------------------------------
 * Primitivas de data — todas em UTC (ver o cabeçalho do arquivo)
 * ---------------------------------------------------------------------- */

/** "AAAA-MM-DD" → timestamp UTC da meia-noite. `null` se a data não existe. */
function parseIso(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  if (ano < ANO_MIN || ano > ANO_MAX || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null

  const ts = Date.UTC(ano, mes - 1, dia)
  const d = new Date(ts)
  // Rejeita 31/02 e afins, que o `Date.UTC` normalizaria em silêncio para 03/03.
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    return null
  }
  return ts
}

/** Timestamp UTC → "AAAA-MM-DD". */
function paraIso(ts: number): string {
  const d = new Date(ts)
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(d.getUTCDate()).padStart(2, '0')
  return `${d.getUTCFullYear()}-${mes}-${dia}`
}

/** Dias no mês (mês 1-12). */
function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate()
}

/** 0 = domingo … 6 = sábado. */
function diaDaSemana(ts: number): number {
  return new Date(ts).getUTCDay()
}

function ehFimDeSemana(ts: number): boolean {
  const d = diaDaSemana(ts)
  return d === 0 || d === 6
}

/**
 * Soma `n` meses preservando o dia, com **clamp no fim do mês**: 31/01 + 1 mês
 * é 28/02 (ou 29/02 em bissexto), não 03/03. É a convenção de todo calendário
 * e de toda folha de pagamento — e é a mesma primitiva usada para decompor o
 * intervalo em anos/meses/dias, o que garante que somar e medir concordem.
 */
function somarMeses(ts: number, n: number): number {
  const d = new Date(ts)
  const ano = d.getUTCFullYear()
  const mes = d.getUTCMonth()
  const dia = d.getUTCDate()

  const totalMeses = mes + n
  const anoAlvo = ano + Math.floor(totalMeses / 12)
  const mesAlvo = ((totalMeses % 12) + 12) % 12

  return Date.UTC(anoAlvo, mesAlvo, Math.min(dia, diasNoMes(anoAlvo, mesAlvo + 1)))
}

function somarDias(ts: number, n: number): number {
  return ts + n * MS_DIA
}

/** Dias corridos entre duas meia-noites UTC (fim − início). */
function diasEntre(inicio: number, fim: number): number {
  return Math.round((fim - inicio) / MS_DIA)
}

/**
 * Dias de segunda a sexta no intervalo **fechado** [inicio, fim].
 *
 * Sem laço sobre o intervalo: semanas inteiras rendem 5 dias úteis cada e só o
 * resto (no máximo 6 dias) é percorrido. Um intervalo de 50 anos custa o mesmo
 * que um de 3 dias. O teste compara este resultado com uma contagem ingênua
 * dia a dia justamente para travar a aritmética.
 */
function diasUteisNoIntervalo(inicio: number, fim: number): number {
  if (fim < inicio) return 0
  const total = diasEntre(inicio, fim) + 1
  const semanas = Math.floor(total / 7)
  let uteis = semanas * 5

  const resto = total % 7
  const primeiroDoResto = diaDaSemana(somarDias(inicio, semanas * 7))
  for (let i = 0; i < resto; i++) {
    const dow = (primeiroDoResto + i) % 7
    if (dow !== 0 && dow !== 6) uteis++
  }
  return uteis
}

/** Feriados da lista que caem em dia útil dentro do intervalo fechado. */
function feriadosEmDiaUtilNoIntervalo(
  inicio: number,
  fim: number,
  feriados: readonly string[],
): number {
  if (fim < inicio) return 0
  let total = 0
  const vistos = new Set<number>()
  for (const iso of feriados) {
    const ts = parseIso(iso)
    if (ts === null || ts < inicio || ts > fim || ehFimDeSemana(ts)) continue
    if (vistos.has(ts)) continue
    vistos.add(ts)
    total++
  }
  return total
}

/**
 * Desloca a data em `n` dias **úteis** (positivo ou negativo), pulando fins de
 * semana e feriados. É o cálculo de prazo: o 5º dia útil a partir de uma
 * sexta-feira é a sexta seguinte, não a quarta.
 */
function somarDiasUteis(ts: number, n: number, feriados: ReadonlySet<number>): number {
  const passo = n >= 0 ? 1 : -1
  let restantes = Math.abs(n)
  let atual = ts
  while (restantes > 0) {
    atual = somarDias(atual, passo)
    if (!ehFimDeSemana(atual) && !feriados.has(atual)) restantes--
  }
  return atual
}

/* -------------------------------------------------------------------------
 * Formatação (pt-BR, sem depender de ICU)
 *
 * Tabelas literais em vez de `toLocaleDateString('pt-BR')` porque o core roda
 * também fora do browser — Node sem ICU completo, Apps Script, Tauri — e ali
 * o locale silenciosamente vira inglês. O resultado é texto para o usuário:
 * "Wednesday" num site brasileiro é bug, não detalhe.
 * ---------------------------------------------------------------------- */

/** Nome do dia da semana de um timestamp UTC. */
function nomeDiaSemana(ts: number): string {
  return DIAS_SEMANA[diaDaSemana(ts)] ?? ''
}

/** "23/09/2026". */
export function formatarDataBR(iso: string): string {
  const ts = parseIso(iso)
  if (ts === null) return iso
  const d = new Date(ts)
  const dia = String(d.getUTCDate()).padStart(2, '0')
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${d.getUTCFullYear()}`
}

/** "quarta-feira, 23 de setembro de 2026". */
export function formatarDataExtenso(iso: string): string {
  const ts = parseIso(iso)
  if (ts === null) return iso
  const d = new Date(ts)
  const mes = MESES_NOME[d.getUTCMonth()] ?? ''
  return `${nomeDiaSemana(ts)}, ${d.getUTCDate()} de ${mes} de ${d.getUTCFullYear()}`
}

function plural(n: number, singular: string, plural_: string): string {
  return `${n.toLocaleString('pt-BR')} ${n === 1 ? singular : plural_}`
}

/** "8 meses e 22 dias", "1 ano, 2 meses e 3 dias", "22 dias". */
function descreverDuracao(anos: number, meses: number, dias: number): string {
  const partes: string[] = []
  if (anos > 0) partes.push(plural(anos, 'ano', 'anos'))
  if (meses > 0) partes.push(plural(meses, 'mês', 'meses'))
  if (dias > 0 || partes.length === 0) partes.push(plural(dias, 'dia', 'dias'))
  const ultima = partes[partes.length - 1] ?? ''
  if (partes.length === 1) return ultima
  return `${partes.slice(0, -1).join(', ')} e ${ultima}`
}

/* -------------------------------------------------------------------------
 * Cálculo
 * ---------------------------------------------------------------------- */

function validar(params: CalculoDatasParams): ErroValidacao[] {
  const erros: ErroValidacao[] = []

  if (parseIso(params.dataInicial ?? '') === null) {
    erros.push({ campo: 'dataInicial', mensagem: 'Informe uma data inicial válida (DD/MM/AAAA)' })
  }

  if (params.modo === 'diferenca') {
    if (parseIso(params.dataFinal ?? '') === null) {
      erros.push({ campo: 'dataFinal', mensagem: 'Informe uma data final válida (DD/MM/AAAA)' })
    }
  } else {
    const limites: Array<[keyof CalculoDatasParams, number, string]> = [
      ['dias', 36_500, 'dias'],
      ['meses', 12_000, 'meses'],
      ['anos', 1_000, 'anos'],
    ]
    for (const [campo, teto, nome] of limites) {
      const valor = params[campo] as number | undefined
      if (valor === undefined) continue
      if (!Number.isFinite(valor) || !Number.isInteger(valor)) {
        erros.push({ campo: String(campo), mensagem: `Informe um número inteiro de ${nome}` })
      } else if (Math.abs(valor) > teto) {
        erros.push({
          campo: String(campo),
          mensagem: `Máximo de ${teto.toLocaleString('pt-BR')} ${nome}`,
        })
      }
    }
    // Os três zerados, não a soma zerada: `dias: 30, meses: -30` é um pedido
    // legítimo que uma checagem de soma recusaria.
    const nenhumaQuantidade =
      (params.dias ?? 0) === 0 && (params.meses ?? 0) === 0 && (params.anos ?? 0) === 0
    if (erros.length === 0 && nenhumaQuantidade) {
      erros.push({
        campo: 'dias',
        mensagem: 'Informe quantos dias, meses ou anos somar ou subtrair',
      })
    }
  }

  return erros
}

export function calcularDatas(
  params: CalculoDatasParams,
): ResultadoOuErro<CalculoDatasResultado> {
  const erros = validar(params)
  if (erros.length > 0) return { sucesso: false, erros }

  const base = parseIso(params.dataInicial) as number
  // Só faz sentido medindo um intervalo. Ao deslocar uma data, "somar 30 dias"
  // tem de reportar 30 — e o campo fica escondido no formulário nesse modo,
  // mas o valor escolhido antes continua no estado, então quem decide é aqui.
  const incluiDataInicial = params.modo === 'diferenca' && params.incluirDataInicial === true
  const apenasDiasUteis = params.apenasDiasUteis === true
  const listaFeriados = params.feriados ?? []

  let inicio = base
  let fim: number
  let invertido = false

  if (params.modo === 'diferenca') {
    fim = parseIso(params.dataFinal as string) as number
    if (fim < inicio) {
      // Trocar as pontas é mais útil que recusar: quem inverteu quer o mesmo
      // número. O aviso diz que a troca aconteceu, para o resultado não
      // parecer que a ordem digitada foi respeitada.
      ;[inicio, fim] = [fim, inicio]
      invertido = true
    }
  } else {
    const sinal = params.modo === 'subtrair' ? -1 : 1
    const anos = (params.anos ?? 0) * sinal
    const meses = (params.meses ?? 0) * sinal
    const dias = (params.dias ?? 0) * sinal

    // Ordem: anos e meses primeiro (com clamp de fim de mês), dias depois.
    // Inverter a ordem muda o resultado em fins de mês — 31/01 + 1 mês + 1 dia
    // é 01/03, enquanto 31/01 + 1 dia + 1 mês é 01/03 também, mas 31/01 + 1 mês
    // − 1 dia é 27/02 e 31/01 − 1 dia + 1 mês é 28/02. É a convenção de
    // calendário, e está documentada no MDX.
    let destino = somarMeses(base, anos * 12 + meses)
    if (dias !== 0) {
      destino = apenasDiasUteis
        ? somarDiasUteis(
            destino,
            dias,
            new Set(
              listaFeriados
                .map((f) => parseIso(f))
                .filter((t): t is number => t !== null),
            ),
          )
        : somarDias(destino, dias)
    }

    const anoDestino = new Date(destino).getUTCFullYear()
    if (anoDestino < ANO_MIN || anoDestino > ANO_MAX) {
      return {
        sucesso: false,
        erros: [
          {
            campo: 'anos',
            mensagem: `A data resultante sai do intervalo suportado (${ANO_MIN} a ${ANO_MAX})`,
          },
        ],
      }
    }

    if (destino < base) {
      inicio = destino
      fim = base
    } else {
      inicio = base
      fim = destino
    }
  }

  // Intervalo de contagem. Sem `incluirDataInicial`, o dia inicial fica de
  // fora — "de 1º a 2 de janeiro" é 1 dia. Com ele, o intervalo é fechado dos
  // dois lados, que é como prazo e diária contam.
  const inicioContagem = incluiDataInicial ? inicio : somarDias(inicio, 1)
  const diasCorridos = diasEntre(inicio, fim) + (incluiDataInicial ? 1 : 0)
  const diasUteisBrutos = diasUteisNoIntervalo(inicioContagem, fim)
  const feriadosEmDiaUtil = feriadosEmDiaUtilNoIntervalo(inicioContagem, fim, listaFeriados)
  const diasUteis = diasUteisBrutos - feriadosEmDiaUtil
  const diasFimDeSemana = diasCorridos - diasUteisBrutos

  // Decomposição em anos/meses/dias pela mesma primitiva do modo "somar":
  // avança o máximo de meses que ainda não ultrapassa o fim e mede o resto em
  // dias. Contar componente a componente (ano − ano, mês − mês) produz resto
  // negativo em fim de mês — 31/01 → 01/03 daria "1 mês e −2 dias".
  let totalMeses = Math.max(
    0,
    (new Date(fim).getUTCFullYear() - new Date(inicio).getUTCFullYear()) * 12 +
      (new Date(fim).getUTCMonth() - new Date(inicio).getUTCMonth()),
  )
  if (somarMeses(inicio, totalMeses) > fim) totalMeses--
  const restoDias = diasEntre(somarMeses(inicio, totalMeses), fim)

  const anos = Math.floor(totalMeses / 12)
  const meses = totalMeses % 12
  const totalSemanas = Math.floor(diasCorridos / 7)
  const diasRestantesSemana = diasCorridos % 7

  const dadosResultado: CalculoDatasResultado = {
    modo: params.modo,
    dataInicial: paraIso(inicio),
    dataFinal: paraIso(fim),
    diaSemanaInicial: nomeDiaSemana(inicio),
    diaSemanaFinal: nomeDiaSemana(fim),
    invertido,
    diasCorridos,
    diasUteis,
    diasFimDeSemana,
    feriadosEmDiaUtil,
    anos,
    meses,
    dias: restoDias,
    totalMeses,
    totalSemanas,
    diasRestantesSemana,
    totalHoras: diasCorridos * 24,
    totalMinutos: diasCorridos * 24 * 60,
    incluiDataInicial,
  }

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: 'Data inicial',
      valor: 0,
      tipo: 'neutro',
      valorTexto: formatarDataExtenso(dadosResultado.dataInicial),
    },
    {
      descricao: 'Data final',
      valor: 0,
      tipo: 'neutro',
      valorTexto: formatarDataExtenso(dadosResultado.dataFinal),
    },
    {
      descricao: 'Dias corridos',
      valor: diasCorridos,
      tipo: 'neutro',
      valorTexto: plural(diasCorridos, 'dia', 'dias'),
    },
    {
      descricao: 'Dias úteis (segunda a sexta)',
      valor: diasUteis,
      tipo: 'neutro',
      valorTexto: plural(diasUteis, 'dia', 'dias'),
    },
    {
      descricao: 'Sábados e domingos',
      valor: diasFimDeSemana,
      tipo: 'neutro',
      valorTexto: plural(diasFimDeSemana, 'dia', 'dias'),
    },
    ...(feriadosEmDiaUtil > 0
      ? [
          {
            descricao: 'Feriados em dia útil',
            valor: feriadosEmDiaUtil,
            tipo: 'neutro' as const,
            valorTexto: plural(feriadosEmDiaUtil, 'dia', 'dias'),
          },
        ]
      : []),
    {
      descricao: 'Em anos, meses e dias',
      valor: totalMeses,
      tipo: 'neutro',
      valorTexto: descreverDuracao(anos, meses, restoDias),
    },
    {
      descricao: 'Em meses',
      valor: totalMeses,
      tipo: 'neutro',
      valorTexto:
        restoDias > 0
          ? `${plural(totalMeses, 'mês', 'meses')} e ${plural(restoDias, 'dia', 'dias')}`
          : plural(totalMeses, 'mês', 'meses'),
    },
    {
      descricao: 'Em semanas',
      valor: totalSemanas,
      tipo: 'neutro',
      valorTexto:
        diasRestantesSemana > 0
          ? `${plural(totalSemanas, 'semana', 'semanas')} e ${plural(diasRestantesSemana, 'dia', 'dias')}`
          : plural(totalSemanas, 'semana', 'semanas'),
    },
    {
      descricao: 'Em horas',
      valor: dadosResultado.totalHoras,
      tipo: 'neutro',
      valorTexto: plural(dadosResultado.totalHoras, 'hora', 'horas'),
    },
  ]

  const avisos: string[] = []
  if (invertido) {
    avisos.push(
      'A data final informada era anterior à inicial — as duas foram trocadas para contar o intervalo.',
    )
  }
  if (listaFeriados.length === 0) {
    avisos.push(
      'Os dias úteis consideram apenas segunda a sexta: feriados nacionais, estaduais e municipais não são descontados.',
    )
  }
  if (!incluiDataInicial) {
    avisos.push(
      'O dia inicial não entra na contagem. Para prazos que contam "a partir de hoje, incluindo hoje", marque a opção de incluir o dia inicial.',
    )
  }

  const ehDeslocamento = params.modo !== 'diferenca'
  const rotulo = ehDeslocamento
    ? 'Data final'
    : apenasDiasUteis
      ? 'Dias úteis entre as datas'
      : 'Dias corridos entre as datas'
  const valorPrincipal = ehDeslocamento ? diasCorridos : apenasDiasUteis ? diasUteis : diasCorridos
  const textoPrincipal = ehDeslocamento
    ? formatarDataExtenso(dadosResultado.dataFinal)
    : plural(valorPrincipal, 'dia', 'dias')

  return {
    sucesso: true,
    dados: {
      resultado: valorPrincipal,
      rotuloResultado: rotulo,
      resultadoTexto: textoPrincipal,
      detalhamento,
      avisos,
      baseCalculo: ehDeslocamento
        ? // A menção a dias úteis só entra quando houve deslocamento em dias:
          // com `dias: 0` e `meses: 3`, nenhuma lógica de dia útil rodou.
          `Calendário gregoriano — anos e meses aplicados antes dos dias, com ajuste para o último dia do mês${apenasDiasUteis && (params.dias ?? 0) !== 0 ? '; deslocamento contado em dias úteis' : ''}`
        : 'Calendário gregoriano — diferença entre duas datas em dias corridos, dias úteis, meses e semanas',
      // Não há base legal nem tabela: esta é a primeira calculadora do site
      // que não depende de legislação. Strings vazias escondem o selo "Base
      // legal" e o rótulo "Tabelas" em vez de inventar uma fonte.
      fonteJuridica: '',
      dataReferencia: '',
      dados: dadosResultado,
    },
  }
}
