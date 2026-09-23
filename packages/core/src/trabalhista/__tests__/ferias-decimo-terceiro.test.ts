import { describe, expect, it } from 'vitest'
import { calcularFeriasDecimoTerceiro } from '../ferias-decimo-terceiro'
import { calcularFerias } from '../ferias'
import { calcularDecimoTerceiro } from '../decimo-terceiro'
import { arredondar } from '../../utils'

describe('calcularFeriasDecimoTerceiro (F69)', () => {
  const BASE = { salarioBruto: 3000, mesAdmissao: null } as const

  describe('composição', () => {
    it('reproduz exatamente as duas calculadoras de origem', () => {
      // A invariante que mais importa: a página combinada não pode divergir
      // das páginas individuais. Se `calcularFerias` ou `calcularDecimoTerceiro`
      // mudarem de regra, é aqui que a divergência aparece.
      const r = calcularFeriasDecimoTerceiro(BASE)
      const ferias = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, numeroDependentes: 0 })
      const decimo = calcularDecimoTerceiro({
        salarioBruto: 3000,
        mesAdmissao: null,
        numeroDependentesIRRF: 0,
        parcela: 'total',
      })
      expect(r.sucesso && ferias.sucesso && decimo.sucesso).toBe(true)
      if (r.sucesso && ferias.sucesso && decimo.sucesso) {
        expect(r.dados.dados.feriasLiquido).toBe(ferias.dados.dados.totalLiquido)
        expect(r.dados.dados.decimoLiquido).toBe(decimo.dados.dados.valorLiquido)
        expect(r.dados.dados.totalLiquido).toBe(
          arredondar(ferias.dados.dados.totalLiquido + decimo.dados.dados.valorLiquido),
        )
      }
    })

    it('R$ 3.000, ano inteiro: R$ 3.631,40 + R$ 2.751,40 = R$ 6.382,80', () => {
      const r = calcularFeriasDecimoTerceiro(BASE)
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const d = r.dados.dados
        expect(d.feriasLiquido).toBe(3631.4)
        expect(d.primeiraParcela).toBe(1500)
        expect(d.segundaParcela).toBe(1251.4)
        expect(d.totalLiquido).toBe(6382.8)
        expect(r.dados.resultado).toBe(d.totalLiquido)
      }
    })

    it('as duas parcelas do 13º somam o líquido do 13º', () => {
      for (const salarioBruto of [1621, 2500, 4000, 7500, 12000]) {
        const r = calcularFeriasDecimoTerceiro({ salarioBruto, mesAdmissao: null })
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          const d = r.dados.dados
          expect(arredondar(d.primeiraParcela + d.segundaParcela), `salário ${salarioBruto}`).toBe(
            d.decimoLiquido,
          )
        }
      }
    })
  })

  describe('o que a página promete no texto', () => {
    it('avisa que o salário do mês NÃO entra no total', () => {
      // É a armadilha desta página, espelho da do F58: lá o erro era somar o
      // que já estava contido; aqui é achar que o contracheque entra.
      const r = calcularFeriasDecimoTerceiro(BASE)
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.avisos?.join(' ')).toContain('NÃO inclui o salário do mês')
      }
    })

    it('adiantar a 1ª parcela muda o que cai com as férias, não o total', () => {
      const normal = calcularFeriasDecimoTerceiro(BASE)
      const adiantado = calcularFeriasDecimoTerceiro({ ...BASE, adiantarPrimeiraParcela: true })
      expect(normal.sucesso && adiantado.sucesso).toBe(true)
      if (normal.sucesso && adiantado.sucesso) {
        expect(adiantado.dados.dados.totalLiquido).toBe(normal.dados.dados.totalLiquido)
        expect(adiantado.dados.dados.recebeComAsFerias).toBe(5131.4)
        expect(normal.dados.dados.recebeComAsFerias).toBe(3631.4)
        expect(adiantado.dados.avisos?.join(' ')).toContain('janeiro')
      }
    })

    it('vender 10 dias aumenta o total sem mudar o bruto das férias', () => {
      const inteiro = calcularFeriasDecimoTerceiro(BASE)
      const vendido = calcularFeriasDecimoTerceiro({ ...BASE, diasAbono: 10 })
      expect(inteiro.sucesso && vendido.sucesso).toBe(true)
      if (inteiro.sucesso && vendido.sucesso) {
        expect(vendido.dados.dados.feriasBruto).toBe(inteiro.dados.dados.feriasBruto)
        expect(vendido.dados.dados.totalLiquido).toBe(6535.71)
        expect(vendido.dados.dados.totalLiquido).toBeGreaterThan(
          inteiro.dados.dados.totalLiquido,
        )
      }
    })
  })

  describe('proporcionalidade e faltas', () => {
    it('admissão em maio dá 8/12 de 13º e não mexe nas férias', () => {
      const r = calcularFeriasDecimoTerceiro({ salarioBruto: 3000, mesAdmissao: 5 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.mesesDireito).toBe(8)
        expect(r.dados.dados.decimoBruto).toBe(2000)
        expect(r.dados.dados.feriasLiquido).toBe(3631.4)
        expect(r.dados.dados.totalLiquido).toBe(5475.71)
      }
    })

    it('faltas cortam as férias e não o 13º (CLT art. 130)', () => {
      const r = calcularFeriasDecimoTerceiro({ ...BASE, diasFaltas: 8 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasGozados).toBe(24)
        expect(r.dados.dados.decimoBruto).toBe(3000)
        expect(r.dados.dados.totalLiquido).toBe(5678.8)
      }
    })

    it('dependentes abatem nas duas contas', () => {
      const sem = calcularFeriasDecimoTerceiro({ salarioBruto: 6000, mesAdmissao: null })
      const com = calcularFeriasDecimoTerceiro({
        salarioBruto: 6000,
        mesAdmissao: null,
        numeroDependentes: 2,
      })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.totalIRRF).toBeLessThan(sem.dados.dados.totalIRRF)
        expect(com.dados.dados.totalLiquido).toBe(11222.57)
        expect(sem.dados.dados.totalLiquido).toBe(11014.03)
      }
    })
  })

  describe('validação', () => {
    it('salário inválido devolve erro', () => {
      const r = calcularFeriasDecimoTerceiro({ salarioBruto: 0, mesAdmissao: null })
      expect(r.sucesso).toBe(false)
    })

    it('mês de admissão fora de 1-12 devolve erro', () => {
      const r = calcularFeriasDecimoTerceiro({ salarioBruto: 3000, mesAdmissao: 13 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe('mesAdmissao')
    })
  })
})
