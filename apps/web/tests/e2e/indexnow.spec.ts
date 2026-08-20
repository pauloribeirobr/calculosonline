import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// O IndexNow (canal de notificação do Bing — que responde por ~95% do tráfego
// real do site) só aceita submissões se `keyLocation` servir exatamente a
// chave enviada. Divergência entre as duas derruba tudo com um 4xx opaco.

const CHAVE = '7a2b357b3e5402cd1a0b1d9931a28185'

test.describe('IndexNow', () => {
  test('o arquivo de verificação é servido e contém exatamente a chave', async ({ request }) => {
    const r = await request.get(`/${CHAVE}.txt`)
    expect(r.status()).toBe(200)
    expect((await r.text()).trim()).toBe(CHAVE)
  })

  test('a chave da rota e a do arquivo em public/ são a mesma', () => {
    const rota = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/indexnow/route.ts'),
      'utf-8',
    )
    const daRota = rota.match(/const INDEXNOW_KEY = '([a-f0-9]+)'/)?.[1]
    expect(daRota, 'INDEXNOW_KEY não encontrada na rota').toBeTruthy()

    const arquivo = path.join(process.cwd(), 'public', `${daRota}.txt`)
    expect(fs.existsSync(arquivo), `falta public/${daRota}.txt`).toBe(true)
    expect(fs.readFileSync(arquivo, 'utf-8').trim()).toBe(daRota)
  })

  test('o endpoint recusa quem não tem o segredo interno', async ({ request }) => {
    const r = await request.post('/api/indexnow', {
      data: { urls: ['https://calculosonline.com.br/'] },
      headers: { 'x-api-key': 'chave-errada' },
    })
    // 401 com o segredo configurado; 500 quando o ambiente não tem a env var.
    // O que não pode acontecer é submeter URL sem autorização.
    expect([401, 500]).toContain(r.status())
  })
})
