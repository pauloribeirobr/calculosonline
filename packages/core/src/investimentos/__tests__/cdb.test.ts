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

    it('cdi: 110% × CDI de referência (13,65%) = 15,015% a.a.', () => {
      const r = calcularCDB({
        valorInicial: 10000,
        taxaAnual: 1.1,
        tipo: 'cdi',
        prazoMeses: 12,
      })
      if (r.sucesso) {
        expect(r.dados.dados.taxaAnualEfetiva).toBeCloseTo(0.15015, 5)
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
    // F82: o prazo em meses vira dias de calendário (365,25/12 por mês). Antes,
    // 6 meses viravam 180 dias (22,5%) e 12 meses 360 dias (20%), um degrau
    // acima do que o banco retém de verdade.
    const aliquota = (prazoMeses: number) => {
      const r = calcularCDB({ valorInicial: 10000, taxaAnual: 0.12, tipo: 'prefixado', prazoMeses })
      if (!r.sucesso) throw new Error('falhou')
      return r.dados.dados.aliquotaIR
    }

    it('5 meses (152 dias): 22,5%', () => expect(aliquota(5)).toBe(0.225))
    it('6 meses (183 dias): 20%', () => expect(aliquota(6)).toBe(0.2))
    it('11 meses (335 dias): 20%', () => expect(aliquota(11)).toBe(0.2))
    it('12 meses (365 dias): 17,5%', () => expect(aliquota(12)).toBe(0.175))
    it('23 meses (700 dias): 17,5%', () => expect(aliquota(23)).toBe(0.175))
    it('24 meses (731 dias): 15%', () => expect(aliquota(24)).toBe(0.15))

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

describe('evolução mês a mês (F86)', () => {
  const r = calcularCDB({ valorInicial: 10000, taxaAnual: 1, tipo: 'cdi', prazoMeses: 24 })
  if (!r.sucesso) throw new Error('cálculo falhou')
  const { dados, evolucao } = r.dados

  it('tem uma linha por mês e a última bate com o detalhamento', () => {
    expect(evolucao?.linhas).toHaveLength(24)
    const ultima = evolucao!.linhas.at(-1)!
    expect(ultima.montanteBruto).toBe(dados.montanteBruto)
    expect(ultima.ir).toBe(dados.ir)
    expect(ultima.montanteLiquido).toBe(r.dados.resultado)
  })

  it('o rendimento de cada mês soma o rendimento bruto', () => {
    const soma = evolucao!.linhas.reduce((t, l) => t + l.rendimentoMes!, 0)
    expect(soma).toBeCloseTo(dados.rendimentoBruto, 2)
  })

  it('a faixa de IR muda conforme o mês do resgate', () => {
    // 5 meses = 152 dias; 6 = 183; 12 = 365; 24 = 730 (ver `diasDoPrazo`).
    const aliquotas: Array<[number, number]> = [
      [5, 0.225],
      [6, 0.2],
      [12, 0.175],
      [24, 0.15],
    ]
    for (const [mes, aliquota] of aliquotas) {
      const linha = evolucao!.linhas[mes - 1]!
      expect(linha.ir).toBeCloseTo((linha.montanteBruto! - 10000) * aliquota, 1)
    }
  })
})
