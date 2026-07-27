import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calcularDecimoTerceiro } from '../decimo-terceiro'

describe('calcularDecimoTerceiro', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

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
    it('parcela "total" gera valor bruto de R$3.000 para salário R$3.000, 12 meses', () => {
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
        expect(r.dados.dados.descontoINSS).toBe(253.41)
        expect(r.dados.dados.descontoIRRF).toBe(23.83)
        expect(r.dados.dados.valorLiquido).toBe(2722.76)
      }
    })

    it('1ª parcela = metade do bruto, sem descontos, 12 meses de direito', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'primeira',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(12)
        expect(r.dados.dados.descontoINSS).toBe(0)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.valorLiquido).toBe(1500)
      }
    })

    it('2ª parcela: 12 meses de direito, INSS/IRRF sobre o valor bruto integral, deduzida a 1ª parcela', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'segunda',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(12)
        expect(r.dados.dados.valorBruto).toBe(3000)
        expect(r.dados.dados.descontoINSS).toBe(253.41)
        expect(r.dados.dados.descontoIRRF).toBe(23.83)
        expect(r.dados.dados.valorLiquido).toBe(1222.76)
      }
    })

    it('1ª parcela + 2ª parcela = total, para várias faixas salariais (regressão do bug de mês de referência)', () => {
      for (const salarioBruto of [1518, 2000, 3000, 5000, 8000, 12000]) {
        const total = calcularDecimoTerceiro({
          salarioBruto,
          mesAdmissao: null,
          numeroDependentesIRRF: 0,
          parcela: 'total',
        })
        const primeira = calcularDecimoTerceiro({
          salarioBruto,
          mesAdmissao: null,
          numeroDependentesIRRF: 0,
          parcela: 'primeira',
        })
        const segunda = calcularDecimoTerceiro({
          salarioBruto,
          mesAdmissao: null,
          numeroDependentesIRRF: 0,
          parcela: 'segunda',
        })
        expect(total.sucesso && primeira.sucesso && segunda.sucesso).toBe(true)
        if (total.sucesso && primeira.sucesso && segunda.sucesso) {
          const soma = primeira.dados.dados.valorLiquido + segunda.dados.dados.valorLiquido
          expect(Math.round(soma * 100) / 100).toBe(total.dados.dados.valorLiquido)
        }
      }
    })

    it('2ª parcela deduz a 1ª parcela já recebida (líquido da 2ª < líquido do total)', () => {
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
        expect(segunda.dados.dados.valorLiquido).toBeLessThan(total.dados.dados.valorLiquido)
      }
    })

    it('mais dependentes reduz o IRRF (e aumenta o líquido) da 2ª parcela e do total', () => {
      const semDependentes = calcularDecimoTerceiro({
        salarioBruto: 5000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'segunda',
      })
      const comDependentes = calcularDecimoTerceiro({
        salarioBruto: 5000,
        mesAdmissao: null,
        numeroDependentesIRRF: 2,
        parcela: 'segunda',
      })
      expect(semDependentes.sucesso && comDependentes.sucesso).toBe(true)
      if (semDependentes.sucesso && comDependentes.sucesso) {
        expect(comDependentes.dados.dados.descontoIRRF).toBeLessThan(
          semDependentes.dados.dados.descontoIRRF,
        )
        expect(comDependentes.dados.dados.valorLiquido).toBeGreaterThan(
          semDependentes.dados.dados.valorLiquido,
        )
      }
    })

    it('não passar mesReferencia não muda o resultado independente do mês real (regressão do bug)', () => {
      // Antes do fix, mesesDireito da 2ª parcela usava o mês real do sistema em vez de 12
      // meses fixos — calcular em julho dava um valor diferente de calcular em dezembro.
      for (const parcela of ['primeira', 'segunda', 'total'] as const) {
        const resultados = [1, 6, 7, 11, 12].map((mes) => {
          vi.setSystemTime(new Date(Date.UTC(2026, mes - 1, 15)))
          return calcularDecimoTerceiro({
            salarioBruto: 3000,
            mesAdmissao: null,
            numeroDependentesIRRF: 0,
            parcela,
          })
        })
        const mesesDireito = resultados.map((r) => (r.sucesso ? r.dados.dados.mesesDireito : null))
        expect(mesesDireito).toEqual([12, 12, 12, 12, 12])

        const liquidos = resultados.map((r) => (r.sucesso ? r.dados.dados.valorLiquido : null))
        expect(new Set(liquidos).size).toBe(1)
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

    it('admitido em janeiro com mês cheio → 12 meses (mesmo direito que quem já trabalhava)', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 1,
        diasTrabalhados: 30,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(12)
        expect(r.dados.dados.valorBruto).toBe(3000)
      }
    })

    it('admitido em dezembro com <15 dias → 0 meses de direito (bruto zero, sem erro)', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: 12,
        diasTrabalhados: 5,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(0)
        expect(r.dados.dados.valorBruto).toBe(0)
      }
    })

    it('1ª parcela + 2ª parcela = total também para admitido no ano corrente', () => {
      const params = {
        salarioBruto: 4200,
        mesAdmissao: 3,
        diasTrabalhados: 30,
        numeroDependentesIRRF: 1,
      }
      const total = calcularDecimoTerceiro({ ...params, parcela: 'total' })
      const primeira = calcularDecimoTerceiro({ ...params, parcela: 'primeira' })
      const segunda = calcularDecimoTerceiro({ ...params, parcela: 'segunda' })
      expect(total.sucesso && primeira.sucesso && segunda.sucesso).toBe(true)
      if (total.sucesso && primeira.sucesso && segunda.sucesso) {
        const soma = primeira.dados.dados.valorLiquido + segunda.dados.dados.valorLiquido
        expect(Math.round(soma * 100) / 100).toBe(total.dados.dados.valorLiquido)
      }
    })

    it('mesesDireito de quem foi admitido no ano não depende do mês real do sistema', () => {
      const rodar = () =>
        calcularDecimoTerceiro({
          salarioBruto: 3000,
          mesAdmissao: 6,
          diasTrabalhados: 20,
          numeroDependentesIRRF: 0,
          parcela: 'segunda',
        })

      vi.setSystemTime(new Date(Date.UTC(2026, 0, 15))) // janeiro
      const emJaneiro = rodar()
      vi.setSystemTime(new Date(Date.UTC(2026, 11, 15))) // dezembro
      const emDezembro = rodar()

      expect(emJaneiro.sucesso && emDezembro.sucesso).toBe(true)
      if (emJaneiro.sucesso && emDezembro.sucesso) {
        expect(emJaneiro.dados.dados.mesesDireito).toBe(7)
        expect(emDezembro.dados.dados.mesesDireito).toBe(7)
      }
    })
  })

  describe('1ª parcela em meio de ano sem mesAdmissao (mesReferencia ainda aceito, mas não altera o direito)', () => {
    it('mesReferencia continua sendo validado, mas mesesDireito é sempre 12 quando mesAdmissao é null', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        mesReferencia: 6,
        numeroDependentesIRRF: 0,
        parcela: 'primeira',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(12)
        expect(r.dados.dados.valorLiquido).toBe(1500)
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

    it('salário na faixa de isenção do IRRF (13º ≤ R$2.428,80) não gera desconto de IRRF', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 1518,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(113.85)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.valorLiquido).toBe(1404.15)
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

    it('parcela total NÃO inclui linha "1ª Parcela (já recebida)"', () => {
      const r = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes.some((d) => d.includes('1ª Parcela (já recebida)'))).toBe(false)
      }
    })
  })
})
