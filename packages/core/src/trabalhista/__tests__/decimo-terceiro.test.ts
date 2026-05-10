import { describe, expect, it } from 'vitest'
import { calcularDecimoTerceiro } from '../decimo-terceiro'

describe('calcularDecimoTerceiro', () => {
  describe('validação', () => {
    it('rejeita salário zero', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 0,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: -1,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita mês de admissão fora do intervalo 1–12', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 13,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita mês de referência fora do intervalo 1–12', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        mesReferencia: 0,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('empregado com ano completo (mesAdmissao = null)', () => {
    it('parcela "total" gera valor bruto de R$3.000 para salário R$3.000', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.valorBruto).toBe(3000)
        expect(r.dados.dados.mesesDireito).toBe(12)
      }
    })

    it('1ª parcela = metade do bruto, sem descontos', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'primeira',
        mesReferencia: 12,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(0)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.valorLiquido).toBe(1500)
      }
    })

    it('2ª parcela deduz a 1ª parcela já recebida', () => {
      const total = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      const segunda = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'segunda',
      })
      expect(total.sucesso && segunda.sucesso).toBe(true)
      if (total.sucesso && segunda.sucesso) {
        // segunda parcela deve ser menor que o líquido total (porque 1ª já foi paga)
        expect(segunda.dados.dados.valorLiquido).toBeLessThan(total.dados.dados.valorLiquido)
      }
    })
  })

  describe('empregado admitido no ano corrente', () => {
    it('admitido em junho com >15 dias trabalhados → 7 meses de direito', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 6,
        diasTrabalhados: 20,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(7)
        // 3000/12 × 7 = 1750
        expect(r.dados.dados.valorBruto).toBe(1750)
      }
    })

    it('admitido em junho com <15 dias trabalhados → 6 meses', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 6,
        diasTrabalhados: 10,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.mesesDireito).toBe(6)
    })

    it('default de diasTrabalhados=30 conta o mês inteiro', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 7,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.mesesDireito).toBe(6)
    })
  })

  describe('1ª parcela em meio de ano sem mesAdmissao', () => {
    it('parcela "primeira" usa o mesReferencia como meses', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        mesReferencia: 6,
        numeroDependentesIRRF: 0,
        parcela: 'primeira',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(6)
        // Bruto para os 6 meses: 3000/12 × 6 = 1500; primeira = 750
        expect(r.dados.dados.valorLiquido).toBe(750)
      }
    })
  })

  describe('descontos do 13º', () => {
    it('salário alto sofre INSS e IRRF na 2ª parcela / total', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 8000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBeGreaterThan(0)
        expect(r.dados.dados.descontoIRRF).toBeGreaterThan(0)
      }
    })
  })

  describe('detalhamento', () => {
    it('parcela primeira tem 2 linhas', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'primeira',
        mesReferencia: 11,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.detalhamento).toHaveLength(2)
    })

    it('parcela segunda inclui linha "1ª Parcela (já recebida)"', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'segunda',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes.some((d) => d.includes('1ª Parcela (já recebida)'))).toBe(true)
      }
    })
  })
})
