import { test, expect, type Page } from '@playwright/test'

// O `ErrorLogger` escuta o evento `error` em fase de captura, e nessa fase o
// navegador entrega duas coisas diferentes no mesmo handler: exceção de
// JavaScript e falha de carregamento de recurso. Enquanto as duas viravam o
// mesmo evento `exception`, o GA4 de 08/09 mostrou 286 `exception` para 323
// `page_view` — um relatório em que não dá para achar erro nenhum do site.
//
// Estes testes travam a classificação na origem, que é onde ela ainda é
// possível: depois de enviado, um `exception` com `description` vazia não tem
// como ser reclassificado no painel.

type EventoCapturado = { nome: string; params: Record<string, unknown> }

/**
 * O `analytics.track` só envia quando `window.gtag` existe, e o
 * `<GoogleAnalytics>` só renderiza com `NEXT_PUBLIC_GA_ID` presente — que não
 * é o caso em dev. O stub faz os dois papéis: habilita o envio e grava o que
 * foi enviado.
 */
async function capturarEventos(page: Page) {
  await page.addInitScript(() => {
    const capturados: EventoCapturado[] = []
    ;(window as unknown as { __eventos: EventoCapturado[] }).__eventos = capturados
    ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
      ...args: unknown[]
    ) => {
      if (args[0] === 'event') {
        capturados.push({
          nome: String(args[1]),
          params: (args[2] as Record<string, unknown>) ?? {},
        })
      }
    }
  })
}

function eventos(page: Page, nome: string) {
  return page.evaluate(
    (n) =>
      (window as unknown as { __eventos: EventoCapturado[] }).__eventos.filter(
        (e) => e.nome === n,
      ),
    nome,
  )
}

test.describe('ErrorLogger — classificação de erro', () => {
  test.beforeEach(async ({ page }) => {
    await capturarEventos(page)
    await page.goto('/')
  })

  test('falha de recurso vira resource_error, não exception', async ({ page }) => {
    await page.evaluate(async () => {
      const img = document.createElement('img')
      const carregou = new Promise((resolve) => img.addEventListener('error', resolve))
      img.src = '/imagem-que-nao-existe-teste.png'
      document.body.appendChild(img)
      await carregou
    })

    // Filtrado pelo recurso do teste, e não pela contagem total, porque a
    // página tem recursos de terceiro que podem falhar por conta própria — a
    // primeira execução desta suíte pegou o
    // `va.vercel-scripts.com/v1/script.debug.js` caindo. Lido na época como
    // ruído de dev, era o mesmo defeito de produção: o F75 achou o
    // `/_vercel/insights/script.js` em 404 em toda página.
    const recursos = (await eventos(page, 'resource_error')).filter((e) =>
      String(e.params.resource_url).includes('imagem-que-nao-existe-teste.png'),
    )
    expect(recursos).toHaveLength(1)
    expect(recursos[0]?.params.resource_tag).toBe('img')

    // A invariante que importa: o relatório de exceção não é contaminado por
    // imagem quebrada nem por tracker bloqueado por adblock.
    expect(await eventos(page, 'exception')).toHaveLength(0)
  })

  test('a página não carrega o script do Vercel Analytics', async ({ page }) => {
    // O Web Analytics nunca foi ligado no projeto da Vercel, então o script
    // respondia 404 em produção e gerava um `resource_error` por pageview: 267
    // em 292 sessões no GA4 de 05/09→02/10, o relatório de erro afogado de novo.
    // Voltar a usar exige ligar o produto na Vercel antes, não só o componente.
    await expect(
      page.locator('script[src*="/_vercel/insights"], script[src*="vercel-scripts.com"]'),
    ).toHaveCount(0)
  })

  test('o mesmo recurso quebrado é reportado uma vez só', async ({ page }) => {
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) {
        const img = document.createElement('img')
        const carregou = new Promise((resolve) => img.addEventListener('error', resolve))
        img.src = '/imagem-repetida-teste.png'
        document.body.appendChild(img)
        await carregou
      }
    })

    const repetidos = (await eventos(page, 'resource_error')).filter((e) =>
      String(e.params.resource_url).includes('imagem-repetida-teste.png'),
    )
    expect(repetidos).toHaveLength(1)
  })

  test('promessa rejeitada é exception não-fatal', async ({ page }) => {
    await page.evaluate(() => {
      void Promise.reject(new Error('rejeicao_de_teste'))
    })
    await expect
      .poll(async () => (await eventos(page, 'exception')).length)
      .toBeGreaterThan(0)

    const excecoes = await eventos(page, 'exception')
    const nossa = excecoes.find((e) =>
      String(e.params.description).includes('rejeicao_de_teste'),
    )

    expect(nossa).toBeDefined()
    // `fatal` no GA4 significa "a pessoa perdeu a página". Uma promessa
    // rejeitada sem `catch` não derruba a renderização — marcá-la fatal
    // apagava a diferença entre tela de erro e falha de script de terceiro.
    expect(nossa?.params.fatal).toBe(false)
  })

  test('exception nunca é enviado sem description', async ({ page }) => {
    // Erro de script cross-origin chega com `message` vazia e sem
    // `filename`/`lineno` — era a linha que aparecia em branco no painel.
    await page.evaluate(() => {
      window.dispatchEvent(new ErrorEvent('error', { message: '' }))
    })

    const excecoes = await eventos(page, 'exception')
    for (const e of excecoes) {
      expect(String(e.params.description ?? '').trim()).not.toBe('')
    }
  })
})
