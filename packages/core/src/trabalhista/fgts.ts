/**
 * Cálculo do Fundo de Garantia por Tempo de Serviço (FGTS).
 *
 * Base legal:
 *  - Lei 8.036/1990: depósito de 8% sobre a remuneração mensal
 *  - Lei 8.036/1990 art. 18: multa rescisória (40% sem justa causa, 20% acordo)
 *  - Lei 13.932/2019: saque-aniversário (tabela progressiva)
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar, formatarBRL, validarSalario } from '../utils'

/**
 * Vigência das regras aplicadas.
 *
 * O FGTS **não tem tabela anual** como INSS e IRRF — os 8% são da Lei
 * 8.036/1990 e as multas do art. 18 da mesma lei (mais o art. 484-A da CLT,
 * de 2017). A única tabela de verdade é a do saque-aniversário, e é dela que
 * sai esta data: a Lei 13.932/2019 passou a vigorar em 01/01/2020.
 *
 * Era `new Date()` antes, o que fazia o rótulo "Tabelas:" mudar todo dia e
 * afirmar que as regras tinham sido atualizadas hoje — quando a última mudança
 * é de 2020.
 */
const VIGENCIA_REGRAS_FGTS = '2020-01-01'

export type ModalidadeFGTS = 'rescisao' | 'saque_aniversario' | 'contribuicao_mensal'

export interface FGTSParams {
  salarioBruto: number
  mesesTrabalhados: number
  modalidade: ModalidadeFGTS
  /** Saldo atual do FGTS (necessário para rescisão e saque-aniversário) */
  saldoAtual?: number
  /** Para saque-aniversário: mês de aniversário (1-12) — apenas informativo */
  mesAniversario?: number
}

export interface FGTSResultado {
  depositoMensal: number
  depositosNoPeriodo: number
  saldoProjetado: number
  multaRescisoria40: number
  multaRescisoria20: number
  saqueAniversarioValor?: number
  saqueAniversarioAliquota?: number
}

/**
 * Tabela do saque-aniversário (Lei 13.932/2019, anexo único).
 * Estrutura: até `ate` reais, aplica `aliquota` somada de `parcela` adicional.
 */
const TABELA_SAQUE_ANIVERSARIO: Array<{
  ate: number | null
  aliquota: number
  parcela: number
}> = [
  { ate: 500, aliquota: 0.5, parcela: 0 },
  { ate: 1000, aliquota: 0.4, parcela: 50 },
  { ate: 5000, aliquota: 0.3, parcela: 150 },
  { ate: 10000, aliquota: 0.2, parcela: 650 },
  { ate: 15000, aliquota: 0.15, parcela: 1150 },
  { ate: 20000, aliquota: 0.1, parcela: 1900 },
  { ate: null, aliquota: 0.05, parcela: 2900 },
]

export function calcularFGTS(params: FGTSParams): ResultadoOuErro<FGTSResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.mesesTrabalhados < 0 || !Number.isFinite(params.mesesTrabalhados)) {
    erros.push({
      campo: 'mesesTrabalhados',
      mensagem: 'Meses trabalhados não pode ser negativo',
    })
  }
  if ((params.saldoAtual ?? 0) < 0) {
    erros.push({ campo: 'saldoAtual', mensagem: 'Saldo atual não pode ser negativo' })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const depositoMensal = arredondar(params.salarioBruto * 0.08)
  const depositosNoPeriodo = arredondar(depositoMensal * params.mesesTrabalhados)
  const saldoAtual = params.saldoAtual ?? 0
  const saldoProjetado = arredondar(saldoAtual + depositosNoPeriodo)

  const multaRescisoria40 = arredondar(saldoProjetado * 0.4)
  const multaRescisoria20 = arredondar(saldoProjetado * 0.2)

  let saqueAniversarioValor: number | undefined
  let saqueAniversarioAliquota: number | undefined

  if (params.modalidade === 'saque_aniversario' && saldoAtual > 0) {
    const faixa = TABELA_SAQUE_ANIVERSARIO.find(
      (f) => saldoAtual <= (f.ate ?? Number.POSITIVE_INFINITY),
    )
    if (faixa) {
      saqueAniversarioAliquota = faixa.aliquota
      saqueAniversarioValor = arredondar(saldoAtual * faixa.aliquota + faixa.parcela)
    }
  }

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: 'Depósito Mensal (8%)',
      valor: depositoMensal,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} × 8%`,
    },
    {
      descricao: `Depósitos em ${params.mesesTrabalhados} ${
        params.mesesTrabalhados === 1 ? 'mês' : 'meses'
      }`,
      valor: depositosNoPeriodo,
      tipo: 'credito',
    },
    {
      // Era só "Saldo Projetado", e "projetado" prometia uma projeção que não
      // acontece: o número é `saldo atual + depósitos`, sem o rendimento de
      // TR + 3% a.a. do art. 13 da Lei 8.036/1990. Com saldo atual zerado ele
      // ficava idêntico à linha de cima, o que parecia erro de cálculo.
      descricao: 'Saldo acumulado (sem rendimento)',
      valor: saldoProjetado,
      tipo: 'credito',
      // `exactOptionalPropertyTypes` no tsconfig: a chave tem de sumir, não
      // receber `undefined`.
      ...(saldoAtual > 0
        ? { formula: `${formatarBRL(saldoAtual)} + ${formatarBRL(depositosNoPeriodo)}` }
        : {}),
    },
    { descricao: 'Multa Rescisória 40% (sem justa causa)', valor: multaRescisoria40, tipo: 'neutro' },
    { descricao: 'Multa Rescisória 20% (acordo mútuo)', valor: multaRescisoria20, tipo: 'neutro' },
    ...(saqueAniversarioValor !== undefined && saqueAniversarioAliquota !== undefined
      ? [
          {
            descricao: `Saque-Aniversário (${(saqueAniversarioAliquota * 100).toFixed(0)}%)`,
            valor: saqueAniversarioValor,
            tipo: 'credito' as const,
            formula: `${formatarBRL(saldoAtual)} × ${(saqueAniversarioAliquota * 100).toFixed(0)}% + parcela`,
          },
        ]
      : []),
  ]

  /*
   * O headline segue a modalidade escolhida.
   *
   * Era `depositoMensal` sempre — o único headline do projeto que não
   * respondia à pergunta do formulário: quem preenchia 24 meses via um número
   * grande de um mês só, e o campo `mesesTrabalhados` não mexia nele. Nas
   * outras 19 calculadoras o headline é o resultado do período (montante
   * final, total líquido, salário líquido).
   *
   * A modalidade também deixa de ser decorativa: antes ela só decidia se o
   * saque-aniversário era calculado.
   */
  const { resultado, rotuloResultado } = ((): {
    resultado: number
    rotuloResultado: string
  } => {
    if (params.modalidade === 'rescisao') {
      return {
        // A leitura mais buscada é a da demissão sem justa causa; a de acordo
        // mútuo fica na linha de 20% do detalhamento, logo abaixo.
        resultado: arredondar(saldoProjetado + multaRescisoria40),
        rotuloResultado: 'A receber na rescisão sem justa causa (saldo + multa de 40%)',
      }
    }
    if (params.modalidade === 'saque_aniversario' && saqueAniversarioValor !== undefined) {
      return {
        resultado: saqueAniversarioValor,
        rotuloResultado: 'Saque-aniversário sobre o saldo atual',
      }
    }
    return {
      resultado: saldoProjetado,
      rotuloResultado:
        params.mesesTrabalhados > 0
          ? `Saldo acumulado em ${params.mesesTrabalhados} ${
              params.mesesTrabalhados === 1 ? 'mês' : 'meses'
            }`
          : 'Saldo acumulado',
    }
  })()

  const avisos: string[] = [
    'A projeção soma apenas os depósitos de 8%. O FGTS ainda rende TR + 3% ao ano (art. 13 da Lei 8.036/1990), além da distribuição de resultados — o saldo real tende a ser maior.',
  ]
  if (params.modalidade === 'saque_aniversario' && saldoAtual === 0) {
    avisos.push(
      'Informe o saldo atual do FGTS para calcular o saque-aniversário: ele incide sobre o saldo já depositado, não sobre a projeção.',
    )
  }

  return {
    sucesso: true,
    dados: {
      resultado,
      rotuloResultado,
      avisos,
      detalhamento,
      baseCalculo: '8% sobre salário bruto por competência (não incide sobre INSS/IRRF)',
      fonteJuridica: 'Lei 8.036/1990 | Lei 13.932/2019 (Saque-Aniversário)',
      dataReferencia: VIGENCIA_REGRAS_FGTS,
      dados: {
        depositoMensal,
        depositosNoPeriodo,
        saldoProjetado,
        multaRescisoria40,
        multaRescisoria20,
        ...(saqueAniversarioValor !== undefined ? { saqueAniversarioValor } : {}),
        ...(saqueAniversarioAliquota !== undefined ? { saqueAniversarioAliquota } : {}),
      },
    },
  }
}
