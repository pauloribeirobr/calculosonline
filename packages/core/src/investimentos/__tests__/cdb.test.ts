import { describe, expect, it } from 'vitest'
import { calcularCDB, getPrazoIR } from '../cdb'

describe('calcularCDB', () => {
  describe('validação', () => {
    it('rejeita valor inicial zero', () => {
      const r = calcularCDB({
        valorInicial: 0,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita prazo zero', () => {
      const r = calcularCDB({
        valorInicial: 1000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa zero', () => {
      const r = calcularCDB({
        valorInicial: 1000,
        taxaAnual: 0,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('tipos', () => {
    it('prefixado: taxa anual aplicada diretamente', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.12, 4)
        expect(r.dados.dados.montanteBruto).toBeCloseTo(11200, -1)
      }
    })

    it('cdi: 110% × CDI default (10,65%) = ~11,72% a.a.', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 1.1,
        tipo: 'cdi',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.1172, 4)
      }
    })

    it('cdi com CDI customizado', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 1,
        tipo: 'cdi',
        prazoMeses: 12,
        cdiAnual: 0.13,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.13, 4)
      }
    })

    it('ipca_mais: (1+IPCA)×(1+taxa) - 1', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.06,
        tipo: 'ipca_mais',
        prazoMeses: 12,
        ipcaAnual: 0.04,
      })
      if (r.sucesso) {
        // (1.04 * 1.06) - 1 = 0.1024
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.1024, 4)
      }
    })

    it('ipca_mais com IPCA default', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.05,
        tipo: 'ipca_mais',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeGreaterThan(0.05)
      }
    })
  })

  describe('IR regressivo', () => {
    it('até 180 dias: 22,5%', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 6,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.225)
    })

    it('181 a 360 dias: 20%', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.2)
    })

    it('361 a 720 dias: 17,5%', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 18,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.175)
    })

    it('acima de 720 dias: 15%', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 36,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.15)
    })

    it('helper getPrazoIR cobre todas as faixas', () => {
      expect(getPrazoIR(30)).toBe('ate180')
      expect(getPrazoIR(200)).toBe('181_360')
      expect(getPrazoIR(500)).toBe('361_720')
      expect(getPrazoIR(800)).toBe('acima720')
    })
  })

  describe('detalhamento e metadata', () => {
    it('inclui linha de IR no detalhamento', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        const linha = r.dados.detalhamento.find((d) => d.descricao.includes('IR'))
        expect(linha).toBeDefined()
      }
    })

    it('fonte jurídica é Lei 11.033/2004', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 0.12,
        tipo: 'prefixado',
        prazoMeses: 12,
      })
      if (r.sucesso) expect(r.dados.fonteJuridica).toContain('11.033/2004')
    })
  })
})
