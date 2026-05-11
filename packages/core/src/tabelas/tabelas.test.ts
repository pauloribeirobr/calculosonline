import { describe, expect, it } from 'vitest'
import {
  PISOS_REGIONAIS_2026,
  TABELAS_2026,
  calcularINSSProgressivo,
  calcularIRRFMensal,
  getPisoRegional,
  getTabelasVigentes,
} from './index'

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

  it('respeita vigenciaFim em tabelas históricas', () => {
    const tabela2025: typeof TABELAS_2026 = {
      ...TABELAS_2026,
      vigenciaInicio: '2025-01-01',
      vigenciaFim: '2025-12-31',
      salarioMinimo: 1412,
    }
    const historico = [tabela2025, TABELAS_2026]

    expect(getTabelasVigentes(new Date('2025-06-15'), historico)).toBe(tabela2025)
    expect(getTabelasVigentes(new Date('2026-06-15'), historico)).toBe(TABELAS_2026)
  })
})

describe('PISOS_REGIONAIS_2026', () => {
  it('contém ao menos 15 UFs', () => {
    expect(PISOS_REGIONAIS_2026.length).toBeGreaterThanOrEqual(15)
  })

  it('São Paulo tem piso regional próprio acima do mínimo federal', () => {
    const sp = PISOS_REGIONAIS_2026.find((p) => p.uf === 'SP')
    expect(sp?.valor).toBe(1700.0)
  })
})

describe('getPisoRegional', () => {
  it('retorna piso de SP para uf="SP"', () => {
    expect(getPisoRegional('SP')).toBe(1700.0)
  })

  it('aceita UF em minúsculas', () => {
    expect(getPisoRegional('rs')).toBe(1636.94)
  })

  it('faz fallback para salário mínimo federal quando UF desconhecida', () => {
    expect(getPisoRegional('ZZ')).toBe(TABELAS_2026.salarioMinimo)
  })
})

describe('calcularINSSProgressivo', () => {
  it('salário mínimo (R$1.518) → faixa 1, INSS R$113,85', () => {
    const r = calcularINSSProgressivo(1518)
    expect(r.valorINSS).toBe(113.85)
    expect(r.detalhamento).toHaveLength(1)
  })

  it('R$3.000 → soma das 3 primeiras faixas (R$253,41)', () => {
    // Faixa 1: 1518 × 7,5%       = R$ 113,85
    // Faixa 2: (2793,88-1518) × 9%  = 1.275,88 × 9% = R$ 114,83
    // Faixa 3: (3000-2793,89) × 12% = 206,11   × 12% = R$ 24,73
    const r = calcularINSSProgressivo(3000)
    expect(r.valorINSS).toBe(253.41)
    expect(r.detalhamento).toHaveLength(3)
  })

  it('salário acima do teto (R$10.000) é capado pelo teto INSS', () => {
    const r = calcularINSSProgressivo(10000)
    const noTeto = calcularINSSProgressivo(8157.41)
    expect(r.valorINSS).toBe(noTeto.valorINSS)
  })

  it('R$0 não gera nenhuma faixa', () => {
    const r = calcularINSSProgressivo(0)
    expect(r.valorINSS).toBe(0)
    expect(r.detalhamento).toHaveLength(0)
  })

  it('aceita tabela injetada com faixa final aberta (ate=null) e marca como "teto"', () => {
    // Cenário hipotético — faixa final sem teto, como em tabelas anteriores a 1991
    const tabelaHipotetica = {
      ...TABELAS_2026,
      inss: [
        { de: 0, ate: 1500, aliquota: 0.08 },
        { de: 1500.01, ate: null, aliquota: 0.11 },
      ],
    }
    const r = calcularINSSProgressivo(5000, tabelaHipotetica)
    expect(r.detalhamento[1]?.faixa).toBe('teto')
    expect(r.valorINSS).toBeGreaterThan(0)
  })
})

describe('calcularIRRFMensal', () => {
  it('isenção quando base ≤ R$2.428,80', () => {
    const r = calcularIRRFMensal({ salarioBruto: 2500, inss: 200, numeroDependentes: 0 })
    expect(r.valorIRRF).toBe(0)
  })

  it('faixa de 7,5% aplicada com a parcela a deduzir', () => {
    // base = 3000 - 250 = 2750 → faixa 7,5% (2428,81–2826,65)
    // 2750 × 0,075 - 182,16 = 24,09
    const r = calcularIRRFMensal({ salarioBruto: 3000, inss: 250, numeroDependentes: 0 })
    expect(r.aliquota).toBe(0.075)
    expect(r.valorIRRF).toBeCloseTo(24.09, 2)
  })

  it('desconta dependentes da base', () => {
    const semDep = calcularIRRFMensal({ salarioBruto: 5000, inss: 500, numeroDependentes: 0 })
    const comDep = calcularIRRFMensal({ salarioBruto: 5000, inss: 500, numeroDependentes: 2 })
    expect(comDep.baseCalculo).toBe(arredondar(semDep.baseCalculo - 2 * 189.59))
    expect(comDep.valorIRRF).toBeLessThan(semDep.valorIRRF)
  })

  it('aceita outras deduções (plano de saúde, previdência privada)', () => {
    const r = calcularIRRFMensal({
      salarioBruto: 5000,
      inss: 500,
      numeroDependentes: 0,
      outrasDeducoes: 300,
    })
    expect(r.baseCalculo).toBe(arredondar(5000 - 500 - 300))
  })

  it('nunca retorna IRRF negativo', () => {
    // Caso degenerado em que dedução excede o imposto apurado
    const r = calcularIRRFMensal({ salarioBruto: 2500, inss: 200, numeroDependentes: 10 })
    expect(r.valorIRRF).toBeGreaterThanOrEqual(0)
  })
})

// Pequeno helper local — evita importar utils só para o teste
function arredondar(v: number): number {
  return Math.round(v * 100) / 100
}
