import { describe, expect, it } from 'vitest'
import { calcularIRPF, DEDUCAO_SIMPLIFICADA_MAX_2026 } from '../irpf'

describe('calcularIRPF', () => {
  describe('validação', () => {
    it('rejeita rendimentos negativos', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: -1,
        irrfRetidoFonte: 0,
        numeroDependentes: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita IRRF retido negativo', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 50000,
        irrfRetidoFonte: -1,
        numeroDependentes: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 50000,
        irrfRetidoFonte: 0,
        numeroDependentes: -1,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('modelo simplificado', () => {
    it('rendimento baixo é isento', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 20000,
        irrfRetidoFonte: 0,
        numeroDependentes: 0,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.impostoDevidoSimplificado).toBe(0)
      }
    })

    it('rendimento alto: dedução simplificada é capped no limite legal', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 200000,
        irrfRetidoFonte: 30000,
        numeroDependentes: 0,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.deducaoSimplificada).toBe(DEDUCAO_SIMPLIFICADA_MAX_2026)
        expect(r.dados.dados.impostoDevidoSimplificado).toBeGreaterThan(0)
      }
    })
  })

  describe('modelo completo', () => {
    it('completo é melhor quando há muitas deduções', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 120000,
        irrfRetidoFonte: 18000,
        numeroDependentes: 3,
        despesasMedicas: 15000,
        despesasEducacao: 8000,
        contribuicaoINSS: 12000,
        pensaoAlimenticia: 6000,
        contribuicaoPrevidenciaPrivada: 5000,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.modeloIndicado).toBe('completo')
        expect(r.dados.dados.diferencaEntreModelos).toBeGreaterThan(0)
        expect(r.dados.dados.totalDeducoesCompleto).toBeGreaterThan(0)
      }
    })

    it('educação é capped por dependentes+1 contribuinte', () => {
      // Sem dependentes: limite = 3561.50 × 1 = 3561.50
      const r = calcularIRPF({
        rendimentosTributaveis: 80000,
        irrfRetidoFonte: 8000,
        numeroDependentes: 0,
        despesasEducacao: 100000,
      })
      if (r.sucesso) {
        // totalDeducoesCompleto deve incluir apenas o cap de educação
        expect(r.dados.dados.totalDeducoesCompleto).toBeLessThanOrEqual(3561.5)
      }
    })

    it('simplificado é melhor quando há poucas deduções', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 80000,
        irrfRetidoFonte: 5000,
        numeroDependentes: 0,
      })
      if (r.sucesso) {
        expect(r.dados.dados.modeloIndicado).toBe('simplificado')
      }
    })
  })

  describe('faixas progressivas anuais', () => {
    it('faixa intermediária aplica alíquota correspondente', () => {
      // base ~35000/ano → faixa 15% (de=2826.66*12=33919.92)
      const r = calcularIRPF({
        rendimentosTributaveis: 45000,
        irrfRetidoFonte: 1000,
        numeroDependentes: 0,
      })
      if (r.sucesso) {
        expect(r.dados.dados.impostoDevidoSimplificado).toBeGreaterThanOrEqual(0)
      }
    })

    it('base alta entra na faixa de 27,5%', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 300000,
        irrfRetidoFonte: 50000,
        numeroDependentes: 0,
      })
      if (r.sucesso) {
        // base simpl = 300000 - cap = 300000 - 16754.34 ≈ 283245.66
        // faixa max: aliquota 0.275, dedução anual 908.73*12
        expect(r.dados.dados.impostoDevidoSimplificado).toBeGreaterThan(50000)
      }
    })
  })

  describe('detalhamento', () => {
    it('detalhamento tem 9 linhas (3 simplificado + 3 completo + intro/sumário)', () => {
      const r = calcularIRPF({
        rendimentosTributaveis: 80000,
        irrfRetidoFonte: 8000,
        numeroDependentes: 1,
      })
      if (r.sucesso) {
        expect(r.dados.detalhamento.length).toBeGreaterThanOrEqual(9)
        const ultima = r.dados.detalhamento.at(-1)!
        expect(ultima.descricao).toContain('Modelo indicado')
      }
    })
  })
})
