import { describe, expect, it } from 'vitest'
import { calcularFerias } from '../ferias'

describe('calcularFerias', () => {
  describe('validação', () => {
    it('rejeita salário inválido', () => {
      const r = calcularFerias({ salarioBruto: 0, diasFaltas: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita faltas negativas', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: -1 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita faltas > 365', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 400 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dias de abono negativos', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, diasAbono: -1 })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('tabela de dias por faltas (CLT art. 130)', () => {
    it('0–5 faltas → 30 dias', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 5 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasDireito).toBe(30)
    })

    it('6–14 faltas → 24 dias', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 10 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasDireito).toBe(24)
    })

    it('15–23 faltas → 18 dias', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 20 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasDireito).toBe(18)
    })

    it('24–32 faltas → 12 dias', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 30 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasDireito).toBe(12)
    })

    it('>32 faltas → perde direito (CLT art. 133)', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 40 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.perdeuDireito).toBe(true)
        expect(r.dados.dados.totalBruto).toBe(0)
      }
    })
  })

  describe('cálculo de valor', () => {
    it('R$3.000 + 30 dias + 0 faltas = R$4.000 brutos (3000 + 1/3)', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.salarioFerias).toBe(3000)
        expect(r.dados.dados.adicionalTerco).toBe(1000)
        expect(r.dados.dados.totalBruto).toBe(4000)
      }
    })

    it('valor diário usa divisor 30', () => {
      const r = calcularFerias({ salarioBruto: 1500, diasFaltas: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.salarioFerias).toBe(1500)
    })
  })

  describe('abono pecuniário', () => {
    it('limita o abono em 1/3 dos dias de direito', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, diasAbono: 30 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasAbono).toBe(10)
        expect(r.dados.dados.diasGozados).toBe(20)
      }
    })

    it('aceita abono dentro do limite (10 dias para 30 de direito)', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, diasAbono: 10 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasAbono).toBe(10)
        expect(r.dados.dados.valorAbono).toBeCloseTo(1333.33, 2)
      }
    })
  })

  describe('férias em atraso', () => {
    it('dobra o valor total (CLT art. 137)', () => {
      const normal = calcularFerias({ salarioBruto: 3000, diasFaltas: 0 })
      const atraso = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, emAtraso: true })
      expect(normal.sucesso && atraso.sucesso).toBe(true)
      if (normal.sucesso && atraso.sucesso) {
        expect(atraso.dados.dados.totalBruto).toBe(normal.dados.dados.totalBruto * 2)
      }
    })
  })

  describe('detalhamento', () => {
    it('inclui Salário, 1/3, Abono e Total quando aplicável', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, diasAbono: 10 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes.some((d) => d.includes('Salário de Férias'))).toBe(true)
        expect(descricoes.some((d) => d.includes('Adicional 1/3'))).toBe(true)
        expect(descricoes.some((d) => d.includes('Abono'))).toBe(true)
        expect(descricoes).toContain('Total Bruto')
      }
    })

    it('inclui linha de "em atraso" quando aplicável', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, emAtraso: true })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes.some((d) => d.includes('Atraso'))).toBe(true)
      }
    })

    it('detalhamento de quem perdeu o direito tem só uma linha', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 50 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.detalhamento).toHaveLength(1)
        expect(r.dados.detalhamento[0]?.descricao).toContain('Perdeu')
      }
    })
  })
})
