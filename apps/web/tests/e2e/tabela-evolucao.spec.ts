import { test, expect, type Page } from '@playwright/test'
import { encodeShareData } from '../../src/lib/shareLink'

// Trava a F86: as calculadoras com prazo mostram a evolução período a período
// no resultado, fechada por padrão, e a última linha bate com o headline.

const resultado = (page: Page) => page.getByRole('region', { name: 'Resultado do cálculo' })

async function abrirTabela(page: Page, titulo: RegExp) {
  const summary = resultado(page).locator('summary').filter({ hasText: titulo })
  await expect(summary).toBeVisible()
  await expect(resultado(page).locator('table')).toBeHidden()
  await summary.click()
  return resultado(page).locator('table')
}

test.describe('F86 — tabela de evolução', () => {
  test('CDB: 12 linhas, e a do mês 12 é o líquido do headline', async ({ page }) => {
    await page.goto(
      `/calculadora/cdb?d=${encodeShareData({ valorInicial: 10000, taxaAnual: 1, tipo: 'cdi', prazoMeses: 12 })}`,
    )
    const tabela = await abrirTabela(page, /Evolução mês a mês/)
    await expect(tabela.locator('tbody tr')).toHaveCount(12)
    await expect(tabela.locator('tbody tr').last()).toContainText('11.126,12')
  })

  test('Financiamento SAC de 120 meses: uma linha por parcela, saldo final zerado', async ({
    page,
  }) => {
    await page.goto(
      `/calculadora/financiamento?d=${encodeShareData({ valorFinanciado: 100000, taxaMensalJuros: 0.01, prazoMeses: 120, sistema: 'sac', taxaSeguroMensal: 0 })}`,
    )
    const tabela = await abrirTabela(page, /Tabela de parcelas \(SAC\)/)
    await expect(tabela.locator('tbody tr')).toHaveCount(120)
    await expect(tabela.locator('tbody tr').last().locator('td').last()).toHaveText('R$ 0,00')
  })

  for (const [slug, dados] of [
    ['poupanca', { valorInicial: 1000, prazoMeses: 24, aporteMensal: 100 }],
    [
      'juros-compostos',
      {
        principal: 1000,
        taxaJuros: 0.01,
        periodoTaxa: 'mensal',
        prazoMeses: 24,
        aporteMensal: 100,
      },
    ],
    ['tesouro-direto', { valorInicial: 1000, tipo: 'selic', taxaAnual: 0, prazoMeses: 24 }],
    [
      'emprestimo',
      {
        valorFinanciado: 10000,
        taxaMensalJuros: 0.02,
        prazoMeses: 24,
        sistema: 'price',
        taxaSeguroMensal: 0,
      },
    ],
  ] as const) {
    test(`${slug}: 24 linhas`, async ({ page }) => {
      await page.goto(`/calculadora/${slug}?d=${encodeShareData(dados)}`)
      const tabela = await abrirTabela(page, /mês a mês|Tabela de parcelas/)
      await expect(tabela.locator('tbody tr')).toHaveCount(24)
    })
  }

  test('FGTS: depósitos mês a mês, e a última linha é o saldo acumulado', async ({ page }) => {
    await page.goto(
      `/calculadora/fgts?d=${encodeShareData({ salarioBruto: 3000, mesesTrabalhados: 12, modalidade: 'contribuicao_mensal' })}`,
    )
    const tabela = await abrirTabela(page, /Depósitos mês a mês/)
    await expect(tabela.locator('tbody tr')).toHaveCount(12)
    await expect(tabela.locator('tbody tr').last()).toContainText('2.880,00')
  })

  test('calculadora sem prazo não mostra a tabela', async ({ page }) => {
    await page.goto(
      `/calculadora/margem-lucro?d=${encodeShareData({ custoTotal: 100, modo: 'preco', precoVenda: 150 })}`,
    )
    await expect(resultado(page)).toBeVisible()
    await expect(resultado(page).locator('details')).toHaveCount(0)
  })
})
