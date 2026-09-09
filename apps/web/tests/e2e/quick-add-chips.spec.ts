import { test, expect } from '@playwright/test'

// Chips de valor rápido (mesmo padrão visual/comportamental do Recibo Fácil,
// ver CurrencyInputWithQuickAdd lá e CalculatorForm.quickAdd aqui): "Zerar"
// zera o campo e cada chip "+N" SOMA ao valor atual.
//
// **Escopo por grupo, e não por página (08/09).** Estes testes buscavam o chip
// no documento inteiro, o que funcionava enquanto só um campo por página tinha
// chips. Ao estender os chips para os 65 campos numéricos, "+1.000" passou a
// existir em mais de um campo do mesmo formulário e os localizadores viraram
// ambíguos. A correção é recortar o escopo — cada bloco de chips carrega um
// `data-testid` com o nome do campo —, não afrouxar a asserção; mesma lição
// que o F58 registrou ao excluir o rodapé do teste de link interno.
//
// "Salário Bruto"/"Saldo do FGTS" (rescisão) e "Valor inicial" (CDB) são
// campos de moeda mascarados (dígitos digitados = centavos, ver F35/UX do
// F34) — as asserções conferem o texto formatado "1.234,56", não o número cru.

/**
 * Os chips de um campo, isolados dos demais campos do mesmo formulário.
 * O alvo é `data-testid` e não o nome acessível: um grupo nomeado com o
 * rótulo do campo seria encontrado por `getByLabel(rótulo)` junto com o
 * próprio input, porque `getByLabel` casa por substring.
 */
function chipsDe(page: import('@playwright/test').Page, campo: string) {
  return page.getByTestId(`quick-add-${campo}`)
}

test.describe('chips de valor rápido', () => {
  test('chips somam ao valor atual do campo (não substituem)', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    const chips = chipsDe(page, 'salarioBruto')
    await salario.fill('100000') // R$ 1.000,00

    await chips.getByRole('button', { name: '+500', exact: true }).click()
    await expect(salario).toHaveValue('1.500,00')

    await chips.getByRole('button', { name: '+1.000', exact: true }).click()
    await expect(salario).toHaveValue('2.500,00')

    await chips.getByRole('button', { name: '+100', exact: true }).click()
    await expect(salario).toHaveValue('2.600,00')
  })

  test('"Zerar" zera o campo independente do valor acumulado', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    const chips = chipsDe(page, 'salarioBruto')
    await salario.fill('300000') // R$ 3.000,00
    await chips.getByRole('button', { name: '+5.000', exact: true }).click()
    await expect(salario).toHaveValue('8.000,00')

    await chips.getByRole('button', { name: 'Zerar' }).click()
    await expect(salario).toHaveValue('0,00')
  })

  test('chips funcionam a partir do valor padrão 0 (soma sobre 0)', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    await expect(salario).toHaveValue('0,00')

    await chipsDe(page, 'salarioBruto').getByRole('button', { name: '+100', exact: true }).click()
    await expect(salario).toHaveValue('100,00')
  })

  // Substitui o antigo "campo sem quickAdd não ganha chips": desde 08/09 não
  // existe mais campo numérico sem chips, então a asserção passou a ser a que
  // de fato importa — o chip mexe **no seu** campo e não vaza para o vizinho.
  test('o chip de um campo não altera o campo ao lado', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const salario = page.getByLabel('Salário Bruto')
    const saldoFgts = page.getByLabel('Saldo do FGTS')
    await salario.fill('200000') // R$ 2.000,00

    await chipsDe(page, 'saldoFGTS')
      .getByRole('button', { name: '+1.000', exact: true })
      .click()

    await expect(saldoFgts).toHaveValue('1.000,00')
    await expect(salario).toHaveValue('2.000,00')
  })

  test('cada campo tem o próprio grupo de chips', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')
    await expect(chipsDe(page, 'salarioBruto')).toBeVisible()
    await expect(chipsDe(page, 'saldoFGTS')).toBeVisible()
  })

  test('escala diferente por campo: investimento (CDB) usa presets maiores', async ({ page }) => {
    await page.goto('/calculadora/cdb')

    const valorInicial = page.getByLabel('Valor inicial')
    await expect(valorInicial).toHaveValue('0,00')
    await chipsDe(page, 'valorInicial')
      .getByRole('button', { name: '+10.000', exact: true })
      .click()
    await expect(valorInicial).toHaveValue('10.000,00')
  })
})
