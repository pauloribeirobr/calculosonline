import { describe, expect, it } from 'vitest'
import { calcularRescisao } from '../rescisao'

describe('calcularRescisao', () => {
  const BASE = {
    salarioBruto: 3000,
    dataAdmissao: '2023-01-01',
    dataRescisao: '2026-03-15',
    saldoFGTS: 9000,
    numeroDependentesIRRF: 0,
  } as const

  describe('validação', () => {
    it('rejeita salário inválido', () => {
      const r = calcularRescisao({ ...BASE, salarioBruto: 0, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita FGTS negativo', () => {
      const r = calcularRescisao({ ...BASE, saldoFGTS: -1, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita data de rescisão anterior à admissão', () => {
      const r = calcularRescisao({
        ...BASE,
        dataAdmissao: '2026-01-01',
        dataRescisao: '2025-12-31',
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita data inválida', () => {
      const r = calcularRescisao({
        ...BASE,
        dataAdmissao: 'data-invalida',
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(false)
    })

    it('rejeita dependentes negativos', () => {
      const r = calcularRescisao({
        ...BASE,
        numeroDependentesIRRF: -1,
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(false)
    })
  })

  describe('sem justa causa', () => {
    it('paga todas as verbas + multa FGTS de 40%', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.multaFGTS).toBe(3600)
        expect(r.dados.dados.percentualMultaFGTS).toBe(0.4)
        expect(r.dados.dados.feriasProporcionais).toBeGreaterThan(0)
        expect(r.dados.dados.decimoTerceiroProporcional).toBeGreaterThan(0)
      }
    })

    it('aviso prévio = 30 + 3×anos completos (39 dias para 3 anos)', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasAvisoPrevio).toBe(39)
    })

    it('aviso prévio é indenizado por padrão', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.avisoPrevioIndenizado).toBe(true)
        expect(r.dados.dados.avisoPrevio).toBeGreaterThan(0)
      }
    })

    it('aviso prévio trabalhado não soma valor indenizado', () => {
      const r = calcularRescisao({
        ...BASE,
        motivoRescisao: 'sem_justa_causa',
        avisoPrevisTrabalhado: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.avisoPrevio).toBe(0)
        expect(r.dados.dados.avisoPrevioIndenizado).toBe(false)
      }
    })
  })

  describe('justa causa do empregado', () => {
    it('não recebe aviso, férias proporcionais, 13º nem multa', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.avisoPrevio).toBe(0)
        expect(r.dados.dados.diasAvisoPrevio).toBe(0)
        expect(r.dados.dados.feriasProporcionais).toBe(0)
        expect(r.dados.dados.decimoTerceiroProporcional).toBe(0)
        expect(r.dados.dados.multaFGTS).toBe(0)
      }
    })

    it('ainda recebe saldo de salário e férias vencidas', () => {
      const r = calcularRescisao({
        ...BASE,
        feriasVencidas: 1,
        motivoRescisao: 'justa_causa',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.saldoSalario).toBeGreaterThan(0)
        expect(r.dados.dados.feriasVencidas).toBeGreaterThan(0)
      }
    })
  })

  describe('pedido de demissão', () => {
    it('sem aviso indenizado, sem multa FGTS, recebe férias e 13º proporcionais', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'pedido_demissao' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasAvisoPrevio).toBe(0)
        expect(r.dados.dados.avisoPrevio).toBe(0)
        expect(r.dados.dados.multaFGTS).toBe(0)
        expect(r.dados.dados.feriasProporcionais).toBeGreaterThan(0)
        expect(r.dados.dados.decimoTerceiroProporcional).toBeGreaterThan(0)
      }
    })
  })

  describe('acordo mútuo (CLT art. 484-A)', () => {
    it('aviso de 15 dias e multa FGTS de 20%', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'acordo_mutuo' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.diasAvisoPrevio).toBe(15)
        expect(r.dados.dados.multaFGTS).toBe(1800)
        expect(r.dados.dados.percentualMultaFGTS).toBe(0.2)
      }
    })
  })

  describe('aposentadoria', () => {
    it('paga todas as verbas como sem justa causa, multa FGTS 40%', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'aposentadoria' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.percentualMultaFGTS).toBe(0.4)
    })
  })

  describe('com justa causa do empregador', () => {
    it('multa FGTS 40%', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'com_justa_causa_emp' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.percentualMultaFGTS).toBe(0.4)
    })
  })

  describe('aviso prévio máximo (Lei 12.506/2011)', () => {
    it('cap de 90 dias mesmo com 26+ anos de serviço', () => {
      const r = calcularRescisao({
        ...BASE,
        dataAdmissao: '2000-01-01',
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) expect(r.dados.dados.diasAvisoPrevio).toBe(90)
    })
  })

  describe('detalhamento e total', () => {
    it('detalhamento começa em "Saldo de Salário" e termina em "Total Líquido"', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const linhas = r.dados.detalhamento
        expect(linhas[0]?.descricao).toContain('Saldo de Salário')
        expect(linhas[linhas.length - 1]?.descricao).toBe('Total Líquido')
      }
    })

    it('total bruto = soma de todas as verbas creditadas', () => {
      const r = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const d = r.dados.dados
        const soma =
          d.saldoSalario +
          d.avisoPrevio +
          d.feriasVencidas +
          d.feriasProporcionais +
          d.decimoTerceiroProporcional +
          d.multaFGTS
        expect(d.totalBruto).toBeCloseTo(soma, 1)
      }
    })

    it('férias vencidas plurais aparecem no detalhamento', () => {
      const r = calcularRescisao({
        ...BASE,
        feriasVencidas: 2,
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        const desc = r.dados.detalhamento.find((l) => l.descricao.includes('Vencidas'))
        expect(desc?.descricao).toContain('períodos')
      }
    })
  })

  describe('saldo de salário customizado', () => {
    it('respeita diasTrabalhados informado', () => {
      const padrao = calcularRescisao({ ...BASE, motivoRescisao: 'sem_justa_causa' })
      const custom = calcularRescisao({
        ...BASE,
        diasTrabalhados: 5,
        motivoRescisao: 'sem_justa_causa',
      })
      expect(padrao.sucesso && custom.sucesso).toBe(true)
      if (padrao.sucesso && custom.sucesso) {
        expect(custom.dados.dados.saldoSalario).toBeLessThan(padrao.dados.dados.saldoSalario)
      }
    })

    it('justa causa com saldo zero: detalhamento omite linhas de INSS/IRRF', () => {
      const r = calcularRescisao({
        ...BASE,
        diasTrabalhados: 0,
        motivoRescisao: 'justa_causa',
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.descontoINSS).toBe(0)
        expect(r.dados.dados.descontoIRRF).toBe(0)
        const desc = r.dados.detalhamento.map((d) => d.descricao)
        expect(desc).not.toContain('(-) INSS')
        expect(desc).not.toContain('(-) IRRF')
      }
    })
  })

  describe('parâmetros opcionais omitidos', () => {
    it('omitir numeroDependentesIRRF assume zero dependentes', () => {
      const r = calcularRescisao({
        salarioBruto: 3000,
        dataAdmissao: '2023-01-01',
        dataRescisao: '2026-03-15',
        saldoFGTS: 9000,
        motivoRescisao: 'sem_justa_causa',
      })
      expect(r.sucesso).toBe(true)
    })

    it('contrato curto com aviso trabalhado: zero meses no período aquisitivo', () => {
      const r = calcularRescisao({
        salarioBruto: 3000,
        dataAdmissao: '2026-01-15',
        dataRescisao: '2026-01-31',
        saldoFGTS: 0,
        motivoRescisao: 'pedido_demissao',
        avisoPrevisTrabalhado: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        expect(r.dados.dados.feriasProporcionais).toBe(0)
      }
    })

    it('exatamente 12 meses projetados → férias proporcionais cheias', () => {
      // Admissão e rescisão na mesma data do mês 1 ano depois, com aviso trabalhado
      // → mesesProjetados = 12, restando 12/12 dentro do ciclo aquisitivo.
      const r = calcularRescisao({
        salarioBruto: 3000,
        dataAdmissao: '2025-01-15',
        dataRescisao: '2026-01-15',
        saldoFGTS: 3000,
        motivoRescisao: 'sem_justa_causa',
        avisoPrevisTrabalhado: true,
      })
      expect(r.sucesso).toBe(true)
      if (r.sucesso) {
        // 3000 / 12 * 12 * 1.333... = 4000
        expect(r.dados.dados.feriasProporcionais).toBeCloseTo(4000, 0)
      }
    })
  })
})
