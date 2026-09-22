/**
 * Cálculo de férias.
 *
 * Base legal:
 *  - CLT arts. 129–153
 *  - CLT art. 130: dias por faltas no período aquisitivo
 *  - CF/88 art. 7º, XVII: terço constitucional
 *  - CLT art. 143: abono pecuniário (até 1/3 vendido)
 *  - CLT art. 137: férias em atraso pagas em dobro
 *  - Lei 8.212/1991 art. 28, §9º: abono pecuniário fora do salário de contribuição
 *  - Lei 15.270/2025: redutor do IRRF vigente em 2026
 *
 * **Descontos (F66).** Até 22/09/2026 esta função devolvia só o bruto, embora o
 * registry, a meta description e o `llms.txt` prometessem "descontos de INSS e
 * IRRF" — e "quanto vou receber de férias" seja sinônimo declarado da
 * calculadora. O recibo de férias tem três regras próprias, e é por isso que
 * reaproveitar `calcularSalarioLiquido` não serve:
 *
 *  1. **O IRRF das férias é calculado em separado** do salário do mês, sobre a
 *     própria remuneração de férias — não somado ao contracheque.
 *  2. **O abono pecuniário não entra na base** de nenhum dos dois (Lei
 *     8.212/1991, art. 28, §9º).
 *  3. **A dobra do art. 137 também não entra**: ela é indenização pelo atraso
 *     na concessão, não remuneração. Fica declarado em `avisos`, porque é o
 *     ponto em que sistemas de folha divergem.
 *
 * O INSS aqui é o do **recibo**: na folha do mês o cálculo é refeito sobre tudo
 * que pertence àquela competência (dias trabalhados + férias + terço) e o que
 * já foi retido é abatido. O total do mês não muda; a divisão entre os dois
 * pagamentos, sim. Está explicado em `/blog/salario-depois-das-ferias-por-que-vem-menor`
 * e sai como aviso no resultado.
 */

import type { ErroValidacao, ItemDetalhamento, ResultadoOuErro } from '../types'
import { calcularINSSProgressivo, calcularIRRFMensal } from '../tabelas'
import { arredondar, dividir, formatarBRL, hojeISO, validarSalario } from '../utils'

export interface FeriasParams {
  salarioBruto: number
  /** Faltas injustificadas no período aquisitivo */
  diasFaltas: number
  /** Dias convertidos em abono pecuniário (máx. 1/3 do direito) */
  diasAbono?: number
  /** Férias pagas em atraso → CLT art. 137 (dobro) */
  emAtraso?: boolean
  /** Dependentes para o IRRF do recibo de férias (tributação em separado). */
  numeroDependentes?: number
}

export interface FeriasResultado {
  diasDireito: number
  diasGozados: number
  diasAbono: number
  /** Salário proporcional aos dias gozados (sem 1/3) */
  salarioFerias: number
  /** Adicional de 1/3 sobre o salário de férias */
  adicionalTerco: number
  /** Valor do abono pecuniário (já com 1/3) */
  valorAbono: number
  /** Total bruto = salário + 1/3 + abono (× 2 se em atraso) */
  totalBruto: number
  /**
   * Base de INSS e IRRF: remuneração de férias gozadas + terço. Exclui o abono
   * pecuniário e a dobra do art. 137 (ver o cabeçalho do arquivo).
   */
  baseTributavel: number
  descontoINSS: number
  descontoIRRF: number
  /** Total bruto menos INSS e IRRF — o que cai na conta. */
  totalLiquido: number
  /** IRRF pela tabela progressiva, antes do redutor da Lei 15.270/2025. */
  irrfSemRedutor: number
  /** Redutor da Lei 15.270/2025 aplicado (R$). */
  redutorIRRF: number
  /** true quando o desconto simplificado venceu as deduções legais. */
  usouDescontoSimplificado: boolean
  perdeuDireito: boolean
}

/**
 * Tabela de redução de dias por faltas injustificadas (CLT art. 130).
 * >32 faltas → perde o direito ao período.
 */
function diasFeriasPorFaltas(faltas: number): number {
  if (faltas <= 5) return 30
  if (faltas <= 14) return 24
  if (faltas <= 23) return 18
  if (faltas <= 32) return 12
  return 0
}

export function calcularFerias(params: FeriasParams): ResultadoOuErro<FeriasResultado> {
  const erros: ErroValidacao[] = []
  const erroSalario = validarSalario(params.salarioBruto)
  if (erroSalario) erros.push(erroSalario)
  if (params.diasFaltas < 0 || params.diasFaltas > 365) {
    erros.push({ campo: 'diasFaltas', mensagem: 'Número de faltas inválido (0–365)' })
  }
  if ((params.diasAbono ?? 0) < 0) {
    erros.push({ campo: 'diasAbono', mensagem: 'Dias de abono não podem ser negativos' })
  }
  const numeroDependentes = params.numeroDependentes ?? 0
  if (numeroDependentes < 0 || !Number.isFinite(numeroDependentes)) {
    erros.push({
      campo: 'numeroDependentes',
      mensagem: 'Número de dependentes não pode ser negativo',
    })
  }
  if (erros.length > 0) return { sucesso: false, erros }

  const diasDireito = diasFeriasPorFaltas(params.diasFaltas)
  const dataReferencia = hojeISO()

  if (diasDireito === 0) {
    return {
      sucesso: true,
      dados: {
        resultado: 0,
        detalhamento: [
          {
            descricao: 'Perdeu o direito às férias',
            valor: 0,
            tipo: 'neutro',
            formula: `${params.diasFaltas} faltas > 32 — CLT art. 133`,
          },
        ],
        baseCalculo: 'Mais de 32 faltas injustificadas no período aquisitivo',
        fonteJuridica: 'CLT art. 133 | CLT arts. 129–130',
        dataReferencia,
        dados: {
          diasDireito: 0,
          diasGozados: 0,
          diasAbono: 0,
          salarioFerias: 0,
          adicionalTerco: 0,
          valorAbono: 0,
          totalBruto: 0,
          baseTributavel: 0,
          descontoINSS: 0,
          descontoIRRF: 0,
          totalLiquido: 0,
          irrfSemRedutor: 0,
          redutorIRRF: 0,
          usouDescontoSimplificado: false,
          perdeuDireito: true,
        },
      },
    }
  }

  const maxAbono = Math.floor(diasDireito / 3)
  const diasAbono = Math.min(params.diasAbono ?? 0, maxAbono)
  const diasGozados = diasDireito - diasAbono

  // `valorDiario` é arredondado só para APARECER na fórmula do detalhamento.
  // O cálculo usa a divisão exata e arredonda uma única vez, no fim.
  //
  // Até 2026-08-27 o valor diário arredondado entrava na multiplicação, e o
  // erro de centavos era multiplicado pelos dias: um salário de R$ 2.000 dava
  // R$ 2.000,10 de férias (66,67 × 30), e R$ 2.500 dava R$ 2.499,90. Some em
  // qualquer salário não divisível por 30. `decimo-terceiro.ts` e `rescisao.ts`
  // sempre fizeram certo (`arredondar((salario / 12) * meses)`) — férias era a
  // única do módulo trabalhista fora do padrão.
  const valorDiario = dividir(params.salarioBruto, 30)
  const salarioFerias = arredondar((params.salarioBruto / 30) * diasGozados)
  const adicionalTerco = arredondar(salarioFerias / 3)
  const valorAbono = arredondar((params.salarioBruto / 30) * diasAbono * (1 + 1 / 3))

  const subTotal = arredondar(salarioFerias + adicionalTerco + valorAbono)
  const totalBruto = params.emAtraso ? arredondar(subTotal * 2) : subTotal

  // Só a remuneração de férias gozadas + terço é tributável: o abono é isento
  // por lei e a dobra do art. 137 é indenização (ver cabeçalho).
  const baseTributavel = arredondar(salarioFerias + adicionalTerco)
  const { valorINSS: descontoINSS, detalhamento: detINSS } =
    calcularINSSProgressivo(baseTributavel)
  const {
    valorIRRF: descontoIRRF,
    baseCalculo: baseIRRF,
    aliquota,
    impostoApurado,
    redutor,
    usouDescontoSimplificado,
  } = calcularIRRFMensal({
    salarioBruto: baseTributavel,
    inss: descontoINSS,
    numeroDependentes,
  })
  const totalLiquido = arredondar(totalBruto - descontoINSS - descontoIRRF)

  const detalhamento: ItemDetalhamento[] = [
    {
      descricao: `Salário de Férias (${diasGozados} dias)`,
      valor: salarioFerias,
      tipo: 'credito',
      formula: `${formatarBRL(params.salarioBruto)} ÷ 30 × ${diasGozados}`,
    },
    {
      descricao: 'Adicional 1/3 Constitucional',
      valor: adicionalTerco,
      tipo: 'credito',
      formula: `${formatarBRL(salarioFerias)} ÷ 3`,
    },
    ...(diasAbono > 0
      ? [
          {
            descricao: `Abono Pecuniário (${diasAbono} dias + 1/3)`,
            valor: valorAbono,
            tipo: 'credito' as const,
            formula: `${formatarBRL(valorDiario)} × ${diasAbono} × 1,333`,
          },
        ]
      : []),
    ...(params.emAtraso
      ? [
          {
            descricao: 'Dobro — Férias em Atraso (CLT art. 137)',
            valor: subTotal,
            tipo: 'credito' as const,
          },
        ]
      : []),
    { descricao: 'Total Bruto', valor: totalBruto, tipo: 'credito' },
    ...detINSS.map<ItemDetalhamento>((d) => ({
      descricao: `INSS ${(d.aliquota * 100).toFixed(1)}% (${d.faixa})`,
      valor: d.valor,
      tipo: 'debito',
      formula: `${formatarBRL(d.base)} × ${(d.aliquota * 100).toFixed(1)}%`,
    })),
    ...(redutor > 0
      ? [
          {
            descricao: 'Redutor da Lei 15.270/2025',
            valor: redutor,
            tipo: 'credito' as const,
            formula:
              descontoIRRF === 0
                ? `Zera o IRRF de ${formatarBRL(impostoApurado)}`
                : `${formatarBRL(impostoApurado)} − ${formatarBRL(redutor)}`,
          },
        ]
      : []),
    {
      descricao: descontoIRRF === 0 && redutor > 0 ? 'IRRF (zerado pelo redutor)' : 'IRRF',
      valor: descontoIRRF,
      tipo: 'debito',
      formula:
        aliquota === 0
          ? `Base ${formatarBRL(baseIRRF)} — isento`
          : `Base ${formatarBRL(baseIRRF)} × ${(aliquota * 100).toFixed(1)}%`,
    },
    { descricao: 'Total Líquido', valor: totalLiquido, tipo: 'credito' },
  ]

  const avisos = [
    // O usuário confere o recibo contra o contracheque e acha que uma das duas
    // contas está errada. As duas estão certas — a base é que é diferente.
    'O INSS do mês é calculado sobre tudo o que pertence àquele mês: dias trabalhados, dias de férias e o terço. O recibo retém a parte das férias e a folha acerta o restante, então o valor do contracheque costuma sair diferente do de um mês comum.',
    'O IRRF das férias é calculado em separado do salário do mês, sobre a própria remuneração de férias.',
    ...(diasAbono > 0
      ? [
          'O abono pecuniário (dias vendidos) é isento de INSS e de IRRF — Lei 8.212/1991, art. 28, §9º —, e os dias vendidos continuam sendo trabalhados e pagos na folha do mês.',
        ]
      : []),
    ...(params.emAtraso
      ? [
          'A dobra do art. 137 entra sem INSS e sem IRRF: ela indeniza o atraso na concessão, não remunera trabalho. Sistemas de folha divergem neste ponto — confira o seu recibo.',
        ]
      : []),
  ]

  return {
    sucesso: true,
    dados: {
      resultado: totalLiquido,
      rotuloResultado: 'Total líquido das férias',
      detalhamento,
      avisos,
      baseCalculo: `Salário ÷ 30 × ${diasGozados} dias + 1/3${params.emAtraso ? ' (em dobro)' : ''}, menos INSS e IRRF`,
      fonteJuridica:
        'CLT arts. 129–137 | CF/88 art. 7º, XVII | Lei 8.212/1991 art. 28 | Lei 15.270/2025',
      dataReferencia,
      dados: {
        diasDireito,
        diasGozados,
        diasAbono,
        salarioFerias,
        adicionalTerco,
        valorAbono,
        totalBruto,
        baseTributavel,
        descontoINSS,
        descontoIRRF,
        totalLiquido,
        irrfSemRedutor: impostoApurado,
        redutorIRRF: redutor,
        usouDescontoSimplificado,
        perdeuDireito: false,
      },
    },
  }
}
