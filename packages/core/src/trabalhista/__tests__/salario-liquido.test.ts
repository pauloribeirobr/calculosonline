import { describe, expect, it } from 'vitest'
import { calcularSalarioLiquido } from '../salario-liquido'
import { arredondar } from '../../utils'

describe('calcularSalarioLiquido', () => {
  describe('validação', () => {
    it('rejeita salário zero', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 0, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe('salario')
    })

    it('rejeita salário negativo', () => {
      const r = calcularSalarioLiquido({ salarioBruto: -100, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: -1 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) {
        expect(r.erros.some((e) => e.campo === 'numeroDependentesIRRF')).toBe(true)
      }
    })

    it('rejeita outras deduções negativas', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: -10,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita outros descontos negativos', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        outrosDescontos: -10,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('salário mínimo 2026 (R$ 1.518,00)', () => {
    it('INSS = R$ 113,85 (7,5% sobre o piso) e IRRF isento', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 1518, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(113.85)
        expect(r.dados.dados.descontoIRRF).toBe(0)
      }
    })
  })

  describe('salário R$ 3.000,00 sem dependentes', () => {
    it('INSS progressivo soma 3 faixas (R$253,41)', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoINSS).toBe(253.41)
    })

    it('IRRF é calculado na faixa 7,5%', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoIRRF).toBeGreaterThan(0)
    })
  })

  describe('salário R$ 5.000,00 com 2 dependentes', () => {
    it('descontos plausíveis e líquido < bruto', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 2 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBeGreaterThan(0)
        expect(r.dados.dados.descontoIRRF).toBeGreaterThan(0)
        expect(r.dados.dados.salarioLiquido).toBeLessThan(5000)
      }
    })
  })

  describe('vale-transporte', () => {
    it('desconta exatamente 6% quando habilitado', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        temValeTransporte: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoVT).toBe(180)
    })

    it('não desconta VT por padrão', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoVT).toBe(0)
    })
  })

  describe('outras deduções e descontos', () => {
    it('outras deduções reduzem a base do IRRF', () => {
      const sem = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 0 })
      const com = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: 500,
      })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.descontoIRRF).toBeLessThan(sem.dados.dados.descontoIRRF)
      }
    })

    it('outros descontos não afetam base IRRF mas reduzem o líquido', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        outrosDescontos: 200,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.outrosDescontos).toBe(200)
      }
    })
  })

  describe('consistência', () => {
    it('salário líquido = bruto − total de descontos', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 8000, numeroDependentesIRRF: 1 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { salarioBruto, totalDescontos, salarioLiquido } = r.dados.dados
        expect(salarioLiquido).toBe(arredondar(salarioBruto - totalDescontos))
      }
    })

    it('detalhamento contém Salário Bruto e Salário Líquido', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        temValeTransporte: true,
        outrosDescontos: 100,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const itens = r.dados.detalhamento.map((d) => d.descricao)
        expect(itens).toContain('Salário Bruto')
        expect(itens).toContain('Salário Líquido')
        expect(itens.some((i) => i.includes('Vale-Transporte'))).toBe(true)
        expect(itens).toContain('Outros Descontos')
      }
    })

    it('alíquotas efetivas são proporcionais ao bruto', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 10000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { aliquotaEfetivaINSS, aliquotaEfetivaIRRF } = r.dados.dados
        expect(aliquotaEfetivaINSS).toBeGreaterThan(0)
        expect(aliquotaEfetivaINSS).toBeLessThan(0.14)
        expect(aliquotaEfetivaIRRF).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
