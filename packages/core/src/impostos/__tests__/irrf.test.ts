import { describe, expect, it } from 'vitest'
import { calcularIRRF } from '../irrf'

describe('calcularIRRF', () => {
  describe('validação', () => {
    it('rejeita salário inválido', () => {
      const r = calcularIRRF({ salarioBruto: 0, numeroDependentes: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularIRRF({ salarioBruto: 5000, numeroDependentes: -1 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita pensão negativa', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        pensaoAlimenticia: -1,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita outras deduções negativas', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        outrasDeducoes: -1,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita INSS informado negativo', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        descontoINSS: -1,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('cálculo', () => {
    it('salário baixo (R$ 2000) → isento', () => {
      const r = calcularIRRF({ salarioBruto: 2000, numeroDependentes: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.isento).toBe(true)
        expect(r.dados.dados.irrf).toBe(0)
      }
    })

    it('salário alto (R$ 10.000) tem IRRF > 0', () => {
      const r = calcularIRRF({ salarioBruto: 10000, numeroDependentes: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.isento).toBe(false)
        expect(r.dados.dados.irrf).toBeGreaterThan(0)
        expect(r.dados.dados.aliquota).toBe(0.275)
      }
    })

    it('dependentes reduzem a base de cálculo', () => {
      const sem = calcularIRRF({ salarioBruto: 5000, numeroDependentes: 0 })
      const com = calcularIRRF({ salarioBruto: 5000, numeroDependentes: 2 })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
        expect(com.dados.dados.deducaoDependentes).toBeGreaterThan(0)
      }
    })

    it('pensão alimentícia reduz a base do IRRF', () => {
      const sem = calcularIRRF({ salarioBruto: 6000, numeroDependentes: 0 })
      const com = calcularIRRF({
        salarioBruto: 6000,
        numeroDependentes: 0,
        pensaoAlimenticia: 1000,
      })
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
      }
    })

    it('outras deduções reduzem a base', () => {
      const sem = calcularIRRF({ salarioBruto: 6000, numeroDependentes: 0 })
      const com = calcularIRRF({
        salarioBruto: 6000,
        numeroDependentes: 0,
        outrasDeducoes: 500,
      })
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
      }
    })

    it('aceita INSS informado externamente', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        descontoINSS: 600,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.baseCalculo).toBeCloseTo(4400, 0)
    })

    it('detalhamento omite linha de Alíquota quando isento', () => {
      const r = calcularIRRF({ salarioBruto: 2000, numeroDependentes: 0 })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels.some((l) => l.startsWith('Alíquota'))).toBe(false)
        expect(labels.at(-1)).toBe('IRRF (Isento)')
      }
    })

    it('detalhamento mostra Pensão e Outras Deduções quando informadas', () => {
      const r = calcularIRRF({
        salarioBruto: 8000,
        numeroDependentes: 1,
        pensaoAlimenticia: 500,
        outrasDeducoes: 200,
      })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels.some((l) => l.includes('Pensão'))).toBe(true)
        expect(labels.some((l) => l.includes('Outras Deduções'))).toBe(true)
        expect(labels.some((l) => l.startsWith('(-) Dependentes'))).toBe(true)
      }
    })
  })
})
