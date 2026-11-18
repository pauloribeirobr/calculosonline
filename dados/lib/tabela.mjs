// F89 — saída das leituras: tabela em Markdown (para o terminal e para colar nos .md) e CSV (para guardar).
// Porte literal do ../recibofacil/dados/lib/tabela.mjs.
import { writeFileSync } from 'node:fs'

// Número de verdade (para formatar e alinhar à direita). Sequência de mais de 15 dígitos é identificador: como número, o
// JavaScript arredonda e o ID sai errado.
const num = (v) => (typeof v === 'number' && Number.isFinite(v)) || /^-?\d{1,15}(\.\d+)?$/.test(String(v))

/** Número no formato do projeto: 27.986 · 1,19. */
export function br(v, casas) {
  if (!num(v)) return String(v ?? '')
  const n = Number(v)
  const c = casas ?? (Number.isInteger(n) ? 0 : 2)
  return n.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c })
}

export function markdown(cabecalho, linhas) {
  const fmt = (v) => (num(v) ? br(v) : String(v ?? '').replace(/\|/g, '\\|'))
  const alinhar = cabecalho.map((_, i) => (linhas.some((l) => num(l[i])) ? '---:' : '---'))
  return [
    `| ${cabecalho.join(' | ')} |`,
    `| ${alinhar.join(' | ')} |`,
    ...linhas.map((l) => `| ${l.map(fmt).join(' | ')} |`),
  ].join('\n')
}

export function csv(arq, cabecalho, linhas) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  writeFileSync(arq, [cabecalho, ...linhas].map((l) => l.map(esc).join(',')).join('\n') + '\n')
}

/** Linhas × colunas → tabela larga (como as Explorações do GA4 com "Colunas"). */
export function pivotar(registros, chavesLinha, chaveColuna, chaveValor) {
  const cols = [...new Set(registros.map((r) => r[chaveColuna]))].sort()
  const mapa = new Map()
  for (const r of registros) {
    const k = chavesLinha.map((c) => r[c]).join('\u0000')
    if (!mapa.has(k)) mapa.set(k, { chave: chavesLinha.map((c) => r[c]), vals: {} })
    mapa.get(k).vals[r[chaveColuna]] = (mapa.get(k).vals[r[chaveColuna]] || 0) + Number(r[chaveValor])
  }
  const linhas = [...mapa.values()].map((m) => [...m.chave, ...cols.map((c) => m.vals[c] ?? 0)])
  return { cabecalho: [...chavesLinha, ...cols], linhas }
}
