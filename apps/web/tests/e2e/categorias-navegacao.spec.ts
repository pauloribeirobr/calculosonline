import { test, expect } from '@playwright/test'
import { CATEGORIAS, getCalculatorsByCategory } from '../../src/lib/calculators'

test.describe('navegação por categoria', () => {
  // Escopado em `main` de propósito: desde o F43 o rodapé também lista as 6
  // categorias e as 8 calculadoras de maior impressão, então buscar no `page`
  // inteiro casa duas vezes. O que estes testes checam é o conteúdo da página,
  // não a navegação global.
  test('/categorias lista as 6 categorias', async ({ page }) => {
    await page.goto('/categorias')

    const conteudo = page.getByRole('main')
    for (const categoria of Object.values(CATEGORIAS)) {
      await expect(
        conteudo.getByRole('link', { name: new RegExp(categoria.label, 'i') }),
      ).toBeVisible()
    }
  })

  for (const [categoria, calculadoras] of Object.entries(getCalculatorsByCategory())) {
    test(`/categoria/${categoria} lista suas calculadoras e os links levam à página certa`, async ({
      page,
    }) => {
      await page.goto(`/categoria/${categoria}`)

      const primeira = calculadoras[0]
      const link = page
        .getByRole('main')
        .getByRole('link', { name: new RegExp(primeira.titulo, 'i') })
        .first()
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(new RegExp(`/calculadora/${primeira.slug}$`))
    })
  }
})
