import { test, expect } from '@playwright/test'

// Cobertura mobile (viewport + toque real via `tap()`, projeto
// `mobile-chromium` do playwright.config.ts) dos componentes novos da
// calculadora de salário líquido — em especial o stepper de dependentes,
// que só existe como botões +/- (sem digitação livre em muitos fluxos
// mobile) e precisa funcionar bem com toque, não só clique de mouse.

test.describe('calculadora de salário líquido — mobile', () => {
  test('stepper de dependentes funciona por toque (+/-)', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    const dependentes = page.getByLabel('Dependentes (IRRF)')
    const aumentar = page.getByRole('button', { name: 'Aumentar' })
    const diminuir = page.getByRole('button', { name: 'Diminuir' })

    await expect(dependentes).toHaveValue('0')
    await expect(diminuir).toBeDisabled()

    await aumentar.tap()
    await aumentar.tap()
    await aumentar.tap()
    await expect(dependentes).toHaveValue('3')

    await diminuir.tap()
    await expect(dependentes).toHaveValue('2')
  })

  test('botões do stepper têm área de toque adequada (≥ 36px)', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    for (const nome of ['Diminuir', 'Aumentar']) {
      const box = await page.getByRole('button', { name: nome }).boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(36)
      expect(box!.height).toBeGreaterThanOrEqual(36)
    }
  })

  test('campo de moeda com máscara de centavos funciona no teclado mobile', async ({ page }) => {
    await page.goto('/calculadora/salario-liquido')

    const salario = page.getByLabel('Salário Bruto')
    await salario.tap()
    await salario.fill('350075')
    await expect(salario).toHaveValue('3.500,75')
  })

  test('chip de sugestão e remoção de item por toque na lista de adicionais', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    const grupo = page.getByRole('group', { name: 'Adicionais (não entram na folha)' })
    await grupo.getByRole('button', { name: '+ Vale Refeição' }).tap()

    const linha = grupo.getByRole('listitem')
    await expect(linha).toHaveCount(1)
    await expect(linha.getByLabel('Descrição do item 1')).toHaveValue('Vale Refeição')

    await linha.getByRole('button', { name: 'Remover item 1' }).tap()
    await expect(grupo.getByRole('listitem')).toHaveCount(0)
  })

  test('fluxo completo por toque: bruto + stepper + adicional → resultado visível', async ({
    page,
  }) => {
    await page.goto('/calculadora/salario-liquido')

    await page.getByLabel('Salário Bruto').fill('500000')
    await page.getByRole('button', { name: 'Aumentar' }).tap()

    const adicionais = page.getByRole('group', { name: 'Adicionais (não entram na folha)' })
    await adicionais.getByRole('button', { name: '+ Vale Alimentação' }).tap()
    await adicionais.getByLabel('Valor do item 1').fill('40000')

    await page.getByRole('button', { name: 'Calcular Salário Líquido' }).tap()

    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado.getByText('Total com Adicionais')).toBeVisible()
  })
})
