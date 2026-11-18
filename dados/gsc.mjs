#!/usr/bin/env node
// F89 — Search Console pela API (searchAnalytics.query): o "Desempenho na Pesquisa" sem o corte de 1.000 linhas da tela.
// Porte do ../recibofacil/dados/gsc.mjs (F284).
//
// Uso:
//   node dados/gsc.mjs --sites                                        → as propriedades a que a conta tem acesso
//   node dados/gsc.mjs --dias 28 --dims query                         → consultas dos últimos 28 dias (até 3 dias atrás)
//   node dados/gsc.mjs --de 2026-10-01 --ate 2026-10-28 --dims query,page --filtro "page~/calculadora/cdb"
//   opções: --dims query,page,device,country,date,searchAppearance (padrão: query)
//           --filtro "<dim><op><valor>" com op = (igual) ~ (contém) !~ (não contém) ~~ (regex RE2); vários separados por ";"
//           --tipo web|image|video|news|discover (padrão web) · --mostrar 30 (linhas no terminal) · --estado all (inclui os
//           dias ainda não finais; padrão final)
// Saída: tabela no terminal (ordenada por cliques, depois impressões) e o CSV inteiro em dados/saida/gsc/. O GSC guarda 16
// meses e atrasa 2 a 3 dias; as consultas raras vêm anonimizadas (somem das linhas, mas contam no total), como na tela.
import { argumentos, exigir, falhar, pastaSaida, SITE } from './lib/config.mjs'
import { google } from './lib/google.mjs'
import { br, csv, markdown } from './lib/tabela.mjs'

const API = 'https://searchconsole.googleapis.com/webmasters/v3'
const args = argumentos()

if (args.sites) {
  const j = await google(`${API}/sites`, { method: 'GET' })
  console.log(markdown(['Propriedade (GSC_SITE)', 'Permissão'], (j.siteEntry || []).map((s) => [s.siteUrl, s.permissionLevel])))
  process.exit(0)
}

const site = exigir('GSC_SITE')
const dia = (d) => d.toISOString().slice(0, 10)
let de = args.de,
  ate = args.ate
if (!de || !ate) {
  const n = Number(args.dias || 28)
  const fim = new Date(Date.now() - 3 * 864e5) // o GSC fecha os dias com 2–3 dias de atraso
  ate = dia(fim)
  de = dia(new Date(fim.getTime() - (n - 1) * 864e5))
}
const dims = String(args.dims || 'query')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function filtros(txt) {
  if (!txt || txt === true) return undefined
  const lista = String(txt)
    .split(';')
    .map((f) => {
      const m = f.match(/^(\w+)(!~|~~|~|=)(.*)$/)
      if (!m) falhar(`filtro inválido: "${f}" (use dim=valor, dim~valor, dim!~valor ou dim~~regex)`)
      const op = { '=': 'equals', '~': 'contains', '!~': 'notContains', '~~': 'includingRegex' }[m[2]]
      return { dimension: m[1], operator: op, expression: m[3] }
    })
  return [{ groupType: 'and', filters: lista }]
}

const corpo = {
  startDate: de,
  endDate: ate,
  dimensions: dims,
  type: args.tipo || 'web',
  dataState: args.estado === 'all' ? 'all' : 'final',
  rowLimit: 25000,
  dimensionFilterGroups: filtros(args.filtro),
}
const linhas = []
for (let startRow = 0; ; startRow += corpo.rowLimit) {
  const j = await google(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { body: { ...corpo, startRow } })
  const rows = j.rows || []
  for (const r of rows) {
    const chaves = r.keys.map((k, i) => (dims[i] === 'page' ? k.replace(SITE, '') || '/' : k))
    linhas.push([...chaves, r.clicks, r.impressions, +(r.ctr * 100).toFixed(2), +r.position.toFixed(2)])
  }
  if (rows.length < corpo.rowLimit) break
}
linhas.sort((a, b) => b[dims.length] - a[dims.length] || b[dims.length + 1] - a[dims.length + 1])

// O total que vale é o da consulta sem dimensão (inclui as consultas anonimizadas), não a soma das linhas.
const total = (await google(`${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { body: { ...corpo, dimensions: [], startRow: 0 } })).rows?.[0]

const cab = [...dims, 'cliques', 'impressões', 'CTR %', 'posição']
const soma = linhas.reduce((s, l) => [s[0] + l[dims.length], s[1] + l[dims.length + 1]], [0, 0])
console.log(`\nGSC ${site} — ${de} → ${ate} (${corpo.type}${args.filtro ? `, filtro ${args.filtro}` : ''})`)
if (total)
  console.log(`Total: ${br(total.clicks)} cliques, ${br(total.impressions)} impressões, CTR ${br(total.ctr * 100, 2)}%, posição ${br(total.position, 1)}`)
// A soma das linhas difere do total: por consulta, faltam as anonimizadas; por página, uma busca que mostra duas páginas
// do site conta nas duas (validação de 17/11/2026: 6.382 na soma por página × 6.307 no total, igual ao export).
console.log(`${br(linhas.length)} linhas · soma das linhas: ${br(soma[0])} cliques, ${br(soma[1])} impressões\n`)
console.log(markdown(cab, linhas.slice(0, Number(args.mostrar || 30))))
const saida = `${pastaSaida('gsc')}/${dims.join('-') || 'total'}-${de}_${ate}.csv`
csv(saida, cab, linhas)
console.log(`\nCSV: ${saida}`)
