import { describe, expect, it } from 'vitest'
import { calcularFerias } from '../ferias'
import { calcularINSSProgressivo } from '../../tabelas'
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
      //
      // Com o F66 são dois totais na lista: as linhas de crédito acima do
      // "Total Bruto" somam o bruto, e o bruto menos as linhas de débito
      // (INSS e IRRF) fecha o "Total Líquido". O redutor aparece como crédito
      // **dentro** do bloco de descontos, por isso ele entra no segundo grupo.
      const casos = [
        { salarioBruto: 2000, diasFaltas: 0 },
        { salarioBruto: 2500, diasFaltas: 0, diasAbono: 10 },
        { salarioBruto: 3500, diasFaltas: 8 },
        { salarioBruto: 4400, diasFaltas: 0, diasAbono: 10 },
        { salarioBruto: 7777, diasFaltas: 20 },
        { salarioBruto: 9000, diasFaltas: 0, numeroDependentes: 2 },
      ]
      for (const caso of casos) {
        const r = calcularFerias(caso)
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          const linhas = r.dados.detalhamento
          const iBruto = linhas.findIndex((l) => l.descricao === 'Total Bruto')
          const creditos = arredondar(
            linhas.slice(0, iBruto).reduce((acc, l) => acc + l.valor, 0),
          )
          expect(creditos, JSON.stringify(caso)).toBe(r.dados.dados.totalBruto)

          const descontos = arredondar(
            linhas
              .slice(iBruto + 1)
              .filter((l) => l.descricao !== 'Total Líquido')
              .reduce((acc, l) => acc + (l.tipo === 'debito' ? l.valor : 0), 0),
          )
          expect(arredondar(r.dados.dados.totalBruto - descontos), JSON.stringify(caso)).toBe(
            r.dados.dados.totalLiquido,
          )
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

  describe('descontos de INSS e IRRF (F66)', () => {
    it('o headline passa a ser o líquido, não o bruto', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.totalBruto).toBe(4000)
        expect(r.dados.dados.descontoINSS).toBe(368.6)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.totalLiquido).toBe(3631.4)
        expect(r.dados.resultado).toBe(r.dados.dados.totalLiquido)
        expect(r.dados.rotuloResultado).toContain('líquido')
      }
    })

    it('o abono fica fora da base de INSS e IRRF (Lei 8.212/1991, art. 28, §9º)', () => {
      // R$ 4.000 com 20 dias gozados + 10 vendidos: mesmo bruto de quem tira
      // 30 dias (R$ 5.333,33), mas base tributável menor — e é isso que zera o
      // IRRF que apareceria nos 30 dias.
      const trinta = calcularFerias({ salarioBruto: 4000, diasFaltas: 0 })
      const vendido = calcularFerias({ salarioBruto: 4000, diasFaltas: 0, diasAbono: 10 })
      expect(trinta.sucesso && vendido.sucesso).toBe(true)
      if (trinta.sucesso && vendido.sucesso) {
        expect(trinta.dados.dados.baseTributavel).toBe(5333.33)
        expect(vendido.dados.dados.baseTributavel).toBe(3555.56)
        expect(trinta.dados.dados.descontoIRRF).toBe(122.45)
        expect(vendido.dados.dados.descontoIRRF).toBe(0)
        expect(vendido.dados.dados.totalLiquido).toBeGreaterThan(
          trinta.dados.dados.totalLiquido,
        )
      }
    })

    it('a dobra do art. 137 não é tributada', () => {
      const normal = calcularFerias({ salarioBruto: 3000, diasFaltas: 0 })
      const atraso = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, emAtraso: true })
      expect(normal.sucesso && atraso.sucesso).toBe(true)
      if (normal.sucesso && atraso.sucesso) {
        // Mesma base e mesmos descontos; o que dobra é só o que a pessoa recebe.
        expect(atraso.dados.dados.baseTributavel).toBe(normal.dados.dados.baseTributavel)
        expect(atraso.dados.dados.descontoINSS).toBe(normal.dados.dados.descontoINSS)
        expect(atraso.dados.dados.totalLiquido).toBe(
          arredondar(normal.dados.dados.totalLiquido + normal.dados.dados.totalBruto),
        )
        expect(atraso.dados.avisos?.join(' ')).toContain('art. 137')
      }
    })

    it('dependentes reduzem o IRRF das férias', () => {
      const sem = calcularFerias({ salarioBruto: 9000, diasFaltas: 0 })
      const com = calcularFerias({ salarioBruto: 9000, diasFaltas: 0, numeroDependentes: 2 })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(sem.dados.dados.descontoIRRF).toBeGreaterThan(com.dados.dados.descontoIRRF)
        expect(com.dados.dados.totalLiquido).toBeGreaterThan(sem.dados.dados.totalLiquido)
      }
    })

    it('dependente negativo é erro de validação', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0, numeroDependentes: -1 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe('numeroDependentes')
    })

    it('quem perdeu o direito não tem desconto nenhum', () => {
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 40 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.totalLiquido).toBe(0)
        expect(r.dados.dados.descontoINSS).toBe(0)
        expect(r.dados.dados.descontoIRRF).toBe(0)
      }
    })

    it('o INSS das férias bate com a tabela vigente, faixa a faixa', () => {
      // Base de R$ 4.000 (30 dias de R$ 3.000 + terço): a conta tem de ser a
      // mesma que a calculadora de INSS devolve para o mesmo valor.
      const r = calcularFerias({ salarioBruto: 3000, diasFaltas: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(
          calcularINSSProgressivo(r.dados.dados.baseTributavel).valorINSS,
        )
      }
    })
  })
})
