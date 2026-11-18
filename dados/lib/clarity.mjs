// F89 — os dias do Clarity coletados no servidor (dados/clarity-coletar.sh): trazer para dados/saida/clarity/dias/ e
// resumir. Usado pelo dados/clarity-dias.mjs e pelo boletim (dados/semana.mjs). Porte do ../recibofacil/dados/lib/clarity.mjs
// (F289), que validou a leitura de cada arquivo no Recibo Fácil (14 a 16/11/2026):
//   total.json                  o site inteiro + as 10 páginas mais vistas (PopularPages), confiável
//   aparelho-so-navegador.json  Device × OS × Browser, poucas linhas, confiável
//   origem-midia-canal.json     Source × Medium × Channel, confiável (uma sessão pode contar em mais de uma origem)
//   url-aparelho.json           URL × Device. A URL vem com a query string, e a API corta em 1.000 linhas. Aqui a query
//                               string é a do link compartilhado (?d=…, F59), bem menos frequente que o ?draft= do RF, então
//                               o teto deve ficar longe; se bater, o resumo avisa.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { caminho, pastaSaida } from './config.mjs'

export const SERVIDOR = 'paulo@69.62.94.73' // o servidor do Recibo Fácil (o Cálculos Online está na Vercel)
export const PASTA_REMOTA = 'dados/clarity-calculosonline/'
export const PASTA_DIAS = pastaSaida('clarity', 'dias')
const TETO = 1000

/** rsync da coleta do servidor para dados/saida/clarity/dias/ (não gasta chamada da API). Lança erro se falhar. */
export function trazer() {
  execFileSync('rsync', ['-a', '-e', 'ssh -o BatchMode=yes -o ConnectTimeout=15', `${SERVIDOR}:${PASTA_REMOTA}`, `${PASTA_DIAS}/`], {
    stdio: ['ignore', 'inherit', 'pipe'], // o erro (pasta remota ainda não existe, ssh fora) vira exceção, sem poluir o terminal
    timeout: 120000,
  })
}

export function diasDisponiveis() {
  return existsSync(PASTA_DIAS) ? readdirSync(PASTA_DIAS).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort() : []
}

const ler = (dia, nome) => {
  const arq = join(PASTA_DIAS, dia, `${nome}.json`)
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8')) : null
}
const bloco = (j, nome) => j?.find((m) => m.metricName === nome)?.information || []

// Métricas de "sessões com X" (o painel do Clarity chama de Insights).
export const SINAIS = [
  ['DeadClickCount', 'Clique morto'],
  ['RageClickCount', 'Clique de raiva'],
  ['QuickbackClick', 'Volta rápida'],
  ['ExcessiveScroll', 'Rolagem excessiva'],
  ['ScriptErrorCount', 'Erro de script'],
  ['ErrorClickCount', 'Clique com erro'],
]

const chaveLinha = (r) => JSON.stringify([r.Url, r.Device, r.OS, r.Browser, r.Source, r.Medium, r.Channel])

/** Linhas de um arquivo de dimensões agrupadas por chave(linha): sessões, % com cada sinal, rolagem e tempo (ponderados). */
function agrupar(j, chave) {
  const g = new Map()
  const pegar = (k) => {
    if (!g.has(k)) g.set(k, { sessoes: 0, bots: 0, usuarios: 0, linhas: 0, base: 0, com: {}, rolagem: [0, 0], tempo: [0, 0, 0] })
    return g.get(k)
  }
  for (const r of bloco(j, 'Traffic')) {
    const o = pegar(chave(r))
    o.sessoes += r.totalSessionCount
    o.bots += r.totalBotSessionCount
    o.usuarios += r.distinctUserCount
    o.linhas++
  }
  // Peso de rolagem e tempo: as sessões da mesma linha no DeadClickCount (ScrollDepth e EngagementTime vêm sem contagem).
  const peso = new Map()
  for (const r of bloco(j, 'DeadClickCount')) {
    pegar(chave(r)).base += r.sessionsCount
    peso.set(chaveLinha(r), r.sessionsCount)
  }
  for (const [met] of SINAIS) {
    for (const r of bloco(j, met)) {
      const o = pegar(chave(r))
      o.com[met] = (o.com[met] || 0) + (r.sessionsCount * r.sessionsWithMetricPercentage) / 100
    }
  }
  const pesoDe = (r) => peso.get(chaveLinha(r)) || 0
  for (const r of bloco(j, 'ScrollDepth')) {
    const o = pegar(chave(r)),
      p = pesoDe(r)
    o.rolagem[0] += r.averageScrollDepth * p
    o.rolagem[1] += p
  }
  for (const r of bloco(j, 'EngagementTime')) {
    const o = pegar(chave(r)),
      p = pesoDe(r)
    o.tempo[0] += r.totalTime * p
    o.tempo[1] += r.activeTime * p
    o.tempo[2] += p
  }
  return g
}

/** Soma de grupos de dias diferentes (mesma chave). */
function somar(alvo, g) {
  for (const [k, o] of g) {
    if (!alvo.has(k)) {
      alvo.set(k, structuredClone(o))
      continue
    }
    const a = alvo.get(k)
    a.sessoes += o.sessoes
    a.bots += o.bots
    a.usuarios += o.usuarios
    a.linhas += o.linhas
    a.base += o.base
    for (const [m, v] of Object.entries(o.com)) a.com[m] = (a.com[m] || 0) + v
    a.rolagem[0] += o.rolagem[0]
    a.rolagem[1] += o.rolagem[1]
    a.tempo[0] += o.tempo[0]
    a.tempo[1] += o.tempo[1]
    a.tempo[2] += o.tempo[2]
  }
  return alvo
}

export const taxa = (o, met) => (o.base ? (100 * (o.com[met] || 0)) / o.base : null)
export const rolagem = (o) => (o.rolagem[1] ? o.rolagem[0] / o.rolagem[1] : null)

/** Um dia: o total do site (total.json), cada sinal em % de sessões, e se a URL foi cortada no teto da API. */
export function dia(d) {
  const t = ler(d, 'total')
  if (!t) return null
  const tr = bloco(t, 'Traffic')[0] || {}
  const sinal = Object.fromEntries(SINAIS.map(([m]) => [m, bloco(t, m)[0]?.sessionsWithMetricPercentage ?? null]))
  const tempo = bloco(t, 'EngagementTime')[0] || {}
  const url = ler(d, 'url-aparelho')
  const linhasUrl = bloco(url, 'Traffic').length
  return {
    dia: d,
    sessoes: tr.totalSessionCount ?? 0,
    bots: tr.totalBotSessionCount ?? 0,
    usuarios: tr.distinctUserCount ?? 0,
    paginasPorSessao: tr.pagesPerSessionPercentage ?? null,
    rolagem: bloco(t, 'ScrollDepth')[0]?.averageScrollDepth ?? null,
    tempoTotal: tempo.totalTime ?? null,
    tempoAtivo: tempo.activeTime ?? null,
    sinal,
    paginas: bloco(t, 'PopularPages').map((p) => ({ caminho: caminho(p.url), visitas: p.visitsCount })),
    urlCortada: linhasUrl >= TETO,
    linhasUrl,
  }
}

/** Resumo de um intervalo de dias (inclusive). Dias sem coleta ficam em `faltando`. */
export function resumo(de, ate) {
  const dias = diasDisponiveis()
    .filter((d) => d >= de && d <= ate)
    .map(dia)
    .filter(Boolean)
  const esperados = []
  for (let t = new Date(`${de}T12:00:00Z`); t <= new Date(`${ate}T12:00:00Z`); t = new Date(t.getTime() + 864e5))
    esperados.push(t.toISOString().slice(0, 10))
  const faltando = esperados.filter((d) => !dias.some((x) => x.dia === d))
  const aparelhos = new Map(),
    paginas = new Map(),
    canais = new Map()
  for (const { dia: d } of dias) {
    somar(aparelhos, agrupar(ler(d, 'aparelho-so-navegador'), (r) => r.Device || '(sem)'))
    somar(paginas, agrupar(ler(d, 'url-aparelho'), (r) => `${caminho(r.Url)}\u0000${r.Device || '(sem)'}`))
    somar(canais, agrupar(ler(d, 'origem-midia-canal'), (r) => r.Channel || '(sem)'))
  }
  // As 10 mais vistas de cada dia (PopularPages), somadas.
  const visitas = new Map()
  for (const x of dias) for (const p of x.paginas) visitas.set(p.caminho, (visitas.get(p.caminho) || 0) + p.visitas)
  return { de, ate, dias, faltando, aparelhos, paginas, canais, visitas, cortados: dias.filter((x) => x.urlCortada).map((x) => x.dia) }
}

/** Totais de um resumo, com cada sinal ponderado pelas sessões do dia. */
export function totais(r) {
  const s = r.dias.reduce((a, x) => a + x.sessoes, 0)
  const pond = (f) => {
    const v = r.dias.filter((x) => f(x) !== null)
    const base = v.reduce((a, x) => a + x.sessoes, 0)
    return base ? v.reduce((a, x) => a + f(x) * x.sessoes, 0) / base : null
  }
  return {
    sessoes: s,
    bots: r.dias.reduce((a, x) => a + x.bots, 0),
    rolagem: pond((x) => x.rolagem),
    tempoAtivo: pond((x) => x.tempoAtivo),
    sinal: Object.fromEntries(SINAIS.map(([m]) => [m, pond((x) => x.sinal[m])])),
  }
}
