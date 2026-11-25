/**
 * Simulador do Tesouro Reserva (F83).
 *
 * Regras do produto, conferidas na fonte em 25/11/2026:
 *  - Rende 100% da Selic, todo dia útil a partir do dia útil seguinte à
 *    aplicação, sem marcação a mercado (B3 Educação,
 *    https://edu.b3.com.br/w/tesouro-reserva; Tesouro Nacional, notícia de
 *    lançamento de 11/05/2026).
 *  - Aplicação e resgate a partir de R$ 1; até R$ 500 mil por investidor ao mês;
 *    resgate sem limite, 24x7 (fora da janela de 0h a 1h), crédito por Pix.
 *  - Custódia B3 de 0,20% a.a., isenta até R$ 10.000 por CPF no Tesouro
 *    Reserva; acima disso, só sobre o excedente (B3 Educação; tarifas B3).
 *  - IR regressivo da Lei 11.033/2004 sobre o rendimento, e IOF regressivo
 *    nos resgates em até 30 dias (Decreto 6.306/2007, art. 32 e Anexo).
 *
 * Simplificações (as mesmas do Tesouro Selic do site): a Selic fica constante
 * no prazo e o ano tem 365 dias corridos (equivale a 252 dias úteis), então o
 * fator é (1 + Selic)^(dias/365); em meses, (1 + Selic)^(meses/12), que é o
 * que o Tesouro Selic do site usa e mantém os dois resultados iguais.
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, hojeISO } from '../utils'
import { ALIQUOTAS_IR_REGRESSIVO, diasDoPrazo, getPrazoIR, rotuloIR } from './cdb'
import { calcularPoupanca } from './poupanca'
import { REFERENCIAS_MERCADO } from './referencias'
import { LIMITE_ISENCAO_SELIC, TAXA_CUSTODIA_B3 } from './tesouro-direto'

export type UnidadePrazo = 'meses' | 'dias'

/**
 * IOF sobre o rendimento por dia corrido de aplicação, em % do rendimento.
 * Decreto 6.306/2007, Anexo (conferido no Planalto em 25/11/2026): 96% no
 * 1º dia, 0% a partir do 30º.
 */
export const TABELA_IOF_REGRESSIVO: readonly number[] = [
  96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20,
  16, 13, 10, 6, 3, 0,
]

/** Alíquota do IOF (0.96 = 96% do rendimento) para um resgate com `dias` de aplicação. */
export function aliquotaIOF(dias: number): number {
  if (dias < 1) return TABELA_IOF_REGRESSIVO[0]! / 100
  if (dias >= 30) return 0
  return TABELA_IOF_REGRESSIVO[dias - 1]! / 100
}

export interface TesouroReservaParams {
  valorInicial: number
  prazo: number
  unidade: UnidadePrazo
  /** Selic anual (default: `REFERENCIAS_MERCADO.selicAnual`) */
  selicAnual?: number
  /** CDI anual para a comparação com o CDB (default: `REFERENCIAS_MERCADO.cdiAnual`) */
  cdiAnual?: number
}

export interface TesouroReservaResultado {
  dias: number
  rendimentoBruto: number
  iof: number
  aliquotaIOF: number
  ir: number
  aliquotaIR: number
  custodia: number
  custodiaIsenta: boolean
  montanteLiquido: number
  rendimentoLiquido: number
  poupanca: number
  cdb100: number
}

interface Resgate {
  montanteBruto: number
  rendimentoBruto: number
  iof: number
  aliquotaIOF: number
  ir: number
  aliquotaIR: number
  prazoIR: ReturnType<typeof getPrazoIR>
  custodia: number
  montanteLiquido: number
}

/**
 * Resgate de renda fixa tributada (Tesouro Reserva ou CDB): rendimento
 * composto, IOF nos primeiros 30 dias, IR regressivo sobre o rendimento menos
 * o IOF (o IOF sai antes e reduz a base do IR) e custódia, quando houver.
 */
function resgatar(
  valor: number,
  taxaAnual: number,
  fracaoAno: number,
  dias: number,
  baseCustodia: number,
): Resgate {
  const montanteBruto = arredondar(valor * Math.pow(1 + taxaAnual, fracaoAno))
  const rendimentoBruto = arredondar(montanteBruto - valor)
  const aliqIOF = aliquotaIOF(dias)
  const iof = arredondar(rendimentoBruto * aliqIOF)
  const prazoIR = getPrazoIR(dias)
  const aliquotaIR = ALIQUOTAS_IR_REGRESSIVO[prazoIR]
  const ir = arredondar((rendimentoBruto - iof) * aliquotaIR)
  const custodia = arredondar(baseCustodia * TAXA_CUSTODIA_B3 * fracaoAno)
  const montanteLiquido = arredondar(valor + rendimentoBruto - iof - ir - custodia)
  return {
    montanteBruto,
    rendimentoBruto,
    iof,
    aliquotaIOF: aliqIOF,
    ir,
    aliquotaIR,
    prazoIR,
    custodia,
    montanteLiquido,
  }
}

/** Poupança no mesmo prazo: só rende a cada mês completo (aniversário). */
function poupancaNoPrazo(valor: number, mesesCompletos: number, selic: number): number {
  if (mesesCompletos < 1) return arredondar(valor)
  const r = calcularPoupanca({ valorInicial: valor, prazoMeses: mesesCompletos, selicAnual: selic })
  return r.sucesso ? r.dados.resultado : arredondar(valor)
}

const pct = (n: number, casas = 2) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })

const brl = (n: number) =>
  `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Acima disso, a tabela dia a dia fica longa demais para ler. */
const MAX_DIAS_TABELA = 60

export function calcularTesouroReserva(
  params: TesouroReservaParams,
): ResultadoOuErro<TesouroReservaResultado> {
  const erros: ErroValidacao[] = []
  if (!Number.isFinite(params.valorInicial) || params.valorInicial < 1) {
    erros.push({ campo: 'valorInicial', mensagem: 'O mínimo do Tesouro Reserva é R$ 1,00' })
  }
  if (!Number.isFinite(params.prazo) || params.prazo < 1 || !Number.isInteger(params.prazo)) {
    erros.push({ campo: 'prazo', mensagem: 'Prazo deve ser um número inteiro maior que zero' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const selic = params.selicAnual ?? REFERENCIAS_MERCADO.selicAnual
  const cdi = params.cdiAnual ?? REFERENCIAS_MERCADO.cdiAnual
  const emMeses = params.unidade === 'meses'
  const valor = params.valorInicial
  const baseCustodia = Math.max(0, valor - LIMITE_ISENCAO_SELIC)
  const custodiaIsenta = baseCustodia === 0

  // Prazo em meses ou em dias → dias corridos (faixa do IR e IOF), fração do
  // ano (juros e custódia) e meses completos (aniversário da poupança).
  const prazoEm = (n: number) => {
    const dias = emMeses ? diasDoPrazo(n) : n
    return {
      dias,
      fracaoAno: emMeses ? n / 12 : n / 365,
      mesesCompletos: emMeses ? n : Math.floor(dias / 30),
    }
  }

  const final = prazoEm(params.prazo)
  const reserva = resgatar(valor, selic, final.fracaoAno, final.dias, baseCustodia)
  const cdb = resgatar(valor, cdi, final.fracaoAno, final.dias, 0)
  const poupanca = poupancaNoPrazo(valor, final.mesesCompletos, selic)
  const rendimentoLiquido = arredondar(reserva.montanteLiquido - valor)

  // Tabela: em meses, um resgate por mês; em dias, um por dia (até 60), que é
  // onde se vê o IOF caindo e a poupança parada até o aniversário.
  const linhas: Array<Record<string, number>> = []
  const passos = emMeses || params.prazo <= MAX_DIAS_TABELA ? params.prazo : 0
  for (let n = 1; n <= passos; n++) {
    const p = prazoEm(n)
    const r = resgatar(valor, selic, p.fracaoAno, p.dias, baseCustodia)
    linhas.push({
      periodo: n,
      rendimentoBruto: r.rendimentoBruto,
      iof: r.iof,
      ir: r.ir,
      custodia: r.custodia,
      montanteLiquido: r.montanteLiquido,
      poupanca: poupancaNoPrazo(valor, p.mesesCompletos, selic),
    })
  }
  const temIOF = !emMeses && params.prazo < 30

  const rotuloPrazo = emMeses
    ? `${params.prazo} ${params.prazo === 1 ? 'mês' : 'meses'}`
    : `${params.prazo} ${params.prazo === 1 ? 'dia' : 'dias'}`

  const detalhamento: ItemDetalhamento[] = [
    { descricao: 'Valor aplicado', valor, tipo: 'neutro' },
    {
      descricao: `Rendimento bruto (100% da Selic de ${pct(selic * 100)}% a.a.)`,
      valor: reserva.rendimentoBruto,
      tipo: 'credito',
    },
  ]
  if (reserva.iof > 0) {
    detalhamento.push({
      descricao: `(-) IOF (${pct(reserva.aliquotaIOF * 100)}% do rendimento, resgate com ${final.dias} ${final.dias === 1 ? 'dia' : 'dias'})`,
      valor: reserva.iof,
      tipo: 'debito',
    })
  }
  detalhamento.push(
    { descricao: rotuloIR(reserva.aliquotaIR, reserva.prazoIR), valor: reserva.ir, tipo: 'debito' },
    {
      descricao: custodiaIsenta
        ? '(-) Custódia B3 (isenta até R$ 10.000)'
        : `(-) Custódia B3 (${pct(TAXA_CUSTODIA_B3 * 100)}% a.a. sobre o que passa de R$ 10.000)`,
      valor: reserva.custodia,
      tipo: 'debito',
    },
    { descricao: 'Valor líquido no resgate', valor: reserva.montanteLiquido, tipo: 'credito' },
    { descricao: 'Rendimento líquido', valor: rendimentoLiquido, tipo: 'credito' },
    {
      descricao:
        final.mesesCompletos < 1
          ? 'Poupança no mesmo prazo (não rende antes de completar 1 mês)'
          : `Poupança no mesmo prazo (${final.mesesCompletos} ${final.mesesCompletos === 1 ? 'mês completo' : 'meses completos'}, sem IR)`,
      valor: poupanca,
      tipo: 'neutro',
    },
    {
      descricao: `CDB de 100% do CDI no mesmo prazo (CDI de ${pct(cdi * 100)}% a.a., sem custódia)`,
      valor: cdb.montanteLiquido,
      tipo: 'neutro',
    },
  )

  return {
    sucesso: true,
    dados: {
      resultado: reserva.montanteLiquido,
      detalhamento,
      ...(linhas.length > 0
        ? {
            evolucao: {
              titulo: emMeses
                ? 'Evolução mês a mês (resgate em cada mês)'
                : 'Evolução dia a dia (resgate em cada dia)',
              colunas: [
                { chave: 'periodo', rotulo: emMeses ? 'Mês' : 'Dia', formato: 'integer' as const },
                { chave: 'rendimentoBruto', rotulo: 'Rendimento bruto' },
                ...(temIOF ? [{ chave: 'iof', rotulo: 'IOF' }] : []),
                { chave: 'ir', rotulo: 'IR no resgate' },
                ...(custodiaIsenta ? [] : [{ chave: 'custodia', rotulo: 'Custódia acumulada' }]),
                { chave: 'montanteLiquido', rotulo: 'Líquido no resgate' },
                { chave: 'poupanca', rotulo: 'Poupança' },
              ],
              linhas,
            },
          }
        : {}),
      baseCalculo: `${brl(valor)} por ${rotuloPrazo} a 100% da Selic (${pct(selic * 100)}% a.a., Banco Central em ${REFERENCIAS_MERCADO.dataConsulta.split('-').reverse().join('/')})`,
      fonteJuridica:
        'Lei 11.033/2004 (IR regressivo) | Decreto 6.306/2007 (IOF) | B3 (custódia do Tesouro Reserva)',
      dataReferencia: hojeISO(),
      dados: {
        dias: final.dias,
        rendimentoBruto: reserva.rendimentoBruto,
        iof: reserva.iof,
        aliquotaIOF: reserva.aliquotaIOF,
        ir: reserva.ir,
        aliquotaIR: reserva.aliquotaIR,
        custodia: reserva.custodia,
        custodiaIsenta,
        montanteLiquido: reserva.montanteLiquido,
        rendimentoLiquido,
        poupanca,
        cdb100: cdb.montanteLiquido,
      },
    },
  }
}
