// F89 — o top 10 do Google Brasil por palavra-chave, pelo Serper (conta do Paulo; SERPER_CHAVE, a mesma do Recibo Fácil,
// ver lib/config.mjs). Usado pelo dados/serp.mjs e pelo boletim (dados/semana.mjs --serp). Porte do
// ../recibofacil/dados/lib/serp.mjs (F290).
//
// Cada busca gasta 1 crédito (o saldo é da conta e é dividido com o Recibo Fácil; GET /account mostra, sem gastar). A busca é
// de computador (o Serper não tem celular) com gl=br, hl=pt-br, location=Brazil. A posição do site que vale é a do GSC; o
// Serper serve para dizer QUEM aparece. Uma rodada por dia: o JSON de cada palavra fica em dados/saida/serp/<dia>/ e não é
// pedido de novo no mesmo dia. O resumo compacto fica versionado em docs/concorrentes/serp/<dia>.json, para a série
// sobreviver à pasta de saída.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DOMINIO, exigir, pastaSaida, RAIZ_DADOS, RAIZ_REPO } from './config.mjs'
import { br, markdown } from './tabela.mjs'

export const ARQ_PALAVRAS = join(RAIZ_DADOS, 'leituras', 'palavras-chave.json')
export const PASTA_SERIE = join(RAIZ_REPO, 'docs', 'concorrentes', 'serp')
export const TETO = 120 // consultas por rodada, salvo --forcar (o saldo é dividido com o Recibo Fácil)
const PARAMS = { gl: 'br', hl: 'pt-br', location: 'Brazil' }

export const dominio = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return '?'
  }
}
export const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export async function saldo() {
  const r = await fetch('https://google.serper.dev/account', { headers: { 'X-API-KEY': exigir('SERPER_CHAVE') } })
  if (!r.ok) throw new Error(`Serper /account respondeu ${r.status} ${await r.text()}`)
  return (await r.json()).balance
}

async function buscar(q) {
  for (let t = 0; ; t++) {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': exigir('SERPER_CHAVE'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, ...PARAMS }),
    })
    if ((r.status === 429 || r.status >= 500) && t < 3) {
      await new Promise((ok) => setTimeout(ok, 1500 * (t + 1)))
      continue
    }
    if (!r.ok) throw new Error(`Serper respondeu ${r.status} para "${q}": ${await r.text()}`)
    return r.json()
  }
}

/** As palavras da lista versionada: as fixas + as geradas do GSC − as tiradas (dados/palavras-chave.mjs). */
export function palavrasDaLista() {
  if (!existsSync(ARQ_PALAVRAS)) throw new Error(`${ARQ_PALAVRAS} não existe: rode node dados/palavras-chave.mjs`)
  const j = JSON.parse(readFileSync(ARQ_PALAVRAS, 'utf8'))
  const fora = new Set((j.fora || []).map((p) => p.toLowerCase()))
  const fixas = (j.fixas || []).map((p) => (typeof p === 'string' ? { palavra: p, pagina: '(fixa)' } : p))
  const lista = [...fixas.map((p) => ({ impressoes: 0, posicao: null, motivo: 'fixa', ...p })), ...j.palavras]
  const vistas = new Set()
  return lista.filter((p) => !fora.has(p.palavra.toLowerCase()) && !vistas.has(p.palavra.toLowerCase()) && vistas.add(p.palavra.toLowerCase()))
}

/** Roda (ou reaproveita) a rodada do dia. Devolve { dia, gastas, itens: [{ ...palavra, site, top, recursos }] }. */
export async function rodada(palavras, { dia, max = TETO, forcar = false, aoAvancar } = {}) {
  if (palavras.length > max && !forcar) palavras = palavras.slice(0, max)
  if (palavras.length > TETO && !forcar) throw new Error(`${palavras.length} palavras passam do teto de ${TETO} por rodada (use --forcar).`)
  const pasta = pastaSaida('serp', dia)
  let gastas = 0,
    feitas = 0
  const itens = new Array(palavras.length)
  let i = 0
  const trabalhador = async () => {
    while (i < palavras.length) {
      const k = i++,
        p = palavras[k]
      const arq = join(pasta, `${slug(p.palavra)}.json`)
      let j
      if (existsSync(arq)) j = JSON.parse(readFileSync(arq, 'utf8'))
      else {
        j = await buscar(p.palavra)
        writeFileSync(arq, JSON.stringify(j))
        gastas += j.credits || 1
      }
      const top = (j.organic || []).slice(0, 10).map((o) => ({ pos: o.position, dominio: dominio(o.link), link: o.link }))
      const site = top.find((o) => o.dominio === DOMINIO)?.pos ?? null
      const recursos = ['answerBox', 'knowledgeGraph', 'peopleAlsoAsk', 'videos', 'topStories', 'images'].filter((r) => (Array.isArray(j[r]) ? j[r].length : j[r]))
      itens[k] = { ...p, site, top, recursos }
      aoAvancar?.(++feitas, palavras.length)
    }
  }
  await Promise.all(Array.from({ length: 4 }, trabalhador)) // limite da conta: 5 por segundo
  return { dia, gastas, itens }
}

/** Guarda o resumo compacto versionado (docs/concorrentes/serp/<dia>.json). */
export function guardarSerie({ dia, itens }) {
  mkdirSync(PASTA_SERIE, { recursive: true })
  const arq = join(PASTA_SERIE, `${dia}.json`)
  writeFileSync(
    arq,
    JSON.stringify(
      {
        dia,
        fonte: 'Serper (Google), gl=br hl=pt-br location=Brazil, computador, top 10 orgânico',
        palavras: itens.map((x) => ({ p: x.palavra, pagina: x.pagina, imp: x.impressoes, posGsc: x.posicao, site: x.site, recursos: x.recursos, top: x.top.map((o) => [o.pos, o.link]) })),
      },
      null,
      1,
    ) + '\n',
  )
  return arq
}

/** A rodada versionada anterior a `dia` (para comparar), no mesmo formato de itens. */
export function rodadaAnterior(dia) {
  if (!existsSync(PASTA_SERIE)) return null
  const ant = readdirSync(PASTA_SERIE)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f.slice(0, 10) < dia)
    .sort()
    .at(-1)
  if (!ant) return null
  const j = JSON.parse(readFileSync(join(PASTA_SERIE, ant), 'utf8'))
  return {
    dia: j.dia,
    itens: j.palavras.map((x) => ({ palavra: x.p, pagina: x.pagina, impressoes: x.imp, posicao: x.posGsc, site: x.site, recursos: x.recursos, top: x.top.map(([pos, link]) => ({ pos, link, dominio: dominio(link) })) })),
  }
}

/** Mapa domínio × palavras: em quantas aparece, em quantas está acima do site, e em que posição média. */
export function mapaDominios(itens) {
  const m = new Map()
  for (const x of itens) {
    for (const o of x.top) {
      if (!m.has(o.dominio)) m.set(o.dominio, { dominio: o.dominio, palavras: 0, acima: 0, somaPos: 0, top3: 0, exemplos: [] })
      const d = m.get(o.dominio)
      d.palavras++
      d.somaPos += o.pos
      if (o.pos <= 3) d.top3++
      if (o.dominio !== DOMINIO && (x.site === null || o.pos < x.site)) d.acima++
      if (d.exemplos.length < 3) d.exemplos.push(`${x.palavra} (${o.pos}º)`)
    }
  }
  return [...m.values()].map((d) => ({ ...d, posMedia: d.somaPos / d.palavras }))
}

/** Faixas de posição do site nas palavras da rodada. */
export function faixas(itens) {
  const f = { primeiro: 0, top3: 0, top10: 0, fora: 0 }
  for (const x of itens) {
    if (x.site === 1) f.primeiro++
    else if (x.site !== null && x.site <= 3) f.top3++
    else if (x.site !== null) f.top10++
    else f.fora++
  }
  return f
}

/** O relatório da rodada em Markdown (o dados/serp.mjs imprime inteiro; o boletim usa com limites menores). */
export function relatorio(r, ant, { concorrentes = 20, palavras = 40, cabecalho = '###' } = {}) {
  const md = []
  const f = faixas(r.itens)
  md.push(
    `${r.itens.length} palavras (Google Brasil, computador, ${r.dia}). **O site está em 1º em ${f.primeiro}, em 2º–3º em ${f.top3}, em 4º–10º em ${f.top10} e fora do top 10 em ${f.fora}.**`,
    '',
  )
  // Sem volume de busca por palavra (o GSC só mede onde o site já aparece), o peso é a presença: em quantas palavras da
  // lista o domínio está no top 10, e em quantas no top 3.
  const doms = mapaDominios(r.itens)
    .filter((d) => d.dominio !== DOMINIO)
    .sort((a, b) => b.palavras - a.palavras || b.top3 - a.top3)
  md.push(`${cabecalho} Quem domina a lista (domínios com mais palavras no top 10)`, '')
  md.push(markdown(['Domínio', 'Palavras no top 10', 'No top 3', 'Acima do site', 'Posição média', 'Exemplos'], doms.slice(0, concorrentes).map((d) => [d.dominio, d.palavras, d.top3, d.acima, br(d.posMedia, 1), d.exemplos.join(' · ')])), '')
  md.push(`${cabecalho} Cada palavra: onde o site está e quem ocupa o top 3`, '')
  md.push(
    markdown(
      ['Palavra', 'Página', 'Impr. GSC', 'Site (Serper)', 'Site (GSC)', '1º', '2º', '3º', 'Recursos'],
      r.itens.slice(0, palavras).map((x) => [x.palavra, x.pagina, x.impressoes || '—', x.site ?? 'fora', x.posicao ?? '—', ...[0, 1, 2].map((i) => x.top[i]?.dominio || '—'), x.recursos.join(', ')]),
    ),
    '',
  )
  if (ant) {
    const a = new Map(ant.itens.map((x) => [x.palavra, x]))
    const mud = r.itens.filter((x) => a.has(x.palavra) && a.get(x.palavra).site !== x.site).map((x) => ({ x, de: a.get(x.palavra).site, para: x.site }))
    md.push(`${cabecalho} Mudou desde ${ant.dia}`, '')
    md.push(mud.length ? markdown(['Palavra', 'Antes', 'Agora'], mud.map((m) => [m.x.palavra, m.de ?? 'fora', m.para ?? 'fora'])) : '_A posição do site não mudou em nenhuma palavra._', '')
  }
  return md
}
