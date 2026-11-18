// F89 — acesso às APIs do Google com a conta do Paulo (OAuth, só leitura), porte do F284 do Recibo Fácil.
// O token de atualização fica em ~/.config/calculosonline/google-oauth-token.json (ou, se não houver, no do Recibo Fácil:
// é a mesma conta, ver lib/config.mjs); cada execução troca por um token de acesso de 1 hora.
import { ARQ_CLIENTE, ARQ_TOKEN, falhar, lerJson } from './config.mjs'

export const ESCOPOS = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
]

/** O cliente OAuth baixado do Google Cloud ({"installed": {client_id, client_secret, …}}). */
export function cliente() {
  const j = lerJson(ARQ_CLIENTE, 'Baixe o cliente OAuth ("App para computador") do Google Cloud. Ver dados/README.md.')
  const c = j.installed || j.web
  if (!c?.client_id || !c?.client_secret) falhar(`${ARQ_CLIENTE} sem client_id/client_secret: é o JSON do cliente OAuth?`)
  return c
}

let cache = null

async function tokenDeAcesso() {
  if (cache && cache.expira > Date.now() + 60_000) return cache.valor
  const { client_id, client_secret } = cliente()
  const t = lerJson(ARQ_TOKEN, 'Rode `node dados/autorizar.mjs` uma vez para autorizar a sua conta.')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id, client_secret, refresh_token: t.refresh_token, grant_type: 'refresh_token' }),
  })
  const j = await r.json()
  if (!r.ok) {
    const dica =
      j.error === 'invalid_grant'
        ? ' O token venceu ou foi revogado: rode `node dados/autorizar.mjs` de novo (se o app estiver em "Teste" no Google Cloud, o token vence em 7 dias; publique-o, ver README).'
        : ''
    falhar(`Google recusou o token de atualização: ${j.error} ${j.error_description || ''}.${dica}`)
  }
  cache = { valor: j.access_token, expira: Date.now() + j.expires_in * 1000 }
  return cache.valor
}

/** Chamada JSON a uma API do Google, com 3 novas tentativas em 429/5xx. */
export async function google(url, { method = 'POST', body } = {}) {
  for (let tentativa = 0; ; tentativa++) {
    const r = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${await tokenDeAcesso()}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if ((r.status === 429 || r.status >= 500) && tentativa < 3) {
      await new Promise((res) => setTimeout(res, 2000 * (tentativa + 1)))
      continue
    }
    const texto = await r.text()
    const j = texto ? JSON.parse(texto) : {}
    if (!r.ok) {
      const msg = j.error?.message || texto
      const dica = r.status === 403 ? ' (a API está ligada no projeto do Google Cloud? a sua conta tem acesso à propriedade?)' : ''
      falhar(`${r.status} em ${url}: ${msg}${dica}`)
    }
    return j
  }
}
