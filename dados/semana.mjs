#!/usr/bin/env node
// Raio-X semanal (nome dado pelo Paulo em 27/11/2026; nasceu como o boletim da F89): GA4 + Search Console + indexação no
// Google + IA e vídeo + Bing (manual) + concorrência pelo Serper (--serp) + saúde, Clarity e velocidade + acompanhamento das
// entregas + calendário, numa página só. O ritual está no AGENTS.md ("Raio-X semanal"). Porte do ../recibofacil/dados/semana.mjs (F285), sem a parte do banco de produção (aqui não há banco: o site
// é gratuito e o negócio é tráfego) e com o funil deste site: página da calculadora → cálculo → compartilhar/salvar.
//
// Uso:  node dados/semana.mjs [--fim AAAA-MM-DD] [--serp] [--sem-clarity] [--sem-inspecao] [--cwv]
//   --fim = o dia do boletim (padrão: hoje). A semana do GA4 são os 7 dias antes de --fim; a do GSC, os 7 dias mais recentes
//   já fechados (o GSC atrasa 2 a 3 dias). Comparação: a semana anterior e a média das 4 semanas anteriores.
//   --serp = roda também a rodada de concorrência do dia (gasta 1 crédito do Serper por palavra; repetir no mesmo dia não gasta).
//   --sem-clarity = não tenta o rsync da coleta do Clarity no servidor (usa só o que já está em dados/saida/clarity/dias/).
//   --sem-inspecao = pula a inspeção de URL do sitemap (cota de 2.000 por dia; ~1 s por URL).
//   --cwv = mede a velocidade (PageSpeed) mesmo que o mês já tenha medição; sem ele, mede só a 1ª vez no mês.
// Saída: docs/semanas/<fim>.md, versionado (é a série que mostra tendência), com a seção "Leitura e propostas" para escrever.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { argumentos, env, exigir, hojeBrasilia, pastaSaida, RAIZ_DADOS, RAIZ_REPO, SITE, somarDias as dia } from './lib/config.mjs'
import * as clarity from './lib/clarity.mjs'
import * as serp from './lib/serp.mjs'
import { google } from './lib/google.mjs'
import { br, markdown } from './lib/tabela.mjs'

const args = argumentos()
const fim = args.fim && args.fim !== true ? args.fim : hojeBrasilia()
const pct = (a, b) => (b ? +(100 * (a / b - 1)).toFixed(1) : null)
const sinal = (v) => (v === null || v === undefined ? '—' : `${v > 0 ? '+' : ''}${br(v, 1)}%`)
const n1 = (v) => (v === null || v === undefined || Number.isNaN(v) ? '—' : br(v, 1))
const taxa = (a, b) => (b ? (100 * a) / b : null)

// ---------- GA4 ----------
const GA4 = `https://analyticsdata.googleapis.com/v1beta/properties/${exigir('GA4_PROPRIEDADE')}:runReport`
const R0 = { startDate: dia(fim, -7), endDate: dia(fim, -1), name: 's0' }
const R1 = { startDate: dia(fim, -14), endDate: dia(fim, -8), name: 's1' }
const RM = { startDate: dia(fim, -35), endDate: dia(fim, -8), name: 'm4' }
async function ga4(corpo, faixas = [R0, R1, RM]) {
  const j = await google(GA4, { body: { ...corpo, dateRanges: faixas, limit: 10000 } })
  const nd = (corpo.dimensions || []).length
  return (j.rows || []).map((r) => ({
    faixa: faixas.length > 1 ? r.dimensionValues[nd].value : faixas[0].name,
    dims: r.dimensionValues.slice(0, nd).map((d) => d.value),
    vals: r.metricValues.map((m) => Number(m.value)),
  }))
}
function porFaixa(rows, chave = (r) => r.dims.join(' · ')) {
  const m = new Map()
  for (const r of rows) {
    const k = chave(r)
    if (!m.has(k)) m.set(k, {})
    m.get(k)[r.faixa] = r.vals
  }
  return m
}

// ---------- Search Console ----------
const GSC = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(exigir('GSC_SITE'))}/searchAnalytics/query`
const gFim = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10) // último dia fechado
const G0 = [dia(gFim, -6), gFim],
  G1 = [dia(gFim, -13), dia(gFim, -7)],
  GM = [dia(gFim, -34), dia(gFim, -7)],
  G28 = [dia(gFim, -27), gFim]
async function gsc([de, ate], dims = []) {
  const linhas = []
  for (let startRow = 0; ; startRow += 25000) {
    const j = await google(GSC, { body: { startDate: de, endDate: ate, dimensions: dims, rowLimit: 25000, startRow, type: 'web' } })
    linhas.push(...(j.rows || []))
    if ((j.rows || []).length < 25000) break
  }
  return linhas
}
const pg = (u) => u.replace(SITE, '') || '/'

const lerLeitura = (nome) => {
  const arq = join(RAIZ_DADOS, 'leituras', nome)
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : null
}
/** Guarda um JSON em dados/saida/<pasta>/<fim>.json e devolve o da rodada anterior mais recente (ou null). */
function guardarEComparar(pasta, dados) {
  const dir = pastaSaida(pasta)
  const anteriores = readdirSync(dir).filter((f) => f.endsWith('.json') && f < `${fim}.json`).sort()
  const ant = anteriores.length ? JSON.parse(readFileSync(join(dir, anteriores.at(-1)), 'utf8')) : null
  writeFileSync(join(dir, `${fim}.json`), JSON.stringify(dados, null, 1))
  return ant
}

// ---------- Monta ----------
const md = []
const add = (...l) => md.push(...l)
console.log(`Raio-X semanal ${R0.startDate} → ${R0.endDate} (GSC ${G0[0]} → ${G0[1]})…`)
add(
  `# Raio-X semanal — ${fim}`,
  '',
  `GA4: **${R0.startDate} → ${R0.endDate}**, contra a semana anterior (${R1.startDate} → ${R1.endDate}) e a média das 4 anteriores (${RM.startDate} → ${RM.endDate}, ÷ 4). Search Console: **${G0[0]} → ${G0[1]}** (os 7 dias fechados mais recentes). Gerado por \`node dados/semana.mjs --fim ${fim}${args.serp ? ' --serp' : ''}\` (Raio-X semanal).`,
  '',
)

// ===== 1. Site (GA4) =====
add('## 1. Site (GA4)', '')
const EVENTOS = ['page_view', 'calculator_calculated', 'calculator_shared', 'calculator_saved', 'calculator_edited', 'calculator_validation_error', 'result_copied', 'exception', 'resource_error']
const tot = porFaixa(await ga4({ metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagedSessions' }] }), () => 't').get('t') || {}
const ev = porFaixa(
  await ga4({
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'sessions' }, { name: 'eventCount' }],
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: EVENTOS } } },
  }),
)
const s = (k, f, i = 0) => (k === '_tot' ? tot[f]?.[i] : ev.get(k)?.[f]?.[i]) ?? 0
const m4 = (k, i = 0) => s(k, 'm4', i) / 4
const linhaGA = (rot, k, i = 0) => [rot, s(k, 's0', i), s(k, 's1', i), +m4(k, i).toFixed(0), sinal(pct(s(k, 's0', i), s(k, 's1', i))), sinal(pct(s(k, 's0', i), m4(k, i)))]
const cabSem = ['Métrica', 'Semana', 'Anterior', 'Média 4 sem.', 'vs anterior', 'vs média']
add(
  markdown(cabSem, [
    linhaGA('Sessões', '_tot', 0),
    linhaGA('Usuários', '_tot', 1),
    linhaGA('Sessões engajadas', '_tot', 2),
    linhaGA('Sessões com cálculo feito', 'calculator_calculated'),
    linhaGA('Cálculos feitos (eventos)', 'calculator_calculated', 1),
    linhaGA('Compartilhamentos (eventos)', 'calculator_shared', 1),
    linhaGA('Cálculos salvos (eventos)', 'calculator_saved', 1),
    linhaGA('Valores copiados (eventos, F70)', 'result_copied', 1),
    linhaGA('Formulário com erro (eventos)', 'calculator_validation_error', 1),
  ]),
  '',
)
add(
  `Sessões com cálculo ÷ sessões: **${n1(taxa(s('calculator_calculated', 's0'), s('_tot', 's0')))}%** (anterior ${n1(taxa(s('calculator_calculated', 's1'), s('_tot', 's1')))}%, média ${n1(taxa(m4('calculator_calculated'), m4('_tot')))}%).`,
  '',
)

// Por calculadora: cada uma tem URL própria, então pagePath faz o papel do calculator_slug (que não está cadastrado como
// dimensão personalizada no GA4; conferido em 17/11/2026).
const calc = porFaixa(
  await ga4(
    {
      dimensions: [{ name: 'pagePath' }, { name: 'eventName' }],
      metrics: [{ name: 'sessions' }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: 'pagePath', stringFilter: { matchType: 'FULL_REGEXP', value: '/calculadora/.*|/calculadora-trabalhista-completa' } } },
            { filter: { fieldName: 'eventName', inListFilter: { values: ['page_view', 'calculator_calculated', 'calculator_shared'] } } },
          ],
        },
      },
    },
    [R0, R1],
  ),
)
const porPagina = new Map()
for (const [k, o] of calc) {
  const [p, e] = k.split(' · ')
  if (!porPagina.has(p)) porPagina.set(p, {})
  porPagina.get(p)[e] = o
}
const v = (o, e, f) => o[e]?.[f]?.[0] ?? 0
const linhasCalc = [...porPagina]
  .map(([p, o]) => [p.replace('/calculadora/', ''), v(o, 'page_view', 's0'), v(o, 'calculator_calculated', 's0'), n1(taxa(v(o, 'calculator_calculated', 's0'), v(o, 'page_view', 's0'))), v(o, 'calculator_shared', 's0'), v(o, 'page_view', 's1'), v(o, 'calculator_calculated', 's1')])
  .filter((l) => l[1] + l[5] > 0)
  .sort((a, b) => b[1] - a[1] || b[2] - a[2])
add('**Por calculadora** (sessões; "com cálculo" ÷ "na página" = quanto da visita vira uso):', '')
add(markdown(['Calculadora', 'Sessões na página', 'Com cálculo', 'Cálculo %', 'Com compartilhar', 'Na página (ant.)', 'Com cálculo (ant.)'], linhasCalc.slice(0, 25)), '')

const can = porFaixa(await ga4({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }] }, [R0, R1]))
add(
  '**Canais** (sessões):',
  '',
  markdown(['Canal', 'Semana', 'Engajadas', 'Anterior', 'Variação'], [...can].map(([k, o]) => [k, o.s0?.[0] ?? 0, o.s0?.[1] ?? 0, o.s1?.[0] ?? 0, sinal(pct(o.s0?.[0] ?? 0, o.s1?.[0] ?? 0))]).sort((x, y) => y[1] - x[1]).slice(0, 10)),
  '',
)
// Origens que importam aqui: buscadores e assistentes de IA (ChatGPT, Copilot, Perplexity, Gemini), que o GA4 mistura em
// "Referral" e "Organic Search".
const org = porFaixa(await ga4({ dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }] }, [R0, R1]))
add(
  '**Origens** (as 12 com mais sessões na semana):',
  '',
  markdown(['Origem · mídia', 'Semana', 'Engajadas', 'Anterior'], [...org].map(([k, o]) => [k, o.s0?.[0] ?? 0, o.s0?.[1] ?? 0, o.s1?.[0] ?? 0]).filter((l) => l[1] + l[3] > 0).sort((x, y) => y[1] - x[1] || y[3] - x[3]).slice(0, 12)),
  '',
)
// Robôs: o Direct do exterior não é gente (27/11/2026: 35 de 41 sessões Direct da Índia, Egito, Paquistão, EUA…, quase tudo
// Chrome de computador). "Sessões de gente" = total − Direct do exterior, a métrica de volume que vale.
const dir = await ga4(
  { dimensions: [{ name: 'country' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }], dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Direct' } } } },
  [R0, R1],
)
const dirSoma = (f, doBrasil) => dir.filter((r) => r.faixa === f && (r.dims[0] === 'Brazil') === doBrasil).reduce((a, r) => [a[0] + r.vals[0], a[1] + r.vals[1]], [0, 0])
const [dBr0, dEx0, dBr1, dEx1] = [dirSoma('s0', true), dirSoma('s0', false), dirSoma('s1', true), dirSoma('s1', false)]
const gente0 = s('_tot', 's0') - dEx0[0]
const gente1 = s('_tot', 's1') - dEx1[0]
add(
  '**Robôs** (Direct separado por país; "sessões de gente" = total − Direct do exterior):',
  '',
  markdown(['Linha', 'Semana', 'Engajadas', 'Anterior', 'Variação'], [
    ['Direct do Brasil', dBr0[0], dBr0[1], dBr1[0], sinal(pct(dBr0[0], dBr1[0]))],
    ['Direct do exterior (robô)', dEx0[0], dEx0[1], dEx1[0], sinal(pct(dEx0[0], dEx1[0]))],
    ['**Sessões de gente**', gente0, '', gente1, sinal(pct(gente0, gente1))],
  ]),
  '',
)
const lp = porFaixa(await ga4({ dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }] }, [R0, R1]))
add(
  '**Páginas de entrada** (as 15 com mais sessões):',
  '',
  markdown(['Página', 'Sessões', 'Engajadas', 'Anterior', 'Variação'], [...lp].map(([k, o]) => [k || '(sem página)', o.s0?.[0] ?? 0, o.s0?.[1] ?? 0, o.s1?.[0] ?? 0, sinal(pct(o.s0?.[0] ?? 0, o.s1?.[0] ?? 0))]).sort((x, y) => y[1] - x[1] || y[3] - x[3]).slice(0, 15)),
  '',
)

// ===== 2. IA e vídeo =====
add('## 2. IA e vídeo', '')
// Assistentes de IA chegam como Referral ou "AI Assistant"; a citação sem clique só aparece no BWT → Desempenho de IA (manual).
const IA = /chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|meta\.ai|you\.com/i
const ia = [...org].filter(([k]) => IA.test(k)).map(([k, o]) => [k, o.s0?.[0] ?? 0, o.s0?.[1] ?? 0, o.s1?.[0] ?? 0]).sort((a, b) => b[1] - a[1])
add(
  '**Assistentes de IA** (sessões por origem):',
  '',
  ia.length ? markdown(['Origem · mídia', 'Semana', 'Engajadas', 'Anterior'], ia) : '_Nenhuma sessão vinda de assistente de IA._',
  '',
)
// Vídeos do canal: sessões por campanha (utm_campaign da descrição) e visualizações lidas da página pública de cada vídeo.
const vids = lerLeitura('videos.json')?.videos || []
if (vids.length) {
  const desde = vids.map((v) => v.publicado).sort()[0]
  const camp = porFaixa(
    await ga4(
      { dimensions: [{ name: 'sessionCampaignName' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }], dimensionFilter: { filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'CONTAINS', value: 'youtube' } } } },
      [R0, { startDate: desde, endDate: R0.endDate, name: 'tudo' }],
    ),
  )
  const views = async (id) => {
    try {
      const h = await (await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'pt-BR' } })).text()
      const m = h.match(/"viewCount":"(\d+)"/)
      return m ? Number(m[1]) : null
    } catch {
      return null
    }
  }
  const atual = {}
  for (const v of vids) atual[v.campanha] = { normal: v.normal ? await views(v.normal) : null, short: v.short ? await views(v.short) : null }
  const antV = guardarEComparar('videos', atual)
  const dif = (a, b) => (a === null || a === undefined ? '—' : b === null || b === undefined ? String(a) : `${a} (+${a - b})`)
  add(
    `**Vídeos do canal** (visualizações agora, com o ganho desde a rodada anterior; sessões da campanha no GA4, origem \`youtube\`):`,
    '',
    markdown(
      ['Vídeo', 'Publicado', 'Visualizações (normal)', 'Visualizações (Short)', 'Sessões na semana', 'Engajadas', 'Sessões desde a publicação'],
      vids.map((v) => {
        const c = camp.get(v.campanha) || {}
        return [`${v.titulo} (\`${v.campanha}\`)`, v.publicado, dif(atual[v.campanha].normal, antV?.[v.campanha]?.normal), dif(atual[v.campanha].short, antV?.[v.campanha]?.short), c.s0?.[0] ?? 0, c.s0?.[1] ?? 0, c.tudo?.[0] ?? 0]
      }),
    ),
    '',
    '_Vídeo novo: acrescentar em `dados/leituras/videos.json`._',
    '',
  )
}

// ===== 3. Busca (GSC) =====
add('## 3. Busca (Search Console)', '')
const gt = async (r) => (await gsc(r))[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
const [t0, t1, tm] = [await gt(G0), await gt(G1), await gt(GM)]
add(
  markdown(cabSem, [
    ['Cliques', t0.clicks, t1.clicks, Math.round(tm.clicks / 4), sinal(pct(t0.clicks, t1.clicks)), sinal(pct(t0.clicks, tm.clicks / 4))],
    ['Impressões', t0.impressions, t1.impressions, Math.round(tm.impressions / 4), sinal(pct(t0.impressions, t1.impressions)), sinal(pct(t0.impressions, tm.impressions / 4))],
    ['CTR %', +(t0.ctr * 100).toFixed(2), +(t1.ctr * 100).toFixed(2), +(tm.ctr * 100).toFixed(2), '', ''],
    ['Posição média', +t0.position.toFixed(1), +t1.position.toFixed(1), +tm.position.toFixed(1), '', ''],
  ]),
  '',
)
// Com pouco clique, quem mostra movimento é a impressão: por página, semana × anterior.
const mapa = (rows) => new Map(rows.map((r) => [r.keys[0], r]))
const [pg0, pg1] = [mapa(await gsc(G0, ['page'])), mapa(await gsc(G1, ['page']))]
const movP = [...new Set([...pg0.keys(), ...pg1.keys()])]
  .map((k) => ({ k: pg(k), a: pg0.get(k), b: pg1.get(k) }))
  .map((m) => ({ ...m, i0: m.a?.impressions || 0, i1: m.b?.impressions || 0 }))
  .filter((m) => Math.max(m.i0, m.i1) >= 20)
add(
  '**Páginas** (impressões, semana × anterior; as 15 com mais impressões):',
  '',
  markdown(
    ['Página', 'Impressões', 'Anterior', 'Variação', 'Cliques', 'Posição', 'Posição ant.'],
    [...movP].sort((a, b) => b.i0 - a.i0).slice(0, 15).map((m) => [m.k, m.i0, m.i1, sinal(pct(m.i0, m.i1)), m.a?.clicks || 0, m.a ? +m.a.position.toFixed(1) : '—', m.b ? +m.b.position.toFixed(1) : '—']),
  ),
  '',
)
const [q0, q1] = [mapa(await gsc(G0, ['query'])), mapa(await gsc(G1, ['query']))]
const movQ = [...new Set([...q0.keys(), ...q1.keys()])]
  .map((k) => ({ k, a: q0.get(k), b: q1.get(k) }))
  .map((m) => ({ ...m, i0: m.a?.impressions || 0, i1: m.b?.impressions || 0, d: (m.a?.impressions || 0) - (m.b?.impressions || 0) }))
  .filter((m) => Math.max(m.i0, m.i1) >= 5)
const fmtQ = (l) => l.map((m) => [m.k, m.i0, m.i1, `${m.d > 0 ? '+' : ''}${m.d}`, m.a?.clicks || 0, m.a ? +m.a.position.toFixed(1) : '—', m.b ? +m.b.position.toFixed(1) : '—'])
const cabQ = ['Consulta', 'Impressões', 'Anterior', 'Diferença', 'Cliques', 'Posição', 'Posição ant.']
const tabQ = (l) => (l.length ? markdown(cabQ, fmtQ(l)) : '_Nenhuma (consulta com 5+ impressões numa das semanas)._')
add(
  '_Quase toda consulta deste site vem anonimizada no GSC (a soma das linhas fica muito abaixo do total), então as listas abaixo são a parte visível._',
  '',
)
add('**Consultas que mais ganharam impressão:**', '', tabQ(movQ.filter((m) => m.d > 0).sort((a, b) => b.d - a.d).slice(0, 10)), '')
add('**Consultas que mais perderam:**', '', tabQ(movQ.filter((m) => m.d < 0).sort((a, b) => a.d - b.d).slice(0, 8)), '')
// Perto da página 1 (28 dias): consultas na posição 4 a 20 com impressão. É onde título, descrição e conteúdo mais rendem.
const q28 = await gsc(G28, ['query', 'page'])
const perto = q28
  .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 15)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 15)
add(
  `**Perto da página 1** (28 dias, ${G28[0]} → ${G28[1]}): consulta × página na posição 4 a 20 com 15+ impressões.`,
  '',
  markdown(['Consulta', 'Página', 'Impressões', 'Cliques', 'CTR %', 'Posição'], perto.map((r) => [r.keys[0], pg(r.keys[1]), r.impressions, r.clicks, +(r.ctr * 100).toFixed(2), +r.position.toFixed(1)])),
  '',
)

// ===== 4. Indexação no Google =====
// Inspeção de URL pela API (escopo webmasters.readonly, o mesmo do GSC) em todas as URLs do sitemap. Em 27/11/2026 achou 5
// fora do índice, entre elas a maior página do site no Bing, coisa que nenhuma outra fonte mostrava.
add('## 4. Indexação no Google (inspeção de URL)', '')
if (args['sem-inspecao']) add('_Pulada (`--sem-inspecao`)._', '')
else {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const INSP = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'
  const insp = {}
  for (const u of urls) {
    try {
      const r = await google(INSP, { body: { inspectionUrl: u, siteUrl: exigir('GSC_SITE'), languageCode: 'pt-BR' }, lancar: true })
      const i = r.inspectionResult?.indexStatusResult || {}
      insp[pg(u)] = { estado: i.coverageState || '—', rastreio: (i.lastCrawlTime || '').slice(0, 10) || '—' }
    } catch (e) {
      insp[pg(u)] = { estado: `erro: ${e.message.slice(0, 60)}`, rastreio: '—' }
    }
  }
  const antI = guardarEComparar('indexacao', insp)
  const indexada = (e) => /indexad/i.test(e) && !/não indexad/i.test(e)
  const contagem = {}
  for (const v of Object.values(insp)) contagem[v.estado] = (contagem[v.estado] || 0) + 1
  add(
    `**${Object.values(insp).filter((v) => indexada(v.estado)).length} de ${urls.length} URLs do sitemap no índice.**`,
    '',
    markdown(['Estado', 'URLs'], Object.entries(contagem).sort((a, b) => b[1] - a[1])),
    '',
  )
  const fora = Object.entries(insp).filter(([, v]) => !indexada(v.estado))
  if (fora.length) add('**Fora do índice:**', '', markdown(['URL', 'Estado', 'Na rodada anterior'], fora.map(([u, v]) => [u, v.estado, antI?.[u]?.estado ?? '—'])), '')
  const mudou = antI ? Object.entries(insp).filter(([u, v]) => antI[u] && antI[u].estado !== v.estado) : []
  if (mudou.length) add('**Mudou de estado desde a rodada anterior:**', '', markdown(['URL', 'Antes', 'Agora'], mudou.map(([u, v]) => [u, antI[u].estado, v.estado])), '')
  add('_Fora do índice: pedir indexação no GSC (Inspeção de URL → "Solicitar indexação"); a API não faz o pedido._', '')
}

// ===== 5. Bing (Bing Webmaster Tools) =====
// API do BWT com BWT_CHAVE (27/11/2026): tráfego por dia, páginas e consultas por semana (o balde fecha na sexta) e rastreio
// por dia. O "Desempenho de IA" não está na API: continua export manual em gsc/.
add('## 5. Bing (Bing Webmaster Tools)', '')
{
  const chave = env().BWT_CHAVE
  const pastaGsc = join(RAIZ_REPO, 'gsc')
  const exportIA = existsSync(pastaGsc)
    ? readdirSync(pastaGsc, { recursive: true }).map(String).filter((f) => /AIPerformance|AI_Performance|Desempenho.*IA/i.test(f)).map((f) => ({ f, t: statSync(join(pastaGsc, f)).mtime }))
    : []
  if (!chave) {
    add('_Sem `BWT_CHAVE` (bing.com/webmasters → Configurações → Acesso à API → Chave de API → `BWT_CHAVE=` em `~/.config/recibofacil/dados.env`)._', '')
  } else {
    const BWT = 'https://ssl.bing.com/webmaster/api.svc/json'
    const bwt = async (m) => {
      try {
        const r = await fetch(`${BWT}/${m}?apikey=${chave}&siteUrl=${encodeURIComponent(SITE + '/')}`)
        return r.ok ? (await r.json()).d || [] : []
      } catch {
        return []
      }
    }
    const diaBwt = (x) => new Date(Number(String(x.Date).match(/\d+/)[0])).toISOString().slice(0, 10)
    const [trafego, paginas, consultas, rastreio] = [await bwt('GetRankAndTrafficStats'), await bwt('GetPageStats'), await bwt('GetQueryStats'), await bwt('GetCrawlStats')]
    // Tráfego: os 7 dias mais recentes que o BWT tem × os 7 anteriores.
    const diasT = [...new Set(trafego.map(diaBwt))].sort()
    const ult = diasT.at(-1)
    const somaT = (de, ate) => trafego.filter((x) => diaBwt(x) >= de && diaBwt(x) <= ate).reduce((a, x) => [a[0] + x.Clicks, a[1] + x.Impressions], [0, 0])
    if (ult) {
      const [a0, a1] = [somaT(dia(ult, -6), ult), somaT(dia(ult, -13), dia(ult, -7))]
      add(
        `**Busca no Bing** (${dia(ult, -6)} → ${ult}, contra os 7 dias anteriores):`,
        '',
        markdown(['Métrica', 'Semana', 'Anterior', 'Variação'], [
          ['Cliques', a0[0], a1[0], sinal(pct(a0[0], a1[0]))],
          ['Impressões', a0[1], a1[1], sinal(pct(a0[1], a1[1]))],
          ['CTR %', n1(taxa(a0[0], a0[1])), n1(taxa(a1[0], a1[1])), ''],
        ]),
        '',
      )
    }
    // Páginas e consultas: o último balde semanal × o anterior.
    const baldes = (rows) => [...new Set(rows.map(diaBwt))].sort()
    const porBalde = (rows, b) => new Map(rows.filter((x) => diaBwt(x) === b).map((x) => [x.Query, x]))
    const tabelaBwt = (rows, rotulo, fmt, n) => {
      const bs = baldes(rows)
      if (bs.length < 1) return
      const [r0, r1] = [porBalde(rows, bs.at(-1)), bs.length > 1 ? porBalde(rows, bs.at(-2)) : new Map()]
      const linhas = [...r0.values()].sort((a, b) => b.Impressions - a.Impressions || b.Clicks - a.Clicks).slice(0, n).map((x) => {
        const y = r1.get(x.Query)
        return [fmt(x.Query), x.Clicks, x.Impressions, y?.Impressions ?? 0, x.AvgImpressionPosition > 0 ? x.AvgImpressionPosition : '—', y && y.AvgImpressionPosition > 0 ? y.AvgImpressionPosition : '—']
      })
      add(`**${rotulo}** (semana do BWT de ${bs.at(-1)}, contra a de ${bs.at(-2) ?? '—'}; as ${n} com mais impressões):`, '', markdown([rotulo.replace(/s$/, ''), 'Cliques', 'Impressões', 'Impr. ant.', 'Posição', 'Posição ant.'], linhas), '')
    }
    tabelaBwt(paginas, 'Páginas', (u) => pg(u), 15)
    tabelaBwt(consultas, 'Consultas', (q) => q, 15)
    // Rastreio: o Bingbot nos últimos 7 dias. 4xx/5xx e bloqueio por robots.txt são o que pede ação.
    const diasR = [...new Set(rastreio.map(diaBwt))].sort()
    const ultR = diasR.at(-1)
    if (ultR) {
      const somaR = (de, ate, f) => rastreio.filter((x) => diaBwt(x) >= de && diaBwt(x) <= ate).reduce((a, x) => a + (x[f] || 0), 0)
      const lr = (rot, f) => [rot, somaR(dia(ultR, -6), ultR, f), somaR(dia(ultR, -13), dia(ultR, -7), f)]
      add(
        `**Rastreio do Bingbot** (${dia(ultR, -6)} → ${ultR}):`,
        '',
        markdown(['Sinal', 'Semana', 'Anterior'], [lr('Páginas rastreadas', 'CrawledPages'), lr('Respostas 2xx', 'Code2xx'), lr('Respostas 4xx', 'Code4xx'), lr('Respostas 5xx', 'Code5xx'), lr('Erros de rastreio', 'CrawlErrors'), lr('Bloqueadas pelo robots.txt', 'BlockedByRobotsTxt')]),
        '',
      )
    }
  }
  const recIA = exportIA.filter((x) => (Date.now() - x.t) / 864e5 <= 7)
  add(
    recIA.length
      ? `Desempenho de IA (export manual): ${recIA.map((x) => `\`${x.f}\``).join(', ')}. Leitura na seção 10.`
      : '_Desempenho de IA (citações em respostas do Copilot) não está na API: export manual. bing.com/webmasters → calculosonline.com.br → **Desempenho de IA** → **Últimos 7 dias** → **Exportar** → arquivo em `gsc/`._',
    '',
  )
}

// ===== 6. Concorrência (Serper), só com --serp =====
add('## 6. Concorrência (Serper)', '')
if (!args.serp) add('_Não rodada (gasta crédito). Para incluir: `node dados/semana.mjs --serp`, ou a lista completa em `node dados/serp.mjs`._', '')
else if (!env().SERPER_CHAVE) add('_Sem `SERPER_CHAVE`: rodada não feita._', '')
else {
  try {
    const rs = await serp.rodada(serp.palavrasDaLista(), { dia: fim })
    const antS = serp.rodadaAnterior(fim)
    serp.guardarSerie(rs)
    add(...serp.relatorio(rs, antS, { concorrentes: 10, palavras: 30, cabecalho: '###' }))
    add(`_${rs.gastas} consultas do Serper nesta execução. A posição do site no Serper é de computador; a do GSC é a que vale._`, '')
  } catch (e) {
    add(`_Rodada do Serper falhou: ${e.message}_`, '')
  }
}

// ===== 7. Saúde =====
add('## 7. Saúde, comportamento e velocidade', '')
add(
  markdown(
    ['Sinal (eventos do GA4)', 'Semana', 'Anterior', 'Média 4 sem.'],
    [
      ['Erros de página (exception)', s('exception', 's0', 1), s('exception', 's1', 1), +m4('exception', 1).toFixed(0)],
      ['Recurso que não carregou (resource_error)', s('resource_error', 's0', 1), s('resource_error', 's1', 1), +m4('resource_error', 1).toFixed(0)],
      ['Formulário com erro de validação', s('calculator_validation_error', 's0', 1), s('calculator_validation_error', 's1', 1), +m4('calculator_validation_error', 1).toFixed(0)],
    ],
  ),
  '',
)

add('**Comportamento (Clarity):**', '')
let semTrazer = !!args['sem-clarity']
if (!semTrazer) {
  try {
    clarity.trazer()
  } catch {
    semTrazer = true
  }
}
const cs = [clarity.resumo(R0.startDate, R0.endDate), clarity.resumo(R1.startDate, R1.endDate)]
if (!cs[0].dias.length) {
  add('_Sem dia do Clarity coletado na semana. A coleta precisa do token do projeto "Calculos Online" e do cron no servidor (`dados/README.md`, "Clarity")._', '')
} else {
  const gaDia = new Map(
    (await ga4({ dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }] }, [{ startDate: R1.startDate, endDate: R0.endDate }])).map((l) => [
      `${l.dims[0].slice(0, 4)}-${l.dims[0].slice(4, 6)}-${l.dims[0].slice(6)}`,
      l.vals[0],
    ]),
  )
  const ct = cs.map((c) => (c.dias.length ? clarity.totais(c) : null))
  const cob = (c) => {
    const g = c.dias.reduce((a, x) => a + (gaDia.get(x.dia) || 0), 0)
    return g ? (100 * c.dias.reduce((a, x) => a + x.sessoes, 0)) / g : null
  }
  const lin = (rot, f) => [rot, ...ct.map((t, i) => (t ? f(t, cs[i]) : '—'))]
  add(
    markdown(['Sinal', 'Semana', 'Anterior'], [
      lin('Dias coletados', (_, c) => `${c.dias.length} de 7`),
      lin('Sessões', (t) => t.sessoes),
      lin('Cobertura do GA4 %', (_, c) => n1(cob(c))),
      lin('Rolagem média %', (t) => n1(t.rolagem)),
      lin('Tempo ativo por sessão (s)', (t) => n1(t.tempoAtivo)),
      ...clarity.SINAIS.slice(0, 5).map(([m, nome]) => lin(`Sessões com ${nome.toLowerCase()} %`, (t) => n1(t.sinal[m]))),
    ]),
    '',
  )
  const pgs = [...cs[0].paginas].map(([k, o]) => [...k.split('\u0000'), o.base, clarity.taxa(o, 'DeadClickCount'), clarity.taxa(o, 'QuickbackClick')]).filter((l) => l[2] >= 10)
  const topo = (i) => [...pgs].sort((a, b) => b[i] - a[i]).slice(0, 5).map((l) => [l[0], l[1], l[2], n1(l[3]), n1(l[4])])
  const cabPg = ['Página', 'Aparelho', 'Amostra (sessões)', 'Clique morto %', 'Volta rápida %']
  add('Mais clique morto (página × aparelho, amostra ≥ 10):', '', markdown(cabPg, topo(3)), '', 'Mais volta rápida:', '', markdown(cabPg, topo(4)), '')
  add(`_${semTrazer ? '⚠️ rsync falhou: dias locais de dados/saida/clarity/dias/. ' : ''}Detalhe: \`node dados/clarity-dias.mjs --de ${R0.startDate} --ate ${R0.endDate}\`. Mapa de calor não sai pela API._`, '')
}

// Velocidade (PageSpeed / Core Web Vitals): uma vez por mês, nas 5 maiores páginas de entrada, celular. Precisa de
// PAGESPEED_CHAVE (a API recusa o token OAuth e a cota anônima vive em 429).
add('**Velocidade (PageSpeed, celular, mensal):**', '')
{
  const mes = fim.slice(0, 7)
  const dirCwv = pastaSaida('cwv')
  const arqMes = join(dirCwv, `${mes}.json`)
  const chave = env().PAGESPEED_CHAVE
  let cwv = existsSync(arqMes) && !args.cwv ? JSON.parse(readFileSync(arqMes, 'utf8')) : null
  if (!cwv && !chave) {
    add(
      '_Sem `PAGESPEED_CHAVE`. Para ligar: console.cloud.google.com → projeto `recibofacil-dados` → APIs e serviços → Biblioteca → **PageSpeed Insights API** → Ativar; Credenciais → Criar credenciais → Chave de API (restringir à PageSpeed Insights API) → `PAGESPEED_CHAVE=...` em `~/.config/recibofacil/dados.env` (serve aos dois sites)._',
      '',
    )
  } else {
    if (!cwv) {
      const topo = [...lp].map(([k, o]) => [k, o.s0?.[0] ?? 0]).filter(([k]) => k && k.startsWith('/')).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k)
      cwv = { dia: fim, paginas: [] }
      for (const pth of topo) {
        try {
          const u = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE + pth)}&strategy=mobile&category=performance&key=${chave}`
          const j = await (await fetch(u)).json()
          if (j.error) throw new Error(j.error.message)
          const a = j.lighthouseResult?.audits || {}
          const campo = j.loadingExperience?.metrics || {}
          cwv.paginas.push({
            pagina: pth,
            nota: Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
            lcp: a['largest-contentful-paint']?.displayValue || '—',
            cls: a['cumulative-layout-shift']?.displayValue || '—',
            tbt: a['total-blocking-time']?.displayValue || '—',
            campo: campo.LARGEST_CONTENTFUL_PAINT_MS ? `LCP ${campo.LARGEST_CONTENTFUL_PAINT_MS.category}` : 'sem dado de campo',
          })
        } catch (e) {
          cwv.paginas.push({ pagina: pth, nota: '—', lcp: '—', cls: '—', tbt: '—', campo: `erro: ${e.message.slice(0, 50)}` })
        }
      }
      writeFileSync(arqMes, JSON.stringify(cwv, null, 1))
    }
    add(
      `Medição de ${cwv.dia} (Lighthouse no celular; "campo" = usuários reais do Chrome, quando há volume):`,
      '',
      markdown(['Página', 'Nota', 'LCP', 'CLS', 'TBT', 'Campo'], cwv.paginas.map((x) => [x.pagina, x.nota, x.lcp, x.cls, x.tbt, x.campo])),
      '',
    )
  }
}

// ===== 8. Acompanhamento das entregas =====
add('## 8. Acompanhamento das entregas', '')
{
  const ac = lerLeitura('acompanhamento.json')?.itens || []
  const quando = (d) => (d < fim ? '⚠️ vencida' : d <= dia(fim, 7) ? '▶ esta semana' : '')
  add(
    ac.length
      ? markdown(['Entrega', 'O que medir', 'Linha de base', 'Leitura', '', 'Status'], [...ac].sort((a, b) => a.leitura.localeCompare(b.leitura)).map((x) => [x.entrega, x.medir, x.base, x.leitura, quando(x.leitura), x.status]))
      : '_Nada em acompanhamento._',
    '',
    '_Fonte: `dados/leituras/acompanhamento.json` (entrega nova entra lá com métrica, linha de base e data; ao ler, atualizar o status)._',
    '',
  )
}

// ===== 9. Calendário =====
add('## 9. Calendário (próximas 6 semanas)', '')
{
  const ev = (lerLeitura('calendario.json')?.eventos || []).filter((e) => e.data >= fim && e.data <= dia(fim, 42)).sort((a, b) => a.data.localeCompare(b.data))
  add(
    ev.length ? markdown(['Data', 'O quê', 'Efeito no site', 'Fonte'], ev.map((e) => [`${e.data}${e.aprox ? ' (aprox.)' : ''}`, e.o_que, e.efeito, e.fonte])) : '_Nada nas próximas 6 semanas._',
    '',
    '_Fonte: `dados/leituras/calendario.json`._',
    '',
  )
}

add('## 10. Leitura e propostas da semana', '', '_(escrita na sessão: o que os números dizem, até 3 mudanças — hipótese, métrica, linha de base e data de leitura —, a manutenção da vez e 1 a 3 possibilidades novas)_', '')

const pasta = join(RAIZ_REPO, 'docs', 'semanas')
mkdirSync(pasta, { recursive: true })
const arq = join(pasta, `${fim}.md`)
writeFileSync(arq, md.join('\n') + '\n')
console.log(`✓ ${arq}`)
