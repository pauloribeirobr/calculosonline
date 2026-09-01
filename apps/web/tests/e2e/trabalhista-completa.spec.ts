import { test, expect } from '@playwright/test'
import { HUB_TRABALHISTA } from '../../src/lib/hubTrabalhista'
import { calculatorRegistry } from '../../src/lib/calculators'

// Trava o F58 (hub "Calculadora Trabalhista Completa").
//
// Contexto: o GSC mostra queries de intenção agregada (`calculo trabalhista
// completo`, `como calcular direitos trabalhistas`) que nenhuma das
// calculadoras trabalhistas atende sozinha — cada uma responde um pedaço. O
// único candidato que o site tinha era `/categoria/trabalhista`, um índice de
// links, com 1 pageview em 3 meses.

const HUB = HUB_TRABALHISTA.path

/**
 * Preenchimento canônico: salário R$ 3.000, contrato de 01/09/2021 a
 * 30/09/2026 (60 meses, 5 anos completos), sem justa causa, saldo de FGTS
 * igual ao estimado do contrato. É o mesmo caso das tabelas do MDX, então os
 * números da página e os do texto têm de bater.
 */
async function preencher(page: import('@playwright/test').Page) {
  await page.goto(HUB)
  await page.getByLabel('Salário Bruto').fill('300000')
  await page.getByLabel('Data de Admissão').fill('01/09/2021')
  await page.getByLabel('Data de Saída').fill('30/09/2026')
  await page.getByLabel('Motivo da Saída').selectOption('sem_justa_causa')
  await page.getByLabel('Saldo do FGTS').fill('1440000')
  await page.getByRole('button', { name: /Calcular tudo/ }).click()
}

/**
 * O card de um bloco do resultado. Ancorado no `h3` do bloco porque os mesmos
 * valores aparecem de novo nas tabelas do conteúdo editorial logo abaixo (é o
 * ponto do F47: o texto e a calculadora saem do mesmo motor) — buscar o valor
 * solto na página casaria com dez elementos.
 */
function bloco(page: import('@playwright/test').Page, titulo: string) {
  return page
    .locator('li')
    .filter({ has: page.getByRole('heading', { name: titulo, exact: true }) })
}

/**
 * Links do corpo da página, sem o rodapé — que passou a linkar o hub em 100%
 * das páginas. Sem esse recorte, "a página X linka o hub" seria verdade em
 * toda parte e o teste não mediria nada.
 */
function linksDoConteudo(page: import('@playwright/test').Page, href: string) {
  return page.getByRole('main').locator(`a[href="${href}"]`)
}

test.describe('hub trabalhista — o fluxo único', () => {
  test('um preenchimento só entrega os quatro cálculos', async ({ page }) => {
    await preencher(page)

    const panorama = page.getByRole('heading', { name: 'Seu panorama trabalhista' })
    await expect(panorama).toBeVisible()

    // Os quatro valores saíram de `calcularPanoramaTrabalhista`, não de conta à
    // mão — mesma disciplina do F47. Se uma regra de INSS, IRRF, aviso prévio
    // ou 13º mudar, este teste quebra antes de a página passar a mentir.
    await expect(bloco(page, 'Rescisão')).toContainText('R$ 15.558,57')
    await expect(bloco(page, '13º salário')).toContainText('R$ 2.722,76')
    await expect(bloco(page, 'Férias')).toContainText('R$ 4.000,00')
    await expect(bloco(page, 'FGTS')).toContainText('R$ 14.400,00')
  })

  test('o aviso de que os valores não se somam aparece antes dos números', async ({
    page,
  }) => {
    await preencher(page)

    // A leitura errada (somar os quatro) acontece no primeiro olhar. Se o
    // aviso descer para o rodapé, ele deixa de interceptá-la.
    const aviso = page.getByText(/Os quatro valores não se somam/)
    await expect(aviso).toBeVisible()

    const posicaoAviso = (await aviso.boundingBox())!.y
    const posicaoPrimeiroBloco = (await page
      .getByRole('heading', { name: 'Rescisão', exact: true })
      .boundingBox())!.y
    expect(posicaoAviso).toBeLessThan(posicaoPrimeiroBloco)
  })

  test('a página não oferece um "total geral" somando os blocos', async ({ page }) => {
    await preencher(page)

    // R$ 36.681,33 é a soma ingênua dos quatro blocos — mais que o dobro do
    // que a pessoa realmente recebe. Ele só pode aparecer no texto editorial,
    // como contraexemplo, nunca como um resultado do cálculo.
    const resultado = page.getByRole('heading', { name: 'Seu panorama trabalhista' })
    await expect(resultado).toBeVisible()

    const secaoDeResultado = page.locator('section[aria-label="Calculadora trabalhista completa"]')
    await expect(secaoDeResultado).not.toContainText('R$ 36.681,33')
    await expect(secaoDeResultado).not.toContainText(/Total geral/i)
  })

  test('cada bloco abre o detalhamento e leva à calculadora dedicada', async ({ page }) => {
    await preencher(page)

    for (const slug of HUB_TRABALHISTA.calculadorasEncadeadas) {
      const calc = calculatorRegistry.find((c) => c.slug === slug)!
      await expect(
        page.getByRole('link', { name: `Abrir a calculadora de ${calc.titulo}` }),
      ).toBeVisible()
    }

    // O detalhamento do FGTS marca a multa como referência cruzada, não como
    // verba a mais — é o dinheiro que já está no bloco da rescisão.
    await page.getByText('Ver como chegou nesse valor').last().click()
    await expect(page.getByText('já incluída no total da rescisão acima')).toBeVisible()
  })

  test('formulário inválido reporta erro em vez de calcular', async ({ page }) => {
    await page.goto(HUB)
    await page.getByLabel('Salário Bruto').fill('300000')
    await page.getByLabel('Data de Admissão').fill('01/09/2026')
    await page.getByLabel('Data de Saída').fill('01/09/2021')
    await page.getByRole('button', { name: /Calcular tudo/ }).click()

    await expect(page.getByRole('heading', { name: 'Seu panorama trabalhista' })).toHaveCount(0)
  })
})

test.describe('hub trabalhista — link interno (disciplina do F43)', () => {
  test('as quatro calculadoras encadeadas linkam de volta para o hub', async ({ page }) => {
    // É a metade que dá PageRank ao hub. Sem ela ele receberia link só do
    // rodapé e nasceria no fim da fila, com Authority Score 2.
    for (const slug of HUB_TRABALHISTA.calculadorasEncadeadas) {
      await page.goto(`/calculadora/${slug}`)
      await expect(
        linksDoConteudo(page, HUB),
        `${slug} não linka o hub`,
      ).toHaveCount(1)
    }
  })

  test('as demais calculadoras não exibem o bloco do hub', async ({ page }) => {
    // Bloco fora do tema é exatamente o link sem sinal que o F43 removeu do
    // rodapé — 31 links idênticos em todas as páginas não priorizam nada.
    await page.goto('/calculadora/imc')
    await expect(linksDoConteudo(page, HUB)).toHaveCount(0)
  })

  test('a categoria trabalhista destaca o hub, as outras não', async ({ page }) => {
    await page.goto('/categoria/trabalhista')
    await expect(linksDoConteudo(page, HUB)).toHaveCount(1)

    await page.goto('/categoria/saude')
    await expect(linksDoConteudo(page, HUB)).toHaveCount(0)
  })

  test('o hub aponta para as quatro calculadoras que agrega', async ({ page }) => {
    await page.goto(HUB)
    for (const slug of HUB_TRABALHISTA.calculadorasEncadeadas) {
      await expect(
        page.locator(`a[href="/calculadora/${slug}"]`).first(),
        `hub não linka ${slug}`,
      ).toBeVisible()
    }
  })
})

test.describe('hub trabalhista — SEO', () => {
  test('entra no sitemap com prioridade de ferramenta, não de índice', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    expect(body).toContain(`${HUB}</loc>`)

    const bloco = body.split('<url>').find((b) => b.includes(`${HUB}</loc>`))!
    expect(bloco).toContain('<priority>0.9</priority>')
  })

  test('declara canonical próprio — não é duplicata da rescisão', async ({ page }) => {
    await page.goto(HUB)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://calculosonline.com.br${HUB}`,
    )
  })

  test('publica FAQPage com as perguntas do próprio conteúdo', async ({ page }) => {
    await page.goto(HUB)

    const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
    const dados = blocos.map((b) => JSON.parse(b))

    const faq = dados.find((d) => d['@type'] === 'FAQPage')
    expect(faq, 'nenhum FAQPage na página').toBeTruthy()
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(4)
    expect(JSON.stringify(faq)).toContain('direitos trabalhistas')

    // `ItemList` é o que diz ao Google e ao modelo de IA "esta página agrega
    // estas outras" — a relação que impede o hub de ser lido como duplicata.
    const lista = dados.find((d) => d['@type'] === 'ItemList')
    expect(lista.itemListElement).toHaveLength(4)
  })

  test('tem imagem social própria', async ({ page }) => {
    const resposta = await page.request.get(`${HUB}/opengraph-image`)
    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['content-type']).toContain('image/png')
  })
})

test.describe('hub trabalhista — os números do texto vêm do motor (trava do F47)', () => {
  test('as tabelas do conteúdo batem com o que a calculadora devolve', async ({ page }) => {
    await page.goto(HUB)
    const artigo = page.locator('article')

    // Todos gerados rodando o próprio core, não escritos à mão. O primeiro é o
    // contraexemplo da soma indevida, e é o número que dá o tamanho do erro.
    for (const valor of [
      'R$ 36.681,33', // soma ingênua dos quatro blocos
      'R$ 15.558,57', // rescisão real no mesmo caso
      'R$ 9.189,36', // acordo mútuo
      'R$ 8.320,15', // pedido de demissão
      'R$ 2.722,76', // justa causa (só o 13º proporcional)
      'R$ 7.286,40', // FGTS de 60 meses no salário mínimo
    ]) {
      await expect(artigo, `${valor} sumiu do conteúdo`).toContainText(valor)
    }
  })
})
