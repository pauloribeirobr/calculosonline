/**
 * Panorama trabalhista — encadeia rescisão, 13º, férias e FGTS a partir de um
 * único conjunto de dados (F58).
 *
 * **Por que isto existe.** O GSC mostra dezenas de queries de intenção
 * agregada (`calculo trabalhista completo`, `como calcular direitos
 * trabalhistas`) que nenhuma das calculadoras trabalhistas atende sozinha:
 * cada uma responde um pedaço, e a `/categoria/trabalhista` — que é só um
 * índice — teve 1 pageview em 3 meses. Quem busca isso não quer escolher uma
 * calculadora, quer o panorama.
 *
 * **A armadilha que este módulo existe para não cair: os quatro números não
 * se somam.** A rescisão já embute 13º proporcional, férias proporcionais e a
 * multa do FGTS. Somar os quatro blocos contaria a mesma verba de duas a três
 * vezes e entregaria um total inflado — exatamente o erro que um agregador
 * ingênuo cometeria. Por isso nenhum campo aqui é "total geral", o
 * `detalhamento` consolidado sai inteiro como `neutro` (não entra em soma
 * nenhuma na UI) e o motivo está declarado em `avisos`, que a página exibe.
 *
 * Os quatro blocos respondem perguntas **distintas**:
 *  - rescisão → o que entra na conta ao sair da empresa (líquido);
 *  - 13º → quanto vale o 13º cheio do ano, se ficasse até dezembro;
 *  - férias → quanto vale um período completo de 30 dias + 1/3;
 *  - FGTS → quanto deveria estar depositado no fundo ao fim do contrato.
 *
 * Base legal: a de cada função chamada — este módulo não inventa regra
 * nenhuma, só deriva os parâmetros de cada uma a partir de um input comum.
 */

import type { ItemDetalhamento, ResultadoOuErro } from '../types'
import { anosCompletos, arredondar, diasNoMes, formatarBRL } from '../utils'
import { calcularRescisao, type MotivoRescisao } from './rescisao'
import { calcularDecimoTerceiro } from './decimo-terceiro'
import { calcularFerias } from './ferias'
import { calcularFGTS } from './fgts'

export interface PanoramaTrabalhistaParams {
  salarioBruto: number
  /** Data de admissão no formato ISO "AAAA-MM-DD" */
  dataAdmissao: string
  /**
   * Data de saída (ou a data de hoje, para quem ainda está na empresa e quer
   * a projeção) no formato ISO "AAAA-MM-DD".
   */
  dataSaida: string
  motivoRescisao: MotivoRescisao
  /** Saldo atual do FGTS informado pelo usuário. 0 = não sabe/não informou. */
  saldoFGTS: number
  /** Períodos de férias completos vencidos e não gozados (0, 1 ou 2) */
  feriasVencidas?: number
  numeroDependentesIRRF?: number
  /** Faltas injustificadas no período aquisitivo — só afeta o bloco de férias. */
  diasFaltas?: number
}

export type IdBlocoPanorama = 'rescisao' | 'decimo-terceiro' | 'ferias' | 'fgts'

export interface BlocoPanorama {
  id: IdBlocoPanorama
  titulo: string
  /** Slug da calculadora dedicada — para onde o bloco aprofunda. */
  slugCalculadora: string
  /** O número que responde à pergunta do bloco. */
  valor: number
  /** O que esse número é, em uma linha — nunca "total". */
  legenda: string
  linhas: ItemDetalhamento[]
  fonteJuridica: string
}

export interface PanoramaTrabalhistaResultado {
  blocos: BlocoPanorama[]
  mesesTrabalhados: number
  anosCompletos: number
  /**
   * Total líquido da rescisão. É o único número do panorama que pode ser
   * chamado de "o que você recebe" — ver a nota sobre não somar os blocos.
   */
  totalRescisao: number
  /** Estimativa do FGTS depositado no contrato inteiro (8% × meses). */
  fgtsEsperado: number
  /**
   * `saldoFGTS` informado − `fgtsEsperado`. Negativo sugere depósito faltando.
   * `null` quando o usuário não informou saldo (comparação sem sentido).
   */
  diferencaFGTS: number | null
}

/**
 * Dias trabalhados no mês de admissão. Entra no 13º porque a Lei 4.090/1962
 * só conta o mês inteiro a partir de 15 dias trabalhados — o degrau que faz
 * um único dia de admissão valer 1/12 do salário.
 */
function diasNoMesDeAdmissao(dataAdmissao: Date): number {
  return diasNoMes(dataAdmissao) - dataAdmissao.getDate() + 1
}

export function calcularPanoramaTrabalhista(
  params: PanoramaTrabalhistaParams,
): ResultadoOuErro<PanoramaTrabalhistaResultado> {
  // A rescisão é o validador mais completo do conjunto (salário, saldo do
  // FGTS, dependentes e as duas datas, inclusive a ordem entre elas). Se ela
  // reprova o input, os outros três reprovariam pelos mesmos motivos ou
  // rodariam com data inconsistente — então ela é o portão de entrada.
  const rescisao = calcularRescisao({
    salarioBruto: params.salarioBruto,
    dataAdmissao: params.dataAdmissao,
    dataRescisao: params.dataSaida,
    motivoRescisao: params.motivoRescisao,
    saldoFGTS: params.saldoFGTS,
    ...(params.feriasVencidas !== undefined ? { feriasVencidas: params.feriasVencidas } : {}),
    ...(params.numeroDependentesIRRF !== undefined
      ? { numeroDependentesIRRF: params.numeroDependentesIRRF }
      : {}),
  })
  if (!rescisao.sucesso) return { sucesso: false, erros: rescisao.erros }

  const dataAdm = new Date(params.dataAdmissao + 'T12:00:00')
  const dataSaida = new Date(params.dataSaida + 'T12:00:00')
  const anos = anosCompletos(dataAdm, dataSaida)
  const mesesTrabalhados = rescisao.dados.dados.mesesTrabalhados
  const dependentes = params.numeroDependentesIRRF ?? 0

  // 13º **cheio do ano**, não o proporcional que a rescisão já pagou: a
  // pergunta do bloco é "quanto vale meu 13º se eu ficar até dezembro", que é
  // justamente o que sair no meio do ano custa. Só quem foi admitido no
  // próprio ano tem proporcional; quem já estava antes tem os 12 meses.
  const admitidoNoAnoDaSaida = dataAdm.getFullYear() === dataSaida.getFullYear()
  const decimoTerceiro = calcularDecimoTerceiro({
    salarioBruto: params.salarioBruto,
    mesAdmissao: admitidoNoAnoDaSaida ? dataAdm.getMonth() + 1 : null,
    diasTrabalhados: diasNoMesDeAdmissao(dataAdm),
    anoReferencia: dataSaida.getFullYear(),
    numeroDependentesIRRF: dependentes,
    parcela: 'total',
  })
  if (!decimoTerceiro.sucesso) return { sucesso: false, erros: decimoTerceiro.erros }

  // Um período completo (30 dias) + 1/3, sem abono: a pergunta é "quanto vale
  // uma férias minha", e não as proporcionais que já estão na rescisão.
  const ferias = calcularFerias({
    salarioBruto: params.salarioBruto,
    diasFaltas: params.diasFaltas ?? 0,
  })
  if (!ferias.sucesso) return { sucesso: false, erros: ferias.erros }

  // `saldoAtual: 0` de propósito. O saldo que o usuário informa **já contém**
  // os depósitos do contrato; passá-lo aqui somaria os mesmos 8% duas vezes e
  // inflaria o fundo. O que interessa neste bloco é a outra metade: quanto
  // deveria ter sido depositado, para comparar com o extrato.
  const fgts = calcularFGTS({
    salarioBruto: params.salarioBruto,
    mesesTrabalhados,
    modalidade: 'rescisao',
    saldoAtual: 0,
  })
  if (!fgts.sucesso) return { sucesso: false, erros: fgts.erros }

  const fgtsEsperado = fgts.dados.dados.depositosNoPeriodo
  const diferencaFGTS =
    params.saldoFGTS > 0 ? arredondar(params.saldoFGTS - fgtsEsperado) : null
  const percentualMulta = rescisao.dados.dados.percentualMultaFGTS

  const linhasFGTS: ItemDetalhamento[] = [
    {
      descricao: 'Depósito mensal (8% do salário)',
      valor: fgts.dados.dados.depositoMensal,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} × 8%`,
    },
    {
      descricao: `Depósitos estimados em ${mesesTrabalhados} ${
        mesesTrabalhados === 1 ? 'mês' : 'meses'
      } de contrato`,
      valor: fgtsEsperado,
      tipo: 'credito',
    },
    ...(diferencaFGTS !== null
      ? [
          {
            descricao: 'Saldo que você informou',
            valor: params.saldoFGTS,
            tipo: 'neutro' as const,
          },
          {
            descricao:
              diferencaFGTS < 0
                ? 'Informado a MENOS que o estimado — vale conferir o extrato'
                : 'Informado a mais que o estimado (rendimento e reajustes)',
            valor: Math.abs(diferencaFGTS),
            tipo: 'neutro' as const,
            formula: `${formatarBRL(params.saldoFGTS)} − ${formatarBRL(fgtsEsperado)}`,
          },
        ]
      : []),
    ...(percentualMulta > 0
      ? [
          {
            descricao: `Multa de ${(percentualMulta * 100).toFixed(0)}% sobre o saldo informado`,
            valor: rescisao.dados.dados.multaFGTS,
            tipo: 'neutro' as const,
            // Marcado `neutro` e com a nota explícita porque este dinheiro
            // **já está** no total líquido da rescisão. É referência cruzada,
            // não uma verba a mais.
            formula: 'já incluída no total da rescisão acima — não some de novo',
          },
        ]
      : []),
  ]

  const blocos: BlocoPanorama[] = [
    {
      id: 'rescisao',
      titulo: 'Rescisão',
      slugCalculadora: 'rescisao-trabalhista',
      valor: rescisao.dados.dados.totalLiquido,
      legenda: 'Total líquido do acerto, já com INSS e IRRF descontados',
      linhas: rescisao.dados.detalhamento,
      fonteJuridica: rescisao.dados.fonteJuridica,
    },
    {
      id: 'decimo-terceiro',
      titulo: '13º salário',
      slugCalculadora: 'decimo-terceiro',
      valor: decimoTerceiro.dados.dados.valorLiquido,
      legenda: admitidoNoAnoDaSaida
        ? `13º líquido do ano, proporcional aos ${decimoTerceiro.dados.dados.mesesDireito} meses de casa`
        : '13º líquido do ano cheio, se você ficar até dezembro',
      linhas: decimoTerceiro.dados.detalhamento,
      fonteJuridica: decimoTerceiro.dados.fonteJuridica,
    },
    {
      id: 'ferias',
      titulo: 'Férias',
      slugCalculadora: 'ferias',
      valor: ferias.dados.dados.totalBruto,
      legenda: `Um período completo de ${ferias.dados.dados.diasDireito} dias + 1/3, valor bruto`,
      linhas: ferias.dados.detalhamento,
      fonteJuridica: ferias.dados.fonteJuridica,
    },
    {
      id: 'fgts',
      titulo: 'FGTS',
      slugCalculadora: 'fgts',
      valor: fgtsEsperado,
      legenda: 'Estimativa do que deveria estar depositado no fundo ao fim do contrato',
      linhas: linhasFGTS,
      fonteJuridica: fgts.dados.fonteJuridica,
    },
  ]

  // Consolidado **inteiro** como `neutro`: a UI usa o sinal (+)/(−) só em
  // crédito/débito, então marcar tudo como neutro é o que impede a lista de
  // parecer uma soma. Ver a nota do topo do arquivo.
  const detalhamento: ItemDetalhamento[] = blocos.map((bloco) => ({
    descricao: `${bloco.titulo} — ${bloco.legenda}`,
    valor: bloco.valor,
    tipo: 'neutro',
  }))

  const avisos = [
    'Os quatro valores não se somam: a rescisão já inclui o 13º proporcional, as férias proporcionais e a multa do FGTS. Cada bloco responde a uma pergunta diferente.',
    'A estimativa do FGTS usa o salário atual em todos os meses do contrato e ignora o rendimento do fundo — serve para conferir a ordem de grandeza do extrato, não para substituí-lo.',
    ...(params.diasFaltas === undefined || params.diasFaltas === 0
      ? ['As férias foram calculadas sem faltas injustificadas no período aquisitivo.']
      : []),
  ]

  return {
    sucesso: true,
    dados: {
      resultado: rescisao.dados.dados.totalLiquido,
      detalhamento,
      baseCalculo: `${mesesTrabalhados} meses de contrato (${anos} ano${anos === 1 ? '' : 's'} completo${anos === 1 ? '' : 's'}), quatro cálculos a partir dos mesmos dados`,
      fonteJuridica:
        'CLT arts. 129–153 e 477–487 | Lei 4.090/1962 | Lei 4.749/1965 | Lei 8.036/1990 | Lei 12.506/2011',
      dataReferencia: rescisao.dados.dataReferencia,
      avisos,
      dados: {
        blocos,
        mesesTrabalhados,
        anosCompletos: anos,
        totalRescisao: rescisao.dados.dados.totalLiquido,
        fgtsEsperado,
        diferencaFGTS,
      },
    },
  }
}
