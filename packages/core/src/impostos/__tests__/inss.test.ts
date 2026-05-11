import { describe, expect, it } from 'vitest'
import { calcularINSS, TETO_INSS_2026 } from '../inss'

describe('calcularINSS', () => {
  describe('validação', () => {
    it('rejeita salário zero para empregado', () => {
      const r = calcularINSS({ salarioBruto: 0, categoria: 'empregado' })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita salário negativo para autônomo', () => {
      const r = calcularINSS({ salarioBruto: -100, categoria: 'autonomo' })
      expect(r.sucesso).toBe(false)
    })

    it('aceita MEI sem informar salário (usa salário mínimo)', () => {
      const r = calcularINSS({ salarioBruto: 0, categoria: 'mei' })
      expect(r.sucesso).toBe(true)
    })
  })

  describe('empregado (tabela progressiva)', () => {
    it('R$ 2.000 → primeira faixa progressiva', () => {
      const r = calcularINSS({ salarioBruto: 2000, categoria: 'empregado' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.contribuicao).toBeGreaterThan(0)
        expect(r.dados.dados.categoria).toBe('empregado')
        expect(r.dados.dados.teto).toBe(false)
      }
    })

    it('atinge teto quando salário supera R$ 8.157,41', () => {
      const r = calcularINSS({ salarioBruto: 20000, categoria: 'empregado' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.teto).toBe(true)
      }
    })
  })

  describe('autônomo / facultativo (20% sobre base)', () => {
    it('autônomo paga 20% do salário-base', () => {
      const r = calcularINSS({ salarioBruto: 5000, categoria: 'autonomo' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.contribuicao).toBe(1000)
    })

    it('facultativo igual ao autônomo (20%)', () => {
      const a = calcularINSS({ salarioBruto: 5000, categoria: 'autonomo' })
      const f = calcularINSS({ salarioBruto: 5000, categoria: 'facultativo' })
      expect(a.sucesso && f.sucesso).toBe(true)
      if (a.sucesso && f.sucesso) {
        expect(a.dados.dados.contribuicao).toBe(f.dados.dados.contribuicao)
      }
    })

    it('autônomo respeita o teto do INSS', () => {
      const r = calcularINSS({ salarioBruto: 30000, categoria: 'autonomo' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        // 20% × 8157.41 = 1631.48
        expect(r.dados.dados.contribuicao).toBe(1631.48)
        expect(r.dados.dados.teto).toBe(true)
      }
    })
  })

  describe('MEI (5% do salário mínimo)', () => {
    it('contribuição = 5% × SM 2026 (1518)', () => {
      const r = calcularINSS({ salarioBruto: 0, categoria: 'mei' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.contribuicao).toBe(75.9)
        expect(r.dados.dados.aliquotaEfetiva).toBe(0.05)
        expect(r.dados.dados.teto).toBe(false)
      }
    })
  })

  describe('metadata', () => {
    it('expõe a base legal correta por categoria', () => {
      const emp = calcularINSS({ salarioBruto: 3000, categoria: 'empregado' })
      const aut = calcularINSS({ salarioBruto: 3000, categoria: 'autonomo' })
      const mei = calcularINSS({ salarioBruto: 0, categoria: 'mei' })
      if (emp.sucesso) expect(emp.dados.fonteJuridica).toContain('11.936')
      if (aut.sucesso) expect(aut.dados.fonteJuridica).toContain('8.212')
      if (mei.sucesso) expect(mei.dados.fonteJuridica).toContain('LC 123')
    })

    it('TETO_INSS_2026 é uma constante coerente', () => {
      expect(TETO_INSS_2026).toBe(8157.41)
    })

    it('detalhamento contém Salário Base, INSS e Alíquota efetiva', () => {
      const r = calcularINSS({ salarioBruto: 3000, categoria: 'empregado' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels[0]).toBe('Salário Base')
        expect(labels.some((l) => l.startsWith('INSS'))).toBe(true)
        expect(labels.at(-1)).toContain('Alíquota efetiva')
      }
    })
  })
})
