import { test, expect } from '@playwright/test'
import { siteConfig } from '../../src/lib/seo'

// Verificação de posse do site no AdSense (F19). O Publisher ID aparece em
// dois lugares que o Google lê separadamente — a meta do `<head>` e o
// `ads.txt` — e o `ads.txt` é arquivo estático, então não há nada no build
// que garanta que os dois continuem iguais. Divergência entre eles é a
// falha clássica: a verificação passa, o `ads.txt` é marcado como inválido
// no painel semanas depois, e nada no site acusa.

const PUBLISHER_ID = siteConfig.adsensePublisherId

test.describe('AdSense — verificação de posse', () => {
  test('a meta de verificação está no head e traz o publisher ID', async ({ page }) => {
    await page.goto('/')
    const conteudo = await page
      .locator('meta[name="google-adsense-account"]')
      .getAttribute('content')

    expect(conteudo).toBe(PUBLISHER_ID)
    expect(PUBLISHER_ID).toMatch(/^ca-pub-\d{16}$/)
  })

  // A meta vem do layout raiz, então vale em toda rota — inclusive nas
  // páginas de calculadora, que são onde cai o tráfego e onde os anúncios
  // eventualmente vão morar.
  test('a meta vale também nas páginas de calculadora', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    await expect(page.locator('meta[name="google-adsense-account"]')).toHaveAttribute(
      'content',
      PUBLISHER_ID,
    )
  })

  test('o ads.txt é servido e declara o mesmo publisher ID da meta', async ({ request }) => {
    const r = await request.get('/ads.txt')
    expect(r.status()).toBe(200)

    // Formato exigido pelo IAB: <domínio do exchange>, <id>, DIRECT|RESELLER,
    // <TAG-ID de certificação>. O ID no ads.txt vai sem o prefixo `ca-`.
    const semPrefixo = PUBLISHER_ID.replace(/^ca-/, '')
    expect((await r.text()).trim()).toBe(
      `google.com, ${semPrefixo}, DIRECT, f08c47fec0942fa0`,
    )
  })

  // Enquanto a conta não está aprovada, o site declara posse mas não pode
  // carregar o script de anúncio — é o que a flag de env controla, e é o
  // que separa "verificado" de "monetizando".
  test('nenhum script do adsbygoogle é carregado antes da aprovação', async ({ page }) => {
    test.skip(
      Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID),
      'exibição de anúncios ligada — este teste só vale no estado pré-aprovação',
    )

    await page.goto('/calculadora/ferias')
    await expect(page.locator('script[src*="adsbygoogle"]')).toHaveCount(0)
    await expect(page.locator('ins.adsbygoogle')).toHaveCount(0)
  })
})
