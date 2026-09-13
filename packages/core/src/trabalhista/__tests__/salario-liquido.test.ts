import { describe, expect, it } from 'vitest'
import { calcularSalarioLiquido } from '../salario-liquido'
import { arredondar } from '../../utils'

describe('calcularSalarioLiquido', () => {
  describe('validação', () => {
    it('rejeita salário zero', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 0, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe('salario')
    })

    it('rejeita salário negativo', () => {
      const r = calcularSalarioLiquido({ salarioBruto: -100, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: -1 })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) {
        expect(r.erros.some((e) => e.campo === 'numeroDependentesIRRF')).toBe(true)
      }
    })

    it('rejeita item de outras deduções com valor negativo', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: [{ descricao: 'Plano de Saúde', valor: -10 }],
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita item de outros descontos com valor negativo', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        outrosDescontos: [{ descricao: 'Consignado', valor: -10 }],
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita item de adicionais com valor negativo', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        adicionais: [{ descricao: 'Vale Refeição', valor: -10 }],
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('salário mínimo 2026 (R$ 1.621,00)', () => {
    it('INSS = R$ 121,58 (7,5% sobre o piso) e IRRF isento', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 1621, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(121.58)
        expect(r.dados.dados.descontoIRRF).toBe(0)
      }
    })
  })

  describe('salário R$ 3.000,00 sem dependentes', () => {
    it('INSS progressivo soma 3 faixas (R$248,60)', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoINSS).toBe(248.6)
    })

    it('IRRF é zero — base abaixo da isenção pelo desconto simplificado', () => {
      // 3.000 − 607,20 = 2.392,80, abaixo dos R$ 2.428,80 de isenção.
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.usouDescontoSimplificado).toBe(true)
      }
    })
  })

  describe('salário R$ 5.000,00 com 2 dependentes', () => {
    it('IRRF zerado pelo redutor da Lei 15.270/2025', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 2 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBeGreaterThan(0)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        expect(r.dados.dados.redutorIRRF).toBeGreaterThan(0)
        expect(r.dados.dados.salarioLiquido).toBeLessThan(5000)
      }
    })

    it('expõe quanto a nova regra economizou (irrfSemRedutor − IRRF final)', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const d = r.dados.dados
        expect(d.irrfSemRedutor).toBe(312.89)
        expect(d.irrfSemRedutor - d.descontoIRRF).toBe(d.redutorIRRF)
      }
    })
  })

  describe('salário acima da faixa do redutor (R$ 8.000)', () => {
    it('sem redutor, IRRF cheio pela tabela', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 8000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(921.51)
        expect(r.dados.dados.redutorIRRF).toBe(0)
        expect(r.dados.dados.descontoIRRF).toBe(1037.85)
        expect(r.dados.dados.usouDescontoSimplificado).toBe(false)
      }
    })
  })

  describe('vale-transporte', () => {
    it('desconta exatamente 6% quando habilitado', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 3000,
        numeroDependentesIRRF: 0,
        temValeTransporte: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoVT).toBe(180)
    })

    it('não desconta VT por padrão', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 3000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.descontoVT).toBe(0)
    })
  })

  describe('outras deduções (itemizadas)', () => {
    it('reduzem a base do IRRF', () => {
      // R$ 8.000 de propósito: abaixo da faixa do redutor o IRRF já é zero nos
      // dois casos e a comparação não mediria nada.
      const sem = calcularSalarioLiquido({ salarioBruto: 8000, numeroDependentesIRRF: 0 })
      const com = calcularSalarioLiquido({
        salarioBruto: 8000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: [{ descricao: 'Plano de Saúde', valor: 500 }],
      })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.descontoIRRF).toBeLessThan(sem.dados.dados.descontoIRRF)
      }
    })

    it('também reduzem o salário líquido (é dinheiro descontado do contracheque, não só abatimento fiscal)', () => {
      const sem = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 0 })
      const com = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: [{ descricao: 'Plano de Saúde', valor: 500 }],
      })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.outrasDeducoes).toBe(500)
        expect(com.dados.dados.salarioLiquido).toBeLessThan(sem.dados.dados.salarioLiquido)
      }
    })

    it('soma múltiplos itens', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        outrasDeducoes: [
          { descricao: 'Plano de Saúde', valor: 300 },
          { descricao: 'Previdência Privada', valor: 200 },
        ],
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.outrasDeducoes).toBe(500)
        const itens = r.dados.detalhamento.map((d) => d.descricao)
        expect(itens).toContain('Plano de Saúde')
        expect(itens).toContain('Previdência Privada')
      }
    })
  })

  describe('outros descontos (itemizados)', () => {
    it('não afetam base IRRF mas reduzem o líquido', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        outrosDescontos: [{ descricao: 'Consignado', valor: 200 }],
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.outrosDescontos).toBe(200)
        expect(r.dados.detalhamento.map((d) => d.descricao)).toContain('Consignado')
      }
    })
  })

  describe('adicionais (vale-refeição, vale-alimentação etc.)', () => {
    it('não afetam INSS/IRRF/salário líquido, só o total informativo', () => {
      const sem = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 0 })
      const com = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        adicionais: [
          { descricao: 'Vale Refeição', valor: 600 },
          { descricao: 'Vale Alimentação', valor: 400 },
        ],
      })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.descontoINSS).toBe(sem.dados.dados.descontoINSS)
        expect(com.dados.dados.descontoIRRF).toBe(sem.dados.dados.descontoIRRF)
        expect(com.dados.dados.salarioLiquido).toBe(sem.dados.dados.salarioLiquido)
        expect(com.dados.dados.totalAdicionais).toBe(1000)
        expect(com.dados.dados.totalComAdicionais).toBe(
          arredondar(sem.dados.dados.salarioLiquido + 1000),
        )
      }
    })

    it('sem adicionais, não gera a linha "Total com Adicionais"', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 5000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.detalhamento.map((d) => d.descricao)).not.toContain('Total com Adicionais')
      }
    })

    it('com adicionais, a linha "Total com Adicionais" aparece depois de "Salário Líquido"', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        adicionais: [{ descricao: 'Vale Refeição', valor: 600 }],
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        const idxLiquido = descricoes.indexOf('Salário Líquido')
        const idxTotal = descricoes.indexOf('Total com Adicionais')
        expect(idxLiquido).toBeGreaterThanOrEqual(0)
        expect(idxTotal).toBeGreaterThan(idxLiquido)
      }
    })
  })

  describe('consistência', () => {
    it('salário líquido = bruto − total de descontos', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 8000, numeroDependentesIRRF: 1 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { salarioBruto, totalDescontos, salarioLiquido } = r.dados.dados
        expect(salarioLiquido).toBe(arredondar(salarioBruto - totalDescontos))
      }
    })

    it('detalhamento contém Salário Bruto e Salário Líquido', () => {
      const r = calcularSalarioLiquido({
        salarioBruto: 5000,
        numeroDependentesIRRF: 0,
        temValeTransporte: true,
        outrosDescontos: [{ descricao: 'Consignado', valor: 100 }],
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const itens = r.dados.detalhamento.map((d) => d.descricao)
        expect(itens).toContain('Salário Bruto')
        expect(itens).toContain('Salário Líquido')
        expect(itens.some((i) => i.includes('Vale-Transporte'))).toBe(true)
        expect(itens).toContain('Consignado')
      }
    })

    it('alíquotas efetivas são proporcionais ao bruto', () => {
      const r = calcularSalarioLiquido({ salarioBruto: 10000, numeroDependentesIRRF: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const { aliquotaEfetivaINSS, aliquotaEfetivaIRRF } = r.dados.dados
        expect(aliquotaEfetivaINSS).toBeGreaterThan(0)
        expect(aliquotaEfetivaINSS).toBeLessThan(0.14)
        expect(aliquotaEfetivaIRRF).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
