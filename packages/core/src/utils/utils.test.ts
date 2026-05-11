import { describe, expect, it } from 'vitest'
import * as Explainability from '../explainability'
import {
  anosCompletos,
  arredondar,
  diasNoMes,
  dividir,
  formatarBRL,
  mesesEntre,
  validarSalario,
} from './index'

describe('arredondar', () => {
  it('arredonda para 2 casas decimais', () => {
    expect(arredondar(10.456)).toBe(10.46)
    expect(arredondar(10.454)).toBe(10.45)
    expect(arredondar(10)).toBe(10)
  })

  it('aceita valores negativos', () => {
    expect(arredondar(-5.555)).toBe(-5.55)
  })
})

describe('dividir', () => {
  it('divide e arredonda em 2 casas', () => {
    expect(dividir(1518, 30)).toBe(50.6)
    expect(dividir(100, 3)).toBe(33.33)
  })

  it('lança erro ao dividir por zero', () => {
    expect(() => dividir(100, 0)).toThrow('Divisão por zero')
  })
})

describe('mesesEntre', () => {
  it('conta meses no mesmo ano', () => {
    expect(mesesEntre(new Date('2026-01-15'), new Date('2026-04-15'))).toBe(3)
  })

  it('conta meses entre anos diferentes', () => {
    expect(mesesEntre(new Date('2023-06-01'), new Date('2026-03-01'))).toBe(33)
  })

  it('retorna 0 para mesma data', () => {
    expect(mesesEntre(new Date('2026-01-15'), new Date('2026-01-15'))).toBe(0)
  })
})

describe('anosCompletos', () => {
  it('conta anos completos entre datas', () => {
    expect(anosCompletos(new Date('2020-03-15'), new Date('2026-03-15'))).toBe(6)
  })

  it('subtrai 1 quando aniversário ainda não chegou', () => {
    expect(anosCompletos(new Date('2020-06-15'), new Date('2026-05-15'))).toBe(5)
  })

  it('subtrai 1 quando ainda falta um dia para completar', () => {
    expect(anosCompletos(new Date('2020-06-15'), new Date('2026-06-14'))).toBe(5)
  })

  it('nunca retorna negativo', () => {
    expect(anosCompletos(new Date('2026-06-15'), new Date('2020-01-01'))).toBe(0)
  })
})

describe('diasNoMes', () => {
  it('janeiro tem 31 dias', () => {
    expect(diasNoMes(new Date('2026-01-15'))).toBe(31)
  })

  it('fevereiro de ano comum tem 28 dias', () => {
    expect(diasNoMes(new Date('2026-02-15'))).toBe(28)
  })

  it('fevereiro de ano bissexto tem 29 dias', () => {
    expect(diasNoMes(new Date('2024-02-15'))).toBe(29)
  })

  it('abril tem 30 dias', () => {
    expect(diasNoMes(new Date('2026-04-15'))).toBe(30)
  })
})

describe('validarSalario', () => {
  it('aceita salário positivo', () => {
    expect(validarSalario(1518)).toBeNull()
  })

  it('rejeita zero', () => {
    const erro = validarSalario(0)
    expect(erro).not.toBeNull()
    expect(erro?.campo).toBe('salario')
  })

  it('rejeita valor negativo', () => {
    expect(validarSalario(-100)).not.toBeNull()
  })

  it('rejeita NaN e Infinity', () => {
    expect(validarSalario(Number.NaN)).not.toBeNull()
    expect(validarSalario(Number.POSITIVE_INFINITY)).not.toBeNull()
  })

  it('aceita campo personalizado', () => {
    const erro = validarSalario(0, 'salarioBruto')
    expect(erro?.campo).toBe('salarioBruto')
  })
})

describe('formatarBRL', () => {
  it('formata com símbolo R$ e separadores brasileiros', () => {
    const resultado = formatarBRL(1234.56)
    expect(resultado).toContain('R$')
    expect(resultado).toContain('1.234,56')
  })

  it('formata zero', () => {
    expect(formatarBRL(0)).toContain('0,00')
  })
})

describe('criarMemoriaCalculo', () => {
  it('gera passos reproduzíveis a partir do detalhamento', () => {
    const memoria = Explainability.criarMemoriaCalculo(
      [
        { descricao: 'Salário Base', valor: 3000, tipo: 'neutro' },
        {
          descricao: 'INSS',
          valor: 280,
          tipo: 'debito',
          formula: 'Tabela progressiva por faixa',
        },
        { descricao: 'Total Líquido', valor: 2720, tipo: 'neutro' },
      ],
      { baseCalculo: 'Salário bruto - INSS' },
    )

    expect(memoria.resumo).toBe('Salário bruto - INSS')
    expect(memoria.passos).toHaveLength(3)
    expect(memoria.passos[0]).toMatchObject({
      id: 'passo-01-salario-base',
      ordem: 1,
      tipo: 'entrada',
    })
    expect(memoria.passos[1]?.formula).toBe('Tabela progressiva por faixa')
    expect(memoria.passos[2]?.tipo).toBe('resultado')
  })

  it('classifica avisos por termos configuráveis', () => {
    const memoria = Explainability.criarMemoriaCalculo(
      [
        {
          descricao: 'ATENÇÃO: faturamento acima do teto MEI',
          valor: 97000,
          tipo: 'debito',
        },
      ],
      { baseCalculo: 'Limite anual MEI' },
    )

    expect(memoria.passos[0]?.tipo).toBe('aviso')
  })
})
