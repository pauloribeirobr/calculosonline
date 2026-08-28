import { describe, expect, it } from 'vitest'
import { calcularIRRF } from '../irrf'
import { arredondar } from '../../utils'

describe('calcularIRRF', () => {
  describe('validação', () => {
    it('rejeita salário inválido', () => {
      const r = calcularIRRF({ salarioBruto: 0, numeroDependentes: 0 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularIRRF({ salarioBruto: 5000, numeroDependentes: -1 })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita pensão negativa', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        pensaoAlimenticia: -1,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita outras deduções negativas', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        outrasDeducoes: -1,
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita INSS informado negativo', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        descontoINSS: -1,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('cálculo', () => {
    it('salário baixo (R$ 2000) → isento', () => {
      const r = calcularIRRF({ salarioBruto: 2000, numeroDependentes: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.isento).toBe(true)
        expect(r.dados.dados.irrf).toBe(0)
      }
    })

    it('salário alto (R$ 10.000) tem IRRF > 0', () => {
      const r = calcularIRRF({ salarioBruto: 10000, numeroDependentes: 0 })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.isento).toBe(false)
        expect(r.dados.dados.irrf).toBeGreaterThan(0)
        expect(r.dados.dados.aliquota).toBe(0.275)
      }
    })

    it('dependentes reduzem a base de cálculo', () => {
      const sem = calcularIRRF({ salarioBruto: 5000, numeroDependentes: 0 })
      const com = calcularIRRF({ salarioBruto: 5000, numeroDependentes: 2 })
      expect(sem.sucesso && com.sucesso).toBe(true)
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
        expect(com.dados.dados.deducaoDependentes).toBeGreaterThan(0)
      }
    })

    it('pensão alimentícia reduz a base do IRRF', () => {
      const sem = calcularIRRF({ salarioBruto: 6000, numeroDependentes: 0 })
      const com = calcularIRRF({
        salarioBruto: 6000,
        numeroDependentes: 0,
        pensaoAlimenticia: 1000,
      })
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
      }
    })

    it('outras deduções reduzem a base', () => {
      const sem = calcularIRRF({ salarioBruto: 6000, numeroDependentes: 0 })
      const com = calcularIRRF({
        salarioBruto: 6000,
        numeroDependentes: 0,
        outrasDeducoes: 500,
      })
      if (sem.sucesso && com.sucesso) {
        expect(com.dados.dados.irrf).toBeLessThan(sem.dados.dados.irrf)
      }
    })

    it('aceita INSS informado externamente', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        descontoINSS: 600,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.baseCalculo).toBeCloseTo(4400, 0)
    })

    it('detalhamento omite linha de Alíquota quando isento', () => {
      const r = calcularIRRF({ salarioBruto: 2000, numeroDependentes: 0 })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels.some((l) => l.startsWith('Alíquota'))).toBe(false)
        expect(labels.at(-1)).toBe('IRRF (Isento)')
      }
    })

    it('detalhamento mostra Pensão e Outras Deduções quando informadas', () => {
      const r = calcularIRRF({
        salarioBruto: 8000,
        numeroDependentes: 1,
        pensaoAlimenticia: 500,
        outrasDeducoes: 200,
      })
      if (r.sucesso) {
        const labels = r.dados.detalhamento.map((d) => d.descricao)
        expect(labels.some((l) => l.includes('Pensão'))).toBe(true)
        expect(labels.some((l) => l.includes('Outras Deduções'))).toBe(true)
        expect(labels.some((l) => l.startsWith('(-) Dependentes'))).toBe(true)
      }
    })
  })
  describe('rendimento de aluguel (F54)', () => {
    // Saiu do painel de IA do Clarity: "calculadora irrf 2026 aluguel" e
    // "calculadora irrf aluguel 2026" apareceram com 4 citações cada — demanda
    // comprovada que a calculadora não atendia. Mesma tabela progressiva
    // mensal; muda o que se abate antes dela.

    it('aluguel não sofre desconto de INSS', () => {
      const aluguel = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
      })
      const salario = calcularIRRF({ salarioBruto: 5000, numeroDependentes: 0 })
      expect(aluguel.sucesso && salario.sucesso).toBe(true)
      if (aluguel.sucesso && salario.sucesso) {
        // Sem INSS a base é o próprio bruto, então o imposto é maior.
        expect(aluguel.dados.dados.baseCalculo).toBe(5000)
        expect(aluguel.dados.dados.irrf).toBeGreaterThan(salario.dados.dados.irrf)
      }
    })

    it('ignora o INSS mesmo se informado explicitamente', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
        descontoINSS: 500,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.baseCalculo).toBe(5000)
    })

    it('abate IPTU, condomínio e taxa de administração da base', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
        despesasAluguel: { iptu: 200, condominio: 450, taxaAdministracao: 350 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.despesasDedutiveis).toBe(1000)
        expect(r.dados.dados.baseCalculo).toBe(4000)
      }
    })

    it('dependentes e pensão continuam valendo no aluguel', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 2,
        pensaoAlimenticia: 300,
        despesasAluguel: { iptu: 200 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        // 5000 − 200 (IPTU) − 2 dependentes − 300 de pensão
        expect(r.dados.dados.baseCalculo).toBe(
          arredondar(5000 - 200 - r.dados.dados.deducaoDependentes - 300),
        )
      }
    })

    it('despesas do aluguel são ignoradas quando a origem é salário', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        numeroDependentes: 0,
        despesasAluguel: { iptu: 200, condominio: 450 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.despesasDedutiveis).toBe(0)
        expect(r.dados.dados.origemRendimento).toBe('salario')
      }
    })

    it('rejeita despesa negativa', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
        despesasAluguel: { condominio: -1 },
      })
      expect(r.sucesso).toBe(false)
      if (!r.sucesso) expect(r.erros[0]?.campo).toBe('condominio')
    })

    it('despesas altas o bastante zeram o imposto', () => {
      const r = calcularIRRF({
        salarioBruto: 3000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
        despesasAluguel: { iptu: 300, condominio: 800 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.baseCalculo).toBe(1900)
        expect(r.dados.dados.isento).toBe(true)
      }
    })

    it('o detalhamento nomeia a origem e lista cada despesa', () => {
      const r = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
        despesasAluguel: { iptu: 200, condominio: 450, taxaAdministracao: 350 },
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const descricoes = r.dados.detalhamento.map((d) => d.descricao)
        expect(descricoes).toContain('Aluguel Bruto Recebido')
        expect(descricoes).toContain('(-) IPTU')
        expect(descricoes).toContain('(-) Condomínio e taxas')
        expect(descricoes).toContain('(-) Taxa de administração imobiliária')
        expect(descricoes).not.toContain('(-) INSS')
      }
    })

    it('a fonte jurídica citada muda com a origem', () => {
      const aluguel = calcularIRRF({
        salarioBruto: 5000,
        origemRendimento: 'aluguel',
        numeroDependentes: 0,
      })
      expect(aluguel.sucesso).toBe(true)
      if (aluguel.sucesso) {
        expect(aluguel.dados.fonteJuridica).toContain('arts. 42')
        expect(aluguel.dados.fonteJuridica).toContain('IN RFB 1.500')
      }
    })
  })

})
