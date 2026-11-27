// Gravação da tela do Short da V1 (Tesouro Reserva) em PRODUÇÃO, seguindo docs/roteiros/v1-tesouro-reserva.md §2 (texto
// aprovado em 25/11/2026). Celular emulado de 360 × 640 com escala 3 = 1080 × 1920 nativos. Porte do gravar-v6-short.cjs
// do Recibo Fácil. Voz ANTES da tela (voz/v1-short.json): cada bloco do short.json dura o que a fala pede, e a montagem
// acelera o trecho gravado para caber (ou segura o último quadro).
//
// Rodar na pasta do Short: cd ~/Vídeos/calculosonline-v1-short && node <repo>/docs/roteiros/ferramentas/v1-short/gravar-v1-short.cjs
// Saídas: frames/, quadros.json e marcas.json.
//
// Nada fica em produção além do que um visitante anônimo deixa: GA4, Clarity, AdSense e Vercel Analytics bloqueados; nada
// salvo; o valor do resultado não é tocado (copiaria). A caixa âmbar das linhas é desenhada por cima, só no vídeo. Tudo o
// que importa fica abaixo de ~200 px CSS: acima ficam a pílula do passo e a legenda (render-*.cjs).
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const URL = 'https://calculosonline.com.br/calculadora/tesouro-reserva'
const W = 360, H = 640, ESCALA = 3

const TOQUE = `
(() => {
  if (window.__toque) return; window.__toque = true
  window.__circulo = (x, y) => {
    const r = document.createElement('div')
    Object.assign(r.style, { position: 'fixed', left: (x - 22) + 'px', top: (y - 22) + 'px', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(37,99,235,.38)', border: '2px solid rgba(37,99,235,.7)', zIndex: 2147483646, pointerEvents: 'none', transition: 'transform .5s ease-out, opacity .5s ease-out' })
    document.documentElement.appendChild(r)
    requestAnimationFrame(() => { r.style.transform = 'scale(1.7)'; r.style.opacity = '0' })
    setTimeout(() => r.remove(), 700)
  }
  const ready = () => {
    const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st)
    document.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) window.__circulo(t.clientX, t.clientY) }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready()
})()`

;(async () => {
  fs.rmSync('frames', { recursive: true, force: true }); fs.mkdirSync('frames')
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=3'] })
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: ESCALA, isMobile: true, hasTouch: true,
    locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  })
  await ctx.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|googlesyndication|adservice|_vercel\/insights|vitals\.vercel/, (r) => r.abort())
  await ctx.addInitScript(TOQUE)
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  const quadros = []
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const nome = `frames/${String(quadros.length + 1).padStart(6, '0')}.jpg`
    fs.writeFileSync(nome, Buffer.from(data, 'base64'))
    quadros.push({ nome, ts: metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  const t0 = Date.now(), inicio = new Date(), marcas = []
  const marca = (nome) => { const t = (Date.now() - t0) / 1000; marcas.push({ nome, t, epoch: Date.now() / 1000 }); console.log(t.toFixed(1).padStart(6), nome) }
  const espera = (ms) => page.waitForTimeout(ms)
  const tocar = async (loc) => { const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await espera(150) }
  const rolarAte = (y, ms) => page.evaluate(async ({ y, ms }) => {
    const y0 = window.scrollY, dy = y - y0, t0 = performance.now()
    await new Promise((res) => { const f = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) })
  }, { y, ms })
  const rolarPara = async (loc, folgaTopo, ms = 700) => {
    const y = await loc.evaluate((el, f) => el.getBoundingClientRect().top + window.scrollY - f, folgaTopo)
    await rolarAte(Math.max(0, y), ms)
  }
  const destacar = (loc) => loc.evaluate((el) => {
    document.querySelectorAll('.__hl').forEach((e) => e.remove())
    const r = el.getBoundingClientRect(), d = document.createElement('div')
    d.className = '__hl'
    Object.assign(d.style, { position: 'absolute', left: (r.left + scrollX - 4) + 'px', top: (r.top + scrollY - 3) + 'px', width: (r.width + 8) + 'px', height: (r.height + 6) + 'px',
      border: '2.5px solid #F59E0B', borderRadius: '8px', background: 'rgba(245,158,11,.14)', pointerEvents: 'none', zIndex: 2147483640 })
    document.body.appendChild(d)
  })
  const limpar = () => page.evaluate(() => document.querySelectorAll('.__hl').forEach((e) => e.remove()))
  const linha = (re) => page.locator('#detalhamento-lista li').filter({ hasText: re }).first()
  const valor = page.locator('#valorInicial'), prazo = page.locator('#prazo')
  const simular = page.getByRole('button', { name: 'Simular Tesouro Reserva' })
  // O cartão do resultado logo abaixo da pílula e da legenda (1ª tomada de 25/11: o valor ficava atrás da legenda).
  const cartao = page.getByText('Resultado', { exact: true }).first()
  const rolarResultado = () => rolarPara(cartao, 200, 500)
  const valorTopo = page.locator('#detalhamento-lista').locator('xpath=preceding::button[1]')
  const confere = async (esperado) => {
    const txt = await page.locator('#detalhamento-lista').innerText()
    if (!txt.includes(esperado)) throw new Error(`resultado sem "${esperado}" — tomada descartada`)
  }

  await page.goto(URL, { waitUntil: 'load' })
  await page.locator('h1').first().waitFor()
  await espera(1500)
  // Abre com o formulário na tela, logo abaixo da área da pílula e da legenda.
  await rolarPara(page.getByText('Valor aplicado', { exact: true }).first(), 210, 10)
  await espera(400)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * ESCALA, maxHeight: H * ESCALA, everyNthFrame: 1 })
  await espera(300)

  marca('01-gancho')            // "Tirou do Tesouro Reserva antes de trinta dias?" — o formulário parado, com o texto do gancho
  await espera(3300)
  marca('02-conta')             // "Uma parte do rendimento ficou com o IOF." — o toque no "Dias" (a dica do IOF)
  await espera(900)
  await tocar(page.getByLabel('Dias', { exact: true }))
  await espera(2000)

  marca('03-mil')               // "Mil reais, quinze dias." — valor, prazo, Simular (a montagem acelera)
  await tocar(valor); await page.keyboard.type('100000', { delay: 60 })
  await tocar(prazo); await page.keyboard.press('Control+A'); await page.keyboard.type('15', { delay: 80 })
  await page.keyboard.press('Escape')
  await tocar(simular)
  await page.locator('#detalhamento-lista').waitFor()
  await espera(300)
  await rolarResultado()
  await confere('R$ 1.002,05'); await confere('IOF (50% do rendimento')

  marca('04-iof')               // "O IOF leva metade do rendimento."
  await destacar(linha(/IOF/))
  await espera(2800)

  marca('05-poupanca')          // "A poupança, no mesmo prazo, não rende nada."
  await rolarPara(linha(/Poupança no mesmo prazo/), 420, 600)
  await destacar(linha(/Poupança no mesmo prazo/))
  await espera(3300)
  await limpar()

  marca('06-trinta')            // "Com trinta dias, o IOF zera." — prazo 30, Simular, o resultado sem a linha do IOF
  await rolarPara(prazo, 260, 500)
  await tocar(prazo); await page.keyboard.press('Control+A'); await page.keyboard.type('30', { delay: 80 })
  await page.keyboard.press('Escape')
  await tocar(simular)
  await espera(500)
  await rolarResultado()
  await confere('R$ 1.008,25')
  if ((await page.locator('#detalhamento-lista').innerText()).includes('IOF (')) throw new Error('30 dias com IOF — tomada descartada')
  await destacar(linha(/\(-\) IR/))
  await espera(1200)

  marca('07-fecho')             // "Simule o seu prazo antes de resgatar." — o resultado de 30 dias
  await destacar(cartao.locator('xpath=ancestor::div[contains(@class,"bg-")][1]'))
  await espera(2900)
  marca('fim')

  await cdp.send('Page.stopScreencast').catch(() => {})
  await espera(300)
  await ctx.close(); await browser.close()
  const fim = new Date()
  fs.writeFileSync('quadros.json', JSON.stringify(quadros))
  fs.writeFileSync('marcas.json', JSON.stringify({ inicio: inicio.toISOString(), fim: fim.toISOString(), quadros: quadros.length, marcas }, null, 2))
  console.log('quadros:', quadros.length, 'início', inicio.toLocaleString('pt-BR'), 'fim', fim.toLocaleString('pt-BR'))
})()
