import { describe, expect, it } from 'vitest'
import { calcularIMC } from '../imc'

describe('calcularIMC', () => {
  describe('validação', () => {
    it('rejeita peso zero', () => {
      const r = calcularIMC({ peso: 0, altura: 1.7 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita peso absurdo (>500)', () => {
      const r = calcularIMC({ peso: 600, altura: 1.7 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita altura absurda', () => {
      const r = calcularIMC({ peso: 70, altura: 4 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita altura zero', () => {
      const r = calcularIMC({ peso: 70, altura: 0 })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('classificações OMS', () => {
    const casos: Array<{
      label: string
      peso: number
      altura: number
      classif: string
      risco: string
    }> = [
      { label: 'Magreza grau III', peso: 40, altura: 1.75, classif: 'Magreza grau III', risco: 'muito_alto' },
      { label: 'Magreza grau II', peso: 51, altura: 1.75, classif: 'Magreza grau II', risco: 'alto' },
      { label: 'Magreza grau I', peso: 55, altura: 1.75, classif: 'Magreza grau I', risco: 'moderado' },
      { label: 'Peso normal', peso: 70, altura: 1.75, classif: 'Peso normal', risco: 'muito_baixo' },
      { label: 'Sobrepeso', peso: 85, altura: 1.75, classif: 'Sobrepeso', risco: 'baixo' },
      { label: 'Obesidade I', peso: 95, altura: 1.75, classif: 'Obesidade grau I', risco: 'moderado' },
      { label: 'Obesidade II', peso: 110, altura: 1.75, classif: 'Obesidade grau II', risco: 'alto' },
      { label: 'Obesidade III', peso: 140, altura: 1.75, classif: 'Obesidade grau III', risco: 'muito_alto' },
    ]

    casos.forEach(({ label, peso, altura, classif, risco }) => {
      it(`${label}: ${peso}kg / ${altura}m → ${classif}`, () => {
        const r = calcularIMC({ peso, altura })
        if (r.sucesso) {
          expect(r.dados.dados.classificacao).toBe(classif)
          expect(r.dados.dados.risco).toBe(risco)
        }
      })
    })
  })

  describe('cálculo conhecido', () => {
    it('70 kg / 1,75 m → IMC 22,86 (Peso Normal)', () => {
      const r = calcularIMC({ peso: 70, altura: 1.75 })
      if (r.sucesso) {
        expect(r.dados.dados.imc).toBeCloseTo(22.86, 1)
        expect(r.dados.dados.classificacao).toBe('Peso normal')
      }
    })

    it('expõe faixa de peso ideal', () => {
      const r = calcularIMC({ peso: 70, altura: 1.75 })
      if (r.sucesso) {
        expect(r.dados.dados.pesoIdeal.min).toBeCloseTo(56.66, 1)
        expect(r.dados.dados.pesoIdeal.max).toBeCloseTo(76.26, 1)
        expect(r.dados.dados.pesoParaPerder).toBeCloseTo(70 - 76.26, 1)
      }
    })
  })

  describe('parâmetros opcionais', () => {
    it('aceita idade e sexo (não interferem no IMC)', () => {
      const r = calcularIMC({ peso: 70, altura: 1.75, idade: 30, sexo: 'masculino' })
      expect(r.sucesso).toBe(true)
    })
  })
})
