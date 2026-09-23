import { test, expect } from '@playwright/test'
import { findCalculator } from '../../src/lib/calculators'

// Trava o F68 — a calculadora de datas, primeira feature fora do eixo
// trabalhista/fiscal e primeira sem legislação por trás.
//
// Alvo definido pelo export de 22/09 (Diário, parte 14): **não** é `calculadora
// de datas` (33,1K/mês, mas KD 37 com um AS 20 em 1º), e sim a cauda de KD
// 16-25 — `diferença entre datas` 4,4K/16, `dias entre datas` 3,6K/21,
// `calculadora de meses` 5,4K/23, `calcular dias` 6,6K/24, `somar dias`
// 3,6K/25 —, que soma ~30K de volume/mês na faixa que um AS 2 alcança.
//
// Quatro coisas aqui:
//  1. a rota existe, entra no sitemap e não nasce órfã de link (F43);
//  2. o vocabulário medido está no registry E na copy (disciplina do F67);
//  3. os números do conteúdo saem do mesmo motor do formulário (trava do F47);
//  4. a página **não** finge ter base legal, e declara o que não faz.

const SLUG = 'datas'

async function calcular(
  page: import('@playwright/test').Page,
  campos: {
    modo?: 'diferenca' | 'somar' | 'subtrair'
    inicial: string
    final?: string
    dias?: number
    meses?: number
    diasUteis?: boolean
    incluirInicial?: boolean
  },
) {
  await page.goto(`/calculadora/${SLUG}`)

  if (campos.modo && campos.modo !== 'diferenca') {
    const rotulo = campos.modo === 'somar' ? 'Somar dias a uma data' : 'Subtrair dias de uma data'
    await page.getByRole('radio', { name: rotulo }).check()
  }

  await page.getByLabel('Data inicial').fill(campos.inicial)
  if (campos.final) await page.getByLabel('Data final').fill(campos.final)
  if (campos.dias !== undefined) await page.getByLabel('Dias', { exact: true }).fill(String(campos.dias))
  if (campos.meses !== undefined) {
    await page.getByLabel('Meses', { exact: true }).fill(String(campos.meses))
  }
  if (campos.diasUteis) {
    await page.getByLabel('Contar apenas dias úteis?').selectOption('sim')
  }
  if (campos.incluirInicial) {
    await page.getByLabel('Incluir o dia inicial na contagem?').selectOption('sim')
  }

  await page.getByRole('button', { name: 'Calcular', exact: true }).click()
  return {
    resultado: page.getByRole('region', { name: 'Resultado do cálculo' }),
    detalhamento: page.getByRole('list', { name: 'Detalhamento linha a linha' }),
  }
}

test.describe('F68 — rota, SEO e links', () => {
  test('a rota responde 200 com H1 e entra no sitemap', async ({ page }) => {
    const resposta = await page.goto(`/calculadora/${SLUG}`)
    expect(resposta?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText('Diferença entre Datas')

    const xml = await (await page.request.get('/sitemap.xml')).text()
    expect(xml).toContain(`<loc>https://calculosonline.com.br/calculadora/${SLUG}</loc>`)
  })

  test('o title cabe na SERP e sai sem ano (cálculo atemporal)', async ({ page }) => {
    await page.goto(`/calculadora/${SLUG}`)
    const title = await page.title()
    expect(title.length, title).toBeLessThanOrEqual(78)
    expect(title).toContain('Diferença entre Datas')
    // O ano só faz sentido onde o resultado muda de um ano para o outro.
    expect(title, title).not.toContain('2026')
  })

  test('o registry declara o vocabulário da cauda medida', async () => {
    const calc = findCalculator(SLUG)
    const vocab = [...(calc?.palavrasChave ?? []), ...(calc?.sinonimos ?? [])]
      .join(' | ')
      .toLowerCase()
    for (const termo of [
      'diferença entre datas',
      'dias entre datas',
      'calcular dias',
      'calculadora de meses',
      'contador de meses',
      'somar dias',
      'somar data',
    ]) {
      expect(vocab, termo).toContain(termo)
    }
  })

  test('o vocabulário também está na copy, não só no head', async ({ page }) => {
    // A lição do F38: `keywords` no `<head>` não ranqueia nada desde 2009.
    await page.goto(`/calculadora/${SLUG}`)
    const artigo = page.locator('article')
    for (const termo of [
      'diferença entre duas datas',
      'dias úteis',
      'contador de meses',
      'Somar e subtrair dias',
    ]) {
      await expect(artigo.getByText(termo, { exact: false }).first(), termo).toBeVisible()
    }
  })

  test('a categoria Tempo existe e lista a calculadora', async ({ page }) => {
    const resposta = await page.goto('/categoria/tempo')
    expect(resposta?.status()).toBe(200)
    await expect(page.locator(`a[href="/calculadora/${SLUG}"]`).first()).toBeVisible()
  })

  test('não nasce órfã: as trabalhistas linkam para ela', async ({ page }) => {
    // Num site de AS 2 o PageRank interno é o único capital de autoridade.
    for (const origem of ['rescisao-trabalhista', 'ferias', 'hora-extra']) {
      await page.goto(`/calculadora/${origem}`)
      await expect(
        page.locator(`a[href="/calculadora/${SLUG}"]`).first(),
        origem,
      ).toBeVisible()
    }
  })
})

test.describe('F68 — diferença entre datas', () => {
  test('conta dias corridos, dias úteis e fins de semana que fecham o total', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
    })

    await expect(resultado).toContainText('265 dias')
    await expect(detalhamento).toContainText('189 dias') // úteis
    await expect(detalhamento).toContainText('76 dias') // sábados e domingos
    // O invariante do F57: as linhas exibidas somam o total exibido.
    expect(189 + 76).toBe(265)
  })

  test('decompõe em anos, meses, semanas e horas', async ({ page }) => {
    const { detalhamento } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
    })
    await expect(detalhamento).toContainText('8 meses e 22 dias')
    await expect(detalhamento).toContainText('37 semanas e 6 dias')
    await expect(detalhamento).toContainText('6.360 horas')
  })

  test('incluir o dia inicial muda a contagem em exatamente 1 dia', async ({ page }) => {
    const sem = await calcular(page, { inicial: '01/01/2026', final: '02/01/2026' })
    await expect(sem.resultado).toContainText('1 dia')

    const com = await calcular(page, {
      inicial: '01/01/2026',
      final: '02/01/2026',
      incluirInicial: true,
    })
    await expect(com.resultado).toContainText('2 dias')
  })

  test('marcar dias úteis troca o headline', async ({ page }) => {
    const { resultado } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
      diasUteis: true,
    })
    await expect(resultado).toContainText('Dias úteis entre as datas')
    await expect(resultado).toContainText('189 dias')
  })

  test('a borda de fim de mês não produz dias negativos', async ({ page }) => {
    // 31/01 → 01/03 daria "1 mês e −2 dias" na decomposição ingênua.
    const { detalhamento } = await calcular(page, {
      inicial: '31/01/2026',
      final: '01/03/2026',
    })
    await expect(detalhamento).toContainText('1 mês e 1 dia')
    await expect(detalhamento).not.toContainText('−2')
  })

  test('datas invertidas são trocadas, com aviso', async ({ page }) => {
    const { resultado } = await calcular(page, {
      inicial: '23/09/2026',
      final: '01/01/2026',
    })
    await expect(resultado).toContainText('265 dias')
    await expect(resultado).toContainText('trocadas')
  })
})

test.describe('F68 — somar e subtrair', () => {
  test('somar 90 dias devolve a data final por extenso', async ({ page }) => {
    const { resultado } = await calcular(page, {
      modo: 'somar',
      inicial: '23/09/2026',
      dias: 90,
    })
    await expect(resultado).toContainText('Data final')
    await expect(resultado).toContainText('22 de dezembro de 2026')
    // O dia da semana é o que decide se o prazo é útil — vai junto sempre.
    await expect(resultado).toContainText('terça-feira')
  })

  test('somar dias úteis pula o fim de semana', async ({ page }) => {
    const corridos = await calcular(page, { modo: 'somar', inicial: '23/09/2026', dias: 30 })
    await expect(corridos.resultado).toContainText('23 de outubro de 2026')

    const uteis = await calcular(page, {
      modo: 'somar',
      inicial: '23/09/2026',
      dias: 30,
      diasUteis: true,
    })
    await expect(uteis.resultado).toContainText('4 de novembro de 2026')
  })

  test('somar 1 mês a 31/01 cai no último dia de fevereiro', async ({ page }) => {
    const { resultado } = await calcular(page, {
      modo: 'somar',
      inicial: '31/01/2026',
      meses: 1,
      dias: 0,
    })
    await expect(resultado).toContainText('28 de fevereiro de 2026')
  })

  test('subtrair 30 dias volta no calendário', async ({ page }) => {
    const { resultado, detalhamento } = await calcular(page, {
      modo: 'subtrair',
      inicial: '23/09/2026',
      dias: 30,
    })
    await expect(resultado).toContainText('30 dias')
    await expect(detalhamento).toContainText('24 de agosto de 2026')
  })
})

test.describe('F68 — o que a página não finge ser', () => {
  test('não exibe base legal nem rótulo de tabelas — não tem nenhum dos dois', async ({
    page,
  }) => {
    const { resultado } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
    })
    await expect(resultado).not.toContainText('Base legal')
    await expect(resultado).not.toContainText('Tabelas:')
    // E o selo do cabeçalho também some.
    await expect(page.getByTitle(/^Base legal:/)).toHaveCount(0)
  })

  test('declara que feriados não entram nos dias úteis', async ({ page }) => {
    const { resultado } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
    })
    await expect(resultado).toContainText('feriados')
  })

  test('nenhuma linha do detalhamento sai formatada como dinheiro', async ({ page }) => {
    // Sem o `valorTexto` do F68, "Dias corridos: 265" sairia como "R$ 265,00":
    // a inferência de formato da UI assume moeda quando não reconhece a linha.
    const { detalhamento } = await calcular(page, {
      inicial: '01/01/2026',
      final: '23/09/2026',
    })
    await expect(detalhamento).not.toContainText('R$')
  })

  test('a tabela do conteúdo bate com a calculadora', async ({ page }) => {
    await page.goto(`/calculadora/${SLUG}`)
    const artigo = page.locator('article')
    for (const valor of ['265', '189', '8 meses e 22 dias', '28/02/2026', '04/11/2026']) {
      await expect(artigo.getByText(valor, { exact: false }).first(), valor).toBeVisible()
    }
  })
})
