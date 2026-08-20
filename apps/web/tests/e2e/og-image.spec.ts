import { test, expect } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'

// F42: antes disso, TODA página apontava `og:image` para
// `/images/og-image.png` — arquivo que nunca existiu. Todo link compartilhado
// no WhatsApp (F32) mostrava preview quebrado.
//
// A resolução tem duas armadilhas opostas no App Router, e este arquivo tranca
// as duas: definir `openGraph.images` sobrescreve a convenção
// `opengraph-image.tsx`; declarar `openGraph` sem `images` suprime a herança
// da imagem do segmento pai.

test.describe('imagem social (og:image)', () => {
  test('toda página tem og:image, e a URL responde uma imagem de verdade', async ({
    page,
    request,
  }) => {
    const rotas = [
      '/',
      '/sobre',
      '/contato',
      '/categorias',
      '/categoria/trabalhista',
      '/calculadora/ferias',
    ]

    for (const rota of rotas) {
      await page.goto(rota)
      const og = page.locator('meta[property="og:image"]')
      await expect(og, `og:image ausente em ${rota}`).toHaveCount(1)

      const url = await og.getAttribute('content')
      expect(url, rota).toBeTruthy()

      // A URL do meta é absoluta e aponta para o domínio de produção; o que
      // interessa aqui é se o caminho existe nesta build, então buscamos o
      // pathname no servidor de teste.
      const { pathname } = new URL(url!)
      const resposta = await request.get(pathname)
      expect(resposta.status(), `${rota} -> ${pathname}`).toBe(200)
      expect(resposta.headers()['content-type']).toContain('image/png')
    }
  })

  test('cada calculadora aponta para a própria imagem, não para a do site', async ({ page }) => {
    for (const calc of calculatorRegistry) {
      await page.goto(`/calculadora/${calc.slug}`)
      const url = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(url, calc.slug).toContain(`/calculadora/${calc.slug}/opengraph-image`)
    }
  })

  test('twitter:image acompanha a imagem da rota', async ({ page }) => {
    await page.goto('/calculadora/tesouro-direto')
    const twitter = await page.locator('meta[name="twitter:image"]').first().getAttribute('content')
    expect(twitter).toContain('/calculadora/tesouro-direto/opengraph-image')
  })

  test('a imagem tem as dimensões que as redes esperam', async ({ request }) => {
    const r = await request.get('/calculadora/imc/opengraph-image')
    expect(r.status()).toBe(200)

    // Cabeçalho PNG: largura e altura são big-endian a partir do byte 16.
    const buf = await r.body()
    expect(buf.readUInt32BE(16)).toBe(1200)
    expect(buf.readUInt32BE(20)).toBe(630)
  })
})
