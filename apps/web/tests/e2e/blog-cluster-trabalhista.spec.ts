import { test, expect } from '@playwright/test'
import { blogRegistry } from '../../src/lib/blog'

// Trava os 4 posts do cluster 13º/rescisão (export do GSC de 08/09).
//
// A pauta saiu do dado: `rescisao-trabalhista` (+93% de impressão) e
// `decimo-terceiro` (+84%) foram as duas páginas que mais cresceram no export,
// e são justamente as do pico de nov/dez — em posição 91,5 e 85,8. As queries
// que motivaram cada post estão nas `palavrasChave` do registry.
//
// Três coisas distintas aqui, e a terceira é a que dura:
//  1. as rotas existem, listam e trazem o `Article` com as datas certas;
//  2. os links recíprocos post <-> calculadora <-> hub (disciplina do F43);
//  3. os números saem do motor. Mesma trava do F47/F22: se uma regra de
//     cálculo mudar, o artigo não pode divergir da calculadora em silêncio.

const ACORDO = 'rescisao-por-acordo-mutuo-quanto-voce-recebe'
const ACERTO = 'acerto-trabalhista-o-que-entra-e-quando-recebo'
const PROPORCIONAL = '13-salario-proporcional-como-calcular'
const DIREITOS = 'direitos-trabalhistas-na-demissao-guia-completo'

const NOVOS = [ACORDO, ACERTO, PROPORCIONAL, DIREITOS]

test.describe('cluster trabalhista — rotas e listagem', () => {
  for (const slug of NOVOS) {
    test(`/blog/${slug} responde 200 e tem H1`, async ({ page }) => {
      const resposta = await page.goto(`/blog/${slug}`)
      expect(resposta?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })
  }

  test('a listagem passou a ter os 5 posts', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.getByRole('article')).toHaveCount(blogRegistry.length)
    expect(blogRegistry).toHaveLength(5)
  })

  test('o sitemap inclui os 4 posts novos', async ({ page }) => {
    const xml = await (await page.request.get('/sitemap.xml')).text()
    for (const slug of NOVOS) {
      expect(xml).toContain(`<loc>https://calculosonline.com.br/blog/${slug}</loc>`)
    }
  })

  test('cada post tem imagem social própria', async ({ page }) => {
    for (const slug of NOVOS) {
      const r = await page.request.get(`/blog/${slug}/opengraph-image`)
      expect(r.status(), slug).toBe(200)
      expect(r.headers()['content-type']).toContain('image/png')
    }
  })

  test('os posts declaram Article com data de publicação', async ({ page }) => {
    for (const slug of NOVOS) {
      await page.goto(`/blog/${slug}`)
      const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
      const article = blocos.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'Article')
      expect(article, `sem Article em ${slug}`).toBeTruthy()
      expect(article.datePublished).toBe('2026-09-08')
      expect(article.inLanguage).toBe('pt-BR')
    }
  })

  test('nenhum title de post estoura o orçamento da SERP', async ({ page }) => {
    // Mesmo orçamento de 78 caracteres que o F38 fixou para as calculadoras —
    // acima disso o Google trunca e o termo de busca pode cair fora.
    for (const slug of NOVOS) {
      await page.goto(`/blog/${slug}`)
      const title = await page.title()
      expect(title.length, `${slug}: "${title}"`).toBeLessThanOrEqual(78)
    }
  })
})

test.describe('cluster trabalhista — links recíprocos (F43)', () => {
  test('a calculadora de rescisão lista os 3 guias que a citam', async ({ page }) => {
    await page.goto('/calculadora/rescisao-trabalhista')
    const bloco = page.getByRole('region', { name: /Guias sobre este tema/ })
    await expect(bloco).toBeVisible()
    for (const slug of [ACORDO, ACERTO, DIREITOS]) {
      await expect(bloco.locator(`a[href="/blog/${slug}"]`), slug).toHaveCount(1)
    }
  })

  test('a calculadora do 13º lista os dois guias do tema', async ({ page }) => {
    await page.goto('/calculadora/decimo-terceiro')
    const bloco = page.getByRole('region', { name: /Guias sobre este tema/ })
    await expect(bloco.locator(`a[href="/blog/${PROPORCIONAL}"]`)).toHaveCount(1)
  })

  // O post agregado é o único com `ctaHub` — o CTA de topo vai para o hub do
  // F58, não para uma calculadora, porque a intenção é "todos os direitos".
  test('o post de direitos manda o leitor para o hub, não para uma calculadora', async ({
    page,
  }) => {
    await page.goto(`/blog/${DIREITOS}`)
    const cta = page.getByRole('link', { name: /Calculadora Trabalhista Completa/ }).first()
    await expect(cta).toHaveAttribute('href', '/calculadora-trabalhista-completa')
  })

  test('o hub aponta de volta para o post agregado', async ({ page }) => {
    await page.goto('/calculadora-trabalhista-completa')
    const bloco = page.getByRole('region', { name: /Guia sobre este tema/ })
    await expect(bloco).toBeVisible()
    await expect(bloco.locator(`a[href="/blog/${DIREITOS}"]`)).toHaveCount(1)
  })

  // Os outros posts continuam com o CTA na calculadora — se `ctaHub` vazasse
  // para todos, o leitor de um guia específico cairia sempre no fluxo longo.
  test('post sem ctaHub continua mandando para a calculadora', async ({ page }) => {
    await page.goto(`/blog/${ACORDO}`)
    const cta = page.getByRole('link', { name: /Rescisão Trabalhista/ }).first()
    await expect(cta).toHaveAttribute('href', '/calculadora/rescisao-trabalhista')
  })

  test('os posts do cluster se citam entre si', async ({ page }) => {
    // Sem isto os quatro seriam quatro ilhas: o cluster só concentra
    // autoridade se os posts se linkarem, que é o ponto do F43.
    const esperado: Record<string, string[]> = {
      [ACORDO]: [ACERTO, PROPORCIONAL],
      [ACERTO]: [DIREITOS],
      [PROPORCIONAL]: [ACERTO, DIREITOS],
      [DIREITOS]: [ACERTO, PROPORCIONAL, ACORDO],
    }
    for (const [origem, destinos] of Object.entries(esperado)) {
      await page.goto(`/blog/${origem}`)
      for (const destino of destinos) {
        await expect(
          page.locator('article').locator(`a[href="/blog/${destino}"]`),
          `${origem} -> ${destino}`,
        ).not.toHaveCount(0)
      }
    }
  })
})

test.describe('cluster trabalhista — os números vêm do motor', () => {
  // Cada valor abaixo saiu de uma execução de `calcularRescisao`,
  // `calcularDecimoTerceiro` ou `calcularPanoramaTrabalhista`, não de conta à
  // mão. Se uma regra mudar, estes testes quebram antes de o artigo mentir.
  const casos: Array<[string, string[]]> = [
    [
      ACORDO,
      [
        // salário 3.000, contrato 01/03/2021 → 30/09/2026, acordo mútuo
        'R$ 11.787,35', // líquido do acordo
        'R$ 18.449,66', // líquido da demissão sem justa causa
        'R$ 6.623,96', // líquido do pedido de demissão
        'R$ 3.216,00', // multa de 20% do FGTS
        'R$ 12.549,33', // total bruto
        // F40 — as duas leituras do aviso prévio, 10 anos de casa
        'R$ 3.000,00',
        'R$ 1.500,00',
      ],
    ],
    [
      ACERTO,
      [
        // salário 2.500, 10/05/2023 → 15/09/2026, 1 férias vencida
        'R$ 14.678,07', // líquido sem justa causa
        'R$ 10.616,95', // líquido acordo mútuo
        'R$ 7.305,84', // líquido pedido de demissão
        'R$ 4.489,58', // líquido justa causa — não é zero
        'R$ 3.250,00', // aviso proporcional de 39 dias
      ],
    ],
    [
      PROPORCIONAL,
      [
        // degrau da regra dos 15 dias, salário 3.000, junho
        'R$ 1.616,81',
        'R$ 1.387,50',
        // tabela por mês de admissão, salário 2.500
        'R$ 2.299,31',
        'R$ 1.156,25',
        'R$ 192,71',
        // 6/12 com salário 12.000 — a única faixa em que o IRRF ainda aparece,
        // porque o redutor de 2026 zera todo 13º de até R$ 5.000
        'R$ 4.973,39',
      ],
    ],
    [
      DIREITOS,
      [
        // panorama do F58: salário 3.000, 5 anos
        'R$ 15.777,66', // o que a pessoa recebe de fato
        'R$ 36.929,06', // a soma ingênua, que não existe
        'R$ 2.751,40',
        'R$ 4.000,00',
        'R$ 14.400,00',
      ],
    ],
  ]

  for (const [slug, valores] of casos) {
    test(`${slug} publica só valores calculados pelo core`, async ({ page }) => {
      await page.goto(`/blog/${slug}`)
      const artigo = page.locator('article')
      for (const valor of valores) {
        await expect(artigo.getByText(valor, { exact: false }).first(), valor).toBeVisible()
      }
    })
  }

  test('o guia agregado avisa que a soma é o erro, antes de mostrar a soma', async ({
    page,
  }) => {
    // Mesma invariante do F58: o aviso fica ACIMA dos números, senão a tabela
    // é lida como se fosse somável.
    await page.goto(`/blog/${DIREITOS}`)
    const artigo = page.locator('article')

    const aviso = artigo.getByRole('heading', { name: /O erro de somar/i }).first()
    const soma = artigo.getByText('R$ 36.929,06').first()
    await expect(aviso).toBeVisible()
    await expect(soma).toBeVisible()

    const yAviso = (await aviso.boundingBox())?.y ?? 0
    const ySoma = (await soma.boundingBox())?.y ?? 0
    expect(yAviso).toBeLessThan(ySoma)
  })
})
