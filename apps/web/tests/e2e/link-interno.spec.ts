import { test, expect } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'

// Trava o F43 (escultura de link interno) e o F44 (URLs quebradas).
//
// Contexto: o export do GSC de 27/08 mostrava 31 links internos idênticos para
// todas as páginas — o rodapé listava as 20 calculadoras em todo lugar — e o
// bloco `relacionadas` do registry estava invertido: `financiamento`, a página
// de maior impressão do site (298), recebia 1 link, enquanto `juros-compostos`
// (3 impressões) recebia 8. Com Authority Score 2 e um único backlink
// reconhecido, o PageRank interno é o único capital de autoridade sob controle
// total, então essa distribuição é ativo de SEO e precisa de regressão.

/** Quantos slugs do registry apontam para cada slug via `relacionadas`. */
function linksRecebidos(slug: string): number {
  return calculatorRegistry.filter((c) => c.relacionadas.includes(slug)).length
}

test.describe('escultura de link interno (F43)', () => {
  test('o rodapé destaca poucas calculadoras em vez de listar as 20', async ({ page }) => {
    await page.goto('/')

    const rodape = page.getByRole('contentinfo')
    const linksDeCalculadora = rodape.locator('a[href^="/calculadora/"]')

    // O ponto do F43: o rodapé precisa ser um sinal de prioridade, não um
    // índice. Se voltar a listar as 20, o sinal some de novo.
    const total = await linksDeCalculadora.count()
    expect(total).toBeGreaterThan(0)
    expect(total).toBeLessThanOrEqual(10)
    expect(total).toBeLessThan(calculatorRegistry.length)

    // E o acesso ao catálogo completo continua existindo, via hub.
    await expect(rodape.locator('a[href="/categorias"]')).toHaveCount(1)
  })

  test('o rodapé não linka mais /blog, rota que nunca existiu', async ({ page }) => {
    await page.goto('/')

    // Era um 404 interno servido em 100% das páginas do site, seguido pelo
    // Google em todo crawl. Enquanto o F22 (blog sazonal) não existir, o link
    // não pode voltar.
    await expect(page.getByRole('contentinfo').locator('a[href^="/blog"]')).toHaveCount(0)
  })

  test('as páginas de maior impressão recebem mais links internos que as de menor', async () => {
    // Números de impressão do export de 27/08 (GSC, 3 meses).
    expect(linksRecebidos('financiamento')).toBeGreaterThan(linksRecebidos('juros-compostos'))
    expect(linksRecebidos('hora-extra')).toBeGreaterThan(linksRecebidos('juros-compostos'))
    expect(linksRecebidos('fgts')).toBeGreaterThan(linksRecebidos('porcentagem'))

    // `financiamento` é a maior página do site e chegou a ter 1 link só.
    expect(linksRecebidos('financiamento')).toBeGreaterThanOrEqual(4)
  })

  test('nenhuma calculadora fica órfã de link interno', async () => {
    for (const calc of calculatorRegistry) {
      expect(linksRecebidos(calc.slug), `${calc.slug} sem link interno`).toBeGreaterThan(0)
      expect(calc.relacionadas).not.toContain(calc.slug)
    }
  })

  test('o conteúdo editorial tem links contextuais para os alvos do P0', async ({ page }) => {
    // Antes do F43 os 20 MDX tinham ZERO links internos — todo link vinha do
    // rodapé (plano) e do bloco `relacionadas` (fora do texto). Link dentro do
    // corpo do artigo é o que passa contexto de anchor text.
    await page.goto('/calculadora/hora-extra')

    const artigo = page.locator('article')
    await expect(artigo.locator('a[href="/calculadora/fgts"]').first()).toBeVisible()
    await expect(artigo.locator('a[href="/calculadora/ferias"]').first()).toBeVisible()
    await expect(artigo.locator('a[href="/calculadora/decimo-terceiro"]').first()).toBeVisible()
  })
})

test.describe('URLs quebradas com tráfego real (F44)', () => {
  // Medido no Clarity em 25-27/08: `/site` respondeu por 4 das 25 sessões
  // (16%) e `/2026/calculadora/cdb` por 1. A origem é externa (link errado em
  // diretório/agregador), então só o redirect resolve.
  test('/site redireciona para a home em vez de servir 404', async ({ page }) => {
    const res = await page.goto('/site')
    expect(res?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe('/')
  })

  test('prefixo de ano espúrio cai na calculadora certa', async ({ page }) => {
    const res = await page.goto('/2026/calculadora/cdb')
    expect(res?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe('/calculadora/cdb')
  })
})
