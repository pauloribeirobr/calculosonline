import { describe, expect, it } from 'vitest'
import {
  calcularTesouroDireto,
  TAXA_CUSTODIA_B3,
  LIMITE_ISENCAO_SELIC,
} from '../tesouro-direto'

describe('calcularTesouroDireto', () => {
  describe('validação', () => {
    it('rejeita valor inicial zero', () => {
      const r = calcularTesouroDireto({
        valorInicial: 0,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita prazo zero', () => {
      const r = calcularTesouroDireto({
        valorInicial: 1000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 0,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita taxa negativa', () => {
      const r = calcularTesouroDireto({
        valorInicial: 1000,
        tipo: 'prefixado',
        taxaAnual: -0.01,
        prazoMeses: 12,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('tipos', () => {
    it('prefixado: usa taxa anual fixa', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.12, 4)
      }
    })

    it('prefixado_cupom: também usa taxa fixa', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'prefixado_cupom',
        taxaAnual: 0.10,
        prazoMeses: 24,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.10, 4)
      }
    })

    it('selic: usa SELIC default', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'selic',
        taxaAnual: 0,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.1375, 4)
      }
    })

    it('selic: aceita SELIC customizada', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'selic',
        taxaAnual: 0,
        prazoMeses: 12,
        selicAnual: 0.10,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.10, 4)
      }
    })

    it('ipca_plus: combina IPCA + taxa real', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'ipca_plus',
        taxaAnual: 0.06,
        prazoMeses: 12,
        ipcaAnual: 0.04,
      })
      if (r.sucesso) {
        // (1.04 * 1.06) - 1 = 0.1024
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.1024, 4)
      }
    })

    it('ipca_cupom: também combina IPCA + taxa real', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'ipca_cupom',
        taxaAnual: 0.05,
        prazoMeses: 24,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeGreaterThan(0.05)
      }
    })
  })

  describe('custódia B3', () => {
    it('Tesouro SELIC até R$ 10.000 é isento de custódia', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'selic',
        taxaAnual: 0,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.custodiaIsenta).toBe(true)
        expect(r.dados.dados.custodia).toBe(0)
      }
    })

    it('Tesouro SELIC acima de R$ 10.000 paga custódia', () => {
      const r = calcularTesouroDireto({
        valorInicial: 20000,
        tipo: 'selic',
        taxaAnual: 0,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.custodiaIsenta).toBe(false)
        // F82: só os R$ 10.000 excedentes pagam — 10.000 × 0,20% × 1 ano = 20 (antes: 40)
        expect(r.dados.dados.custodia).toBe(20)
      }
    })

    it('Outros tipos sempre pagam custódia', () => {
      const r = calcularTesouroDireto({
        valorInicial: 5000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.custodiaIsenta).toBe(false)
        // 5000 * 0.002 * 1 ano = 10
        expect(r.dados.dados.custodia).toBeCloseTo(10, 1)
      }
    })

    it('constantes expostas', () => {
      expect(TAXA_CUSTODIA_B3).toBe(0.002)
      expect(LIMITE_ISENCAO_SELIC).toBe(10000)
    })
  })

  describe('IR regressivo', () => {
    // F82: 6 meses de calendário têm no mínimo 181 dias, então caem nos 20%.
    it('prazo de 6 meses → 20%', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 6,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.2)
    })

    it('prazo de 12 meses → 17,5%', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 12,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.175)
    })

    it('prazo longo (>720d) → 15%', () => {
      const r = calcularTesouroDireto({
        valorInicial: 10000,
        tipo: 'prefixado',
        taxaAnual: 0.12,
        prazoMeses: 36,
      })
      if (r.sucesso) expect(r.dados.dados.aliquotaIR).toBe(0.15)
    })
  })

  describe('detalhamento', () => {
    it('mostra linha de custódia isenta para Tesouro SELIC pequeno', () => {
      const r = calcularTesouroDireto({
        valorInicial: 5000,
        tipo: 'selic',
        taxaAnual: 0,
        prazoMeses: 12,
      })
      if (r.sucesso) {
        const linha = r.dados.detalhamento.find((d) => d.descricao.includes('Custódia'))
        expect(linha?.descricao).toContain('isenta')
      }
    })
  })
})

describe('evolução mês a mês (F86)', () => {
  it('a última linha bate com o detalhamento, inclusive a custódia', () => {
    const r = calcularTesouroDireto({
      valorInicial: 20000,
      tipo: 'selic',
      taxaAnual: 0,
      prazoMeses: 18,
    })
    if (!r.sucesso) throw new Error('cálculo falhou')
    const { dados, evolucao } = r.dados
    expect(evolucao?.linhas).toHaveLength(18)
    const ultima = evolucao!.linhas.at(-1)!
    expect(ultima.montanteBruto).toBe(dados.montanteBruto)
    expect(ultima.custodia).toBe(dados.custodia)
    expect(ultima.ir).toBe(dados.ir)
    expect(ultima.montanteLiquido).toBe(r.dados.resultado)
    expect(evolucao!.colunas.map((c) => c.chave)).toContain('custodia')
  })

  it('esconde a coluna de custódia quando ela é isenta', () => {
    const r = calcularTesouroDireto({
      valorInicial: 5000,
      tipo: 'selic',
      taxaAnual: 0,
      prazoMeses: 12,
    })
    if (!r.sucesso) throw new Error('cálculo falhou')
    expect(r.dados.evolucao!.colunas.map((c) => c.chave)).not.toContain('custodia')
  })
})
