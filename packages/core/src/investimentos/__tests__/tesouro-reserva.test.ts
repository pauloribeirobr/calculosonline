import { describe, expect, it } from 'vitest'
import {
  aliquotaIOF,
  calcularTesouroReserva,
  TABELA_IOF_REGRESSIVO,
  type TesouroReservaParams,
} from '../tesouro-reserva'
import { calcularTesouroDireto } from '../tesouro-direto'

const SELIC = 0.1375
const CDI = 0.1365

function dados(p: Omit<TesouroReservaParams, 'selicAnual' | 'cdiAnual'>) {
  const r = calcularTesouroReserva({ ...p, selicAnual: SELIC, cdiAnual: CDI })
  if (!r.sucesso) throw new Error(JSON.stringify(r.erros))
  return r.dados.dados
}

describe('calcularTesouroReserva', () => {
  describe('validação', () => {
    it('rejeita valor abaixo do mínimo de R$ 1', () => {
      expect(calcularTesouroReserva({ valorInicial: 0.5, prazo: 12, unidade: 'meses' }).sucesso).toBe(
        false,
      )
    })
    it('aceita exatamente R$ 1', () => {
      expect(calcularTesouroReserva({ valorInicial: 1, prazo: 12, unidade: 'meses' }).sucesso).toBe(true)
    })
    it('rejeita prazo zero ou fracionado', () => {
      expect(calcularTesouroReserva({ valorInicial: 100, prazo: 0, unidade: 'dias' }).sucesso).toBe(false)
      expect(calcularTesouroReserva({ valorInicial: 100, prazo: 1.5, unidade: 'meses' }).sucesso).toBe(
        false,
      )
    })
  })

  describe('tabela de IOF (Decreto 6.306/2007, Anexo)', () => {
    it('tem 30 linhas, de 96% a 0%', () => {
      expect(TABELA_IOF_REGRESSIVO).toHaveLength(30)
      expect(aliquotaIOF(1)).toBe(0.96)
      expect(aliquotaIOF(14)).toBe(0.53)
      expect(aliquotaIOF(22)).toBe(0.26)
      expect(aliquotaIOF(29)).toBe(0.03)
      expect(aliquotaIOF(30)).toBe(0)
      expect(aliquotaIOF(400)).toBe(0)
    })
  })

  describe('valores do texto da página (gerados pelo motor)', () => {
    it('R$ 1.000 por 12 meses: R$ 1.113,44, sem custódia', () => {
      const d = dados({ valorInicial: 1000, prazo: 12, unidade: 'meses' })
      expect(d.rendimentoBruto).toBe(137.5)
      expect(d.ir).toBe(24.06)
      expect(d.aliquotaIR).toBe(0.175)
      expect(d.custodia).toBe(0)
      expect(d.custodiaIsenta).toBe(true)
      expect(d.montanteLiquido).toBe(1113.44)
      expect(d.poupanca).toBe(1061.68)
      expect(d.cdb100).toBe(1112.61)
    })

    it.each([
      [100, 1, 100.84],
      [100, 24, 124.98],
      [1000, 1, 1008.36],
      [1000, 6, 1053.23],
      [10000, 1, 10083.65],
      [10000, 6, 10532.29],
      [10000, 12, 11134.37],
      [10000, 24, 12498.2],
    ])('R$ %d por %d meses: R$ %d', (valor, meses, esperado) => {
      expect(dados({ valorInicial: valor, prazo: meses, unidade: 'meses' }).montanteLiquido).toBe(esperado)
    })

    it.each([
      [7, 2.47, 1.88, 0.13, 1000.46],
      [15, 5.31, 2.66, 0.6, 1002.05],
      [29, 10.29, 0.31, 2.25, 1007.73],
      [30, 10.65, 0, 2.4, 1008.25],
    ])('R$ 1.000 por %d dias: bruto %d, IOF %d, IR %d, líquido %d', (dias, bruto, iof, ir, liq) => {
      const d = dados({ valorInicial: 1000, prazo: dias, unidade: 'dias' })
      expect(d.rendimentoBruto).toBe(bruto)
      expect(d.iof).toBe(iof)
      expect(d.ir).toBe(ir)
      expect(d.montanteLiquido).toBe(liq)
    })

    it('R$ 20.000 por 12 meses: custódia de R$ 20 só sobre o excedente, e o CDB passa à frente', () => {
      const d = dados({ valorInicial: 20000, prazo: 12, unidade: 'meses' })
      expect(d.custodia).toBe(20)
      expect(d.custodiaIsenta).toBe(false)
      expect(d.montanteLiquido).toBe(22248.75)
      expect(d.cdb100).toBe(22252.25)
    })
  })

  describe('regras', () => {
    it('IR incide sobre o rendimento menos o IOF', () => {
      const d = dados({ valorInicial: 10000, prazo: 10, unidade: 'dias' })
      expect(d.ir).toBe(Math.round(((d.rendimentoBruto as number) - (d.iof as number)) * 0.225 * 100) / 100)
    })

    it('poupança não rende antes do primeiro aniversário', () => {
      expect(dados({ valorInicial: 1000, prazo: 29, unidade: 'dias' }).poupanca).toBe(1000)
      expect(dados({ valorInicial: 1000, prazo: 30, unidade: 'dias' }).poupanca).toBe(1005)
    })

    it('em meses, dá o mesmo resultado do Tesouro Selic do site', () => {
      for (const [valor, meses] of [
        [1000, 12],
        [20000, 12],
        [5000, 24],
      ] as const) {
        const reserva = dados({ valorInicial: valor, prazo: meses, unidade: 'meses' })
        const selic = calcularTesouroDireto({
          valorInicial: valor,
          tipo: 'selic',
          taxaAnual: 0,
          prazoMeses: meses,
          selicAnual: SELIC,
        })
        expect(selic.sucesso && selic.dados.resultado).toBe(reserva.montanteLiquido)
      }
    })

    it('a última linha da tabela é o resultado do headline', () => {
      for (const p of [
        { valorInicial: 1000, prazo: 12, unidade: 'meses' as const },
        { valorInicial: 1000, prazo: 15, unidade: 'dias' as const },
      ]) {
        const r = calcularTesouroReserva({ ...p, selicAnual: SELIC, cdiAnual: CDI })
        if (!r.sucesso) throw new Error()
        const linhas = r.dados.evolucao!.linhas
        expect(linhas).toHaveLength(p.prazo)
        expect(linhas.at(-1)!.montanteLiquido).toBe(r.dados.resultado)
      }
    })

    it('sem tabela dia a dia acima de 60 dias', () => {
      const r = calcularTesouroReserva({ valorInicial: 1000, prazo: 90, unidade: 'dias' })
      expect(r.sucesso && r.dados.evolucao).toBeFalsy()
    })

    it('coluna de IOF só no resgate antes de 30 dias', () => {
      const colunas = (p: TesouroReservaParams) => {
        const r = calcularTesouroReserva(p)
        return r.sucesso ? r.dados.evolucao!.colunas.map((c) => c.chave) : []
      }
      expect(colunas({ valorInicial: 1000, prazo: 15, unidade: 'dias' })).toContain('iof')
      expect(colunas({ valorInicial: 1000, prazo: 45, unidade: 'dias' })).not.toContain('iof')
      expect(colunas({ valorInicial: 1000, prazo: 12, unidade: 'meses' })).not.toContain('iof')
    })
  })
})
