import { describe, expect, it } from 'vitest'
import { calcularFGTS } from '../fgts'

describe('calcularFGTS', () => {
  describe('validação', () => {
    it('rejeita salário zero', () => {
      const r = calcularFGTS({
        salarioBruto: 0,
        mesesTrabalhados: 12,
        modalidade: 'rescisao',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita salário negativo', () => {
      const r = calcularFGTS({
        salarioBruto: -100,
        mesesTrabalhados: 12,
        modalidade: 'rescisao',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita meses trabalhados negativos', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: -1,
        modalidade: 'rescisao',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita meses trabalhados NaN', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: NaN,
        modalidade: 'rescisao',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita saldo atual negativo', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 12,
        modalidade: 'rescisao',
        saldoAtual: -100,
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('depósito mensal', () => {
    it('é 8% do salário bruto', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 24,
        modalidade: 'contribuicao_mensal',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.depositoMensal).toBe(240)
    })

    it('com 1 mês mostra "mês" no detalhamento (singular)', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 1,
        modalidade: 'contribuicao_mensal',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const linha = r.dados.detalhamento.find((d) => d.descricao.includes('Depósitos'))
        expect(linha?.descricao).toContain('1 mês')
        expect(linha?.descricao).not.toContain('meses')
      }
    })
  })

  describe('saldo projetado e multas', () => {
    it('saldo projetado = saldo atual + depósitos no período', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 24,
        modalidade: 'rescisao',
        saldoAtual: 1000,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        // 240 * 24 + 1000 = 6760
        expect(r.dados.dados.saldoProjetado).toBe(6760)
      }
    })

    it('multa 40% sobre saldo projetado (R$3.000 × 24 meses → R$2.304)', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 24,
        modalidade: 'rescisao',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.saldoProjetado).toBe(5760)
        expect(r.dados.dados.multaRescisoria40).toBe(2304)
        expect(r.dados.dados.multaRescisoria20).toBe(1152)
      }
    })
  })

  describe('saque-aniversário (Lei 13.932/2019)', () => {
    // Tabela: 50%, 40%, 30%, 20%, 15%, 10%, 5% (com parcelas)
    const cases: Array<{ saldo: number; aliquota: number; valor: number }> = [
      { saldo: 400, aliquota: 0.5, valor: 400 * 0.5 + 0 }, // 200
      { saldo: 800, aliquota: 0.4, valor: 800 * 0.4 + 50 }, // 370
      { saldo: 3000, aliquota: 0.3, valor: 3000 * 0.3 + 150 }, // 1050
      { saldo: 8000, aliquota: 0.2, valor: 8000 * 0.2 + 650 }, // 2250
      { saldo: 12000, aliquota: 0.15, valor: 12000 * 0.15 + 1150 }, // 2950
      { saldo: 18000, aliquota: 0.1, valor: 18000 * 0.1 + 1900 }, // 3700
      { saldo: 30000, aliquota: 0.05, valor: 30000 * 0.05 + 2900 }, // 4400
    ]

    cases.forEach(({ saldo, aliquota, valor }) => {
      it(`saldo R$ ${saldo} → ${(aliquota * 100).toFixed(0)}%`, () => {
        const r = calcularFGTS({
          salarioBruto: 3000,
          mesesTrabalhados: 0,
          modalidade: 'saque_aniversario',
          saldoAtual: saldo,
        })
        expect(r.sucesso).toBe(true)
        if (r.sucesso) {
          expect(r.dados.dados.saqueAniversarioAliquota).toBe(aliquota)
          expect(r.dados.dados.saqueAniversarioValor).toBe(valor)
        }
      })
    })

    it('sem saldo atual: saque-aniversário não é calculado', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 0,
        modalidade: 'saque_aniversario',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.saqueAniversarioValor).toBeUndefined()
        expect(r.dados.dados.saqueAniversarioAliquota).toBeUndefined()
      }
    })

    it('modalidade rescisao não calcula saque-aniversário', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 12,
        modalidade: 'rescisao',
        saldoAtual: 5000,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.saqueAniversarioValor).toBeUndefined()
      }
    })

    it('detalhamento inclui linha de saque-aniversário quando aplicável', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 0,
        modalidade: 'saque_aniversario',
        saldoAtual: 3000,
        mesAniversario: 7,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const linha = r.dados.detalhamento.find((d) =>
          d.descricao.startsWith('Saque-Aniversário'),
        )
        expect(linha).toBeDefined()
        expect(linha?.descricao).toContain('30%')
      }
    })
  })

  describe('metadata', () => {
    it('expõe base legal e fonte jurídica', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 12,
        modalidade: 'contribuicao_mensal',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.fonteJuridica).toContain('Lei 8.036/1990')
        expect(r.dados.baseCalculo).toContain('8%')
      }
    })
  })

  // O headline era `depositoMensal` em todas as modalidades: quem preenchia
  // 24 meses e R$ 15.000 via "R$ 1.200" — o depósito de um mês —, e o campo
  // `mesesTrabalhados` não mexia no número principal. Era a única das 20
  // calculadoras cujo headline não respondia à pergunta do formulário.
  describe('headline por modalidade', () => {
    const base = { salarioBruto: 15000, mesesTrabalhados: 24 } as const

    it('acúmulo devolve o saldo acumulado, não o depósito de um mês', () => {
      const r = calcularFGTS({ ...base, modalidade: 'contribuicao_mensal' })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      expect(r.dados.resultado).toBe(28800)
      expect(r.dados.resultado).not.toBe(r.dados.dados.depositoMensal)
      expect(r.dados.rotuloResultado).toContain('24 meses')
    })

    it('o headline do acúmulo responde ao campo de meses', () => {
      const doze = calcularFGTS({ ...base, mesesTrabalhados: 12, modalidade: 'contribuicao_mensal' })
      const vinteQuatro = calcularFGTS({ ...base, modalidade: 'contribuicao_mensal' })
      if (!doze.sucesso || !vinteQuatro.sucesso) throw new Error('cálculo falhou')
      expect(vinteQuatro.dados.resultado).toBe(doze.dados.resultado * 2)
    })

    it('rescisão devolve saldo + multa de 40%, com o rótulo dizendo qual leitura é', () => {
      const r = calcularFGTS({ ...base, modalidade: 'rescisao' })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      expect(r.dados.resultado).toBe(28800 + 11520)
      expect(r.dados.rotuloResultado).toContain('sem justa causa')
      // A leitura de acordo mútuo continua disponível no detalhamento.
      expect(r.dados.detalhamento.some((i) => i.descricao.includes('20%'))).toBe(true)
    })

    it('saque-aniversário devolve o valor do saque', () => {
      const r = calcularFGTS({ ...base, modalidade: 'saque_aniversario', saldoAtual: 20000 })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      expect(r.dados.resultado).toBe(r.dados.dados.saqueAniversarioValor)
      expect(r.dados.rotuloResultado).toContain('Saque-aniversário')
    })

    it('saque-aniversário sem saldo informado avisa em vez de devolver número sem sentido', () => {
      const r = calcularFGTS({ ...base, modalidade: 'saque_aniversario' })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      expect(r.dados.avisos?.some((a) => a.includes('saldo atual'))).toBe(true)
    })
  })

  describe('data de referência e rótulos', () => {
    // Era `new Date().toISOString()`, que é UTC: depois das 21h de Brasília a
    // página exibia a data de amanhã. A tela de 08/09 às 22h mostrou
    // "Tabelas: 2026-09-09".
    it('a data das regras é fixa, não "hoje", e nunca cai no futuro', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 12,
        modalidade: 'contribuicao_mensal',
      })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      expect(r.dados.dataReferencia).toBe('2020-01-01')
      expect(r.dados.dataReferencia < new Date().toISOString().slice(0, 10)).toBe(true)
    })

    it('o saldo não se anuncia como projeção, e avisa que ignora o rendimento', () => {
      const r = calcularFGTS({
        salarioBruto: 3000,
        mesesTrabalhados: 12,
        modalidade: 'contribuicao_mensal',
      })
      expect(r.sucesso).toBe(true)
      if (!r.sucesso) return
      const linhas = r.dados.detalhamento.map((i) => i.descricao)
      expect(linhas).not.toContain('Saldo Projetado')
      expect(linhas.some((d) => d.includes('sem rendimento'))).toBe(true)
      expect(r.dados.avisos?.some((a) => a.includes('TR + 3%'))).toBe(true)
    })
  })
})
