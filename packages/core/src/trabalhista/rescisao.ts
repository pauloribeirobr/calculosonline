/**
 * Cálculo de rescisão de contrato CLT.
 *
 * Base legal:
 *  - CLT arts. 477–487
 *  - Lei 12.506/2011: aviso prévio proporcional (3 dias por ano, máx. 90 dias)
 *  - Lei 8.036/1990 art. 18: multa rescisória do FGTS
 *  - CLT art. 484-A: rescisão por acordo mútuo (multa 20%, aviso 15 dias)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import {
  calcularINSSProgressivo,
  calcularIRRFMensal,
  getTabelasVigentes,
} from '../tabelas'
import {
  anosCompletos,
  arredondar,
  diasNoMes,
  formatarBRL,
  mesesEntre,
  validarSalario,
} from '../utils'

export type MotivoRescisao =
  | 'sem_justa_causa'
  | 'com_justa_causa_emp'
  | 'justa_causa'
  | 'pedido_demissao'
  | 'acordo_mutuo'
  | 'aposentadoria'

export interface RescisaoParams {
  salarioBruto: number
  /** Data de admissão no formato ISO "AAAA-MM-DD" */
  dataAdmissao: string
  /** Data de rescisão no formato ISO "AAAA-MM-DD" */
  dataRescisao: string
  motivoRescisao: MotivoRescisao
  /** Saldo do FGTS para cálculo da multa */
  saldoFGTS: number
  /** Dias trabalhados no mês de rescisão (default: dia da rescisão) */
  diasTrabalhados?: number
  /** Períodos de férias completos vencidos e não gozados (0, 1 ou 2) */
  feriasVencidas?: number
  numeroDependentesIRRF?: number
  /** true = aviso trabalhado | false = aviso indenizado */
  avisoPrevisTrabalhado?: boolean
}

export interface RescisaoResultado {
  saldoSalario: number
  avisoPrevio: number
  feriasVencidas: number
  feriasProporcionais: number
  decimoTerceiroProporcional: number
  multaFGTS: number
  totalBruto: number
  descontoINSS: number
  descontoIRRF: number
  totalLiquido: number
  diasAvisoPrevio: number
  mesesTrabalhados: number
  avisoPrevioIndenizado: boolean
  percentualMultaFGTS: number
}

function calcularDiasAvisoPrevio(anos: number, motivo: MotivoRescisao): number {
  if (motivo === 'justa_causa' || motivo === 'pedido_demissao') return 0
  if (motivo === 'acordo_mutuo') return 15
  return Math.min(90, 30 + anos * 3)
}

function percentualMultaFGTS(motivo: MotivoRescisao): number {
  if (
    motivo === 'sem_justa_causa' ||
    motivo === 'aposentadoria' ||
    motivo === 'com_justa_causa_emp'
  ) {
    return 0.4
  }
  if (motivo === 'acordo_mutuo') return 0.2
  return 0
}

export function calcularRescisao(params: RescisaoParams): ResultadoOuErro<RescisaoResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.saldoFGTS < 0 || !Number.isFinite(params.saldoFGTS)) {
    erros.push({ campo: 'saldoFGTS', mensagem: 'Saldo FGTS não pode ser negativo' })
  }
  if ((params.numeroDependentesIRRF ?? 0) < 0) {
    erros.push({
      campo: 'numeroDependentesIRRF',
      mensagem: 'Número de dependentes não pode ser negativo',
    })
  }

  const dataAdm = new Date(params.dataAdmissao + 'T12:00:00')
  const dataResc = new Date(params.dataRescisao + 'T12:00:00')

  if (Number.isNaN(dataAdm.getTime()) || Number.isNaN(dataResc.getTime())) {
    erros.push({ campo: 'dataRescisao', mensagem: 'Data inválida' })
  }
  if (dataResc <= dataAdm) {
    erros.push({
      campo: 'dataRescisao',
      mensagem: 'Data de rescisão deve ser posterior à admissão',
    })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const anos = anosCompletos(dataAdm, dataResc)
  const mesesTrabalhados = mesesEntre(dataAdm, dataResc)
  const mesRescisao = dataResc.getMonth() + 1
  const dataReferencia = getTabelasVigentes().vigenciaInicio

  // Saldo de salário — proporcional aos dias trabalhados no mês de rescisão
  const diasUltimoMes = params.diasTrabalhados ?? dataResc.getDate()
  const totalDiasUltimoMes = diasNoMes(dataResc)
  const saldoSalario = arredondar(
    (params.salarioBruto / totalDiasUltimoMes) * diasUltimoMes,
  )

  // Aviso prévio (dias e valor indenizado)
  const diasAvisoPrevio = calcularDiasAvisoPrevio(anos, params.motivoRescisao)
  const avisoPrevioIndenizado = !params.avisoPrevisTrabalhado && diasAvisoPrevio > 0
  const avisoPrevio = avisoPrevioIndenizado
    ? arredondar((params.salarioBruto / 30) * diasAvisoPrevio)
    : 0

  // Quando indenizado, o aviso projeta tempo adicional para férias e 13º
  const mesesProjetados = avisoPrevioIndenizado
    ? mesesTrabalhados + Math.ceil(diasAvisoPrevio / 30)
    : mesesTrabalhados

  // Direito a verbas em rescisão por justa causa do empregado: nada além do saldo + férias vencidas
  const direitoVerbas = params.motivoRescisao !== 'justa_causa'

  // Férias vencidas (paga inclusive em justa causa, art. 146)
  const periodosVencidos = params.feriasVencidas ?? 0
  const feriasVencidasValor = arredondar(params.salarioBruto * periodosVencidos * (1 + 1 / 3))

  // Férias proporcionais: meses dentro do período aquisitivo atual.
  // Cada 12 meses completos zeram o ciclo — usamos o resto da divisão.
  const mesesProporcionaisFerias =
    mesesProjetados === 0 ? 0 : mesesProjetados % 12 || 12
  const feriasProporcionais = direitoVerbas
    ? arredondar((params.salarioBruto / 12) * mesesProporcionaisFerias * (1 + 1 / 3))
    : 0

  // 13º proporcional: meses trabalhados no ano corrente
  const meses13 = avisoPrevioIndenizado
    ? Math.min(12, mesRescisao + Math.ceil(diasAvisoPrevio / 30))
    : mesRescisao
  const decimoTerceiro = direitoVerbas ? arredondar((params.salarioBruto / 12) * meses13) : 0

  // Multa FGTS
  const percentualMulta = percentualMultaFGTS(params.motivoRescisao)
  const multaFGTS = arredondar(params.saldoFGTS * percentualMulta)

  // Total bruto
  const totalBruto = arredondar(
    saldoSalario +
      avisoPrevio +
      feriasVencidasValor +
      feriasProporcionais +
      decimoTerceiro +
      multaFGTS,
  )

  // Descontos: INSS sobre saldo + 13º; IRRF sobre saldo + 13º (férias e indenizações isentas)
  const baseINSS = arredondar(saldoSalario + decimoTerceiro)
  const { valorINSS } = calcularINSSProgressivo(baseINSS)
  const { valorIRRF } = calcularIRRFMensal({
    salarioBruto: baseINSS,
    inss: valorINSS,
    numeroDependentes: params.numeroDependentesIRRF ?? 0,
  })

  const totalLiquido = arredondar(totalBruto - valorINSS - valorIRRF)

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: `Saldo de Salário (${diasUltimoMes} dias)`,
      valor: saldoSalario,
      tipo: 'credito',
    },
    ...(avisoPrevio > 0
      ? [
          {
            descricao: `Aviso Prévio Indenizado (${diasAvisoPrevio} dias)`,
            valor: avisoPrevio,
            tipo: 'credito' as const,
          },
        ]
      : []),
    ...(feriasVencidasValor > 0
      ? [
          {
            descricao: `Férias Vencidas + 1/3 (${periodosVencidos} período${periodosVencidos > 1 ? 's' : ''})`,
            valor: feriasVencidasValor,
            tipo: 'credito' as const,
          },
        ]
      : []),
    ...(feriasProporcionais > 0
      ? [
          {
            descricao: `Férias Proporcionais + 1/3 (${mesesProporcionaisFerias}/12)`,
            valor: feriasProporcionais,
            tipo: 'credito' as const,
          },
        ]
      : []),
    ...(decimoTerceiro > 0
      ? [
          {
            descricao: `13º Proporcional (${meses13}/12)`,
            valor: decimoTerceiro,
            tipo: 'credito' as const,
          },
        ]
      : []),
    ...(multaFGTS > 0
      ? [
          {
            descricao: `Multa FGTS ${(percentualMulta * 100).toFixed(0)}%`,
            valor: multaFGTS,
            tipo: 'credito' as const,
            formula: `${formatarBRL(params.saldoFGTS)} × ${(percentualMulta * 100).toFixed(0)}%`,
          },
        ]
      : []),
    { descricao: 'Total Bruto', valor: totalBruto, tipo: 'credito' },
    ...(valorINSS > 0
      ? [{ descricao: '(-) INSS', valor: valorINSS, tipo: 'debito' as const }]
      : []),
    ...(valorIRRF > 0
      ? [{ descricao: '(-) IRRF', valor: valorIRRF, tipo: 'debito' as const }]
      : []),
    { descricao: 'Total Líquido', valor: totalLiquido, tipo: 'credito' },
  ]

  return {
    sucesso: true,
    dados: {
      resultado: totalLiquido,
      detalhamento,
      baseCalculo: `Rescisão por ${params.motivoRescisao} | ${anos} anos completos, ${mesesTrabalhados} meses de serviço`,
      fonteJuridica: 'CLT arts. 477–487 | Lei 12.506/2011 | Lei 8.036/1990 art. 18',
      dataReferencia,
      dados: {
        saldoSalario,
        avisoPrevio,
        feriasVencidas: feriasVencidasValor,
        feriasProporcionais,
        decimoTerceiroProporcional: decimoTerceiro,
        multaFGTS,
        totalBruto,
        descontoINSS: valorINSS,
        descontoIRRF: valorIRRF,
        totalLiquido,
        diasAvisoPrevio,
        mesesTrabalhados,
        avisoPrevioIndenizado,
        percentualMultaFGTS: percentualMulta,
      },
    },
  }
}
