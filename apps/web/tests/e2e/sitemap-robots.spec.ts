import { test, expect } from '@playwright/test'
import { calculatorRegistry, CATEGORIAS } from '../../src/lib/calculators'

// sitemap.xml e robots.txt migraram de next-sitemap (gerado no postbuild,
// estático em public/) para app/sitemap.ts + app/robots.ts nativos do Next,
// no mesmo padrão do recibofacil — sitemap dinâmico a partir do registry
// de calculadoras, com prioridade maior para "featured" e lastModified real
// (calc.dataAtualizacao) em vez de datas de build.

test.describe('sitemap.xml', () => {
  test('inclui todas as 20 calculadoras e as páginas de categoria', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.ok()).toBeTruthy()
    expect(res.headers()['content-type']).toContain('xml')

    const body = await res.text()

    for (const calc of calculatorRegistry) {
      expect(body).toContain(`/calculadora/${calc.slug}</loc>`)
    }
    for (const categoria of Object.keys(CATEGORIAS)) {
      expect(body).toContain(`/categoria/${categoria}</loc>`)
    }

    // Canônica de privacidade, não a rota que só redireciona.
    expect(body).toContain('/politica-de-privacidade</loc>')
    expect(body).not.toContain('<loc>https://calculosonline.com.br/privacidade</loc>')
  })

  test('calculadoras featured têm prioridade maior que as demais', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    const body = await res.text()

    const featuredSlug = calculatorRegistry.find((c) => c.featured)!.slug
    const naoFeaturedSlug = calculatorRegistry.find((c) => !c.featured)!.slug

    // Não assume ordem/adjacência exata das tags dentro de <url> — só que
    // <loc> e <priority> do mesmo slug caem no mesmo bloco <url>...</url>.
    const prioridadeDe = (slug: string) => {
      const block = body
        .split('<url>')
        .find((b) => b.includes(`/calculadora/${slug}</loc>`))
      const match = block?.match(/<priority>([\d.]+)<\/priority>/)
      return match ? Number(match[1]) : null
    }

    expect(prioridadeDe(featuredSlug)).toBe(0.95)
    expect(prioridadeDe(naoFeaturedSlug)).toBe(0.9)
  })
})

test.describe('robots.txt', () => {
  test('permite crawling geral e aponta para o sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.ok()).toBeTruthy()

    const body = await res.text()
    expect(body).toMatch(/Allow:\s*\//)
    expect(body).toContain('Disallow: /api/')
    expect(body).toContain('Sitemap: https://calculosonline.com.br/sitemap.xml')
  })
})
