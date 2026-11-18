#!/usr/bin/env node
// F89 — autoriza a conta do Paulo a ler o GA4 e o Search Console (porte do F284 do Recibo Fácil).
//
// Só é preciso se o token do Recibo Fácil (~/.config/recibofacil/google-oauth-token.json, a mesma conta) parar de valer,
// ou para ter um token próprio deste projeto. Uso:  node dados/autorizar.mjs
// Abre (ou mostra) o endereço de login do Google; depois de entrar e aceitar, o Google volta para um endereço local
// (http://127.0.0.1:<porta>) que este script escuta. O token vai para ~/.config/calculosonline/google-oauth-token.json
// (chmod 600). Escopos só de leitura: analytics.readonly e webmasters.readonly. Para revogar:
// https://myaccount.google.com/permissions (ou apague o arquivo).
import { createHash, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { ARQ_TOKEN_GRAVAR, PASTA_CONFIG, falhar } from './lib/config.mjs'
import { ESCOPOS, cliente } from './lib/google.mjs'

const { client_id, client_secret } = cliente()
const verificador = randomBytes(48).toString('base64url')
const desafio = createHash('sha256').update(verificador).digest('base64url')
const estado = randomBytes(16).toString('hex')

const servidor = createServer()
servidor.listen(0, '127.0.0.1', () => {
  const redirect = `http://127.0.0.1:${servidor.address().port}`
  const url =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id,
      redirect_uri: redirect,
      response_type: 'code',
      scope: ESCOPOS.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      code_challenge: desafio,
      code_challenge_method: 'S256',
      state: estado,
    })
  console.log('\nAbra este endereço no navegador, entre com a sua conta do Google e aceite (só leitura):\n')
  console.log(url + '\n')
  console.log('Se o Google avisar que o app não foi verificado: "Avançado" → "Acessar … (não seguro)". O app é seu.\n')
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref()

  servidor.on('request', async (req, res) => {
    const q = new URL(req.url, redirect).searchParams
    if (!q.get('code') && !q.get('error')) {
      res.writeHead(404).end()
      return
    }
    const fim = (ok, msg) => {
      res.writeHead(ok ? 200 : 400, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`<meta charset="utf-8"><body style="font:16px system-ui;padding:40px">${msg}</body>`)
      servidor.close()
    }
    if (q.get('error')) {
      fim(false, 'Recusado. Veja o terminal.')
      falhar(`O Google devolveu: ${q.get('error')}`)
    }
    if (q.get('state') !== estado) {
      fim(false, 'Estado não confere.')
      falhar('O parâmetro state não confere; tente de novo.')
    }
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        code: q.get('code'),
        code_verifier: verificador,
        redirect_uri: redirect,
        grant_type: 'authorization_code',
      }),
    })
    const j = await r.json()
    if (!r.ok || !j.refresh_token) {
      fim(false, 'Não deu certo. Veja o terminal.')
      falhar(`Troca do código falhou: ${j.error || ''} ${j.error_description || ''}${!j.refresh_token ? ' (sem refresh_token)' : ''}`)
    }
    mkdirSync(PASTA_CONFIG, { recursive: true })
    writeFileSync(ARQ_TOKEN_GRAVAR, JSON.stringify({ refresh_token: j.refresh_token, scope: j.scope, criado: new Date().toISOString() }, null, 2))
    chmodSync(ARQ_TOKEN_GRAVAR, 0o600)
    fim(true, '✓ Autorizado. Pode fechar esta aba e voltar ao terminal.')
    console.log(`✓ Token gravado em ${ARQ_TOKEN_GRAVAR} (chmod 600). Escopos: ${j.scope}`)
  })
})
