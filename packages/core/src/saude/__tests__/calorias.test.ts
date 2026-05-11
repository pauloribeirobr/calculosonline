import { describe, expect, it } from 'vitest'
import { calcularCalorias, FATORES_ATIVIDADE } from '../calorias'

describe('calcularCalorias', () => {
  const BASE = {
    peso: 70,
    altura: 175,
    idade: 30,
    sexo: 'masculino' as const,
    nivelAtividade: 'moderado' as const,
    objetivo: 'manutencao' as const,
  }

  describe('validação', () => {
    it('rejeita peso zero', () => {
      const r = calcularCalorias({ ...BASE, peso: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita altura fora da faixa (em cm)', () => {
      const r = calcularCalorias({ ...BASE, altura: 50 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita altura > 250 cm', () => {
      const r = calcularCalorias({ ...BASE, altura: 300 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita idade < 15', () => {
      const r = calcularCalorias({ ...BASE, idade: 10 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita idade > 100', () => {
      const r = calcularCalorias({ ...BASE, idade: 120 })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('Mifflin-St Jeor', () => {
    it('homem 70kg / 175cm / 30 anos → TMB ≈ 1649', () => {
      const r = calcularCalorias({ ...BASE })
      if (r.sucesso) {
        // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
        expect(r.dados.dados.tmb).toBeCloseTo(1648.75, 1)
      }
    })

    it('mulher 70kg / 175cm / 30 anos → TMB menor que homem', () => {
      const h = calcularCalorias({ ...BASE, sexo: 'masculino' })
      const m = calcularCalorias({ ...BASE, sexo: 'feminino' })
      if (h.sucesso && m.sucesso) {
        expect(m.dados.dados.tmb).toBeLessThan(h.dados.dados.tmb)
      }
    })
  })

  describe('fatores de atividade', () => {
    it.each(Object.entries(FATORES_ATIVIDADE))(
      'aplica o fator %s = %f',
      (nivel, fator) => {
        const r = calcularCalorias({
          ...BASE,
          nivelAtividade: nivel as keyof typeof FATORES_ATIVIDADE,
        })
        if (r.sucesso) {
          expect(r.dados.dados.fatorAtividade).toBe(fator)
        }
      },
    )
  })

  describe('objetivos', () => {
    it('perda → -500 kcal', () => {
      const r = calcularCalorias({ ...BASE, objetivo: 'perda' })
      if (r.sucesso) {
        expect(r.dados.dados.caloriasMeta).toBe(r.dados.dados.tdee - 500)
      }
    })

    it('manutenção → TDEE', () => {
      const r = calcularCalorias({ ...BASE, objetivo: 'manutencao' })
      if (r.sucesso) {
        expect(r.dados.dados.caloriasMeta).toBe(r.dados.dados.tdee)
      }
    })

    it('ganho → +300 kcal', () => {
      const r = calcularCalorias({ ...BASE, objetivo: 'ganho' })
      if (r.sucesso) {
        expect(r.dados.dados.caloriasMeta).toBe(r.dados.dados.tdee + 300)
      }
    })
  })

  describe('macronutrientes', () => {
    it('soma aproximadamente 100% das calorias', () => {
      const r = calcularCalorias({ ...BASE })
      if (r.sucesso) {
        const { proteinas, carboidratos, gorduras } = r.dados.dados.macros
        const total = proteinas * 4 + carboidratos * 4 + gorduras * 9
        // Tolerância por arredondamento
        expect(total).toBeCloseTo(r.dados.dados.caloriasMeta, -1)
      }
    })
  })

  describe('detalhamento', () => {
    it('inclui linhas para TMB, TDEE, Meta e macronutrientes', () => {
      const r = calcularCalorias({ ...BASE })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels.some((l) => l.includes('TMB'))).toBe(true)
        expect(labels.some((l) => l.startsWith('TDEE'))).toBe(true)
        expect(labels.some((l) => l.startsWith('Meta'))).toBe(true)
        expect(labels).toContain('Proteínas')
        expect(labels).toContain('Carboidratos')
        expect(labels).toContain('Gorduras')
      }
    })
  })
})
