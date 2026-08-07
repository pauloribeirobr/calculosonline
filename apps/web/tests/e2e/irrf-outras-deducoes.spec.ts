import { test, expect } from '@playwright/test'

// F35 — "Outras deduções" do IRRF virou `itemList` (mesmo padrão do salário
// líquido, F34): o usuário lança linhas soltas (plano de saúde, PGBL) em vez
// de somar tudo de cabeça num único campo. A soma dos itens é o que vira o
// `outrasDeducoes` (number) que o motor de cálculo já esperava — o core não
// mudou, só a UX de preencher o valor.

test.describe('calculadora de IRRF — "Outras deduções" como lista de itens', () => {
  test('itens somados reduzem a base de cálculo do IRRF', async ({ page }) => {
    await page.goto('/calculadora/irrf')

    await page.getByLabel('Salário Bruto').fill('500000') // R$ 5.000,00

    const grupo = page.getByRole('group', { name: 'Outras deduções' })
    await grupo.getByRole('button', { name: '+ Plano de Saúde' }).click()
    await grupo.getByLabel('Valor do item 1').fill('30000') // R$ 300,00
    await grupo.getByRole('button', { name: '+ Previdência Privada PGBL' }).click()
    await grupo.getByLabel('Valor do item 2').fill('20000') // R$ 200,00
    await expect(grupo.getByText('Total: R$ 500,00')).toBeVisible()

    await page.getByRole('button', { name: 'Calcular IRRF' }).click()

    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    await expect(detalhamento).toContainText('Outras Deduções')
    await expect(detalhamento).toContainText('R$ 500,00')
  })

  test('linha em branco não conta na soma nem no cálculo', async ({ page }) => {
    await page.goto('/calculadora/irrf')

    await page.getByLabel('Salário Bruto').fill('500000')

    const grupo = page.getByRole('group', { name: 'Outras deduções' })
    await grupo.getByRole('button', { name: 'Adicionar item' }).click()
    await expect(grupo.getByText('Total: R$ 0,00')).toBeVisible()

    await page.getByRole('button', { name: 'Calcular IRRF' }).click()

    const detalhamento = page.getByRole('list', { name: 'Detalhamento linha a linha' })
    await expect(detalhamento).toContainText('Base de Cálculo IRRF')
    await expect(detalhamento).not.toContainText('Outras Deduções')
  })
})
