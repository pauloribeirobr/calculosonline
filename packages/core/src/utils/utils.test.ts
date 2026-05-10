import { describe, expect, it } from 'vitest'
import { arredondarReais, naoNegativo } from './index'

describe('arredondarReais', () => {
  it('arredonda para 2 casas decimais', () => {
    expect(arredondarReais(10.456)).toBe(10.46)
    expect(arredondarReais(10.454)).toBe(10.45)
    expect(arredondarReais(10)).toBe(10)
  })
})

describe('naoNegativo', () => {
  it('aceita valores >= 0', () => {
    expect(naoNegativo(0, 'salario')).toBe(0)
    expect(naoNegativo(100, 'salario')).toBe(100)
  })

  it('lança erro para valores negativos', () => {
    expect(() => naoNegativo(-1, 'salario')).toThrow('salario não pode ser negativo')
  })
})
