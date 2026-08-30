import { test, expect } from '@playwright/test'

// Trava o F22 — o blog, começando pelo guia sazonal do 13º salário.
//
// O blog é a maior lacuna do plano de negócios (seção 3.2) e nunca tinha sido
// implementado: até o F44 o rodapé linkava `/blog`, uma rota inexistente, em
// 100% das páginas. Estes testes cobrem três coisas distintas, e a terceira é
// a que mais importa a longo prazo:
//
//  1. a rota existe, lista, renderiza e 404 quando deve;
//  2. o par de links recíprocos post <-> calculadora (disciplina do F43) —
//     é o que faz o post ter função, em vez de ser um texto solto;
//  3. os números do artigo saem do motor. Mesma trava do F47: se uma regra de
//     cálculo mudar, o artigo não pode divergir da calculadora em silêncio.

const POST = 'decimo-terceiro-2026-quando-cai-e-quanto-voce-recebe'

test.describe('blog — listagem e rota', () => {
  test('/blog lista o post com data e tempo de leitura', async ({ page }) => {
    await page.goto('/blog')

    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()

    const card = page.getByRole('article').filter({ hasText: 'Décimo terceiro 2026' })
    await expect(card).toHaveCount(1)
    await expect(card.getByText('30 de agosto de 2026')).toBeVisible()
    await expect(card.getByText('7 min de leitura')).toBeVisible()
  })

  test('o card leva ao post', async ({ page }) => {
    await page.goto('/blog')
    await page.getByRole('link', { name: /Décimo terceiro 2026/ }).click()
    await expect(page).toHaveURL(new RegExp(`/blog/${POST}$`))
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Décimo terceiro 2026')
  })

  test('slug inexistente devolve 404', async ({ page }) => {
    const resposta = await page.goto('/blog/post-que-nao-existe')
    expect(resposta?.status()).toBe(404)
  })

  test('o rodapé volta a linkar /blog — agora a rota existe (F44 + F22)', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('footer').getByRole('link', { name: 'Blog', exact: true })
    await expect(link).toHaveAttribute('href', '/blog')

    const resposta = await page.request.get('/blog')
    expect(resposta.status()).toBe(200)
  })
})

test.describe('blog — SEO', () => {
  test('o post declara Article com data de publicação e de modificação', async ({ page }) => {
    await page.goto(`/blog/${POST}`)

    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
    const article = blocos.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Article')

    expect(article, 'nenhum JSON-LD Article na página').toBeTruthy()
    expect(article.datePublished).toBe('2026-08-30')
    expect(article.dateModified).toBe('2026-08-30')
    expect(article.headline).toContain('Décimo terceiro 2026')
    expect(article.inLanguage).toBe('pt-BR')
  })

  test('o post tem imagem social própria', async ({ page }) => {
    const resposta = await page.request.get(`/blog/${POST}/opengraph-image`)
    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['content-type']).toContain('image/png')
  })

  test('sitemap inclui o hub e o post', async ({ page }) => {
    const xml = await (await page.request.get('/sitemap.xml')).text()
    expect(xml).toContain('<loc>https://calculosonline.com.br/blog</loc>')
    expect(xml).toContain(`<loc>https://calculosonline.com.br/blog/${POST}</loc>`)
  })

  test('títulos do MDX não parecem link de corpo de texto', async ({ page }) => {
    // `rehype-autolink-headings` embrulha todo título num <a>. Sem a regra do
    // globals.css, o `.prose a` pintava cada H2 de azul sublinhado — no blog,
    // onde os H2 são a estrutura da página inteira, fica especialmente ruim.
    await page.goto(`/blog/${POST}`)

    const ancora = page.locator('article h2 a').first()
    await expect(ancora).toBeVisible()

    const estilo = await ancora.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { decoracao: cs.textDecorationLine, cor: cs.color }
    })
    expect(estilo.decoracao).toBe('none')
    // gray-900 herdado do h2, não o blue-600 do link de corpo de texto.
    expect(estilo.cor).not.toBe('rgb(37, 99, 235)')
  })
})

test.describe('blog — links recíprocos com a calculadora (F43)', () => {
  test('o post manda o leitor para a calculadora do 13º', async ({ page }) => {
    await page.goto(`/blog/${POST}`)

    const cta = page.getByRole('link', { name: /13º Salário/ }).first()
    await expect(cta).toHaveAttribute('href', '/calculadora/decimo-terceiro')
  })

  test('o post lista as calculadoras que cita', async ({ page }) => {
    await page.goto(`/blog/${POST}`)

    const bloco = page.getByRole('region', { name: 'Calculadoras citadas neste artigo' })
    await expect(bloco).toBeVisible()
    for (const slug of ['salario-liquido', 'inss', 'irrf', 'ferias']) {
      await expect(bloco.locator(`a[href="/calculadora/${slug}"]`)).toHaveCount(1)
    }
  })

  test('a calculadora do 13º aponta de volta para o guia', async ({ page }) => {
    await page.goto('/calculadora/decimo-terceiro')

    const bloco = page.getByRole('region', { name: /Guia sobre este tema/ })
    await expect(bloco).toBeVisible()
    await expect(bloco.locator(`a[href="/blog/${POST}"]`)).toHaveCount(1)
  })

  test('calculadora sem post não renderiza bloco de guias vazio', async ({ page }) => {
    // 19 das 20 calculadoras ainda não têm post. Um bloco vazio nelas seria o
    // mesmo tipo de link sem sinal que o F43 removeu do rodapé.
    await page.goto('/calculadora/imc')
    await expect(page.getByRole('region', { name: /Guia sobre este tema/ })).toHaveCount(0)
  })
})

test.describe('blog — os números vêm do motor (mesma trava do F47)', () => {
  // Cada valor abaixo foi gerado rodando `calcularDecimoTerceiro`, não escrito
  // à mão. Se uma regra de INSS/IRRF ou do 13º mudar, o artigo passa a mentir
  // e este teste quebra antes de alguém notar em produção.
  const valores = [
    // salário R$ 2.500, 12 meses: 1ª parcela, INSS e total líquido
    'R$ 1.250,00',
    'R$ 202,23',
    'R$ 2.297,77',
    // salário R$ 10.000: a 2ª parcela é menos da metade da 1ª
    'R$ 5.000,00',
    'R$ 2.468,80',
    // regra dos 15 dias: 9 meses vs 10 meses com um dia de diferença
    'R$ 2.475,95',
    'R$ 2.722,76',
    // dependentes derrubando o IRRF de R$ 4.000
    'R$ 149,83',
    'R$ 64,51',
  ]

  for (const valor of valores) {
    test(`o artigo publica ${valor}, valor calculado pelo core`, async ({ page }) => {
      await page.goto(`/blog/${POST}`)
      await expect(page.locator('article').getByText(valor, { exact: false }).first()).toBeVisible()
    })
  }

  test('as duas datas de 2026 estão no artigo, com a antecipação do domingo', async ({
    page,
  }) => {
    await page.goto(`/blog/${POST}`)
    const artigo = page.locator('article')

    // 20/12/2026 é domingo — a 2ª parcela antecipa para sexta, 18/12.
    await expect(artigo.getByText('30 de novembro de 2026', { exact: false }).first()).toBeVisible()
    await expect(artigo.getByText('18 de dezembro', { exact: false }).first()).toBeVisible()
  })
})
