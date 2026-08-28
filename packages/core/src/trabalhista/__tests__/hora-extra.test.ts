import { describe, expect, it } from 'vitest'
import { calcularHoraExtra } from '../hora-extra'
import { arredondar } from '../../utils'

describe('calcularHoraExtra', () => {
  describe('jornada 44h (220h/mês)', () => {
    it('hora extra dia útil (50%) → R$20,45 sobre R$3.000', () => {
      // 3000/220 = 13,6363... × 1,5 = 20,4545 → 20,45
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.valorPorHora).toBe(20.45)
    })

    it('domingo (100%) = dobro da hora normal', () => {
      const domingo = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'domingo',
      })
      expect(domingo.sucesso).toBe(true)
      if (domingo.sucesso) {
        const valorNormal = 3000 / 220
        expect(domingo.dados.dados.valorPorHora).toBe(arredondar(valorNormal * 2))
      }
    })

    it('feriado também é 100%', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'feriado',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.adicionalAplicado).toBe(1.0)
    })

    it('multiplica pelo número de horas', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.valorTotal).toBe(arredondar(20.45 * 2))
    })
  })

  describe('outras jornadas pré-definidas', () => {
    it('40h → 200h/mês', () => {
      const r = calcularHoraExtra({
        salarioBruto: 4000,
        jornadaMensalHoras: '40h',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.jornadaMensal).toBe(200)
    })

    it('36h → 180h/mês', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3600,
        jornadaMensalHoras: '36h',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.jornadaMensal).toBe(180)
    })

    it('30h → 150h/mês', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '30h',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.jornadaMensal).toBe(150)
    })

    it('jornada personalizada via número de horas direto', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: 192,
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.jornadaMensal).toBe(192)
    })
  })

  describe('adicional negociado em CCT', () => {
    it('CCT com 75% sobrepõe o mínimo legal de 50%', () => {
      const negociado = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'util',
        adicionalNegociado: 0.75,
      })
      expect(negociado.sucesso).toBe(true)
      if (negociado.sucesso) {
        expect(negociado.dados.dados.adicionalAplicado).toBe(0.75)
      }
    })

    it('mantém o mínimo legal quando CCT pede menos', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'util',
        adicionalNegociado: 0.3,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.adicionalAplicado).toBe(0.5)
    })
  })

  describe('validação', () => {
    it('rejeita salário inválido', () => {
      const r = calcularHoraExtra({
        salarioBruto: 0,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita quantidade de horas zero', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 0,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita adicional negociado negativo', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'util',
        adicionalNegociado: -0.1,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita jornada "personalizada" como string sem o número', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: 'personalizada',
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita jornada numérica inválida (zero)', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: 0,
        quantidadeHoras: 1,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('minutos (F48)', () => {
    it('1h30 vale o mesmo que 1,5 hora decimal', () => {
      const comMinutos = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        quantidadeMinutos: 30,
        tipoHora: 'util',
      })
      const decimal = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1.5,
        tipoHora: 'util',
      })
      expect(comMinutos.sucesso && decimal.sucesso).toBe(true)
      if (comMinutos.sucesso && decimal.sucesso) {
        expect(comMinutos.dados.dados.valorTotal).toBe(decimal.dados.dados.valorTotal)
      }
    })

    it('aceita 0 hora quando há minutos — "45 minutos de hora extra"', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 0,
        quantidadeMinutos: 45,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.horasTotais).toBe(0.75)
    })

    it('continua rejeitando zero hora e zero minuto', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 0,
        quantidadeMinutos: 0,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita minutos fora de 0–59', () => {
      for (const quantidadeMinutos of [-1, 60, 90]) {
        const r = calcularHoraExtra({
          salarioBruto: 3000,
          jornadaMensalHoras: '44h',
          quantidadeHoras: 1,
          quantidadeMinutos,
          tipoHora: 'util',
        })
        expect(r.sucesso, `${quantidadeMinutos} deveria ser rejeitado`).toBe(false)
      }
    })
  })

  describe('adicional noturno (F48 — corrige divergência com o conteúdo)', () => {
    // Até 2026-08-27 o motor cobrava 1,5× na hora noturna enquanto o MDX da
    // página afirmava 1,80× (= 1,20 × 1,50). O conteúdo é que estava certo:
    // o adicional noturno do art. 73 incide sobre a hora normal e a hora extra
    // incide sobre essa base já adicionada.
    it('hora extra noturna é 1,80× a hora normal, não 1,50×', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'noturna',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.valorPorHora).toBe(arredondar((3000 / 220) * 1.2 * 1.5))
        expect(r.dados.dados.adicionalNoturnoAplicado).toBe(0.2)
      }
    })

    it('nenhum outro tipo recebe adicional noturno', () => {
      for (const tipoHora of ['util', 'domingo', 'feriado'] as const) {
        const r = calcularHoraExtra({
          salarioBruto: 3000,
          jornadaMensalHoras: '44h',
          quantidadeHoras: 1,
          tipoHora,
        })
        expect(r.sucesso).toBe(true)
        if (r.sucesso) expect(r.dados.dados.adicionalNoturnoAplicado).toBe(0)
      }
    })

    it('CCT noturna de 60% compõe com o adicional noturno (1,20 × 1,60)', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'noturna',
        adicionalNegociado: 0.6,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.valorPorHora).toBe(arredondar((3000 / 220) * 1.2 * 1.6))
      }
    })
  })

  describe('hora noturna reduzida (F48)', () => {
    it('1h de relógio à noite vale 1,14h de pagamento (60 ÷ 52,5)', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        tipoHora: 'noturna',
        horaNoturnaReduzida: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.horasTotais).toBe(arredondar(60 / 52.5))
    })

    it('a redução é ignorada fora do tipo noturna', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'util',
        horaNoturnaReduzida: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.horasTotais).toBe(2)
    })
  })

  describe('reflexo no DSR (F48)', () => {
    it('DSR = total das horas extras ÷ dias úteis × dias de descanso', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 10,
        tipoHora: 'util',
        dsr: { diasUteis: 25, diasDescanso: 5 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { valorTotal, valorDsr, valorTotalComDsr } = r.dados.dados
        expect(valorDsr).toBe(arredondar((valorTotal / 25) * 5))
        expect(valorTotalComDsr).toBe(arredondar(valorTotal + valorDsr))
        // O resultado apresentado passa a ser o total COM o reflexo.
        expect(r.dados.resultado).toBe(valorTotalComDsr)
      }
    })

    it('sem DSR pedido, o reflexo é zero e o resultado é o total puro', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 10,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.valorDsr).toBe(0)
        expect(r.dados.resultado).toBe(r.dados.dados.valorTotal)
      }
    })

    it('rejeita dias úteis zero (divisão por zero)', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 10,
        tipoHora: 'util',
        dsr: { diasUteis: 0, diasDescanso: 5 },
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dias de descanso negativos', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 10,
        tipoHora: 'util',
        dsr: { diasUteis: 25, diasDescanso: -1 },
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('detalhamento', () => {
    it('contém todas as 6 linhas esperadas', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.detalhamento).toHaveLength(6)
        expect(r.dados.detalhamento[0]?.descricao).toBe('Salário Bruto')
      }
    })

    it('DSR acrescenta duas linhas ao detalhamento', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'util',
        dsr: { diasUteis: 25, diasDescanso: 5 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.detalhamento).toHaveLength(8)
        expect(r.dados.detalhamento.at(-1)?.descricao).toBe('Total com DSR')
      }
    })

    it('noturna com hora reduzida acrescenta as duas linhas próprias', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 2,
        tipoHora: 'noturna',
        horaNoturnaReduzida: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes).toContain('Adicional Noturno (CLT art. 73)')
        expect(descricoes).toContain('Hora Noturna Reduzida (CLT art. 73 §1º)')
      }
    })

    it('rótulo do total mostra horas e minutos, não decimal', () => {
      const r = calcularHoraExtra({
        salarioBruto: 3000,
        jornadaMensalHoras: '44h',
        quantidadeHoras: 1,
        quantidadeMinutos: 30,
        tipoHora: 'util',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.detalhamento.at(-1)?.descricao).toBe('Total (1h30)')
      }
    })
  })
})
