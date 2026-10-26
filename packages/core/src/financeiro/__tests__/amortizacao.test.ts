import { describe, expect, it } from 'vitest'
import { calcularAmortizacao, calcularEmprestimo, calcularFinanciamento } from '../amortizacao'

describe('calcularAmortizacao', () => {
  describe('validação', () => {
    it('rejeita valor financiado zero', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 0,
        taxaMensalJuros: 0.015,
        prazoMeses: 12,
        sistema: 'price',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa zero', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 1000,
        taxaMensalJuros: 0,
        prazoMeses: 12,
        sistema: 'price',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita prazo zero', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 1000,
        taxaMensalJuros: 0.015,
        prazoMeses: 0,
        sistema: 'price',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa de seguro negativa', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 1000,
        taxaMensalJuros: 0.015,
        prazoMeses: 12,
        sistema: 'price',
        taxaSeguroMensal: -0.0001,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('sistema Price', () => {
    it('parcelas são iguais (sem seguro)', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 10000,
        taxaMensalJuros: 0.015,
        prazoMeses: 24,
        sistema: 'price',
      })
      if (r.sucesso) {
        expect(r.dados.dados.primeiraParcela).toBeCloseTo(r.dados.dados.ultimaParcela, 1)
        expect(r.dados.dados.primeiraParcela).toBeGreaterThan(490)
        expect(r.dados.dados.primeiraParcela).toBeLessThan(510)
      }
    })

    it('Price com tabela completa (24 parcelas)', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 10000,
        taxaMensalJuros: 0.015,
        prazoMeses: 24,
        sistema: 'price',
      })
      if (r.sucesso) {
        expect(r.dados.dados.tabela.length).toBe(24)
        // Saldo final deve estar próximo de zero
        expect(r.dados.dados.tabela.at(-1)!.saldoDevedor).toBeLessThan(1)
      }
    })
  })

  describe('sistema SAC', () => {
    it('amortização é constante e parcela decrescente', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 12000,
        taxaMensalJuros: 0.01,
        prazoMeses: 12,
        sistema: 'sac',
      })
      if (r.sucesso) {
        const tabela = r.dados.dados.tabela
        expect(tabela[0]!.amortizacao).toBe(1000)
        expect(tabela[0]!.parcela).toBeGreaterThan(tabela.at(-1)!.parcela)
      }
    })
  })

  describe('seguro mensal', () => {
    it('seguro aumenta o valor total pago', () => {
      const semSeg = calcularAmortizacao({
        valorFinanciado: 100000,
        taxaMensalJuros: 0.01,
        prazoMeses: 60,
        sistema: 'price',
      })
      const comSeg = calcularAmortizacao({
        valorFinanciado: 100000,
        taxaMensalJuros: 0.01,
        prazoMeses: 60,
        sistema: 'price',
        taxaSeguroMensal: 0.0005,
      })
      if (semSeg.sucesso && comSeg.sucesso) {
        expect(comSeg.dados.dados.totalSeguro).toBeGreaterThan(0)
        expect(comSeg.dados.dados.totalPago).toBeGreaterThan(semSeg.dados.dados.totalPago)
      }
    })

    it('detalhamento mostra linha de seguros somente quando há seguro', () => {
      const semSeg = calcularAmortizacao({
        valorFinanciado: 1000,
        taxaMensalJuros: 0.01,
        prazoMeses: 6,
        sistema: 'price',
      })
      if (semSeg.sucesso) {
        const linha = semSeg.dados.detalhamento.find((d) => d.descricao.includes('Seguros'))
        expect(linha).toBeUndefined()
      }
    })
  })

  describe('CET', () => {
    it('CET é calculado e exposto', () => {
      const r = calcularAmortizacao({
        valorFinanciado: 10000,
        taxaMensalJuros: 0.015,
        prazoMeses: 24,
        sistema: 'price',
      })
      if (r.sucesso) {
        expect(r.dados.dados.cet).toBeGreaterThan(0)
      }
    })
  })

  describe('aliases', () => {
    it('calcularEmprestimo é o mesmo que calcularAmortizacao', () => {
      expect(calcularEmprestimo).toBe(calcularAmortizacao)
    })

    it('calcularFinanciamento é o mesmo que calcularAmortizacao', () => {
      expect(calcularFinanciamento).toBe(calcularAmortizacao)
    })
  })
})

describe('tabela de parcelas na evolução (F86)', () => {
  it('expõe uma linha por parcela, e as parcelas somam o total pago', () => {
    const r = calcularAmortizacao({
      valorFinanciado: 100000,
      taxaMensalJuros: 0.01,
      prazoMeses: 120,
      sistema: 'sac',
    })
    if (!r.sucesso) throw new Error('cálculo falhou')
    const { evolucao } = r.dados
    expect(evolucao?.linhas).toHaveLength(120)
    const soma = evolucao!.linhas.reduce((t, l) => t + l.parcela!, 0)
    expect(soma).toBeCloseTo(r.dados.resultado, 2)
    expect(evolucao!.colunas.map((c) => c.chave)).not.toContain('seguro')
  })
})

describe('última parcela quita o saldo (F86)', () => {
  // Antes a última parcela repetia a PMT (Price) ou a amortização fixa (SAC),
  // e o arredondamento deixava dívida (SAC: R$ 0,40 em R$ 100 mil / 120) ou
  // amortizava a mais (Price: R$ 300.011,72 em R$ 300 mil / 360).
  const casos = [
    [100000, 0.01, 120],
    [10000, 0.02, 24],
    [300000, 0.009, 360],
    [5000, 0.035, 12],
  ] as const
  for (const sistema of ['price', 'sac'] as const) {
    for (const [valorFinanciado, taxaMensalJuros, prazoMeses] of casos) {
      it(`${sistema}: R$ ${valorFinanciado} em ${prazoMeses} meses amortiza exatamente o valor financiado`, () => {
        const r = calcularAmortizacao({ valorFinanciado, taxaMensalJuros, prazoMeses, sistema })
        if (!r.sucesso) throw new Error('cálculo falhou')
        const { tabela } = r.dados.dados
        expect(tabela.at(-1)!.saldoDevedor).toBe(0)
        const amortizado = tabela.reduce((t, p) => t + p.amortizacao, 0)
        expect(amortizado).toBeCloseTo(valorFinanciado, 2)
        expect(tabela.every((p) => p.saldoDevedor >= 0)).toBe(true)
      })
    }
  }
})
