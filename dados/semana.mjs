#!/usr/bin/env node
// F89 — boletim da semana: GA4 + Search Console (+ Clarity, quando houver coleta; + concorrência pelo Serper, com --serp),
// numa página só. Porte do ../recibofacil/dados/semana.mjs (F285), sem a parte do banco de produção (aqui não há banco: o site
// é gratuito e o negócio é tráfego) e com o funil deste site: página da calculadora → cálculo → compartilhar/salvar.
//
// Uso:  node dados/semana.mjs [--fim AAAA-MM-DD] [--serp] [--sem-clarity]
//   --fim = o dia do boletim (padrão: hoje). A semana do GA4 são os 7 dias antes de --fim; a do GSC, os 7 dias mais recentes
//   já fechados (o GSC atrasa 2 a 3 dias). Comparação: a semana anterior e a média das 4 semanas anteriores.
//   --serp = roda também a rodada de concorrência do dia (gasta 1 crédito do Serper por palavra; repetir no mesmo dia não gasta).
//   --sem-clarity = não tenta o rsync da coleta do Clarity no servidor (usa só o que já está em dados/saida/clarity/dias/).
// Saída: docs/semanas/<fim>.md, versionado (é a série que mostra tendência), com a seção "Leitura e propostas" para escrever.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { argumentos, env, exigir, hojeBrasilia, RAIZ_REPO, SITE, somarDias as dia } from './lib/config.mjs'
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

// ---------- Monta ----------
const md = []
const add = (...l) => md.push(...l)
console.log(`Boletim da semana ${R0.startDate} → ${R0.endDate} (GSC ${G0[0]} → ${G0[1]})…`)
add(
  `# Boletim da semana — ${fim}`,
  '',
  `GA4: **${R0.startDate} → ${R0.endDate}**, contra a semana anterior (${R1.startDate} → ${R1.endDate}) e a média das 4 anteriores (${RM.startDate} → ${RM.endDate}, ÷ 4). Search Console: **${G0[0]} → ${G0[1]}** (os 7 dias fechados mais recentes). Gerado por \`node dados/semana.mjs --fim ${fim}\` (F89).`,
  '',
)

// ===== 1. Site (GA4) =====
add('## 1. Site (GA4)', '')
const EVENTOS = ['page_view', 'calculator_calculated', 'calculator_shared', 'calculator_saved', 'calculator_edited', 'calculator_validation_error', 'exception', 'resource_error']
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
const lp = porFaixa(await ga4({ dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }] }, [R0, R1]))
add(
  '**Páginas de entrada** (as 15 com mais sessões):',
  '',
  markdown(['Página', 'Sessões', 'Engajadas', 'Anterior', 'Variação'], [...lp].map(([k, o]) => [k || '(sem página)', o.s0?.[0] ?? 0, o.s0?.[1] ?? 0, o.s1?.[0] ?? 0, sinal(pct(o.s0?.[0] ?? 0, o.s1?.[0] ?? 0))]).sort((x, y) => y[1] - x[1] || y[3] - x[3]).slice(0, 15)),
  '',
)

// ===== 2. Busca (GSC) =====
add('## 2. Busca (Search Console)', '')
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

// ===== 3. Concorrência (Serper), só com --serp =====
add('## 3. Concorrência (Serper)', '')
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

// ===== 4. Saúde =====
add('## 4. Saúde (manutenção)', '')
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

add('## 5. Leitura e propostas da semana', '', '_(escrita na sessão: o que os números dizem, até 3 mudanças — hipótese, métrica, linha de base e data de leitura —, a manutenção da vez e 1 a 3 possibilidades novas)_', '')

const pasta = join(RAIZ_REPO, 'docs', 'semanas')
mkdirSync(pasta, { recursive: true })
const arq = join(pasta, `${fim}.md`)
writeFileSync(arq, md.join('\n') + '\n')
console.log(`✓ ${arq}`)
