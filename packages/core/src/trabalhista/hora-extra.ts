/**
 * Cálculo de horas extras.
 *
 * Base legal:
 *  - CLT art. 59: jornada máxima 8h/dia, 44h/semana, máx. 2h extras/dia
 *  - CLT art. 59 §1º: adicional mínimo de 50% em dias úteis
 *  - CF/88 art. 7º, XVI: adicional de 100% em domingos e feriados
 *  - CLT art. 73: adicional noturno de 20% (22h–5h)
 *  - CLT art. 73 §1º: hora noturna reduzida — 52min30s valem 1 hora
 *  - Lei 605/49 art. 7º "a" + Súmula 172 do TST: horas extras habituais
 *    refletem no descanso semanal remunerado (DSR)
 *  - CCT/ACT pode definir adicional maior — sempre prevalece o mais favorável
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export type TipoHoraExtra = 'util' | 'domingo' | 'feriado' | 'noturna'
export type TipoJornada = '44h' | '40h' | '36h' | '30h' | 'personalizada'

/** Reflexo das horas extras no descanso semanal remunerado. */
export interface DsrParams {
  /** Dias úteis do mês (a base sobre a qual as horas extras se diluem). */
  diasUteis: number
  /** Domingos + feriados do mês (os dias de repouso a remunerar). */
  diasDescanso: number
}

export interface HoraExtraParams {
  salarioBruto: number
  /** Jornada contratual mensal — string conhecida ou número (em horas) */
  jornadaMensalHoras: TipoJornada | number
  quantidadeHoras: number
  /**
   * Minutos além das horas cheias (0–59). "1h30 de hora extra" é
   * `quantidadeHoras: 1` + `quantidadeMinutos: 30`.
   *
   * Existe porque ninguém tem "1,5 hora extra" no cartão de ponto — tem
   * "1h30". Obrigar a conversão mental para decimal é o atrito que os
   * concorrentes que rankeiam já removeram.
   */
  quantidadeMinutos?: number
  tipoHora: TipoHoraExtra
  /** Adicional negociado em CCT/ACT — ex.: 0.6 = 60% (sobrepõe o mínimo legal) */
  adicionalNegociado?: number
  /** Reflexo do DSR. Omitir = não calcular (o padrão histórico). */
  dsr?: DsrParams
  /**
   * Aplica a hora noturna reduzida (52min30s = 1h). Só faz sentido em
   * `tipoHora: 'noturna'`; ignorado nos demais.
   *
   * Fica opcional porque depende do que o usuário tem em mãos: quem lê o
   * cartão de ponto informa horas de relógio (e quer a redução aplicada);
   * quem lê o holerite já recebe horas noturnas convertidas.
   */
  horaNoturnaReduzida?: boolean
}

export interface HoraExtraResultado {
  valorTotal: number
  valorPorHora: number
  valorHoraNormal: number
  jornadaMensal: number
  adicionalAplicado: number
  /** Horas extras em decimal, já somados os minutos e a redução noturna. */
  horasTotais: number
  /** 0.2 quando `tipoHora` é noturna, 0 nos demais. */
  adicionalNoturnoAplicado: number
  /** Reflexo no DSR. 0 quando não solicitado. */
  valorDsr: number
  /** `valorTotal + valorDsr`. É este o número apresentado como resultado. */
  valorTotalComDsr: number
}

const JORNADAS: Record<Exclude<TipoJornada, 'personalizada'>, number> = {
  '44h': 220,
  '40h': 200,
  '36h': 180,
  '30h': 150,
}

const ADICIONAIS_MINIMOS: Record<TipoHoraExtra, number> = {
  util: 0.5,
  domingo: 1.0,
  feriado: 1.0,
  noturna: 0.5,
}

const TIPO_LABEL: Record<TipoHoraExtra, string> = {
  util: 'dia útil (50%)',
  domingo: 'domingo (100%)',
  feriado: 'feriado (100%)',
  noturna: 'noturna (50%+)',
}

/** CLT art. 73: adicional noturno de 20% sobre a hora diurna. */
const ADICIONAL_NOTURNO = 0.2

/** CLT art. 73 §1º: a hora noturna dura 52min30s, não 60min. */
const MINUTOS_HORA_NOTURNA = 52.5

export function calcularHoraExtra(
  params: HoraExtraParams,
): ResultadoOuErro<HoraExtraResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)

  const minutos = params.quantidadeMinutos ?? 0
  if (!Number.isFinite(minutos) || minutos < 0 || minutos >= 60) {
    erros.push({
      campo: 'quantidadeMinutos',
      mensagem: 'Minutos devem estar entre 0 e 59',
    })
  }

  // Horas e minutos são validados juntos: "0h" é válido desde que haja
  // minutos, e vice-versa. O que não pode é o total ser zero.
  const horas = Number.isFinite(params.quantidadeHoras) ? params.quantidadeHoras : 0
  const horasInformadas = horas + (Number.isFinite(minutos) ? minutos / 60 : 0)
  if (horas < 0 || horasInformadas <= 0) {
    erros.push({
      campo: 'quantidadeHoras',
      mensagem: 'Quantidade de horas deve ser maior que zero',
    })
  }

  if ((params.adicionalNegociado ?? 0) < 0) {
    erros.push({ campo: 'adicionalNegociado', mensagem: 'Adicional negociado não pode ser negativo' })
  }

  if (params.dsr) {
    if (!Number.isFinite(params.dsr.diasUteis) || params.dsr.diasUteis <= 0) {
      erros.push({ campo: 'diasUteis', mensagem: 'Dias úteis devem ser maiores que zero' })
    }
    if (!Number.isFinite(params.dsr.diasDescanso) || params.dsr.diasDescanso < 0) {
      erros.push({
        campo: 'diasDescanso',
        mensagem: 'Domingos e feriados não podem ser negativos',
      })
    }
  }

  // Resolve jornada mensal
  let jornadaMensal: number
  if (typeof params.jornadaMensalHoras === 'number') {
    jornadaMensal = params.jornadaMensalHoras
  } else if (params.jornadaMensalHoras === 'personalizada') {
    erros.push({
      campo: 'jornadaMensalHoras',
      mensagem: 'Jornada personalizada exige passar o número de horas',
    })
    jornadaMensal = 0
  } else {
    jornadaMensal = JORNADAS[params.jornadaMensalHoras]
  }
  if (!Number.isFinite(jornadaMensal) || jornadaMensal <= 0) {
    if (typeof params.jornadaMensalHoras === 'number') {
      erros.push({ campo: 'jornadaMensalHoras', mensagem: 'Jornada mensal inválida' })
    }
  }

  if (erros.length > 0) return { sucesso: false, erros }

  const valorHoraNormal = params.salarioBruto / jornadaMensal

  const ehNoturna = params.tipoHora === 'noturna'
  const adicionalNoturnoAplicado = ehNoturna ? ADICIONAL_NOTURNO : 0

  // Hora noturna reduzida: 52min30s de relógio já valem 1 hora de pagamento,
  // então cada hora cheia trabalhada rende 60/52,5 ≈ 1,1429 hora paga.
  const fatorHoraReduzida =
    ehNoturna && params.horaNoturnaReduzida ? 60 / MINUTOS_HORA_NOTURNA : 1
  const horasTotais = arredondar(horasInformadas * fatorHoraReduzida)

  const adicionalMinimo = ADICIONAIS_MINIMOS[params.tipoHora]
  const adicionalAplicado = Math.max(adicionalMinimo, params.adicionalNegociado ?? 0)

  // O adicional noturno incide sobre a hora normal e a hora extra incide sobre
  // essa base já adicionada — por isso os fatores se multiplicam (1,2 × 1,5 =
  // 1,8) em vez de somar. Até 2026-08-27 o adicional noturno simplesmente não
  // era aplicado: o código cobrava 1,5× enquanto o conteúdo editorial da
  // página afirmava 1,8×, e o conteúdo é que estava certo.
  const valorPorHora = arredondar(
    valorHoraNormal * (1 + adicionalNoturnoAplicado) * (1 + adicionalAplicado),
  )
  const valorTotal = arredondar(valorPorHora * horasTotais)

  // DSR (Lei 605/49 art. 7º "a", Súmula 172 do TST): as horas extras do mês se
  // diluem pelos dias úteis e essa média é paga também nos dias de repouso.
  const valorDsr = params.dsr
    ? arredondar((valorTotal / params.dsr.diasUteis) * params.dsr.diasDescanso)
    : 0
  const valorTotalComDsr = arredondar(valorTotal + valorDsr)

  const rotuloQuantidade =
    minutos > 0 ? `${horas}h${String(minutos).padStart(2, '0')}` : `${horas}h`

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Salário Bruto', valor: params.salarioBruto, tipo: 'neutro' },
    {
      descricao: 'Jornada Mensal',
      valor: jornadaMensal,
      tipo: 'neutro',
      formula: `${jornadaMensal}h/mês`,
    },
    {
      descricao: 'Valor da Hora Normal',
      valor: arredondar(valorHoraNormal),
      tipo: 'neutro',
      formula: `${formatarBRL(params.salarioBruto)} ÷ ${jornadaMensal}h`,
    },
  ]

  if (adicionalNoturnoAplicado > 0) {
    detalhamento.push({
      descricao: 'Adicional Noturno (CLT art. 73)',
      valor: arredondar(adicionalNoturnoAplicado * 100),
      tipo: 'credito',
      formula: `${(adicionalNoturnoAplicado * 100).toFixed(0)}% sobre a hora diurna`,
    })
  }

  detalhamento.push(
    {
      descricao: `Adicional (${TIPO_LABEL[params.tipoHora]})`,
      valor: arredondar(adicionalAplicado * 100),
      tipo: 'credito',
      formula: `${(adicionalAplicado * 100).toFixed(0)}%`,
    },
    {
      descricao: 'Valor da Hora Extra',
      valor: valorPorHora,
      tipo: 'credito',
      formula:
        adicionalNoturnoAplicado > 0
          ? `${formatarBRL(arredondar(valorHoraNormal))} × ${(1 + adicionalNoturnoAplicado).toFixed(2)} × ${(1 + adicionalAplicado).toFixed(2)}`
          : `${formatarBRL(arredondar(valorHoraNormal))} × ${(1 + adicionalAplicado).toFixed(2)}`,
    },
  )

  if (fatorHoraReduzida > 1) {
    detalhamento.push({
      descricao: 'Hora Noturna Reduzida (CLT art. 73 §1º)',
      valor: horasTotais,
      tipo: 'neutro',
      formula: `${rotuloQuantidade} de relógio ÷ 52min30s = ${horasTotais}h pagas`,
    })
  }

  detalhamento.push({
    descricao: `Total (${rotuloQuantidade})`,
    valor: valorTotal,
    tipo: 'credito',
    formula: `${formatarBRL(valorPorHora)} × ${horasTotais}h`,
  })

  if (params.dsr) {
    detalhamento.push({
      descricao: 'Reflexo no DSR (Súmula 172 do TST)',
      valor: valorDsr,
      tipo: 'credito',
      formula: `${formatarBRL(valorTotal)} ÷ ${params.dsr.diasUteis} dias úteis × ${params.dsr.diasDescanso} de descanso`,
    })
    detalhamento.push({
      descricao: 'Total com DSR',
      valor: valorTotalComDsr,
      tipo: 'credito',
      formula: `${formatarBRL(valorTotal)} + ${formatarBRL(valorDsr)}`,
    })
  }

  return {
    sucesso: true,
    dados: {
      resultado: valorTotalComDsr,
      detalhamento,
      baseCalculo:
        '(Salário ÷ Jornada Mensal) × (1 + Adicional Noturno) × (1 + Adicional) × Horas Extras + DSR',
      fonteJuridica: 'CLT arts. 59 e 73 | CF/88 art. 7º, XVI | Súmula 172 do TST',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        valorTotal,
        valorPorHora,
        valorHoraNormal: arredondar(valorHoraNormal),
        jornadaMensal,
        adicionalAplicado,
        horasTotais,
        adicionalNoturnoAplicado,
        valorDsr,
        valorTotalComDsr,
      },
    },
  }
}
