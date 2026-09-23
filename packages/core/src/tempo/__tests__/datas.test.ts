import { describe, it, expect } from 'vitest'
import { calcularDatas, formatarDataBR, formatarDataExtenso } from '../datas'

/** Atalho: só os dados, falhando o teste se o cálculo tiver dado erro. */
function dados(r: ReturnType<typeof calcularDatas>) {
  if (!r.sucesso) throw new Error(`Esperava sucesso, veio: ${JSON.stringify(r.erros)}`)
  return r.dados.dados
}

/**
 * Contagem ingênua, dia a dia, de segunda a sexta no intervalo fechado.
 * Existe só para conferir a aritmética O(1) do motor — se as duas divergirem,
 * a rápida está errada.
 */
function diasUteisForcaBruta(inicioIso: string, fimIso: string): number {
  const inicio = Date.parse(`${inicioIso}T00:00:00Z`)
  const fim = Date.parse(`${fimIso}T00:00:00Z`)
  let total = 0
  for (let t = inicio; t <= fim; t += 86_400_000) {
    const dow = new Date(t).getUTCDay()
    if (dow !== 0 && dow !== 6) total++
  }
  return total
}

describe('calcularDatas — diferença entre datas', () => {
  it('conta os dias corridos entre duas datas sem incluir o dia inicial', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-01', dataFinal: '2026-09-23' }),
    )
    expect(d.diasCorridos).toBe(265)
    expect(d.dataInicial).toBe('2026-01-01')
    expect(d.dataFinal).toBe('2026-09-23')
  })

  it('inclui o dia inicial quando pedido (contagem de prazo)', () => {
    const semInicial = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-01', dataFinal: '2026-01-02' }),
    )
    const comInicial = dados(
      calcularDatas({
        modo: 'diferenca',
        dataInicial: '2026-01-01',
        dataFinal: '2026-01-02',
        incluirDataInicial: true,
      }),
    )
    expect(semInicial.diasCorridos).toBe(1)
    expect(comInicial.diasCorridos).toBe(2)
  })

  it('devolve zero dias quando as duas datas são iguais', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-03-10', dataFinal: '2026-03-10' }),
    )
    expect(d.diasCorridos).toBe(0)
    expect(d.diasUteis).toBe(0)
    expect(d.diasFimDeSemana).toBe(0)
  })

  it('troca as pontas quando a data final é anterior à inicial, e avisa', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-09-23',
      dataFinal: '2026-01-01',
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.dados.invertido).toBe(true)
    expect(r.dados.dados.diasCorridos).toBe(265)
    expect(r.dados.dados.dataInicial).toBe('2026-01-01')
    expect(r.dados.avisos?.some((a) => a.includes('trocadas'))).toBe(true)
  })

  /**
   * O invariante do F57 aplicado aqui: as linhas exibidas têm de somar o total
   * exibido. Se dias úteis e fins de semana não fecham os dias corridos, o
   * detalhamento está mentindo.
   */
  it('mantém dias úteis + fins de semana = dias corridos', () => {
    const casos: Array<[string, string]> = [
      ['2026-01-01', '2026-09-23'],
      ['2026-09-21', '2026-09-28'],
      ['2020-02-28', '2020-03-02'],
      ['2026-12-30', '2027-01-04'],
      ['1999-06-15', '2026-09-23'],
    ]
    for (const [inicio, fim] of casos) {
      const d = dados(calcularDatas({ modo: 'diferenca', dataInicial: inicio, dataFinal: fim }))
      expect(d.diasUteis + d.diasFimDeSemana).toBe(d.diasCorridos)
    }
  })

  it('conta dias úteis igual à varredura dia a dia', () => {
    const casos: Array<[string, string]> = [
      ['2026-01-01', '2026-09-23'],
      ['2026-09-21', '2026-09-25'],
      ['2026-09-26', '2026-09-27'],
      ['2024-01-01', '2024-12-31'],
      ['2026-02-27', '2026-03-03'],
    ]
    for (const [inicio, fim] of casos) {
      const d = dados(calcularDatas({ modo: 'diferenca', dataInicial: inicio, dataFinal: fim }))
      // O motor não conta o dia inicial por padrão, então a força bruta começa
      // no dia seguinte.
      const seguinte = new Date(Date.parse(`${inicio}T00:00:00Z`) + 86_400_000)
        .toISOString()
        .slice(0, 10)
      expect(d.diasUteis).toBe(diasUteisForcaBruta(seguinte, fim))
    }
  })

  it('desconta feriados que caem em dia útil, e ignora os que caem no fim de semana', () => {
    // 2026: 01/05 é sexta-feira (desconta); 07/09 é segunda (desconta).
    const comFeriados = dados(
      calcularDatas({
        modo: 'diferenca',
        dataInicial: '2026-04-30',
        dataFinal: '2026-09-23',
        feriados: ['2026-05-01', '2026-09-07'],
      }),
    )
    const semFeriados = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-04-30', dataFinal: '2026-09-23' }),
    )
    expect(comFeriados.feriadosEmDiaUtil).toBe(2)
    expect(comFeriados.diasUteis).toBe(semFeriados.diasUteis - 2)
  })

  it('decompõe o intervalo em anos, meses e dias', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-01', dataFinal: '2026-09-23' }),
    )
    expect([d.anos, d.meses, d.dias]).toEqual([0, 8, 22])

    const longo = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2020-03-15', dataFinal: '2026-09-23' }),
    )
    expect([longo.anos, longo.meses, longo.dias]).toEqual([6, 6, 8])
  })

  /**
   * O caso que quebra a decomposição ingênua (ano−ano, mês−mês, dia−dia): de
   * 31/01 a 01/03 ela daria "1 mês e −2 dias". Com clamp de fim de mês, 31/01
   * + 1 mês é 28/02, e de lá até 01/03 é 1 dia.
   */
  it('decompõe corretamente quando o dia inicial não existe no mês final', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-31', dataFinal: '2026-03-01' }),
    )
    expect([d.anos, d.meses, d.dias]).toEqual([0, 1, 1])
    expect(d.dias).toBeGreaterThanOrEqual(0)
  })

  it('trata 29/02 de ano bissexto no aniversário do ano seguinte', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2024-02-29', dataFinal: '2025-02-28' }),
    )
    expect([d.anos, d.meses, d.dias]).toEqual([1, 0, 0])
  })

  it('converte o intervalo em semanas e horas', () => {
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-01', dataFinal: '2026-01-15' }),
    )
    expect(d.totalSemanas).toBe(2)
    expect(d.diasRestantesSemana).toBe(0)
    expect(d.totalHoras).toBe(14 * 24)
    expect(d.totalMinutos).toBe(14 * 24 * 60)
  })

  it('não é afetado por fuso horário (a data não escorrega um dia)', () => {
    // O bug clássico: `new Date('2026-09-23').getDate()` devolve 22 no Brasil.
    const d = dados(
      calcularDatas({ modo: 'diferenca', dataInicial: '2026-09-23', dataFinal: '2026-09-24' }),
    )
    expect(d.dataInicial).toBe('2026-09-23')
    expect(d.dataFinal).toBe('2026-09-24')
    expect(d.diaSemanaInicial).toBe('quarta-feira')
    expect(d.diaSemanaFinal).toBe('quinta-feira')
  })
})

describe('calcularDatas — somar e subtrair', () => {
  it('soma dias corridos', () => {
    const d = dados(calcularDatas({ modo: 'somar', dataInicial: '2026-01-01', dias: 90 }))
    expect(d.dataFinal).toBe('2026-04-01')
  })

  it('subtrai dias corridos', () => {
    const d = dados(calcularDatas({ modo: 'subtrair', dataInicial: '2026-04-01', dias: 90 }))
    expect(d.dataFinal).toBe('2026-04-01')
    expect(d.dataInicial).toBe('2026-01-01')
  })

  it('soma meses com ajuste para o último dia do mês', () => {
    const d = dados(calcularDatas({ modo: 'somar', dataInicial: '2026-01-31', meses: 1 }))
    expect(d.dataFinal).toBe('2026-02-28')
  })

  it('soma meses caindo em fevereiro de ano bissexto', () => {
    const d = dados(calcularDatas({ modo: 'somar', dataInicial: '2024-01-31', meses: 1 }))
    expect(d.dataFinal).toBe('2024-02-29')
  })

  it('soma anos a partir de 29 de fevereiro', () => {
    const d = dados(calcularDatas({ modo: 'somar', dataInicial: '2024-02-29', anos: 1 }))
    expect(d.dataFinal).toBe('2025-02-28')
  })

  it('combina anos, meses e dias na ordem documentada', () => {
    const d = dados(
      calcularDatas({ modo: 'somar', dataInicial: '2026-01-15', anos: 1, meses: 2, dias: 10 }),
    )
    // 2026-01-15 + 14 meses = 2027-03-15; + 10 dias = 2027-03-25.
    expect(d.dataFinal).toBe('2027-03-25')
  })

  it('atravessa a virada do ano ao subtrair', () => {
    const d = dados(calcularDatas({ modo: 'subtrair', dataInicial: '2026-01-05', dias: 10 }))
    expect(d.dataInicial).toBe('2025-12-26')
    expect(d.dataFinal).toBe('2026-01-05')
  })

  it('soma dias úteis pulando o fim de semana', () => {
    // 2026-09-25 é sexta-feira. 1 dia útil depois é segunda, 28/09.
    const d = dados(
      calcularDatas({
        modo: 'somar',
        dataInicial: '2026-09-25',
        dias: 1,
        apenasDiasUteis: true,
      }),
    )
    expect(d.dataFinal).toBe('2026-09-28')
  })

  it('soma 5 dias úteis a partir de uma sexta e cai na sexta seguinte', () => {
    const d = dados(
      calcularDatas({
        modo: 'somar',
        dataInicial: '2026-09-25',
        dias: 5,
        apenasDiasUteis: true,
      }),
    )
    expect(d.dataFinal).toBe('2026-10-02')
  })

  it('pula feriados ao contar dias úteis', () => {
    // 2026-09-04 é sexta. 1 dia útil daria segunda 07/09 — que é feriado.
    const d = dados(
      calcularDatas({
        modo: 'somar',
        dataInicial: '2026-09-04',
        dias: 1,
        apenasDiasUteis: true,
        feriados: ['2026-09-07'],
      }),
    )
    expect(d.dataFinal).toBe('2026-09-08')
  })

  it('ignora "incluir dia inicial" ao deslocar — somar 30 dias reporta 30', () => {
    // O campo fica escondido nos modos de deslocamento, mas o valor escolhido
    // antes continua no estado do formulário; sem o corte no core, somar 30
    // dias reportaria 31.
    const d = dados(
      calcularDatas({
        modo: 'somar',
        dataInicial: '2026-01-01',
        dias: 30,
        incluirDataInicial: true,
      }),
    )
    expect(d.diasCorridos).toBe(30)
    expect(d.incluiDataInicial).toBe(false)
  })

  it('subtrai dias úteis', () => {
    // 2026-09-28 é segunda. 1 dia útil antes é sexta, 25/09.
    const d = dados(
      calcularDatas({
        modo: 'subtrair',
        dataInicial: '2026-09-28',
        dias: 1,
        apenasDiasUteis: true,
      }),
    )
    expect(d.dataInicial).toBe('2026-09-25')
  })
})

describe('calcularDatas — resultado apresentado', () => {
  it('devolve o número de dias como headline na diferença, com a unidade no texto', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-01-01',
      dataFinal: '2026-09-23',
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.resultado).toBe(265)
    expect(r.dados.resultadoTexto).toBe('265 dias')
    expect(r.dados.rotuloResultado).toBe('Dias corridos entre as datas')
  })

  it('destaca os dias úteis como headline quando a opção está marcada', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-01-01',
      dataFinal: '2026-09-23',
      apenasDiasUteis: true,
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.rotuloResultado).toBe('Dias úteis entre as datas')
    expect(r.dados.resultado).toBe(r.dados.dados.diasUteis)
  })

  it('devolve a data por extenso como headline ao somar', () => {
    const r = calcularDatas({ modo: 'somar', dataInicial: '2026-01-01', dias: 90 })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.rotuloResultado).toBe('Data final')
    expect(r.dados.resultadoTexto).toBe('quarta-feira, 1 de abril de 2026')
  })

  it('não declara base legal nem data de tabela — não existe nenhuma das duas', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-01-01',
      dataFinal: '2026-09-23',
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.fonteJuridica).toBe('')
    expect(r.dados.dataReferencia).toBe('')
  })

  it('avisa que feriados não entram quando a lista não foi informada', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-01-01',
      dataFinal: '2026-09-23',
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    expect(r.dados.avisos?.some((a) => a.includes('feriados'))).toBe(true)
  })

  it('toda linha do detalhamento traz texto próprio, sem cair no formato de moeda', () => {
    const r = calcularDatas({
      modo: 'diferenca',
      dataInicial: '2026-01-01',
      dataFinal: '2026-09-23',
    })
    if (!r.sucesso) throw new Error('esperava sucesso')
    for (const item of r.dados.detalhamento) {
      expect(item.valorTexto, `linha "${item.descricao}" sem valorTexto`).toBeTruthy()
      expect(item.valorTexto).not.toContain('R$')
    }
  })
})

describe('calcularDatas — validação', () => {
  it('recusa data inicial vazia ou inválida', () => {
    for (const data of ['', '2026-13-01', '2026-02-31', '01/01/2026']) {
      const r = calcularDatas({ modo: 'diferenca', dataInicial: data, dataFinal: '2026-09-23' })
      expect(r.sucesso, `aceitou "${data}"`).toBe(false)
    }
  })

  it('recusa data final ausente no modo diferença', () => {
    const r = calcularDatas({ modo: 'diferenca', dataInicial: '2026-01-01' })
    if (r.sucesso) throw new Error('esperava erro')
    expect(r.erros[0]?.campo).toBe('dataFinal')
  })

  it('recusa soma sem nenhuma quantidade informada', () => {
    const r = calcularDatas({ modo: 'somar', dataInicial: '2026-01-01' })
    if (r.sucesso) throw new Error('esperava erro')
    expect(r.erros[0]?.campo).toBe('dias')
  })

  it('recusa quantidades fora do limite de sanidade', () => {
    const r = calcularDatas({ modo: 'somar', dataInicial: '2026-01-01', anos: 5000 })
    expect(r.sucesso).toBe(false)
  })

  it('recusa deslocamento que sai do intervalo de anos suportado', () => {
    // 1500 − 1000 = ano 500, abaixo do piso. Já 2026 − 1000 = 1026 é válido, e
    // continua valendo: o limite é a data resultante, não a quantidade pedida.
    const foraDoPiso = calcularDatas({ modo: 'subtrair', dataInicial: '1500-01-01', anos: 1000 })
    expect(foraDoPiso.sucesso).toBe(false)

    const dentro = calcularDatas({ modo: 'subtrair', dataInicial: '2026-01-01', anos: 1000 })
    expect(dentro.sucesso).toBe(true)
  })

  it('recusa quantidade fracionada', () => {
    const r = calcularDatas({ modo: 'somar', dataInicial: '2026-01-01', dias: 1.5 })
    expect(r.sucesso).toBe(false)
  })
})

describe('formatação', () => {
  it('formata a data no padrão brasileiro', () => {
    expect(formatarDataBR('2026-09-23')).toBe('23/09/2026')
    expect(formatarDataBR('2026-01-05')).toBe('05/01/2026')
  })

  it('formata a data por extenso em português', () => {
    expect(formatarDataExtenso('2026-09-23')).toBe('quarta-feira, 23 de setembro de 2026')
    expect(formatarDataExtenso('2026-03-01')).toBe('domingo, 1 de março de 2026')
  })

  it('devolve a entrada intacta quando a data é inválida', () => {
    expect(formatarDataBR('nao-e-data')).toBe('nao-e-data')
  })
})
