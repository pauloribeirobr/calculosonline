import { describe, expect, it } from 'vitest'
import { TABELAS_2026, getTabelasVigentes } from './index'

describe('TABELAS_2026', () => {
  it('declara vigência iniciando em 2026-01-01', () => {
    expect(TABELAS_2026.vigenciaInicio).toBe('2026-01-01')
  })

  it('tem salário mínimo 2026 = R$ 1.518,00', () => {
    expect(TABELAS_2026.salarioMinimo).toBe(1518.0)
  })

  it('tem 4 faixas no INSS sem buracos entre faixas', () => {
    expect(TABELAS_2026.inss).toHaveLength(4)
    for (let i = 1; i < TABELAS_2026.inss.length; i++) {
      const anterior = TABELAS_2026.inss[i - 1]
      const atual = TABELAS_2026.inss[i]
      if (!anterior || !atual || anterior.ate === null) {
        throw new Error('Faixa inválida detectada')
      }
      expect(atual.de).toBeGreaterThan(anterior.ate)
    }
  })

  it('tem 5 faixas no IRRF começando em isenção', () => {
    expect(TABELAS_2026.irrf).toHaveLength(5)
    expect(TABELAS_2026.irrf[0]?.aliquota).toBe(0)
  })

  it('última faixa do IRRF é aberta (ate = null)', () => {
    const ultima = TABELAS_2026.irrf[TABELAS_2026.irrf.length - 1]
    expect(ultima?.ate).toBeNull()
  })
})

describe('getTabelasVigentes', () => {
  it('retorna TABELAS_2026 para datas de 2026', () => {
    const t = getTabelasVigentes(new Date('2026-06-15'))
    expect(t).toBe(TABELAS_2026)
  })

  it('retorna TABELAS_2026 no primeiro dia de vigência', () => {
    const t = getTabelasVigentes(new Date('2026-01-01'))
    expect(t.vigenciaInicio).toBe('2026-01-01')
  })

  it('faz fallback para tabela mais recente quando data é anterior', () => {
    const t = getTabelasVigentes(new Date('2020-01-01'))
    expect(t).toBe(TABELAS_2026)
  })

  it('aceita chamada sem argumento usando data atual', () => {
    const t = getTabelasVigentes()
    expect(t).toBeDefined()
    expect(t.salarioMinimo).toBeGreaterThan(0)
  })
})
