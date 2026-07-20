import { test, expect } from '@playwright/test'
import { CATEGORIAS, getCalculatorsByCategory } from '../../src/lib/calculators'

test.describe('navegação por categoria', () => {
  test('/categorias lista as 6 categorias', async ({ page }) => {
    await page.goto('/categorias')

    for (const categoria of Object.values(CATEGORIAS)) {
      await expect(page.getByRole('link', { name: new RegExp(categoria.label, 'i') })).toBeVisible()
    }
  })

  for (const [categoria, calculadoras] of Object.entries(getCalculatorsByCategory())) {
    test(`/categoria/${categoria} lista suas calculadoras e os links levam à página certa`, async ({
      page,
    }) => {
      await page.goto(`/categoria/${categoria}`)

      const primeira = calculadoras[0]
      const link = page.getByRole('link', { name: new RegExp(primeira.titulo, 'i') }).first()
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(new RegExp(`/calculadora/${primeira.slug}$`))
    })
  }
})
