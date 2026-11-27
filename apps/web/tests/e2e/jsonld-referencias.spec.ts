import { test, expect, type Page } from '@playwright/test'

// Trava a correção de 27/11/2026 no JSON-LD.
//
// O teste de resultados aprimorados do Google acusou no `/blog`: "O campo
// itemListElement não foi encontrado" num `BreadcrumbList` com id
// `/blog#breadcrumb`. O `WebPage` apontava para `#breadcrumb`, mas a trilha
// publicada não tinha `@id`; o Google criava um nó vazio só com o id. Varrendo o
// sitemap, as 23 calculadoras tinham o mesmo defeito com `#webpage` (o HowTo e o
// Dataset apontavam para um `WebPage` que não existia), e quase toda página
// publicava a trilha duas vezes.

const PAGINAS = [
  '/',
  '/blog',
  '/blog/13-salario-proporcional-como-calcular',
  '/calculadora/cdb',
  '/calculadora/irrf',
  '/calculadora-trabalhista-completa',
  '/categorias',
  '/categoria/trabalhista',
  '/feriados',
  '/sobre',
]

async function jsonLd(page: Page): Promise<unknown[]> {
  const blocos = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocos.map((b) => JSON.parse(b))
}

/** `@id` usados como referência ({"@id": …} sozinho) e os que existem como nó de verdade. */
function referencias(dados: unknown[]) {
  const refs = new Set<string>()
  const nos = new Set<string>()
  const andar = (x: unknown) => {
    if (Array.isArray(x)) return x.forEach(andar)
    if (!x || typeof x !== 'object') return
    const o = x as Record<string, unknown>
    if (typeof o['@id'] === 'string') (Object.keys(o).length === 1 ? refs : nos).add(o['@id'])
    Object.values(o).forEach(andar)
  }
  andar(dados)
  return { refs, nos }
}

test.describe('JSON-LD sem referência solta (27/11/2026)', () => {
  for (const caminho of PAGINAS) {
    test(`${caminho}: toda referência @id aponta para um nó publicado, e há uma trilha só`, async ({
      page,
    }) => {
      await page.goto(caminho)
      const dados = await jsonLd(page)
      const { refs, nos } = referencias(dados)
      const soltas = [...refs].filter((r) => !nos.has(r))
      expect(soltas, `referências sem nó em ${caminho}`).toEqual([])

      const trilhas = dados.filter((d) => (d as { '@type'?: string })['@type'] === 'BreadcrumbList')
      expect(trilhas, `BreadcrumbList em ${caminho}`).toHaveLength(1)
      expect(
        (trilhas[0] as { itemListElement?: unknown[] }).itemListElement?.length,
      ).toBeGreaterThan(0)
    })
  }
})
