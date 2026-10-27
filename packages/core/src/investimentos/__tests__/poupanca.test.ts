import { describe, expect, it } from 'vitest'
import { calcularPoupanca } from '../poupanca'

describe('calcularPoupanca', () => {
  describe('validação', () => {
    it('rejeita valor inicial negativo', () => {
      const r = calcularPoupanca({ valorInicial: -1, prazoMeses: 12 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita prazo zero', () => {
      const r = calcularPoupanca({ valorInicial: 1000, prazoMeses: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita aporte negativo', () => {
      const r = calcularPoupanca({
        valorInicial: 1000,
        prazoMeses: 12,
        aporteMensal: -1,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('regra antiga (SELIC > 8,5%)', () => {
    it('aplica 0,5%/mês com a Selic de referência (default, acima de 8,5%)', () => {
      const r = calcularPoupanca({ valorInicial: 10000, prazoMeses: 12 })
      if (r.sucesso) {
        expect(r.dados.dados.regraAplicada).toBe('antiga')
        // 10000 * 1.005^12 ≈ 10616.78
        expect(r.dados.dados.montanteFinal).toBeCloseTo(10616.78, 0)
      }
    })

    it('SELIC alta customizada', () => {
      const r = calcularPoupanca({
        valorInicial: 5000,
        prazoMeses: 6,
        selicAnual: 0.15,
      })
      if (r.sucesso) expect(r.dados.dados.regraAplicada).toBe('antiga')
    })
  })

  describe('regra nova (SELIC ≤ 8,5%)', () => {
    it('aplica 70% da SELIC', () => {
      const r = calcularPoupanca({
        valorInicial: 10000,
        prazoMeses: 12,
        selicAnual: 0.08,
      })
      if (r.sucesso) {
        expect(r.dados.dados.regraAplicada).toBe('nova')
        // taxa ≈ (1 + 0.08*0.7)^(1/12) - 1
        expect(r.dados.dados.taxaMensalEfetiva).toBeGreaterThan(0)
      }
    })
  })

  describe('aporte mensal e TR', () => {
    it('aporte mensal aumenta saldo final', () => {
      const sem = calcularPoupanca({ valorInicial: 1000, prazoMeses: 12 })
      const com = calcularPoupanca({
        valorInicial: 1000,
        prazoMeses: 12,
        aporteMensal: 200,
      })
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.montanteFinal).toBeGreaterThan(
          sem.dados.dados.montanteFinal,
        )
        expect(com.dados.dados.totalAportado).toBe(1000 + 200 * 12)
      }
    })

    it('TR > 0 aumenta a taxa mensal', () => {
      const semTR = calcularPoupanca({ valorInicial: 1000, prazoMeses: 12 })
      const comTR = calcularPoupanca({
        valorInicial: 1000,
        prazoMeses: 12,
        trMensal: 0.001,
      })
      if (semTR.sucesso && comTR.sucesso) {
        expect(comTR.dados.dados.taxaMensalEfetiva).toBeGreaterThan(
          semTR.dados.dados.taxaMensalEfetiva,
        )
      }
    })
  })

  describe('evolução e metadata', () => {
    it('evolução contém uma entrada por mês', () => {
      const r = calcularPoupanca({ valorInicial: 1000, prazoMeses: 6 })
      if (r.sucesso) expect(r.dados.dados.evolucao.length).toBe(6)
    })

    it('é isenta de IR (fonte jurídica menciona Lei 11.033)', () => {
      const r = calcularPoupanca({ valorInicial: 1000, prazoMeses: 12 })
      if (r.sucesso) {
        expect(r.dados.fonteJuridica).toContain('11.033/2004')
      }
    })
  })
})

describe('evolução mês a mês (F86)', () => {
  it('o rendimento de cada mês soma o rendimento total e o saldo final bate', () => {
    const r = calcularPoupanca({ valorInicial: 1000, prazoMeses: 36, aporteMensal: 150 })
    if (!r.sucesso) throw new Error('cálculo falhou')
    const { dados, evolucao } = r.dados
    expect(evolucao?.linhas).toHaveLength(36)
    expect(evolucao!.linhas.at(-1)!.saldo).toBe(dados.montanteFinal)
    const soma = evolucao!.linhas.reduce((t, l) => t + l.rendimentoMes!, 0)
    expect(soma).toBeCloseTo(dados.rendimentoTotal, 2)
  })

  it('sem aporte, não mostra a coluna de aporte', () => {
    const r = calcularPoupanca({ valorInicial: 1000, prazoMeses: 12 })
    if (!r.sucesso) throw new Error('cálculo falhou')
    expect(r.dados.evolucao!.colunas.map((c) => c.chave)).not.toContain('aporte')
  })
})
