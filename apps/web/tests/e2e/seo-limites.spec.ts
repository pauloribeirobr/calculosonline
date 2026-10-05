import { test, expect } from '@playwright/test'

// Trava a F77 — title e meta description de **toda** página do sitemap.
//
// O SEO Analysis do Bing Webmaster Tools (04/10) apontou "title too long" em 6
// páginas e "meta description curta" em 8. Conferido em produção: o title do
// hub tinha 86 caracteres, acima do teto de 78 do `seo.ts`, porque o hub não
// passa por `buildCalculatorTitle`; e as descrições curtas eram a do IMC (75),
// a do FGTS (89), a do salário líquido (97) e as 7 categorias (84-99).
//
// O teto do title vale para qualquer rota nova — página fora do registry (hub,
// feriados, blog) é exatamente onde a regra escapa. Por isso o teste lê o
// sitemap, e não uma lista escrita à mão.

const TITLE_MAX = 78
// O Bing apontou as 8 páginas com até 96 caracteres e não apontou as de 100-106
// (juros compostos, DAS MEI, contato, IRPF). Não há teto: descrição longa só é
// cortada no snippet, e o Bing não reclamou de nenhuma das 14 acima de 165 —
// entre elas a da hora extra, que é a página que mais cresce em IA (F67).
const DESCRICAO_MIN = 100

test('toda página do sitemap respeita os limites de title e description', async ({
  page,
  request,
}) => {
  test.setTimeout(240_000)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  const paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map(
    (m) => m[1] || '/',
  )
  expect(paths.length).toBeGreaterThan(40)

  const problemas: string[] = []
  for (const path of paths) {
    await page.goto(path)
    const title = await page.title()
    const descricao = (await page.locator('meta[name="description"]').getAttribute('content')) ?? ''
    if (title.length > TITLE_MAX) problemas.push(`${path}: title com ${title.length} — ${title}`)
    if (descricao.length < DESCRICAO_MIN) {
      problemas.push(`${path}: description com ${descricao.length} — ${descricao}`)
    }
  }
  expect(problemas, problemas.join('\n')).toEqual([])
})
