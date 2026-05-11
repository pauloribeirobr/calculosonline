import { describe, expect, it } from 'vitest'
import {
  calcularAmortizacao,
  calcularEmprestimo,
  calcularFinanciamento,
} from '../amortizacao'

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
        expect(r.dados.dados.primeiraParcela).toBeCloseTo(
          r.dados.dados.ultimaParcela,
          1,
        )
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
        expect(comSeg.dados.dados.totalPago).toBeGreaterThan(
          semSeg.dados.dados.totalPago,
        )
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
        const linha = semSeg.dados.detalhamento.find((d) =>
          d.descricao.includes('Seguros'),
        )
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
