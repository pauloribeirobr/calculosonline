import { test, expect } from '@playwright/test'

// Compartilhamento de cálculo por link (query param `d`, base64 dos valores
// do formulário): após calcular, um botão "Compartilhar via WhatsApp" leva a
// um link `wa.me` cuja mensagem contém a URL da calculadora com `?d=...`.
// Abrir essa URL deve repreencher o formulário e recalcular automaticamente,
// sem exigir clique em "Calcular".

function extractShareUrl(waHref: string): string {
  const waUrl = new URL(waHref)
  const mensagem = waUrl.searchParams.get('text') ?? ''
  const match = mensagem.match(/https?:\/\/\S+/)
  if (!match) throw new Error(`Nenhuma URL encontrada na mensagem do WhatsApp: ${mensagem}`)
  return match[0]
}

test.describe('compartilhamento de cálculo por link', () => {
  test('após calcular, o botão de compartilhar gera um link wa.me com os dados', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    await page.getByLabel('Custo total').fill('100')
    await page.getByLabel('Preço de venda').fill('150')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    const shareLink = page.getByRole('link', { name: 'Compartilhar via WhatsApp' })
    await expect(shareLink).toBeVisible()

    const href = await shareLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('https://wa.me/?text=')

    const shareUrl = extractShareUrl(href!)
    expect(shareUrl).toContain('/calculadora/margem-lucro?d=')
  })

  test('abrir um link compartilhado repreenche o formulário e recalcula sozinho', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    await page.getByLabel('Custo total').fill('200')
    await page.getByLabel('Preço de venda').fill('250')
    await page.getByRole('button', { name: 'Calcular Margem' }).click()

    const shareLink = page.getByRole('link', { name: 'Compartilhar via WhatsApp' })
    const href = await shareLink.getAttribute('href')
    const shareUrl = extractShareUrl(href!)

    // shareUrl é absoluta com o domínio de produção (siteConfig.url) — de
    // propósito, é o que vai na mensagem real do WhatsApp. Pro teste, precisa
    // navegar dentro do servidor local (baseURL do Playwright), então usamos
    // só o path+query. Abre como se fosse outra pessoa clicando no link —
    // sessão nova, sem interação prévia com o formulário.
    const { pathname, search } = new URL(shareUrl)
    await page.goto(`${pathname}${search}`)

    await expect(
      page.getByText('Valores de um cálculo compartilhado — edite e recalcule à vontade.'),
    ).toBeVisible()

    // Recalculado automaticamente, sem clique em "Calcular Margem".
    const resultado = page.getByRole('region', { name: 'Resultado do cálculo' })
    await expect(resultado).toBeVisible()
    await expect(resultado).toContainText('R$ 250,00')

    await expect(page.getByLabel('Custo total')).toHaveValue('200')
    await expect(page.getByLabel('Preço de venda')).toHaveValue('250')
  })

  test('sem query param, calculadora abre normalmente sem o banner de compartilhado', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    await expect(
      page.getByText('Valores de um cálculo compartilhado — edite e recalcule à vontade.'),
    ).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toHaveCount(0)
  })

  test('query param adulterado/inválido não quebra a página', async ({ page }) => {
    await page.goto('/calculadora/margem-lucro?d=isso-nao-e-base64-valido')

    // Falha de decodificação cai em `null` — sem crash, sem auto-cálculo, sem banner.
    await expect(
      page.getByText('Valores de um cálculo compartilhado — edite e recalcule à vontade.'),
    ).toHaveCount(0)
    await expect(page.getByRole('region', { name: 'Resultado do cálculo' })).toHaveCount(0)
    await expect(page.getByLabel('Custo total')).toBeVisible()
  })
})
