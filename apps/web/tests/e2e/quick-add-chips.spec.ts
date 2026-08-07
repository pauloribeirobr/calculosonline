import { test, expect } from '@playwright/test'

// Chips de valor rápido (mesmo padrão visual/comportamental do Recibo Fácil,
// ver CurrencyInputWithQuickAdd lá e CalculatorForm.quickAdd aqui): "Zerar"
// zera o campo, cada chip "+N" SOMA ao valor atual (não substitui). Testado
// no campo "Salário Bruto" da rescisão (QUICK_ADD_SALARIO) e no "Custo
// total" da margem de lucro, que já tem cobertura de fluxo completo em
// calculadora-margem-lucro.spec.ts.
//
// "Salário Bruto"/"Saldo do FGTS" (rescisão) e "Valor inicial" (CDB) são
// campos de moeda mascarados (dígitos digitados = centavos, ver F35/UX do
// F34) — os valores preenchidos usam a máscara e as asserções conferem o
// texto formatado "1.234,56", não o número cru.

test.describe('chips de valor rápido', () => {
  test('chips somam ao valor atual do campo (não substituem)', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    await salario.fill('100000') // R$ 1.000,00

    await page.getByRole('button', { name: '+500', exact: true }).click()
    await expect(salario).toHaveValue('1.500,00')

    await page.getByRole('button', { name: '+1.000', exact: true }).click()
    await expect(salario).toHaveValue('2.500,00')

    await page.getByRole('button', { name: '+100', exact: true }).click()
    await expect(salario).toHaveValue('2.600,00')
  })

  test('"Zerar" zera o campo independente do valor acumulado', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    await salario.fill('300000') // R$ 3.000,00
    await page.getByRole('button', { name: '+5.000', exact: true }).click()
    await expect(salario).toHaveValue('8.000,00')

    await page.getByRole('button', { name: 'Zerar' }).click()
    await expect(salario).toHaveValue('0,00')
  })

  test('chips funcionam a partir do valor padrão 0 (soma sobre 0)', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    await expect(salario).toHaveValue('0,00')

    await page.getByRole('button', { name: '+100', exact: true }).click()
    await expect(salario).toHaveValue('100,00')
  })

  test('chips de valor rápido não aparecem em campo sem quickAdd configurado', async ({
    page,
  }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    // "Saldo do FGTS" também é R$, mas não tem quickAdd — não deve ganhar chips.
    // Escopo restrito ao wrapper do próprio campo (não a qualquer ancestral),
    // senão o "× Zerar" do Salário Bruto (mesmo form) daria falso positivo.
    const saldoFgts = page.getByLabel('Saldo do FGTS')
    const container = page.locator('div.flex.flex-col.gap-1').filter({ has: saldoFgts })
    await expect(container.getByRole('button', { name: 'Zerar' })).toHaveCount(0)
  })

  test('escala diferente por campo: investimento (CDB) usa presets maiores', async ({ page }) => {
    await page.goto('/calculadora/cdb')

    const valorInicial = page.getByLabel('Valor inicial')
    await expect(valorInicial).toHaveValue('0,00')
    await page.getByRole('button', { name: '+10.000', exact: true }).click()
    await expect(valorInicial).toHaveValue('10.000,00')
  })
})
