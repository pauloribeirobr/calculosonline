// F89 — onde ficam as credenciais e as saídas (porte do F284 do Recibo Fácil, ../recibofacil/dados/).
// Nada disto vai para o git: as chaves ficam em ~/.config/calculosonline/ e as saídas em dados/saida/ (no .gitignore).
//
// O cliente OAuth e o token são da conta Google do Paulo, a mesma do Recibo Fácil, e não de uma propriedade: o token de
// lá já lê o GA4 e o GSC deste site (conferido em 17/11/2026). Por isso, se ~/.config/calculosonline/ não tiver os dois
// arquivos, eles vêm de ~/.config/recibofacil/. Rodar `node dados/autorizar.mjs` grava um token próprio aqui.
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PASTA_CONFIG = join(homedir(), '.config', 'calculosonline')
const PASTA_RF = join(homedir(), '.config', 'recibofacil')
const proprio = (nome) => join(PASTA_CONFIG, nome)
const comReserva = (nome) => (existsSync(proprio(nome)) || !existsSync(join(PASTA_RF, nome)) ? proprio(nome) : join(PASTA_RF, nome))

export const ARQ_CLIENTE = comReserva('google-oauth-cliente.json') // cliente "App para computador" do Google Cloud
export const ARQ_TOKEN = comReserva('google-oauth-token.json') // lido pelas consultas
export const ARQ_TOKEN_GRAVAR = proprio('google-oauth-token.json') // gravado pelo dados/autorizar.mjs
export const ARQ_ENV = proprio('dados.env') // CLARITY_TOKEN, SERPER_CHAVE (e, se quiser trocar, GA4_PROPRIEDADE, GSC_SITE)

// Identificadores das propriedades (não são segredo: sem o token da conta, não abrem nada). O dados.env pode trocar.
const PADRAO = {
  GA4_PROPRIEDADE: '537095884', // GA4 "calculosonline" (conta "Meus Sites"), conferido pela Admin API em 17/11/2026
  GSC_SITE: 'sc-domain:calculosonline.com.br',
}
export const SITE = 'https://calculosonline.com.br'
export const DOMINIO = 'calculosonline.com.br'

export const RAIZ_DADOS = join(dirname(fileURLToPath(import.meta.url)), '..')
export const RAIZ_REPO = join(RAIZ_DADOS, '..')
export const PASTA_SAIDA = join(RAIZ_DADOS, 'saida')

export function falhar(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

function lerEnv(arq) {
  const out = {}
  if (!existsSync(arq)) return out
  for (const linha of readFileSync(arq, 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    // Comentário no fim da linha ("CHAVE=valor   # explicação") não faz parte do valor.
    if (m && !linha.trim().startsWith('#')) {
      const v = m[2].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '')
      if (v) out[m[1]] = v
    }
  }
  return out
}

// Chaves que são da CONTA do Paulo, e não de um site: podem vir do dados.env do Recibo Fácil. O CLARITY_TOKEN é por
// projeto do Clarity e o GA4_PROPRIEDADE/GSC_SITE são deste site, então esses nunca vêm de lá.
const DA_CONTA = ['SERPER_CHAVE']

/** Variáveis do ~/.config/calculosonline/dados.env (CHAVE=valor, uma por linha; # comenta), sobre os padrões acima. */
export function env() {
  const rf = lerEnv(join(PASTA_RF, 'dados.env'))
  const daConta = Object.fromEntries(DA_CONTA.filter((k) => rf[k]).map((k) => [k, rf[k]]))
  return { ...PADRAO, ...daConta, ...lerEnv(ARQ_ENV) }
}

export function exigir(nome) {
  const v = env()[nome]
  if (!v) falhar(`${nome} não está em ${ARQ_ENV}. Ver dados/README.md, "Credenciais".`)
  return v
}

export function lerJson(arq, dica) {
  if (!existsSync(arq)) falhar(`${arq} não existe. ${dica}`)
  return JSON.parse(readFileSync(arq, 'utf8'))
}

export function pastaSaida(...partes) {
  const p = join(PASTA_SAIDA, ...partes)
  mkdirSync(p, { recursive: true })
  return p
}

/** Caminho da URL, sem domínio, query string nem âncora ("https://calculosonline.com.br/x?d=1" → "/x"). */
export const caminho = (url) => (url || '').replace(/^https?:\/\/[^/]+/, '').replace(/[?#].*$/, '') || '/'

/** Data AAAA-MM-DD somando n dias (meio-dia UTC, para não cair no dia anterior). */
export const somarDias = (d, n) => new Date(new Date(`${d}T12:00:00Z`).getTime() + n * 864e5).toISOString().slice(0, 10)

/** Hoje no relógio de Brasília (UTC−3), AAAA-MM-DD. */
export const hojeBrasilia = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)

/** Argumentos --chave valor e --flag (sem valor) da linha de comando. */
export function argumentos(argv = process.argv.slice(2)) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const k = a.slice(2)
      const prox = argv[i + 1]
      if (prox === undefined || prox.startsWith('--')) out[k] = true
      else {
        out[k] = prox
        i++
      }
    } else out._.push(a)
  }
  return out
}
