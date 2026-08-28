import { describe, expect, it } from 'vitest'
import { calcularFerias } from '../ferias'
import { arredondar } from '../../utils'

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
  describe('precisão do valor diário (F57 — regressão)', () => {
    // Até 2026-08-27 o valor diário era arredondado ANTES de multiplicar pelos
    // dias, e o erro de centavos era multiplicado junto: R$ 2.000 de salário
    // rendia R$ 2.000,10 de férias (66,67 × 30). A suíte não pegou porque
    // todos os casos existentes usavam salário divisível por 30 — daí estes
    // testes usarem de propósito salários que NÃO são.
    it('férias de 30 dias equivalem exatamente ao salário do mês', () => {
      for (const salarioBruto of [2000, 2500, 3500, 4500, 5500, 6100, 9999]) {
        const r = calcularFerias({ salarioBruto, diasFaltas: 0 })
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          expect(r.dados.dados.salarioFerias, `salário ${salarioBruto}`).toBe(salarioBruto)
        }
      }
    })

    it('o total bruto de 30 dias é exatamente 4/3 do salário', () => {
      for (const salarioBruto of [2000, 2500, 3500, 7777]) {
        const r = calcularFerias({ salarioBruto, diasFaltas: 0 })
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          expect(r.dados.dados.totalBruto, `salário ${salarioBruto}`).toBe(
            arredondar(salarioBruto * (4 / 3)),
          )
        }
      }
    })

    it('vender 10 dias não muda o total além do centavo de arredondamento', () => {
      // Vender dias não pode fazer o trabalhador ganhar nem perder. Um centavo
      // de diferença é inevitável e correto: gozados, terço e abono são três
      // linhas arredondadas à parte, e é a soma das linhas exibidas que tem de
      // bater com o total exibido (ver o teste seguinte). O que não pode é a
      // diferença crescer com os dias, que era o defeito antigo.
      for (const salarioBruto of [2000, 2500, 3500, 4400]) {
        const inteiro = calcularFerias({ salarioBruto, diasFaltas: 0 })
        const vendido = calcularFerias({ salarioBruto, diasFaltas: 0, diasAbono: 10 })
        expect(inteiro.sucesso && vendido.sucesso).toBe(true)
        if (inteiro.sucesso && vendido.sucesso) {
          // `arredondar` na diferença porque subtrair dois floats de 2 casas
          // devolve 0.010000000000218 — a comparação crua reprovaria sozinha.
          const diferenca = arredondar(
            Math.abs(vendido.dados.dados.totalBruto - inteiro.dados.dados.totalBruto),
          )
          expect(diferenca, `salário ${salarioBruto}`).toBeLessThanOrEqual(0.01)
        }
      }
    })

    it('o detalhamento exibido sempre soma o total exibido', () => {
      // Invariante que vale mais que a igualdade exata acima: o usuário vê as
      // linhas e vê o total, e os dois têm de fechar. É por isso que os
      // componentes continuam arredondados um a um em vez de sair de um único
      // arredondamento no fim.
      const casos = [
        { salarioBruto: 2000, diasFaltas: 0 },
        { salarioBruto: 2500, diasFaltas: 0, diasAbono: 10 },
        { salarioBruto: 3500, diasFaltas: 8 },
        { salarioBruto: 4400, diasFaltas: 0, diasAbono: 10 },
        { salarioBruto: 7777, diasFaltas: 20 },
      ]
      for (const caso of casos) {
        const r = calcularFerias(caso)
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          const linhas = r.dados.detalhamento.filter((l) => l.descricao !== 'Total Bruto')
          const soma = arredondar(linhas.reduce((acc, l) => acc + l.valor, 0))
          expect(soma, JSON.stringify(caso)).toBe(r.dados.dados.totalBruto)
        }
      }
    })

    it('dias reduzidos por falta são proporção exata dos 30 dias', () => {
      // 8 faltas → 24 dias (CLT art. 130), ou seja 80% do salário.
      const r = calcularFerias({ salarioBruto: 2500, diasFaltas: 8 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasGozados).toBe(24)
        expect(r.dados.dados.salarioFerias).toBe(2000)
      }
    })
  })

})
