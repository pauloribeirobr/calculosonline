import { describe, expect, it } from 'vitest'
import { calcularJurosCompostos } from '../juros-compostos'

describe('calcularJurosCompostos', () => {
  describe('validação', () => {
    it('rejeita capital negativo', () => {
      const r = calcularJurosCompostos({
        principal: -100,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa zero', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0,
        periodoTaxa: 'mensal',
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa absurda (> 1000%)', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 20,
        periodoTaxa: 'mensal',
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita prazo zero', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita aporte negativo', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 12,
        aporteMensal: -1,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('fórmula', () => {
    it('R$10.000 a 1%/mês por 12 meses → R$11.268,25', () => {
      const r = calcularJurosCompostos({
        principal: 10000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.montanteFinal).toBeCloseTo(11268.25, 1)
        expect(r.dados.dados.jurosAcumulados).toBeCloseTo(1268.25, 1)
      }
    })

    it('taxa anual é convertida para mensal equivalente', () => {
      const anual = calcularJurosCompostos({
        principal: 10000,
        taxaJuros: 0.1268,
        periodoTaxa: 'anual',
        prazoMeses: 12,
      })
      if (anual.sucesso) {
        // ~equivale a 1% a.m. → ~R$11.268,25
        expect(anual.dados.dados.montanteFinal).toBeCloseTo(11268, -1)
      }
    })

    it('taxa diária é convertida para mensal (×30)', () => {
      const r = calcularJurosCompostos({
        principal: 10000,
        taxaJuros: 0.0001,
        periodoTaxa: 'diario',
        prazoMeses: 6,
      })
      if (r.sucesso) {
        expect(r.dados.dados.montanteFinal).toBeGreaterThan(10000)
      }
    })
  })

  describe('aporte mensal', () => {
    it('com aporte mensal o montante final cresce', () => {
      const semAporte = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 24,
      })
      const comAporte = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 24,
        aporteMensal: 100,
      })
      if (semAporte.sucesso && comAporte.sucesso) {
        expect(comAporte.dados.dados.montanteFinal).toBeGreaterThan(
          semAporte.dados.dados.montanteFinal,
        )
        expect(comAporte.dados.dados.totalAportado).toBe(1000 + 100 * 24)
      }
    })
  })

  describe('evolução anual', () => {
    it('contém um snapshot a cada 12 meses + final', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 30,
      })
      if (r.sucesso) {
        // 12, 24, 30 (final) → 3 entradas
        expect(r.dados.dados.evolucaoAnual.length).toBe(3)
      }
    })

    it('prazo múltiplo de 12 não duplica a entrada final', () => {
      const r = calcularJurosCompostos({
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 24,
      })
      if (r.sucesso) {
        expect(r.dados.dados.evolucaoAnual.length).toBe(2)
      }
    })
  })
})
