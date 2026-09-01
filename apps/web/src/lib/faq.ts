import fs from 'node:fs'
import path from 'node:path'

export interface FaqItem {
  question: string
  answer: string
}

const CONTENT_DIR = path.join(process.cwd(), 'content/calculadoras')

/**
 * Diretórios de conteúdo que publicam uma seção de FAQ. O hub trabalhista
 * (F58) não é uma calculadora do registry e por isso não mora em
 * `content/calculadoras/` — mas o formato da seção é o mesmo, então o parser
 * é o mesmo. Ver `lib/hubTrabalhista.ts`.
 */
const HUB_DIR = path.join(process.cwd(), 'content/hub')

/** Remove marcação MDX (bold, listas, fences) e normaliza para texto corrido. */
function stripMarkdown(raw: string): string {
  const lines = raw
    .replace(/```/g, '')
    .split('\n')
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean)

  return lines
    .join(' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Extrai pares pergunta/resposta de uma seção "## Perguntas frequentes...". */
function parseFaqSection(section: string): FaqItem[] {
  const lines = section.split('\n')
  const items: FaqItem[] = []
  let current: { question: string; lines: string[] } | null = null

  const flush = () => {
    if (current && current.lines.length) {
      const answer = stripMarkdown(current.lines.join('\n'))
      if (answer) items.push({ question: current.question, answer })
    }
    current = null
  }

  for (const line of lines) {
    const questionMatch = line.match(/^\*\*(.+)\*\*$/)
    if (questionMatch) {
      flush()
      current = { question: (questionMatch[1] ?? '').trim(), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  flush()

  return items
}

/**
 * Lê o MDX editorial da calculadora (apps/web/content/calculadoras/[slug].mdx)
 * e extrai as perguntas frequentes reais da seção "## Perguntas frequentes...".
 * Alimenta o schema FAQPage com conteúdo específico de cada página, em vez
 * das 3 perguntas genéricas repetidas em todas as calculadoras.
 */
export function getFaqFromContent(slug: string): FaqItem[] {
  return getFaqFromArquivo(path.join(CONTENT_DIR, `${slug}.mdx`))
}

/** Mesma extração, para o MDX do hub trabalhista (F58). */
export function getFaqDoHub(slug: string): FaqItem[] {
  return getFaqFromArquivo(path.join(HUB_DIR, `${slug}.mdx`))
}

function getFaqFromArquivo(arquivo: string): FaqItem[] {
  let raw: string
  try {
    raw = fs.readFileSync(arquivo, 'utf-8')
  } catch {
    return []
  }

  const heading = raw.match(/^## Perguntas frequentes.*$/m)
  if (!heading || heading.index === undefined) return []

  const afterHeading = raw.slice(heading.index + heading[0].length)
  const section = afterHeading.split(/^## /m)[0] ?? afterHeading

  return parseFaqSection(section)
}
