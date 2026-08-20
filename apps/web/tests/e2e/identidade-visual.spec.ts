import { test, expect } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'
import { IDENTIDADE_CATEGORIA } from '../../src/lib/identidadeVisual'

// F41: identidade visual unificada. Antes, as cores de categoria viviam em
// dois arquivos que já haviam divergido (`ring` vs `border`), e a página de
// calculadora — onde cai todo o tráfego orgânico — não tinha ícone nenhum.

test.describe('identidade visual por categoria', () => {
  test('as 20 calculadoras têm ícone no header, com a cor da própria categoria', async ({
    page,
  }) => {
    for (const calc of calculatorRegistry) {
      await page.goto(`/calculadora/${calc.slug}`)

      const icone = page.locator('header span[aria-hidden]').filter({ has: page.locator('svg') })
      await expect(icone.first()).toBeVisible()

      const classes = (await icone.first().getAttribute('class')) ?? ''
      const identidade = IDENTIDADE_CATEGORIA[calc.categoria]
      expect(classes).toContain(identidade.fundo)
      expect(classes).toContain(identidade.anel)
      expect(classes).toContain(identidade.icone)
    }
  })

  test('cards de calculadoras relacionadas trazem ícone', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')

    const related = page.getByRole('complementary', { name: 'Calculadoras relacionadas' })
    await expect(related).toBeVisible()

    const cards = related.getByRole('listitem')
    const total = await cards.count()
    expect(total).toBeGreaterThan(0)

    for (let i = 0; i < total; i++) {
      await expect(cards.nth(i).locator('span[aria-hidden] svg')).toBeVisible()
    }
  })

  test('a mesma categoria usa a mesma cor na home e na página da calculadora', async ({
    page,
  }) => {
    const calc = calculatorRegistry.find((c) => c.categoria === 'impostos')
    if (!calc) throw new Error('esperava ao menos uma calculadora de impostos')

    await page.goto('/')
    const naHome = page.locator(`a[href="/calculadora/${calc.slug}"] span[aria-hidden]`).first()
    const classesHome = (await naHome.getAttribute('class')) ?? ''

    await page.goto(`/calculadora/${calc.slug}`)
    const naPagina = page
      .locator('header span[aria-hidden]')
      .filter({ has: page.locator('svg') })
      .first()
    const classesPagina = (await naPagina.getAttribute('class')) ?? ''

    // Tamanho difere (md na home, xl no header); a paleta não pode diferir.
    const identidade = IDENTIDADE_CATEGORIA[calc.categoria]
    for (const token of [identidade.fundo, identidade.anel, identidade.icone]) {
      expect(classesHome).toContain(token)
      expect(classesPagina).toContain(token)
    }
  })

  test('o ícone é decorativo e não polui a árvore de acessibilidade', async ({ page }) => {
    await page.goto('/calculadora/ferias')

    // H1 continua único e o ícone não vira conteúdo lido por leitor de tela.
    await expect(page.locator('h1')).toHaveCount(1)
    const icone = page.locator('header span[aria-hidden]').first()
    await expect(icone).toHaveAttribute('aria-hidden', 'true')
  })
})
