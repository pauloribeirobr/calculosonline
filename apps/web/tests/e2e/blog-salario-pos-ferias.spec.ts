import { test, expect } from '@playwright/test'

// Trava o F65 — o guia do salário do mês seguinte às férias.
//
// A pauta saiu do relatório de consultas do Bing Webmaster Tools de 22/09: a
// maior pergunta em linguagem natural do export era "vou tirar 10 dias de
// férias somente, quanto receberia no proximo mês pós ferias" (17 impressões,
// posição 6,8), e `ferias` é a 4ª página do site no Bing (292 impressões,
// posição 8,1) e o 3º tema em citações de IA — com o menor Share of Authority
// dos temas grandes. O `ferias.mdx` não tratava do assunto.
//
// Três coisas distintas aqui:
//  1. a rota existe, entra na listagem e traz o `Article`;
//  2. os links recíprocos post <-> calculadora (disciplina do F43);
//  3. os números saem do motor — mesma trava do F22/F47/F60.

const POST = 'salario-depois-das-ferias-por-que-vem-menor'

test.describe('F65 — rota, listagem e SEO', () => {
  test('a rota responde 200 e tem H1', async ({ page }) => {
    const resposta = await page.goto(`/blog/${POST}`)
    expect(resposta?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Salário depois das férias')
  })

  test('entra no sitemap e tem imagem social', async ({ page }) => {
    const xml = await (await page.request.get('/sitemap.xml')).text()
    expect(xml).toContain(`<loc>https://calculosonline.com.br/blog/${POST}</loc>`)

    const img = await page.request.get(`/blog/${POST}/opengraph-image`)
    expect(img.status()).toBe(200)
    expect(img.headers()['content-type']).toContain('image/png')
  })

  test('declara Article e cabe no orçamento de title da SERP', async ({ page }) => {
    await page.goto(`/blog/${POST}`)

    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
    const article = blocos.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Article')
    expect(article, 'sem Article').toBeTruthy()
    expect(article.datePublished).toBe('2026-09-22')
    expect(article.inLanguage).toBe('pt-BR')

    // Mesmo orçamento de 78 caracteres do F38.
    const title = await page.title()
    expect(title.length, title).toBeLessThanOrEqual(78)
  })
})

test.describe('F65 — links recíprocos (F43)', () => {
  test('o post manda o leitor para a calculadora de férias', async ({ page }) => {
    await page.goto(`/blog/${POST}`)
    const cta = page.getByRole('link', { name: /Férias/ }).first()
    await expect(cta).toHaveAttribute('href', '/calculadora/ferias')
  })

  test('a calculadora de férias lista o guia', async ({ page }) => {
    await page.goto('/calculadora/ferias')
    const bloco = page.getByRole('region', { name: /Guias? sobre este tema/ })
    await expect(bloco).toBeVisible()
    await expect(bloco.locator(`a[href="/blog/${POST}"]`)).toHaveCount(1)
  })

  test('o corpo da página de férias também linka o guia', async ({ page }) => {
    // O bloco de guias é automático (registry); o link no meio do texto é o que
    // carrega anchor text, que é o ponto do F43.
    await page.goto('/calculadora/ferias')
    await expect(
      page.locator('article').locator(`a[href="/blog/${POST}"]`).first(),
    ).toBeVisible()
  })

  test('o post cita as calculadoras que usa', async ({ page }) => {
    await page.goto(`/blog/${POST}`)
    const bloco = page.getByRole('region', { name: 'Calculadoras citadas neste artigo' })
    for (const slug of ['salario-liquido', 'inss', 'irrf', 'decimo-terceiro']) {
      await expect(bloco.locator(`a[href="/calculadora/${slug}"]`), slug).toHaveCount(1)
    }
  })
})

test.describe('F65 — os números vêm do motor', () => {
  // Salário de R$ 3.000 sem dependentes, férias dentro de um mesmo mês, e o
  // caso de R$ 4.000 com 30 dias. Gerados por `calcularFerias`,
  // `calcularINSSProgressivo`, `calcularIRRF` e `calcularSalarioLiquido`.
  const valores = [
    'R$ 1.233,33', // recibo líquido de 10 dias
    'R$ 1.811,40', // contracheque dos 20 dias trabalhados
    'R$ 2.751,40', // mês normal, para comparar
    'R$ 3.044,73', // soma dos dois pagamentos
    'R$ 940,00', // quanto o contracheque vem a menos
    'R$ 288,60', // INSS do mês inteiro (com o terço na base)
    'R$ 3.631,40', // 30 dias de férias, recibo líquido
    'R$ 4.671,40', // 20 dias gozados + 10 vendidos
    'R$ 122,45', // IRRF que aparece nas férias de quem ganha R$ 4.000
    'R$ 5.018,07', // o mesmo salário vendendo 10 dias, sem IRRF
  ]

  test('o post publica só valores calculados pelo core', async ({ page }) => {
    await page.goto(`/blog/${POST}`)
    const artigo = page.locator('article')
    for (const valor of valores) {
      await expect(artigo.getByText(valor, { exact: false }).first(), valor).toBeVisible()
    }
  })
})

test.describe('F65 — correções de conteúdo que vieram junto', () => {
  test('a página de férias não promete mais dobro por atraso no pagamento', async ({ page }) => {
    // A Súmula 450 do TST foi declarada inconstitucional pelo STF (ADPF 501), e
    // a página dizia "acréscimo de 50%", que nunca foi o teor da súmula.
    await page.goto('/calculadora/ferias')
    const artigo = page.locator('article')
    await expect(artigo.getByText('acréscimo de 50%')).toHaveCount(0)
    await expect(artigo.getByText('ADPF 501').first()).toBeVisible()
  })

  test('a calculadora de férias não promete descontos que não calcula', async ({ page }) => {
    // `calcularFerias` devolve valor bruto. A description dizia "com descontos
    // de INSS e IRRF" — promessa que o resultado não cumpria.
    await page.goto('/calculadora/ferias')
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.toLowerCase()).toContain('bruto')
    expect(description!.toLowerCase()).not.toContain('descontos de inss')
  })
})
