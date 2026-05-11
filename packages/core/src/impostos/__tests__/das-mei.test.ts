import { describe, expect, it } from 'vitest'
import { calcularDASMEI, TETO_MEI_ANUAL } from '../das-mei'

describe('calcularDASMEI', () => {
  describe('validação', () => {
    it('rejeita faturamento anual negativo', () => {
      const r = calcularDASMEI({
        atividadePrincipal: 'comercio',
        faturamentoAnual: -100,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('cálculo por atividade', () => {
    it('comércio: INSS + ICMS', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'comercio' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.inss).toBe(75.9)
        expect(r.dados.dados.icms).toBe(1)
        expect(r.dados.dados.iss).toBe(0)
        expect(r.dados.dados.total).toBe(76.9)
      }
    })

    it('indústria: INSS + ICMS', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'industria' })
      if (r.sucesso) {
        expect(r.dados.dados.icms).toBe(1)
        expect(r.dados.dados.iss).toBe(0)
      }
    })

    it('serviço: INSS + ISS', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'servico' })
      if (r.sucesso) {
        expect(r.dados.dados.icms).toBe(0)
        expect(r.dados.dados.iss).toBe(5)
        expect(r.dados.dados.total).toBe(80.9)
      }
    })

    it('comércio + serviço: INSS + ICMS + ISS', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'comercio_servico' })
      if (r.sucesso) {
        expect(r.dados.dados.icms).toBe(1)
        expect(r.dados.dados.iss).toBe(5)
        expect(r.dados.dados.total).toBe(81.9)
      }
    })
  })

  describe('limite anual MEI', () => {
    it('faturamento dentro do limite', () => {
      const r = calcularDASMEI({
        atividadePrincipal: 'comercio',
        faturamentoAnual: 50000,
      })
      if (r.sucesso) {
        expect(r.dados.dados.dentroLimite).toBe(true)
        expect(r.dados.dados.tetoAnual).toBe(TETO_MEI_ANUAL)
        expect(r.dados.dados.tetoMensal).toBe(6750)
      }
    })

    it('faturamento acima do limite emite aviso', () => {
      const r = calcularDASMEI({
        atividadePrincipal: 'servico',
        faturamentoAnual: 100000,
      })
      if (r.sucesso) {
        expect(r.dados.dados.dentroLimite).toBe(false)
        const aviso = r.dados.detalhamento.find((d) => d.descricao.includes('ATENÇÃO'))
        expect(aviso).toBeDefined()
      }
    })

    it('sem faturamento informado: dentroLimite = true por padrão', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'comercio' })
      if (r.sucesso) {
        expect(r.dados.dados.dentroLimite).toBe(true)
        // Não deve ter linha de aviso no detalhamento
        const aviso = r.dados.detalhamento.find((d) => d.descricao.includes('ATENÇÃO'))
        expect(aviso).toBeUndefined()
      }
    })

    it('limite exato no teto = dentro do limite', () => {
      const r = calcularDASMEI({
        atividadePrincipal: 'servico',
        faturamentoAnual: TETO_MEI_ANUAL,
      })
      if (r.sucesso) expect(r.dados.dados.dentroLimite).toBe(true)
    })
  })

  describe('metadata', () => {
    it('fonte jurídica é LC 123/2006', () => {
      const r = calcularDASMEI({ atividadePrincipal: 'servico' })
      if (r.sucesso) expect(r.dados.fonteJuridica).toContain('LC 123')
    })
  })
})
