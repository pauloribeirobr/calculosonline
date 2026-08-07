import { test, expect } from '@playwright/test'

// Fluxo ponta a ponta de uma calculadora: preenche o formulário, calcula e
// confere o resultado e o detalhamento. Serve de referência de padrão para
// as demais calculadoras (todas usam o mesmo CalculatorForm/CalculatorResult
// do @calculosonline/ui, então o mesmo tipo de teste se aplica às outras).

test.describe('calculadora de margem de lucro', () => {
  test('custo 100 + preço 150 → preço no resultado, margem e markup no detalhamento', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    // Custo total e Preço de venda são campos de moeda mascarados (dígitos
    // digitados = centavos): '10000' → R$ 100,00, '15000' → R$ 150,00.
    await page.getByLabel('Custo total').fill('10000')
    await page.getByLabel('Preço de venda').fill('15000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado).toContainText('R$ 150,00')

    // Detalhamento fica sempre visível (sem toggle) — não precisa clicar pra abrir.
    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    await expect(detalhamento).toContainText('Margem de Lucro')
    await expect(detalhamento).toContainText('33,33%')
    await expect(detalhamento).toContainText('Markup')
    await expect(detalhamento).toContainText('50%')
  })

  test('custo zero exibe erro de validação sem gerar resultado', async ({ page }) => {
    await page.goto('/calculadora/margem-lucro')

    await page.getByLabel('Custo total').fill('0')
    await page.getByLabel('Preço de venda').fill('150')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    // Não usa getByRole('alert') puro: o Next injeta um
    // #__next-route-announcer__ com role="alert" em toda página, então o
    // locator genérico bate em 2 elementos (strict-mode violation).
    await expect(page.getByText('Custo deve ser positivo')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toHaveCount(0)
  })

  test('markup desejado em branco não trava a validação (bug real: NaN vs. default do Zod)', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    // Modo "preço" (default) — o campo "Markup desejado" fica visível mas é
    // irrelevante nesse modo. Deixá-lo em branco não pode bloquear o cálculo.
    await page.getByLabel('Custo total').fill('100')
    await page.getByLabel('Preço de venda').fill('150')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    await expect(page.getByText('Expected number, received nan')).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toBeVisible()
  })
})
