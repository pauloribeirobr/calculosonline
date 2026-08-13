import { test, expect } from '@playwright/test'

// Histórico local de cálculos (F37, IndexedDB): depois de calcular, o botão
// "Salvar cálculo" persiste os valores do formulário no navegador (sem
// backend, sem cadastro). `/meus-calculos` lista o que foi salvo, reabre
// (reaproveitando o mesmo `?d=` do compartilhamento por link, F32) e remove.

test.describe('histórico local de cálculos', () => {
  test('salvar um cálculo muda o botão para "salvo" e ele aparece em /meus-calculos', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    await page.getByLabel('Custo total').fill('10000')
    await page.getByLabel('Preço de venda').fill('15000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    const salvarButton = page.getByRole('button', { name: 'Salvar cálculo' })
    await expect(salvarButton).toBeVisible()
    await salvarButton.click()

    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    await page.goto('/meus-calculos')
    const item = page.getByRole('listitem').filter({ hasText: 'Margem de Lucro' })
    await expect(item).toBeVisible()
    await expect(item).toContainText('R$ 150,00')
  })

  test('abrir um cálculo salvo repreenche o formulário, recalcula sozinho e já mostra "salvo" + "Excluir"', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    await page.getByLabel('Custo total').fill('20000')
    await page.getByLabel('Preço de venda').fill('25000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()
    await page.getByRole('button', { name: 'Salvar cálculo' }).click()
    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    await page.goto('/meus-calculos')
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Margem de Lucro' })
      .getByRole('link', { name: 'Abrir' })
      .click()

    await expect(page).toHaveURL(/\/calculadora\/margem-lucro\?d=.*&calc=/)
    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado).toContainText('R$ 250,00')
    await expect(page.getByLabel('Custo total')).toHaveValue('200,00')

    // Já chega marcado como salvo — sem oferecer "Salvar cálculo" de novo —
    // e com a opção de excluir.
    await expect(page.getByText('Cálculo salvo')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Salvar cálculo' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Excluir' })).toBeVisible()
  })

  test('editar e recalcular um cálculo salvo volta a oferecer "Salvar cálculo"', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')
    await page.getByLabel('Custo total').fill('20000')
    await page.getByLabel('Preço de venda').fill('25000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()
    await page.getByRole('button', { name: 'Salvar cálculo' }).click()
    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    await page.goto('/meus-calculos')
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Margem de Lucro' })
      .getByRole('link', { name: 'Abrir' })
      .click()
    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    // Edita e recalcula — é um cálculo diferente agora, não o registro salvo.
    await page.getByLabel('Preço de venda').fill('30000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    await expect(page.getByRole('button', { name: 'Salvar cálculo' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Excluir' })).toHaveCount(0)
  })

  test('excluir direto da página de resultado remove o cálculo salvo', async ({ page }) => {
    await page.goto('/calculadora/margem-lucro')
    await page.getByLabel('Custo total').fill('20000')
    await page.getByLabel('Preço de venda').fill('25000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()
    await page.getByRole('button', { name: 'Salvar cálculo' }).click()
    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    await page.goto('/meus-calculos')
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Margem de Lucro' })
      .getByRole('link', { name: 'Abrir' })
      .click()
    await page.getByRole('button', { name: 'Excluir' }).click()

    await expect(page.getByRole('button', { name: 'Salvar cálculo' })).toBeVisible()

    await page.goto('/meus-calculos')
    await expect(page.getByText('Você ainda não salvou nenhum cálculo.')).toBeVisible()
  })

  test('remover um cálculo salvo tira ele da lista', async ({ page }) => {
    await page.goto('/calculadora/margem-lucro')
    await page.getByLabel('Custo total').fill('10000')
    await page.getByLabel('Preço de venda').fill('15000')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()
    await page.getByRole('button', { name: 'Salvar cálculo' }).click()
    await expect(page.getByText('Cálculo salvo')).toBeVisible()

    await page.goto('/meus-calculos')
    const item = page.getByRole('listitem').filter({ hasText: 'Margem de Lucro' })
    await expect(item).toBeVisible()

    await item.getByRole('button', { name: /Remover cálculo salvo/ }).click()
    await expect(item).toHaveCount(0)
    await expect(page.getByText('Você ainda não salvou nenhum cálculo.')).toBeVisible()
  })

  test('sem nenhum cálculo salvo, /meus-calculos mostra o estado vazio', async ({ page }) => {
    await page.goto('/meus-calculos')
    await expect(page.getByText('Você ainda não salvou nenhum cálculo.')).toBeVisible()
  })
})
