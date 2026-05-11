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
  })
})
