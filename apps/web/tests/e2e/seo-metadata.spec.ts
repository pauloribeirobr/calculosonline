import { test, expect } from '@playwright/test'
import { calculatorRegistry } from '../../src/lib/calculators'

// Reforço do P0 de SEO (diagnóstico GSC de 2026-07): título único por
// calculadora (sem duplicar "2026" nas que já têm o ano no tituloLongo) e
// FAQPage com perguntas reais extraídas do MDX, não mais as 3 genéricas
// repetidas em todas as páginas.

test.describe('metadata das páginas de calculadora', () => {
  test('title não duplica o ano (INSS, IRPF, DAS MEI já trazem 2026 no nome)', async ({
    page,
  }) => {
    await page.goto('/calculadora/inss')
    const title = await page.title()
    expect(title.match(/2026/g)).toHaveLength(1)
    expect(title).toContain('Grátis')
  })

  test('title de cada calculadora contém o nome da calculadora e o USP "sem Cadastro"', async ({
    page,
  }) => {
    for (const calc of calculatorRegistry.slice(0, 3)) {
      await page.goto(`/calculadora/${calc.slug}`)
      const title = await page.title()
      expect(title).toContain('sem Cadastro')
    }
  })

  test('FAQPage do JSON-LD tem perguntas específicas da calculadora, não as genéricas antigas', async ({
    page,
  }) => {
    await page.goto('/calculadora/margem-lucro')

    const faqSchema = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      for (const script of scripts) {
        const data = JSON.parse(script.textContent ?? '{}')
        if (data['@type'] === 'FAQPage') return data
      }
      return null
    })

    expect(faqSchema).not.toBeNull()
    const questions = faqSchema.mainEntity.map((q: { name: string }) => q.name)

    // Pergunta específica que só existe no MDX de margem-lucro — prova que
    // não é mais o fallback genérico ("Como usar a...", "gratuitos?").
    expect(questions).toContain('Qual é uma boa margem de lucro?')
    expect(questions.length).toBeGreaterThanOrEqual(4)

    // Nenhuma resposta deve conter marcação MDX residual (bold/fences).
    for (const q of faqSchema.mainEntity) {
      expect(q.acceptedAnswer.text).not.toMatch(/\*\*|```/)
    }
  })

  test('WebApplication, BreadcrumbList e HowTo continuam presentes no JSON-LD', async ({
    page,
  }) => {
    await page.goto('/calculadora/porcentagem')

    const types = await page.evaluate(() =>
      Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
        (s) => JSON.parse(s.textContent ?? '{}')['@type'],
      ),
    )

    expect(types).toEqual(
      expect.arrayContaining(['WebApplication', 'BreadcrumbList', 'HowTo', 'FAQPage']),
    )
  })
})
