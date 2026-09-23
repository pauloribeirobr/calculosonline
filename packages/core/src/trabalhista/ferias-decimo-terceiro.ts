/**
 * Férias + 13º salário na mesma conta (F69).
 *
 * **Por que existe uma função só para somar duas que já existem.** É a
 * intenção *combinada* — "vou tirar férias e receber o 13º, quanto entra no
 * total" —, e ela não é atendida por calculadora de item único: a pessoa teria
 * de abrir duas páginas, anotar dois resultados e somar à mão, sem saber se
 * pode somar. O dado que motivou (Semrush 21/09, Diário 22/09 parte 9): o
 * concorrente que tem essa página ocupa **posição 1-3** numa família de ~18
 * keywords de KD 11-24, a menor dificuldade medida em qualquer análise deste
 * projeto.
 *
 * **Aqui a soma é legítima, e isso precisa ficar explícito** — o F58 e o post
 * agregado do F60 existem justamente porque somar rescisão + 13º + férias +
 * FGTS **não** é legítimo (a rescisão já embute três deles). Férias e 13º são
 * pagamentos independentes, em datas diferentes, sem dupla contagem.
 *
 * **O que esta função NÃO inclui, de propósito: o salário do mês.** Quem tira
 * férias recebe o salário daquele mês menor, porque os dias de férias já
 * foram pagos adiantados no recibo (F65). Somar o salário cheio aqui daria um
 * total que ninguém recebe — a mesma armadilha do F58, de outro jeito.
 *
 * Base legal: CLT arts. 129-145 (férias), Lei 4.090/1962 e Lei 4.749/1965
 * (13º, incluindo o §2º do art. 2º, que permite adiantar a 1ª parcela junto
 * das férias quando requerido em janeiro).
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { arredondar } from '../utils'
import { calcularFerias } from './ferias'
import { calcularDecimoTerceiro } from './decimo-terceiro'

export interface FeriasDecimoTerceiroParams {
  salarioBruto: number
  /** Faltas injustificadas no período aquisitivo — reduzem os dias de férias. */
  diasFaltas?: number
  /** Dias de férias vendidos (abono pecuniário, até 1/3). */
  diasAbono?: number
  /** Dependentes para o IRRF — vale para as duas contas. */
  numeroDependentes?: number
  /** Mês de admissão (1-12) se admitido no ano corrente; `null` se já estava antes. */
  mesAdmissao: number | null
  /**
   * Adianta a 1ª parcela do 13º junto do recibo de férias (Lei 4.749/1965,
   * art. 2º, §2º). Não muda o total do ano — muda **quando** o dinheiro cai,
   * que é metade da pergunta que esta página responde.
   */
  adiantarPrimeiraParcela?: boolean
}

export interface FeriasDecimoTerceiroResultado {
  /** Líquido do recibo de férias (já com INSS e IRRF das férias). */
  feriasLiquido: number
  feriasBruto: number
  diasGozados: number
  diasAbono: number
  /** 13º bruto proporcional aos meses de direito. */
  decimoBruto: number
  mesesDireito: number
  /** 50% do 13º bruto, sem descontos (Lei 4.749/1965, art. 2º). */
  primeiraParcela: number
  /** O que sobra na 2ª parcela depois de INSS e IRRF do 13º integral. */
  segundaParcela: number
  decimoLiquido: number
  /** Soma dos descontos das duas contas — elas são tributadas em separado. */
  totalINSS: number
  totalIRRF: number
  /** Férias líquidas + 13º líquido. Não inclui o salário do mês. */
  totalLiquido: number
  /** O que cai junto do recibo de férias (com a 1ª parcela, se adiantada). */
  recebeComAsFerias: number
  adiantouPrimeiraParcela: boolean
}

export function calcularFeriasDecimoTerceiro(
  params: FeriasDecimoTerceiroParams,
): ResultadoOuErro<FeriasDecimoTerceiroResultado> {
  const numeroDependentes = params.numeroDependentes ?? 0

  const ferias = calcularFerias({
    salarioBruto: params.salarioBruto,
    diasFaltas: params.diasFaltas ?? 0,
    diasAbono: params.diasAbono ?? 0,
    numeroDependentes,
  })
  if (!ferias.sucesso) return { sucesso: false, erros: ferias.erros }

  const decimo = calcularDecimoTerceiro({
    salarioBruto: params.salarioBruto,
    mesAdmissao: params.mesAdmissao,
    numeroDependentesIRRF: numeroDependentes,
    parcela: 'total',
  })
  if (!decimo.sucesso) {
    // Os dois erros do mesmo campo (salário) já teriam saído acima; o que chega
    // aqui é específico do 13º, como mês de admissão fora de 1-12.
    const erros: ErroValidacao[] = decimo.erros
    return { sucesso: false, erros }
  }

  const f = ferias.dados.dados
  const d = decimo.dados.dados

  const primeiraParcela = arredondar(d.valorBruto / 2)
  const segundaParcela = arredondar(d.valorLiquido - primeiraParcela)
  const totalLiquido = arredondar(f.totalLiquido + d.valorLiquido)
  const adiantou = params.adiantarPrimeiraParcela === true
  const recebeComAsFerias = arredondar(f.totalLiquido + (adiantou ? primeiraParcela : 0))

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: `Férias (${f.diasGozados} dias + 1/3${f.diasAbono > 0 ? ` e ${f.diasAbono} vendidos` : ''})`,
      valor: f.totalBruto,
      tipo: 'credito',
    },
    { descricao: 'INSS e IRRF sobre as férias', valor: arredondar(f.descontoINSS + f.descontoIRRF), tipo: 'debito' },
    { descricao: 'Recibo de férias, líquido', valor: f.totalLiquido, tipo: 'credito' },
    {
      descricao: `13º proporcional (${d.mesesDireito}/12)`,
      valor: d.valorBruto,
      tipo: 'credito',
    },
    {
      descricao: adiantou
        ? '1ª parcela do 13º (50%, sem descontos, junto das férias)'
        : '1ª parcela do 13º (50%, sem descontos)',
      valor: primeiraParcela,
      tipo: 'credito',
    },
    {
      descricao: 'INSS e IRRF sobre o 13º (cobrados na 2ª parcela)',
      valor: arredondar(d.descontoINSS + d.descontoIRRF),
      tipo: 'debito',
    },
    { descricao: '2ª parcela do 13º', valor: segundaParcela, tipo: 'credito' },
    { descricao: 'Total líquido (férias + 13º)', valor: totalLiquido, tipo: 'credito' },
  ]

  const avisos = [
    // A armadilha desta página. O F58 nasceu do erro oposto — somar o que já
    // estava contido —, e aqui o risco é a pessoa achar que o total inclui o
    // contracheque do mês.
    'O total acima é férias + 13º e NÃO inclui o salário do mês: quem sai de férias recebe o salário daquele mês menor, porque os dias de férias já foram pagos adiantados no recibo.',
    'As duas contas são tributadas em separado, cada uma com sua própria tabela — é por isso que o INSS e o IRRF aparecem em linhas diferentes e não podem ser somados numa base só.',
    ...(adiantou
      ? [
          'A 1ª parcela do 13º só pode ser paga junto das férias se você pediu por escrito em janeiro (Lei 4.749/1965, art. 2º, §2º).',
        ]
      : []),
    ...(f.diasAbono > 0
      ? [
          'Os dias vendidos (abono) são isentos de INSS e IRRF, e continuam sendo trabalhados — entram como salário na folha do mês.',
        ]
      : []),
  ]

  return {
    sucesso: true,
    dados: {
      resultado: totalLiquido,
      rotuloResultado: 'Total líquido (férias + 13º)',
      detalhamento,
      avisos,
      baseCalculo: 'Férias + 1/3 líquidas + 13º proporcional líquido, tributados em separado',
      fonteJuridica:
        'CLT arts. 129–145 | CF/88 art. 7º, XVII | Lei 4.090/1962 | Lei 4.749/1965 | Lei 15.270/2025',
      dataReferencia: ferias.dados.dataReferencia,
      dados: {
        feriasLiquido: f.totalLiquido,
        feriasBruto: f.totalBruto,
        diasGozados: f.diasGozados,
        diasAbono: f.diasAbono,
        decimoBruto: d.valorBruto,
        mesesDireito: d.mesesDireito,
        primeiraParcela,
        segundaParcela,
        decimoLiquido: d.valorLiquido,
        totalINSS: arredondar(f.descontoINSS + d.descontoINSS),
        totalIRRF: arredondar(f.descontoIRRF + d.descontoIRRF),
        totalLiquido,
        recebeComAsFerias,
        adiantouPrimeiraParcela: adiantou,
      },
    },
  }
}
