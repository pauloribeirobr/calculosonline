#!/usr/bin/env node
// F89 — a lista de palavras-chave da concorrência: as fixas (a cabeça de cada calculadora e o foco em investimentos, à mão) +
// as tiradas do Search Console (consulta × página). Versionada em dados/leituras/palavras-chave.json; o dados/serp.mjs busca
// o top 10 de cada uma no Google. Porte do ../recibofacil/dados/palavras-chave.mjs (F290), com limites para um site pequeno:
// o RF tira 150 palavras de 28 dias; aqui 28 dias dão poucas consultas com volume, então a janela padrão é de 90 dias e a
// lista fixa carrega o peso (as buscas que o Semrush mediu e onde o site ainda não aparece).
//
// Uso:  node dados/palavras-chave.mjs [--dias 90] [--max 60] [--por-pagina 4] [--imp-consulta 10] [--opp-imp 15]
// Critério (cada consulta vai para a página que mais teve impressão nela):
//   1. das páginas com 3+ cliques ou 200+ impressões na janela, as consultas de --imp-consulta+ impressões (máx. --por-pagina);
//   2. as oportunidades: --opp-imp+ impressões na posição 3 a 20;
//   sem a marca, sem variação de acento ou de espaço da mesma busca (fica a de mais impressões), as --max de mais impressões.
//   Consultas de data exata ("quantos dias faltam para 25 de dezembro") ficam de fora: são cauda do /calculadora/datas e não
//   dizem quem é concorrente. "fixas" e "fora" (editáveis à mão) passam de uma geração para a outra.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { argumentos, caminho, exigir } from './lib/config.mjs'
import { google } from './lib/google.mjs'
import { ARQ_PALAVRAS } from './lib/serp.mjs'
import { markdown } from './lib/tabela.mjs'

const args = argumentos()
const n = (k, padrao) => Number(args[k] && args[k] !== true ? args[k] : padrao)
const DIAS = n('dias', 90),
  MAX = n('max', 60),
  POR_PAGINA = n('por-pagina', 4),
  IMP_CONSULTA = n('imp-consulta', 10),
  OPP_IMP = n('opp-imp', 15)
const dia = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)
const [de, ate] = [dia(DIAS + 2), dia(3)] // dias fechados (o GSC atrasa 2 a 3 dias)

// Primeira geração (17/11/2026): a cabeça de busca de cada calculadora com tráfego possível, e o foco em investimentos
// (Semrush, 26/10/2026: tesouro reserva 49.500/mês, simulador tesouro direto 14.800, calculadora cdb 8.100).
const FIXAS_INICIAIS = [
  ['tesouro reserva', '/calculadora/tesouro-direto'],
  ['simulador tesouro direto', '/calculadora/tesouro-direto'],
  ['calculadora cdb', '/calculadora/cdb'],
  ['calculadora poupança', '/calculadora/poupanca'],
  ['calculadora juros compostos', '/calculadora/juros-compostos'],
  ['simulador de financiamento', '/calculadora/financiamento'],
  ['simulador de empréstimo', '/calculadora/emprestimo'],
  ['calculadora rescisão trabalhista', '/calculadora/rescisao-trabalhista'],
  ['calculadora de férias', '/calculadora/ferias'],
  ['calcular décimo terceiro', '/calculadora/decimo-terceiro'],
  ['calcular hora extra', '/calculadora/hora-extra'],
  ['calculadora salário líquido', '/calculadora/salario-liquido'],
  ['calculadora inss', '/calculadora/inss'],
  ['calculadora irrf', '/calculadora/irrf'],
  ['calculadora fgts', '/calculadora/fgts'],
  ['calculadora de datas', '/calculadora/datas'],
  ['calculadora de porcentagem', '/calculadora/porcentagem'],
  ['calculadora imc', '/calculadora/imc'],
  ['calculadora margem de lucro', '/calculadora/margem-lucro'],
  ['das mei', '/calculadora/das-mei'],
].map(([palavra, pagina]) => ({ palavra, pagina }))

const GSC = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(exigir('GSC_SITE'))}/searchAnalytics/query`
const linhas = []
for (let startRow = 0; ; startRow += 25000) {
  const j = await google(GSC, { body: { startDate: de, endDate: ate, dimensions: ['query', 'page'], rowLimit: 25000, startRow, type: 'web' } })
  linhas.push(...(j.rows || []))
  if ((j.rows || []).length < 25000) break
}

const MARCA = /c[aá]lculos\s*online|calculosonline/i
const DATA_EXATA = /\b\d{1,2}\s*(de\s+)?(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b|\d{1,2}\/\d{1,2}/i
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const consultas = new Map()
const paginas = new Map()
for (const r of linhas) {
  const [q, url] = r.keys,
    pg = caminho(url)
  const p = paginas.get(pg) || { cliques: 0, impressoes: 0 }
  p.cliques += r.clicks
  p.impressoes += r.impressions
  paginas.set(pg, p)
  if (MARCA.test(q) || DATA_EXATA.test(q)) continue
  const c = consultas.get(q) || { palavra: q, impressoes: 0, cliques: 0, somaPos: 0, pagina: null, impPagina: 0 }
  c.impressoes += r.impressions
  c.cliques += r.clicks
  c.somaPos += r.position * r.impressions
  if (r.impressions > c.impPagina) {
    c.pagina = pg
    c.impPagina = r.impressions
  }
  consultas.set(q, c)
}
const todas = [...consultas.values()].map((c) => ({ ...c, posicao: c.somaPos / c.impressoes }))

const escolhidas = new Map() // norm → item
const pegar = (c, motivo) => {
  const k = norm(c.palavra)
  const atual = escolhidas.get(k)
  if (!atual || c.impressoes > atual.impressoes)
    escolhidas.set(k, { palavra: c.palavra, pagina: c.pagina, impressoes: c.impressoes, cliques: c.cliques, posicao: +c.posicao.toFixed(2), motivo: atual ? `${atual.motivo}+${motivo}` : motivo })
}
for (const [pg, p] of paginas) {
  if (p.cliques < 3 && p.impressoes < 200) continue
  let k = 0
  for (const c of todas.filter((x) => x.pagina === pg && x.impressoes >= IMP_CONSULTA).sort((a, b) => b.impressoes - a.impressoes)) {
    if (k >= POR_PAGINA) break
    if (escolhidas.has(norm(c.palavra))) continue
    pegar(c, 'página')
    k++
  }
}
for (const c of todas) if (c.impressoes >= OPP_IMP && c.posicao >= 3 && c.posicao <= 20) pegar(c, 'oportunidade')

const antigo = existsSync(ARQ_PALAVRAS) ? JSON.parse(readFileSync(ARQ_PALAVRAS, 'utf8')) : {}
const fixas = antigo.fixas || FIXAS_INICIAIS
const nFixas = new Set(fixas.map((f) => norm(typeof f === 'string' ? f : f.palavra)))
const palavras = [...escolhidas.values()]
  .filter((p) => !nFixas.has(norm(p.palavra)))
  .sort((a, b) => b.impressoes - a.impressoes)
  .slice(0, MAX)
writeFileSync(
  ARQ_PALAVRAS,
  JSON.stringify(
    {
      gerado: new Date().toISOString().slice(0, 10),
      periodo: `${de} → ${ate}`,
      criterio: `fixas (à mão) + páginas com 3+ cliques ou 200+ impressões: consultas de ${IMP_CONSULTA}+ impressões (máx. ${POR_PAGINA} por página); oportunidades: ${OPP_IMP}+ impressões na posição 3–20; sem a marca, sem data exata, sem variação de acento; as ${MAX} de mais impressões`,
      fixas,
      fora: antigo.fora || [],
      palavras,
    },
    null,
    1,
  ) + '\n',
)

console.log(markdown(['Palavra', 'Página', 'Impressões', 'Cliques', 'Posição', 'Motivo'], palavras.map((p) => [p.palavra, p.pagina, p.impressoes, p.cliques, p.posicao, p.motivo])))
console.log(`\n${fixas.length} fixas + ${palavras.length} do GSC (${de} → ${ate}); ${todas.length} consultas no GSC sem a marca e sem data exata.`)
console.log(`✓ ${ARQ_PALAVRAS}`)
