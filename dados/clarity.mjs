#!/usr/bin/env node
// F89 — Clarity pela Data Export API (os números do painel; mapa de calor e gravações não saem pela API).
// Porte do ../recibofacil/dados/clarity.mjs (F284).
//
// Uso:  node dados/clarity.mjs --dias 3 --dims URL,Device
//   --dias 1|2|3 (últimas 24, 48 ou 72 h, contadas da hora da chamada, em UTC) · --dims até 3 de: Browser, Device,
//   Country/Region, OS, Source, Medium, Campaign, Channel, URL · --mostrar 25
// Limites (Microsoft, conferidos no Recibo Fácil em 14/11/2026): 10 chamadas por projeto por dia, só os últimos 1 a 3 dias,
// até 3 dimensões, 1.000 linhas sem paginação. Por isso o histórico vem da coleta diária no servidor
// (dados/clarity-coletar.sh); este comando é para uma olhada na hora e gasta 1 das 10 chamadas do dia.
// Token: CLARITY_TOKEN em ~/.config/calculosonline/dados.env. É POR PROJETO do Clarity: o do Recibo Fácil não serve
// (Clarity → projeto "Calculos Online" → Configurações → Data Export → Gerar novo token de API).
import { writeFileSync } from 'node:fs'
import { argumentos, exigir, falhar, pastaSaida } from './lib/config.mjs'
import { markdown } from './lib/tabela.mjs'

const args = argumentos()
const dias = String(args.dias || 1)
if (!['1', '2', '3'].includes(dias)) falhar('--dias aceita 1, 2 ou 3 (a API só guarda as últimas 72 h).')
const dims = args.dims && args.dims !== true ? String(args.dims).split(',').map((s) => s.trim()) : []
if (dims.length > 3) falhar('No máximo 3 dimensões por chamada.')

const q = new URLSearchParams({ numOfDays: dias })
dims.forEach((d, i) => q.set(`dimension${i + 1}`, d))
const r = await fetch(`https://www.clarity.ms/export-data/api/v1/project-live-insights?${q}`, {
  headers: { Authorization: `Bearer ${exigir('CLARITY_TOKEN')}`, 'Content-Type': 'application/json' },
})
if (r.status === 429) falhar('Clarity: as 10 chamadas do dia acabaram (o limite volta no dia seguinte).')
if (!r.ok) falhar(`Clarity respondeu ${r.status} ${await r.text()}`)
const j = await r.json()

const arq = `${pastaSaida('clarity')}/${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}-${dias}d-${dims.join('-') || 'total'}.json`
writeFileSync(arq, JSON.stringify(j, null, 2))
for (const bloco of j) {
  const info = bloco.information || []
  if (!info.length) continue
  const chaves = Object.keys(info[0])
  console.log(`\n## ${bloco.metricName} (${info.length} linha${info.length > 1 ? 's' : ''})\n`)
  console.log(markdown(chaves, info.slice(0, Number(args.mostrar || 25)).map((l) => chaves.map((k) => l[k]))))
}
console.log(`\nJSON: ${arq}`)
