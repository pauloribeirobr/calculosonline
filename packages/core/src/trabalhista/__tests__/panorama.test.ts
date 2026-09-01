import { describe, expect, it } from 'vitest'
import { calcularPanoramaTrabalhista, type PanoramaTrabalhistaParams } from '../panorama'
import { calcularRescisao } from '../rescisao'
import { calcularDecimoTerceiro } from '../decimo-terceiro'
import { calcularFerias } from '../ferias'
import { calcularFGTS } from '../fgts'

/**
 * O panorama (F58) não inventa regra nenhuma: ele deriva os parâmetros dos
 * quatro cálculos que já existem. Então o que precisa de teste não é a
 * aritmética trabalhista (cada função já tem a sua suíte), é o **encadeamento**
 * — se os parâmetros derivados batem com os que alguém passaria à mão, e se as
 * duas armadilhas de agregação continuam fechadas: não somar os blocos e não
 * contar os depósitos do FGTS duas vezes.
 */

const BASE: PanoramaTrabalhistaParams = {
  salarioBruto: 3000,
  dataAdmissao: '2020-03-10',
  dataSaida: '2026-08-31',
  motivoRescisao: 'sem_justa_causa',
  saldoFGTS: 15000,
  feriasVencidas: 0,
  numeroDependentesIRRF: 0,
}

function panorama(over: Partial<PanoramaTrabalhistaParams> = {}) {
  const r = calcularPanoramaTrabalhista({ ...BASE, ...over })
  if (!r.sucesso) throw new Error(`panorama falhou: ${JSON.stringify(r.erros)}`)
  return r.dados
}

describe('calcularPanoramaTrabalhista', () => {
  describe('validação — a rescisão é o portão de entrada', () => {
    it('rejeita salário inválido', () => {
      const r = calcularPanoramaTrabalhista({ ...BASE, salarioBruto: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita saída anterior à admissão', () => {
      const r = calcularPanoramaTrabalhista({ ...BASE, dataSaida: '2019-01-01' })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros.some((e) => e.campo === 'dataRescisao')).toBe(true)
    })

    it('rejeita saldo de FGTS negativo', () => {
      const r = calcularPanoramaTrabalhista({ ...BASE, saldoFGTS: -1 })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('encadeamento — cada bloco bate com a calculadora dedicada', () => {
    it('rescisão reproduz exatamente calcularRescisao com os mesmos dados', () => {
      const direto = calcularRescisao({
        salarioBruto: BASE.salarioBruto,
        dataAdmissao: BASE.dataAdmissao,
        dataRescisao: BASE.dataSaida,
        motivoRescisao: BASE.motivoRescisao,
        saldoFGTS: BASE.saldoFGTS,
        feriasVencidas: BASE.feriasVencidas ?? 0,
        numeroDependentesIRRF: BASE.numeroDependentesIRRF ?? 0,
      })
      if (!direto.sucesso) throw new Error('rescisão direta falhou')

      const bloco = panorama().dados.blocos.find((b) => b.id === 'rescisao')!
      expect(bloco.valor).toBe(direto.dados.dados.totalLiquido)
      expect(bloco.linhas).toEqual(direto.dados.detalhamento)
    })

    it('13º usa o ano cheio para quem foi admitido em ano anterior', () => {
      const direto = calcularDecimoTerceiro({
        salarioBruto: BASE.salarioBruto,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      if (!direto.sucesso) throw new Error('13º direto falhou')

      const bloco = panorama().dados.blocos.find((b) => b.id === 'decimo-terceiro')!
      expect(bloco.valor).toBe(direto.dados.dados.valorLiquido)
      expect(bloco.legenda).toContain('ano cheio')
    })

    it('13º vira proporcional quando a admissão é no próprio ano da saída', () => {
      // Admitido em 10/03/2026 → 10 meses (março conta inteiro: 22 dias ≥ 15).
      const bloco = panorama({ dataAdmissao: '2026-03-10' }).dados.blocos.find(
        (b) => b.id === 'decimo-terceiro',
      )!

      const direto = calcularDecimoTerceiro({
        salarioBruto: BASE.salarioBruto,
        mesAdmissao: 3,
        diasTrabalhados: 22,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      if (!direto.sucesso) throw new Error('13º direto falhou')

      expect(direto.dados.dados.mesesDireito).toBe(10)
      expect(bloco.valor).toBe(direto.dados.dados.valorLiquido)
      expect(bloco.legenda).toContain('10 meses')
    })

    it('o degrau dos 15 dias do 13º sobrevive ao encadeamento', () => {
      // Admitido em 17/03 (15 dias) vs 18/03 (14 dias): o mês inteiro entra ou
      // não. É a regra da Lei 4.090/1962 que o panorama poderia perder ao
      // derivar `diasTrabalhados` da data — por isso está travada aqui.
      const com = panorama({ dataAdmissao: '2026-03-17' })
      const sem = panorama({ dataAdmissao: '2026-03-18' })

      const valor = (p: typeof com) =>
        p.dados.blocos.find((b) => b.id === 'decimo-terceiro')!.valor

      expect(valor(com)).toBeGreaterThan(valor(sem))
      expect(com.dados.blocos[1]!.legenda).toContain('10 meses')
      expect(sem.dados.blocos[1]!.legenda).toContain('9 meses')
    })

    it('férias reproduzem um período completo, sem abono', () => {
      const direto = calcularFerias({ salarioBruto: BASE.salarioBruto, diasFaltas: 0 })
      if (!direto.sucesso) throw new Error('férias diretas falharam')

      const bloco = panorama().dados.blocos.find((b) => b.id === 'ferias')!
      expect(bloco.valor).toBe(direto.dados.dados.totalBruto)
      expect(direto.dados.dados.diasDireito).toBe(30)
      // Salário ÷ 30 × 30 + 1/3 = salário × 4/3, exato quando o salário é redondo.
      expect(bloco.valor).toBe(4000)
    })

    it('faltas injustificadas chegam ao bloco de férias (CLT art. 130)', () => {
      const bloco = panorama({ diasFaltas: 10 }).dados.blocos.find((b) => b.id === 'ferias')!
      expect(bloco.legenda).toContain('24 dias')
      expect(bloco.valor).toBeLessThan(4000)
    })
  })

  describe('FGTS — os depósitos não podem ser contados duas vezes', () => {
    it('a estimativa ignora o saldo informado', () => {
      // Este é o bug que o módulo existe para não ter: o saldo que o usuário
      // digita JÁ contém os depósitos do contrato. Se ele entrasse como
      // `saldoAtual` na projeção, os mesmos 8% apareceriam somados de novo.
      const comSaldo = panorama({ saldoFGTS: 15000 })
      const semSaldo = panorama({ saldoFGTS: 0 })

      expect(comSaldo.dados.fgtsEsperado).toBe(semSaldo.dados.fgtsEsperado)

      const direto = calcularFGTS({
        salarioBruto: BASE.salarioBruto,
        mesesTrabalhados: comSaldo.dados.mesesTrabalhados,
        modalidade: 'rescisao',
        saldoAtual: 0,
      })
      if (!direto.sucesso) throw new Error('FGTS direto falhou')
      expect(comSaldo.dados.fgtsEsperado).toBe(direto.dados.dados.depositosNoPeriodo)
    })

    it('a diferença compara saldo informado com o estimado', () => {
      const p = panorama({ saldoFGTS: 15000 })
      expect(p.dados.diferencaFGTS).toBe(
        Math.round((15000 - p.dados.fgtsEsperado) * 100) / 100,
      )
    })

    it('sem saldo informado não há comparação (e não há falso "sobrando")', () => {
      expect(panorama({ saldoFGTS: 0 }).dados.diferencaFGTS).toBeNull()
    })

    it('a multa aparece como referência cruzada, não como verba a mais', () => {
      const bloco = panorama().dados.blocos.find((b) => b.id === 'fgts')!
      const multa = bloco.linhas.find((l) => l.descricao.includes('Multa'))!

      expect(multa.tipo).toBe('neutro')
      expect(multa.formula).toContain('já incluída no total da rescisão')
    })

    it('pedido de demissão não gera linha de multa', () => {
      const bloco = panorama({ motivoRescisao: 'pedido_demissao' }).dados.blocos.find(
        (b) => b.id === 'fgts',
      )!
      expect(bloco.linhas.some((l) => l.descricao.includes('Multa'))).toBe(false)
    })
  })

  describe('a armadilha do agregador — os quatro blocos não se somam', () => {
    it('nenhuma linha do consolidado é crédito ou débito', () => {
      // A UI só desenha o sinal (+)/(−) em crédito/débito. Se uma linha do
      // consolidado virasse crédito, a lista passaria a parecer uma soma — e a
      // soma seria errada, porque a rescisão já contém 13º, férias e multa.
      const p = panorama()
      expect(p.detalhamento.every((l) => l.tipo === 'neutro')).toBe(true)
      expect(p.detalhamento).toHaveLength(4)
    })

    it('a soma dos blocos é maior que a rescisão — e por isso não é oferecida', () => {
      const p = panorama()
      const soma = p.dados.blocos.reduce((t, b) => t + b.valor, 0)

      expect(soma).toBeGreaterThan(p.dados.totalRescisao)
      // O resultado headline é a rescisão, nunca a soma.
      expect(p.resultado).toBe(p.dados.totalRescisao)
    })

    it('o motivo da não-soma está nos avisos exibidos', () => {
      const avisos = panorama().avisos ?? []
      expect(avisos.some((a) => a.includes('não se somam'))).toBe(true)
      expect(avisos.some((a) => a.includes('rendimento do fundo'))).toBe(true)
    })
  })

  describe('estrutura', () => {
    it('entrega os quatro blocos, cada um apontando para a calculadora dedicada', () => {
      const blocos = panorama().dados.blocos
      expect(blocos.map((b) => b.id)).toEqual([
        'rescisao',
        'decimo-terceiro',
        'ferias',
        'fgts',
      ])
      expect(blocos.map((b) => b.slugCalculadora)).toEqual([
        'rescisao-trabalhista',
        'decimo-terceiro',
        'ferias',
        'fgts',
      ])
      expect(blocos.every((b) => b.linhas.length > 0)).toBe(true)
      expect(blocos.every((b) => b.fonteJuridica.length > 0)).toBe(true)
    })

    it('meses e anos de contrato batem com a rescisão', () => {
      const p = panorama()
      // 10/03/2020 → 31/08/2026: 77 meses, 6 anos completos.
      expect(p.dados.mesesTrabalhados).toBe(77)
      expect(p.dados.anosCompletos).toBe(6)
    })
  })
})
