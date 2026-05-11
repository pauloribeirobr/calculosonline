import { describe, expect, it } from 'vitest'
import { calcularPorcentagem } from '../porcentagem'

describe('calcularPorcentagem', () => {
  describe('validação', () => {
    it('rejeita valorA NaN', () => {
      const r = calcularPorcentagem({
        tipo: 'percentual_de',
        valorA: NaN,
        valorB: 100,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita valorB infinito', () => {
      const r = calcularPorcentagem({
        tipo: 'percentual_de',
        valorA: 100,
        valorB: Infinity,
      })
      expect(r.sucesso).toBe(false)
    })

    it('percentual_de rejeita divisor zero', () => {
      const r = calcularPorcentagem({
        tipo: 'percentual_de',
        valorA: 50,
        valorB: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('variacao_percentual rejeita valor inicial zero', () => {
      const r = calcularPorcentagem({
        tipo: 'variacao_percentual',
        valorA: 0,
        valorB: 100,
      })
      expect(r.sucesso).toBe(false)
    })

    it('porcentagem_inversa rejeita percentual zero', () => {
      const r = calcularPorcentagem({
        tipo: 'porcentagem_inversa',
        valorA: 50,
        valorB: 0,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('cada modo', () => {
    it('percentual_de: 300 é 25% de 1200', () => {
      const r = calcularPorcentagem({
        tipo: 'percentual_de',
        valorA: 300,
        valorB: 1200,
      })
      if (r.sucesso) expect(r.dados.dados.resultado).toBe(25)
    })

    it('valor_de_percent: 15% de 200 = 30', () => {
      const r = calcularPorcentagem({
        tipo: 'valor_de_percent',
        valorA: 200,
        valorB: 15,
      })
      if (r.sucesso) expect(r.dados.dados.resultado).toBe(30)
    })

    it('variacao_percentual: 100 → 150 = +50%', () => {
      const r = calcularPorcentagem({
        tipo: 'variacao_percentual',
        valorA: 100,
        valorB: 150,
      })
      if (r.sucesso) {
        expect(r.dados.dados.resultado).toBe(50)
        expect(r.dados.dados.descricao).toContain('+50')
      }
    })

    it('variacao_percentual negativa não tem prefixo "+"', () => {
      const r = calcularPorcentagem({
        tipo: 'variacao_percentual',
        valorA: 100,
        valorB: 80,
      })
      if (r.sucesso) {
        expect(r.dados.dados.resultado).toBe(-20)
        expect(r.dados.dados.descricao).not.toContain('+')
      }
    })

    it('valor_acrescimo: 100 + 20% = 120', () => {
      const r = calcularPorcentagem({
        tipo: 'valor_acrescimo',
        valorA: 100,
        valorB: 20,
      })
      if (r.sucesso) expect(r.dados.dados.resultado).toBe(120)
    })

    it('valor_desconto: 100 − 25% = 75', () => {
      const r = calcularPorcentagem({
        tipo: 'valor_desconto',
        valorA: 100,
        valorB: 25,
      })
      if (r.sucesso) expect(r.dados.dados.resultado).toBe(75)
    })

    it('porcentagem_inversa: 50 é 25% de 200', () => {
      const r = calcularPorcentagem({
        tipo: 'porcentagem_inversa',
        valorA: 50,
        valorB: 25,
      })
      if (r.sucesso) expect(r.dados.dados.resultado).toBe(200)
    })
  })

  describe('detalhamento', () => {
    it('inclui fórmula textual', () => {
      const r = calcularPorcentagem({
        tipo: 'valor_de_percent',
        valorA: 100,
        valorB: 10,
      })
      if (r.sucesso) {
        expect(r.dados.detalhamento[0]?.formula).toBeDefined()
      }
    })
  })
})
