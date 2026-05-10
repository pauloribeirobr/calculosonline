/**
 * Cálculo de horas extras.
 *
 * Base legal:
 *  - CLT art. 59: jornada máxima 8h/dia, 44h/semana, máx. 2h extras/dia
 *  - CLT art. 59 §1º: adicional mínimo de 50% em dias úteis
 *  - CF/88 art. 7º, XVI: adicional de 100% em domingos e feriados
 *  - CCT/ACT pode definir adicional maior — sempre prevalece o mais favorável
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, formatarBRL, validarSalario } from '../utils'

export type TipoHoraExtra = 'util' | 'domingo' | 'feriado' | 'noturna'
export type TipoJornada = '44h' | '40h' | '36h' | '30h' | 'personalizada'

export interface HoraExtraParams {
  salarioBruto: number
  /** Jornada contratual mensal — string conhecida ou número (em horas) */
  jornadaMensalHoras: TipoJornada | number
  quantidadeHoras: number
  tipoHora: TipoHoraExtra
  /** Adicional negociado em CCT/ACT — ex.: 0.6 = 60% (sobrepõe o mínimo legal) */
  adicionalNegociado?: number
}

export interface HoraExtraResultado {
  valorTotal: number
  valorPorHora: number
  valorHoraNormal: number
  jornadaMensal: number
  adicionalAplicado: number
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

export function calcularHoraExtra(
  params: HoraExtraParams,
): ResultadoOuErro<HoraExtraResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (!Number.isFinite(params.quantidadeHoras) || params.quantidadeHoras <= 0) {
    erros.push({
      campo: 'quantidadeHoras',
      mensagem: 'Quantidade de horas deve ser maior que zero',
    })
  }
  if ((params.adicionalNegociado ?? 0) < 0) {
    erros.push({ campo: 'adicionalNegociado', mensagem: 'Adicional negociado não pode ser negativo' })
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

  const adicionalMinimo = ADICIONAIS_MINIMOS[params.tipoHora]
  const adicionalAplicado = Math.max(adicionalMinimo, params.adicionalNegociado ?? 0)

  const valorPorHora = arredondar(valorHoraNormal * (1 + adicionalAplicado))
  const valorTotal = arredondar(valorPorHora * params.quantidadeHoras)

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
      formula: `${formatarBRL(arredondar(valorHoraNormal))} × ${(1 + adicionalAplicado).toFixed(2)}`,
    },
    {
      descricao: `Total (${params.quantidadeHoras}h)`,
      valor: valorTotal,
      tipo: 'credito',
      formula: `${formatarBRL(valorPorHora)} × ${params.quantidadeHoras}h`,
    },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: valorTotal,
      detalhamento,
      baseCalculo: '(Salário ÷ Jornada Mensal) × (1 + Adicional) × Horas Extras',
      fonteJuridica: 'CLT art. 59 | CF/88 art. 7º, XVI',
      dataReferencia: new Date().toISOString().slice(0, 10),
      dados: {
        valorTotal,
        valorPorHora,
        valorHoraNormal: arredondar(valorHoraNormal),
        jornadaMensal,
        adicionalAplicado,
      },
    },
  }
}
