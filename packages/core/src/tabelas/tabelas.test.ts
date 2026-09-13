import { describe, expect, it } from 'vitest'
import {
  PISOS_REGIONAIS_2026,
  TABELAS_2026,
  calcularINSSProgressivo,
  calcularIRRFMensal,
  calcularRedutorIRRF,
  getPisoRegional,
  getTabelasVigentes,
} from './index'

describe('TABELAS_2026', () => {
  it('declara vigência iniciando em 2026-01-01', () => {
    expect(TABELAS_2026.vigenciaInicio).toBe('2026-01-01')
  })

  it('tem salário mínimo 2026 = R$ 1.621,00', () => {
    expect(TABELAS_2026.salarioMinimo).toBe(1621.0)
  })

  it('tem 4 faixas no INSS contínuas (piso = teto da faixa anterior)', () => {
    // Contíguas pelo valor exato, não `+ 0,01`: encurtar cada faixa em um
    // centavo faz a contribuição no teto fechar em R$ 988,10 em vez dos
    // R$ 988,09 da Portaria MPS/MF nº 13/2026.
    expect(TABELAS_2026.inss).toHaveLength(4)
    for (let i = 1; i < TABELAS_2026.inss.length; i++) {
      const anterior = TABELAS_2026.inss[i - 1]
      const atual = TABELAS_2026.inss[i]
      if (!anterior || !atual || anterior.ate === null) {
        throw new Error('Faixa inválida detectada')
      }
      expect(atual.de).toBe(anterior.ate)
    }
  })

  it('teto do INSS 2026 = R$ 8.475,55', () => {
    expect(TABELAS_2026.inss[TABELAS_2026.inss.length - 1]?.ate).toBe(8475.55)
  })

  it('desconto simplificado = 25% do limite de isenção', () => {
    expect(TABELAS_2026.descontoSimplificadoIRRF).toBe(
      arredondar(TABELAS_2026.limiteIsencaoIRRF * 0.25),
    )
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
  it('salário mínimo (R$1.621) → faixa 1, INSS R$121,58', () => {
    // 1.621 × 7,5% = 121,575 → 121,58. Trava o fix de arredondamento: em
    // float o produto dá 121.57499999999999 e um Math.round direto devolveria
    // R$ 121,57, um centavo abaixo da tabela oficial.
    const r = calcularINSSProgressivo(1621)
    expect(r.valorINSS).toBe(121.58)
    expect(r.detalhamento).toHaveLength(1)
  })

  it('R$3.000 → soma das 3 primeiras faixas (R$248,60)', () => {
    // Faixa 1: 1.621 × 7,5%              = R$ 121,58
    // Faixa 2: (2.902,84 − 1.621) × 9%   = 1.281,84 × 9%  = R$ 115,36
    // Faixa 3: (3.000 − 2.902,84) × 12%  =    97,16 × 12% = R$  11,66
    const r = calcularINSSProgressivo(3000)
    expect(r.valorINSS).toBe(248.6)
    expect(r.detalhamento).toHaveLength(3)
  })

  it('no teto, a contribuição máxima é R$988,09 e as faixas somam o total', () => {
    // Número publicado na Portaria MPS/MF nº 13/2026. Arredondar faixa por
    // faixa daria R$ 988,10 — ver o comentário de `calcularINSSProgressivo`.
    const r = calcularINSSProgressivo(8475.55)
    expect(r.valorINSS).toBe(988.09)
    const somaLinhas = arredondar(r.detalhamento.reduce((t, d) => t + d.valor, 0))
    expect(somaLinhas).toBe(988.09)
  })

  it('salário acima do teto (R$10.000) é capado pelo teto INSS', () => {
    const r = calcularINSSProgressivo(10000)
    const noTeto = calcularINSSProgressivo(8475.55)
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

describe('calcularRedutorIRRF (Lei 15.270/2025)', () => {
  // Os dois extremos são a prova de que a fórmula legal recebe o rendimento
  // tributável BRUTO, não a base de cálculo já líquida de INSS: só assim ela
  // é contínua no início da faixa e zera exatamente no fim dela.
  it('em R$5.000 devolve exatamente o redutor máximo de R$312,89', () => {
    expect(calcularRedutorIRRF(5000, 9999)).toBe(312.89)
  })

  it('em R$7.350 devolve exatamente zero (fim da faixa)', () => {
    expect(calcularRedutorIRRF(7350, 9999)).toBe(0)
  })

  it('decresce linearmente no meio da faixa (R$6.000 → R$179,75)', () => {
    // 978,62 − 0,133145 × 6.000 = 179,75
    expect(calcularRedutorIRRF(6000, 9999)).toBe(179.75)
  })

  it('não há redutor acima de R$7.350', () => {
    expect(calcularRedutorIRRF(7350.01, 9999)).toBe(0)
    expect(calcularRedutorIRRF(20000, 9999)).toBe(0)
  })

  it('é limitado ao imposto apurado — zera, nunca gera crédito', () => {
    expect(calcularRedutorIRRF(4000, 50)).toBe(50)
    expect(calcularRedutorIRRF(4000, 0)).toBe(0)
  })

  it('é zero em tabela sem redutor (anterior a 2026)', () => {
    const tabela2025 = { ...TABELAS_2026, redutorIRRF: null }
    expect(calcularRedutorIRRF(4000, 500, tabela2025)).toBe(0)
  })
})

describe('calcularIRRFMensal — exemplos oficiais da Receita Federal', () => {
  // Os cinco exemplos da página "Exemplos de Aplicação da Lei 15.270/2025"
  // (gov.br/receitafederal). Publicados em dez/2025, usam a tabela do INSS de
  // 2025 — por isso o INSS entra aqui explícito, em vez de vir da tabela
  // vigente. O que estes casos travam é a ORDEM do cálculo (simplificado →
  // tabela → redutor sobre o rendimento bruto), que é independente do ano da
  // tabela previdenciária.
  const casos = [
    { nome: 'João', bruto: 3036.0, inss: 257.73, base: 2428.8, apurado: 0, redutor: 0, final: 0 },
    { nome: 'José', bruto: 4000.0, inss: 373.41, base: 3392.8, apurado: 114.76, redutor: 114.76, final: 0 },
    { nome: 'Maria', bruto: 5000.0, inss: 509.6, base: 4392.8, apurado: 312.89, redutor: 312.89, final: 0 },
    { nome: 'Rita', bruto: 6000.0, inss: 649.6, base: 5350.4, apurado: 562.63, redutor: 179.75, final: 382.88 },
    { nome: 'Vera', bruto: 7607.2, inss: 0, base: 7000.0, apurado: 1016.27, redutor: 0, final: 1016.27 },
  ]

  for (const caso of casos) {
    it(`${caso.nome} — R$ ${caso.bruto.toFixed(2)} → IRRF R$ ${caso.final.toFixed(2)}`, () => {
      const r = calcularIRRFMensal({
        salarioBruto: caso.bruto,
        inss: caso.inss,
        numeroDependentes: 0,
      })
      expect(r.baseCalculo).toBe(caso.base)
      expect(r.impostoApurado).toBe(caso.apurado)
      expect(r.redutor).toBe(caso.redutor)
      expect(r.valorIRRF).toBe(caso.final)
    })
  }
})

describe('calcularIRRFMensal', () => {
  it('isenção quando base ≤ R$2.428,80', () => {
    const r = calcularIRRFMensal({ salarioBruto: 2500, inss: 200, numeroDependentes: 0 })
    expect(r.valorIRRF).toBe(0)
  })

  it('aplica o desconto simplificado quando ele vence as deduções legais', () => {
    // INSS de R$ 250 < R$ 607,20 → a base sai do simplificado, não do INSS.
    const r = calcularIRRFMensal({ salarioBruto: 3000, inss: 250, numeroDependentes: 0 })
    expect(r.usouDescontoSimplificado).toBe(true)
    expect(r.deducaoAplicada).toBe(607.2)
    expect(r.baseCalculo).toBe(arredondar(3000 - 607.2))
  })

  it('mantém as deduções legais quando elas superam o simplificado', () => {
    const r = calcularIRRFMensal({ salarioBruto: 8000, inss: 921.51, numeroDependentes: 0 })
    expect(r.usouDescontoSimplificado).toBe(false)
    expect(r.deducaoAplicada).toBe(921.51)
    expect(r.baseCalculo).toBe(arredondar(8000 - 921.51))
  })

  it('faixa de 7,5% aplicada com a parcela a deduzir (imposto apurado, antes do redutor)', () => {
    // base = 3.200 − 607,20 = 2.592,80 → faixa 7,5% (2.428,81–2.826,65)
    // 2.592,80 × 7,5% − 182,16 = 12,30, que o redutor então zera.
    const r = calcularIRRFMensal({ salarioBruto: 3200, inss: 272.6, numeroDependentes: 0 })
    expect(r.aliquota).toBe(0.075)
    expect(r.impostoApurado).toBeCloseTo(12.3, 2)
    expect(r.valorIRRF).toBe(0)
  })

  it('rendimento até R$5.000 sai com IRRF zero — a isenção da Lei 15.270/2025', () => {
    // É o caso que o motor errava antes: o imposto apurado de R$ 312,89 é
    // exatamente o redutor máximo, e só fecha em zero porque a base veio do
    // desconto simplificado.
    const r = calcularIRRFMensal({ salarioBruto: 5000, inss: 501.51, numeroDependentes: 0 })
    expect(r.impostoApurado).toBe(312.89)
    expect(r.redutor).toBe(312.89)
    expect(r.valorIRRF).toBe(0)
  })

  it('redução parcial na faixa de R$5.000,01 a R$7.350 (R$6.000 → R$385,10)', () => {
    const r = calcularIRRFMensal({ salarioBruto: 6000, inss: 641.51, numeroDependentes: 0 })
    expect(r.impostoApurado).toBe(564.85)
    expect(r.redutor).toBe(179.75)
    expect(r.valorIRRF).toBe(385.1)
  })

  it('desconta dependentes da base quando as deduções legais prevalecem', () => {
    const semDep = calcularIRRFMensal({ salarioBruto: 8000, inss: 921.51, numeroDependentes: 0 })
    const comDep = calcularIRRFMensal({ salarioBruto: 8000, inss: 921.51, numeroDependentes: 2 })
    expect(comDep.baseCalculo).toBe(arredondar(semDep.baseCalculo - 2 * 189.59))
    expect(comDep.valorIRRF).toBeLessThan(semDep.valorIRRF)
  })

  it('aceita outras deduções (plano de saúde, previdência privada)', () => {
    const r = calcularIRRFMensal({
      salarioBruto: 8000,
      inss: 921.51,
      numeroDependentes: 0,
      outrasDeducoes: 300,
    })
    expect(r.baseCalculo).toBe(arredondar(8000 - 921.51 - 300))
  })

  it('usa `rendimentoTributavel` no redutor quando informado', () => {
    // Caso do aluguel: as despesas saem do rendimento antes da tabela, e é o
    // rendimento já excluído que entra na fórmula do redutor.
    const r = calcularIRRFMensal({
      salarioBruto: 6000,
      inss: 0,
      numeroDependentes: 0,
      rendimentoTributavel: 4000,
    })
    expect(r.redutor).toBeGreaterThan(0)
    expect(r.redutor).toBe(Math.min(312.89, r.impostoApurado))
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
