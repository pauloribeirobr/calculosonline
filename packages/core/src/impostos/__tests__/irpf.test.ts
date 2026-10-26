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
        // base simpl = 300000 - 17640 = 282360 → 27,5% − 10.904,66
        expect(r.dados.dados.impostoDevidoSimplificado).toBeGreaterThan(50000)
      }
    })
  })

  // F81: valores conferidos à mão contra a tabela anual do exercício 2027
  // publicada pela Receita e o art. 11-A da Lei 9.250/1995 (Lei 15.270/2025).
  describe('declaração 2027 (ano-calendário 2026)', () => {
    const simplificado = (rendimentosTributaveis: number) => {
      const r = calcularIRPF({ rendimentosTributaveis, irrfRetidoFonte: 0, numeroDependentes: 0 })
      if (!r.sucesso) throw new Error('falhou')
      return r.dados.dados
    }

    it('desconto simplificado limitado a R$ 17.640,00', () => {
      expect(DEDUCAO_SIMPLIFICADA_MAX_2026).toBe(17640)
      expect(simplificado(100000).deducaoSimplificada).toBe(17640)
    })

    it('R$ 60.000: a tabela dá exatamente R$ 2.694,15, e a redução zera', () => {
      const d = simplificado(60000)
      expect(d.baseSimplificada).toBe(48000)
      expect(d.reducaoSimplificado).toBe(2694.15)
      expect(d.impostoDevidoSimplificado).toBe(0)
    })

    it('abaixo de R$ 60.000 a redução fica limitada ao imposto apurado', () => {
      // base 40.000 × 15% − 4.729,91 = 1.270,09
      const d = simplificado(50000)
      expect(d.reducaoSimplificado).toBe(1270.09)
      expect(d.impostoDevidoSimplificado).toBe(0)
    })

    it('entre R$ 60.000 e R$ 88.200 a redução é 8.429,73 − 0,095575 × rendimentos', () => {
      // base 64.000 × 27,5% − 10.904,66 = 6.695,34; redução 8.429,73 − 7.646,00 = 783,73
      const d = simplificado(80000)
      expect(d.reducaoSimplificado).toBe(783.73)
      expect(d.impostoDevidoSimplificado).toBe(5911.61)
    })

    it('acima de R$ 88.200 não há redução', () => {
      // base 82.360 × 27,5% − 10.904,66 = 11.744,34
      const d = simplificado(100000)
      expect(d.reducaoSimplificado).toBe(0)
      expect(d.impostoDevidoSimplificado).toBe(11744.34)
    })

    it('a redução usa o rendimento bruto também no modelo completo', () => {
      // deduções 7.000 + 2.275,08 = 9.275,08; base 60.724,92 × 27,5% − 10.904,66 = 5.794,69
      // redução 8.429,73 − 0,095575 × 70.000 = 1.739,48
      const r = calcularIRPF({
        rendimentosTributaveis: 70000,
        irrfRetidoFonte: 5000,
        numeroDependentes: 1,
        contribuicaoINSS: 7000,
      })
      if (!r.sucesso) throw new Error('falhou')
      expect(r.dados.dados.reducaoCompleto).toBe(1739.48)
      expect(r.dados.dados.impostoDevidoCompleto).toBe(4055.21)
      expect(r.dados.dados.impostoDevidoSimplificado).toBe(2755.86)
      expect(r.dados.dados.modeloIndicado).toBe('simplificado')
      expect(r.dados.detalhamento.map((i) => i.descricao)).toContain(
        'Completo — Redução da Lei 15.270/2025',
      )
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
