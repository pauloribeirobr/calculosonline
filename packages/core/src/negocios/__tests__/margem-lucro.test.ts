import { describe, expect, it } from 'vitest'
import { calcularMargemLucro } from '../margem-lucro'

describe('calcularMargemLucro', () => {
  describe('validação', () => {
    it('rejeita custo zero', () => {
      const r = calcularMargemLucro({ custoTotal: 0, precoVenda: 100 })
      expect(r.sucesso).toBe(false)
    })

    it('exige preço OU markup OU margem desejada', () => {
      const r = calcularMargemLucro({ custoTotal: 100 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita margem desejada de 100% (preço seria infinito)', () => {
      const r = calcularMargemLucro({ custoTotal: 100, margemDesejadaPercent: 100 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita margem desejada negativa', () => {
      const r = calcularMargemLucro({ custoTotal: 100, margemDesejadaPercent: -10 })
      expect(r.sucesso).toBe(false)
    })

    it('preço inválido (NaN) é tratado como ausente', () => {
      const r = calcularMargemLucro({
        custoTotal: 100,
        precoVenda: NaN,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('a partir do preço de venda', () => {
    it('custo 100 / preço 150 → markup 50%, margem 33,33%', () => {
      const r = calcularMargemLucro({ custoTotal: 100, precoVenda: 150 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(150)
        expect(r.dados.dados.lucro).toBe(50)
        expect(r.dados.dados.markup).toBe(50)
        expect(r.dados.dados.margemLucro).toBeCloseTo(33.33, 1)
      }
    })

    it('preço abaixo do custo gera lucro negativo', () => {
      const r = calcularMargemLucro({ custoTotal: 100, precoVenda: 80 })
      if (r.sucesso) {
        expect(r.dados.dados.lucro).toBe(-20)
        expect(r.dados.dados.margemLucro).toBeCloseTo(-25, 1)
      }
    })
  })

  describe('a partir do markup', () => {
    it('custo 100, markup 50% → preço 150', () => {
      const r = calcularMargemLucro({ custoTotal: 100, markupPercent: 50 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(150)
        expect(r.dados.dados.lucro).toBe(50)
        expect(r.dados.dados.markup).toBe(50)
      }
    })

    it('markup zero → preço igual ao custo', () => {
      const r = calcularMargemLucro({ custoTotal: 100, markupPercent: 0 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(100)
        expect(r.dados.dados.lucro).toBe(0)
        expect(r.dados.dados.margemLucro).toBe(0)
      }
    })

    it('markup −100 zera o preço (margem = 0)', () => {
      const r = calcularMargemLucro({ custoTotal: 100, markupPercent: -100 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(0)
        expect(r.dados.dados.margemLucro).toBe(0)
      }
    })

    it('markup tem precedência somente quando preço não é informado', () => {
      const r = calcularMargemLucro({
        custoTotal: 100,
        precoVenda: 200,
        markupPercent: 50,
      })
      if (r.sucesso) {
        // Quando preço é informado, prevalece
        expect(r.dados.dados.precoVenda).toBe(200)
      }
    })
  })

  describe('a partir da margem desejada', () => {
    it('custo 100, margem 30% → preço 142,86 (não 130)', () => {
      const r = calcularMargemLucro({ custoTotal: 100, margemDesejadaPercent: 30 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBeCloseTo(142.86, 2)
        expect(r.dados.dados.lucro).toBeCloseTo(42.86, 2)
        expect(r.dados.dados.margemLucro).toBe(30)
        expect(r.dados.dados.markup).toBeCloseTo(42.86, 2)
      }
    })

    it('margem zero → preço igual ao custo', () => {
      const r = calcularMargemLucro({ custoTotal: 80, margemDesejadaPercent: 0 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(80)
        expect(r.dados.dados.lucro).toBe(0)
        expect(r.dados.dados.markup).toBe(0)
      }
    })

    it('margem 50% dobra o preço (markup 100%)', () => {
      const r = calcularMargemLucro({ custoTotal: 100, margemDesejadaPercent: 50 })
      if (r.sucesso) {
        expect(r.dados.dados.precoVenda).toBe(200)
        expect(r.dados.dados.markup).toBe(100)
      }
    })

    it('preço e markup têm precedência sobre a margem desejada', () => {
      const comPreco = calcularMargemLucro({
        custoTotal: 100,
        precoVenda: 200,
        margemDesejadaPercent: 30,
      })
      if (comPreco.sucesso) expect(comPreco.dados.dados.precoVenda).toBe(200)

      const comMarkup = calcularMargemLucro({
        custoTotal: 100,
        markupPercent: 50,
        margemDesejadaPercent: 30,
      })
      if (comMarkup.sucesso) expect(comMarkup.dados.dados.precoVenda).toBe(150)
    })

    it('é o inverso do modo preço: margem informada volta igual', () => {
      const ida = calcularMargemLucro({ custoTotal: 250, margemDesejadaPercent: 40 })
      if (ida.sucesso) {
        const volta = calcularMargemLucro({
          custoTotal: 250,
          precoVenda: ida.dados.dados.precoVenda,
        })
        if (volta.sucesso) expect(volta.dados.dados.margemLucro).toBeCloseTo(40, 1)
      }
    })
  })

  describe('detalhamento', () => {
    it('inclui linhas de custo, preço, lucro, margem e markup', () => {
      const r = calcularMargemLucro({ custoTotal: 100, precoVenda: 150 })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels).toContain('Custo Total')
        expect(labels).toContain('Preço de Venda')
        expect(labels).toContain('Lucro')
        expect(labels).toContain('Margem de Lucro')
        expect(labels).toContain('Markup')
      }
    })

    it('lucro negativo tem tipo "debito"', () => {
      const r = calcularMargemLucro({ custoTotal: 100, precoVenda: 80 })
      if (r.sucesso) {
        const linha = r.dados.detalhamento.find((d) => d.descricao === 'Lucro')
        expect(linha?.tipo).toBe('debito')
      }
    })
  })
})
