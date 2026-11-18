#!/usr/bin/env node
// F89 — leitura do GA4 pela Data API (v1beta, runReport), no vocabulário das Explorações (Linhas / Colunas / Valores).
// Porte do ../recibofacil/dados/ga4.mjs (F284).
//
// Uso:
//   node dados/ga4.mjs dados/leituras/<leitura>.json      → tabela no terminal + CSV em dados/saida/ga4/
//   node dados/ga4.mjs --metadados [--filtro texto]      → dimensões e métricas da propriedade (inclui as personalizadas)
//   node dados/ga4.mjs --propriedades                    → as propriedades a que a conta tem acesso (Admin API)
//
// A leitura (JSON):
//   { "titulo": "…",
//     "periodo": { "de": "2026-10-16", "ate": "2026-11-05" }      (ou { "dias": 28 }, terminando ontem)
//     "linhas": ["deviceCategory"],                              (Linhas)
//     "colunas": "eventName",                                    (Colunas, opcional, uma dimensão)
//     "valores": ["sessions"],                                   (Valores)
//     "filtros": [ { "campo": "eventName", "regex": "calculator_calculated|calculator_shared" } ],   (todos com E)
//     "limite": 1000,
//     "esperado": [ { "linha": ["total (GA4)"], "coluna": "activeUsers", "valor": 216 } ] }        (opcional: valida)
// Filtros: igual, contem, comeca, regex (regex inteira, como "corresponde à regex" do console), em (lista).
// Nomes de dimensão e métrica são os da API (https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema);
// as personalizadas são customEvent:<parâmetro> (ex.: customEvent:calculator_slug), e só existem se cadastradas no GA4.
import { basename } from 'node:path'
import { argumentos, exigir, falhar, lerJson, pastaSaida } from './lib/config.mjs'
import { google } from './lib/google.mjs'
import { br, csv, markdown, pivotar } from './lib/tabela.mjs'

const API = 'https://analyticsdata.googleapis.com/v1beta'
const args = argumentos()

if (args.propriedades) {
  const j = await google('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200', { method: 'GET' })
  const linhas = (j.accountSummaries || []).flatMap((a) =>
    (a.propertySummaries || []).map((p) => [a.displayName, p.displayName, p.property.split('/')[1]]),
  )
  console.log(markdown(['Conta', 'Propriedade', 'ID (GA4_PROPRIEDADE)'], linhas))
  process.exit(0)
}

const propriedade = exigir('GA4_PROPRIEDADE')

if (args.metadados) {
  const j = await google(`${API}/properties/${propriedade}/metadata`, { method: 'GET' })
  const f = typeof args.filtro === 'string' ? args.filtro.toLowerCase() : ''
  const linhas = [
    ...(j.dimensions || []).map((d) => ['dimensão', d.apiName, d.uiName, d.customDefinition ? 'personalizada' : '']),
    ...(j.metrics || []).map((m) => ['métrica', m.apiName, m.uiName, m.customDefinition ? 'personalizada' : '']),
  ].filter((l) => !f || l.join(' ').toLowerCase().includes(f))
  console.log(markdown(['Tipo', 'Nome na API', 'Nome no console', ''], linhas))
  process.exit(0)
}

const arq = args._[0]
if (!arq) falhar('Passe o arquivo da leitura: node dados/ga4.mjs dados/leituras/<leitura>.json')
const L = lerJson(arq, '')

function periodo(p) {
  if (p?.de && p?.ate) return { startDate: p.de, endDate: p.ate }
  if (p?.dias) return { startDate: `${p.dias}daysAgo`, endDate: 'yesterday' }
  falhar('"periodo" precisa de { de, ate } ou { dias }')
}

function filtro(f) {
  const ops = { igual: 'EXACT', contem: 'CONTAINS', comeca: 'BEGINS_WITH', regex: 'FULL_REGEXP' }
  for (const [chave, tipo] of Object.entries(ops)) {
    if (f[chave] !== undefined)
      return { filter: { fieldName: f.campo, stringFilter: { matchType: tipo, value: String(f[chave]), caseSensitive: !!f.maiusculas } } }
  }
  if (Array.isArray(f.em)) return { filter: { fieldName: f.campo, inListFilter: { values: f.em.map(String) } } }
  falhar(`filtro sem operação: ${JSON.stringify(f)}`)
}

const linhasDim = L.linhas || []
const dims = [...linhasDim, ...(L.colunas ? [L.colunas] : [])]
const corpo = {
  dateRanges: [periodo(L.periodo)],
  dimensions: dims.map((name) => ({ name })),
  metrics: (L.valores || []).map((name) => ({ name })),
  limit: L.limite || 10000,
  returnPropertyQuota: true,
}
if (L.filtros?.length)
  corpo.dimensionFilter = L.filtros.length === 1 ? filtro(L.filtros[0]) : { andGroup: { expressions: L.filtros.map(filtro) } }

// Paginação: a API devolve até `limit` linhas por vez e diz o total em rowCount.
const registros = []
let resp
for (let offset = 0; ; offset += corpo.limit) {
  resp = await google(`${API}/properties/${propriedade}:runReport`, { body: { ...corpo, offset } })
  for (const r of resp.rows || []) {
    const reg = {}
    dims.forEach((d, i) => {
      reg[d] = r.dimensionValues[i].value
    })
    corpo.metrics.forEach((m, i) => {
      reg[m.name] = Number(r.metricValues[i].value)
    })
    registros.push(reg)
  }
  if (registros.length >= (resp.rowCount || 0) || !(resp.rows || []).length) break
}

const valores = corpo.metrics.map((m) => m.name)
let tab
if (L.colunas) {
  if (valores.length !== 1) falhar('Com "colunas", use um valor só (como na Exploração).')
  tab = pivotar(registros, linhasDim, L.colunas, valores[0])
} else {
  tab = { cabecalho: [...linhasDim, ...valores], linhas: registros.map((r) => [...linhasDim.map((d) => r[d]), ...valores.map((v) => r[v])]) }
}
// O total vem do próprio GA4, não da soma das linhas: sessões e usuários são contados por estimativa sem duplicar
// (HyperLogLog), e o total da Exploração é esse. Com "colunas", uma consulta a mais só com a dimensão da coluna.
// Sem dimensão nenhuma, a única linha já é o total.
const preenchimento = Array(Math.max(linhasDim.length - 1, 0)).fill('')
let total = null
if (linhasDim.length && L.colunas) {
  const t = await google(`${API}/properties/${propriedade}:runReport`, { body: { ...corpo, dimensions: [{ name: L.colunas }], limit: 10000, offset: 0 } })
  const porColuna = Object.fromEntries((t.rows || []).map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)]))
  total = ['total (GA4)', ...preenchimento, ...tab.cabecalho.slice(linhasDim.length).map((c) => porColuna[c] ?? 0)]
} else if (linhasDim.length) {
  const t = await google(`${API}/properties/${propriedade}:runReport`, { body: { ...corpo, dimensions: [], limit: 1, offset: 0 } })
  total = ['total (GA4)', ...preenchimento, ...(t.rows?.[0]?.metricValues || []).map((v) => Number(v.value))]
} else if (tab.linhas.length) {
  tab.cabecalho = ['', ...tab.cabecalho]
  tab.linhas = tab.linhas.map((l) => ['total (GA4)', ...l])
}

const p = corpo.dateRanges[0]
console.log(`\n${L.titulo || basename(arq)} — GA4 ${propriedade}, ${p.startDate} → ${p.endDate}\n`)
console.log(markdown(tab.cabecalho, [...tab.linhas, ...(total ? [total] : [])]))

const md = resp.metadata || {}
if (md.subjectToThresholding) console.log('\n⚠️ Sujeito a limite (thresholding): o GA4 pode ter escondido linhas com poucos usuários.')
if (md.samplingMetadatas?.length) console.log(`⚠️ Amostrado: ${JSON.stringify(md.samplingMetadatas)}`)
if (md.dataLossFromOtherRow) console.log('⚠️ Parte dos dados caiu em "(other)" (cardinalidade alta).')
const q = resp.propertyQuota?.tokensPerDay
if (q) console.log(`\nCota do dia: ${br(q.consumed)} tokens nesta consulta, ${br(q.remaining)} restantes.`)

const nome = basename(arq).replace(/\.json$/, '')
const saida = `${pastaSaida('ga4')}/${nome}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.csv`
csv(saida, tab.cabecalho, tab.linhas)
console.log(`CSV: ${saida}`)

// Validação contra números conhecidos (ex.: o export do console de 25/10/2026).
if (L.esperado?.length) {
  let erros = 0
  console.log('\nConferência com o esperado:')
  const todas = [...tab.linhas, ...(total ? [total] : [])]
  for (const e of L.esperado) {
    const linha = todas.find((l) => e.linha.every((v, i) => String(l[i]) === String(v)))
    const col = tab.cabecalho.indexOf(e.coluna || valores[0])
    const real = linha && col >= 0 ? Number(linha[col]) : null
    const ok = real === e.valor
    if (!ok) erros++
    const dif =
      real === null ? 'sem linha' : `${br(real)} (${real >= e.valor ? '+' : ''}${br(real - e.valor)}, ${br(((real - e.valor) / e.valor) * 100, 1)}%)`
    console.log(`  ${ok ? '✓' : '✗'} ${e.linha.join(' · ')} · ${e.coluna || valores[0]}: esperado ${br(e.valor)}, veio ${dif}`)
  }
  console.log(erros ? `\n${erros} diferença(s). Ver dados/README.md, "Validação".` : '\n✓ Tudo igual ao esperado.')
}
