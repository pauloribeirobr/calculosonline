// Gravação da tela do Short da V2 (2ª parcela do 13º) em PRODUÇÃO, seguindo docs/roteiros/v2-segunda-parcela-13.md §2
// (texto aprovado em 25/11/2026). Celular emulado de 360 × 640 com escala 3 = 1080 × 1920 nativos. A partir do
// gravar-v1-short.cjs. Voz ANTES da tela (voz/v2-short.json): cada bloco do short.json dura o que a fala pede, e a montagem
// acelera o trecho gravado para caber (ou segura o último quadro).
//
// Rodar na pasta do Short: cd ~/Vídeos/calculosonline-v2-short && node <repo>/docs/roteiros/ferramentas/v2-short/gravar-v2-short.cjs
// Saídas: frames/, quadros.json e marcas.json.
//
// Nada fica em produção além do que um visitante anônimo deixa: GA4, Clarity, AdSense e Vercel Analytics bloqueados; nada
// salvo; o valor do resultado não é tocado (copiaria). A caixa âmbar das linhas é desenhada por cima, só no vídeo. Tudo o
// que importa fica abaixo de ~200 px CSS (acima ficam a pílula do passo e a legenda) e acima de ~500 px (interface do
// YouTube no rodapé).
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const URL = 'https://calculosonline.com.br/calculadora/decimo-terceiro'
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
  // No celular, o formulário do 13º passa da tela: rola até o campo antes de tocar (toque fora da tela não pega; 1ª tomada de 27/11).
  const tocar = async (loc) => {
    let b = await loc.boundingBox()
    if (b.y + b.height > H - 140 || b.y < 200) { await rolarPara(loc, 300, 450); b = await loc.boundingBox() }
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await espera(150)
  }
  const rolarAte = (y, ms) => page.evaluate(async ({ y, ms }) => {
    const y0 = window.scrollY, dy = y - y0, t0 = performance.now()
    await new Promise((res) => { const f = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) })
  }, { y, ms })
  const rolarPara = async (loc, folgaTopo, ms = 700) => {
    const y = await loc.evaluate((el, f) => el.getBoundingClientRect().top + window.scrollY - f, folgaTopo)
    await rolarAte(Math.max(0, y), ms)
  }
  // Caixa âmbar em volta de um ou mais elementos (a união deles).
  const destacar = async (...locs) => {
    const rs = []
    for (const l of locs) rs.push(await l.evaluate((el) => { const r = el.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY } }))
    const u = { l: Math.min(...rs.map((r) => r.l)), t: Math.min(...rs.map((r) => r.t)), r: Math.max(...rs.map((r) => r.r)), b: Math.max(...rs.map((r) => r.b)) }
    await page.evaluate((u) => {
      document.querySelectorAll('.__hl').forEach((e) => e.remove())
      const d = document.createElement('div')
      d.className = '__hl'
      Object.assign(d.style, { position: 'absolute', left: (u.l - 4) + 'px', top: (u.t - 3) + 'px', width: (u.r - u.l + 8) + 'px', height: (u.b - u.t + 6) + 'px',
        border: '2.5px solid #F59E0B', borderRadius: '8px', background: 'rgba(245,158,11,.14)', pointerEvents: 'none', zIndex: 2147483640 })
      document.body.appendChild(d)
    }, u)
  }
  const limpar = () => page.evaluate(() => document.querySelectorAll('.__hl').forEach((e) => e.remove()))
  const lista = page.locator('#detalhamento-lista')
  const linha = (re) => lista.locator('li').filter({ hasText: re }).first()
  const salario = page.locator('#salarioBruto'), parcela = page.locator('#parcela')
  const calcular = page.getByRole('button', { name: /Calcular 13/ })
  // O cartão do resultado logo abaixo da pílula e da legenda.
  const cartao = page.getByText('Resultado', { exact: true }).first()
  const rolarResultado = () => rolarPara(cartao, 200, 500)
  const confere = async (esperado) => {
    const txt = await lista.innerText()
    if (!txt.includes(esperado)) throw new Error(`resultado sem "${esperado}" — tomada descartada`)
  }

  await page.goto(URL, { waitUntil: 'load' })
  await page.locator('h1').first().waitFor()
  await espera(1500)
  // Abre com o formulário na tela, logo abaixo da área da pílula e da legenda.
  await rolarPara(page.getByText('Salário Bruto', { exact: true }).first(), 210, 10)
  await espera(400)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * ESCALA, maxHeight: H * ESCALA, everyNthFrame: 1 })
  await espera(300)

  marca('01-gancho')            // "A segunda parcela do décimo terceiro veio menor?" — o formulário parado, com o gancho
  await espera(3100)
  marca('02-erro')              // "Não é erro."
  await espera(1100)

  marca('03-salario')           // "Quatro mil reais de salário." — salário, 1ª parcela, Calcular (a montagem acelera)
  await tocar(salario); await page.keyboard.type('400000', { delay: 50 })
  await page.keyboard.press('Escape')
  await tocar(parcela); await espera(150); await parcela.selectOption('primeira')
  await tocar(calcular)
  await lista.waitFor()
  await espera(250)
  await rolarResultado()
  await confere('R$ 2.000,00')
  if ((await lista.innerText()).includes('INSS')) throw new Error('1ª parcela com INSS — tomada descartada')

  marca('04-primeira')          // "A primeira vem inteira, sem desconto."
  await destacar(linha(/1ª Parcela \(50%\)/))
  await espera(2700)

  marca('05-segunda')           // "Na segunda, sai o INSS do décimo terceiro todo." — 2ª parcela, Calcular, as linhas do INSS
  await limpar()
  await rolarPara(parcela, 260, 450)
  await tocar(parcela); await espera(150); await parcela.selectOption('segunda')
  await tocar(calcular)
  await espera(400)
  await rolarResultado()
  await confere('R$ 1.631,40')
  await espera(300)
  // No celular as linhas quebram e as três do INSS ocupam ~280 px: sobem para logo abaixo da legenda (1ª tomada montada de
  // 27/11: com o cartão no topo, ficavam embaixo da interface do YouTube).
  const inss = lista.locator('li').filter({ hasText: /^INSS/ })
  await rolarPara(inss.first(), 215, 500)
  await destacar(inss.first(), inss.last())
  await espera(2600)

  marca('06-ir')                // "E, até cinco mil reais, não tem imposto de renda." — o redutor e o IRRF isento
  await rolarPara(linha(/Redutor da Lei 15\.270/), 330, 600)
  await destacar(linha(/Redutor da Lei 15\.270/), linha(/Desconto IRRF/))
  await espera(3400)

  marca('07-fecho')             // "Confira a sua conta antes do pagamento." — a 2ª parcela líquida
  await rolarPara(linha(/2ª Parcela líquida/), 330, 450)
  await destacar(linha(/2ª Parcela líquida/))
  await espera(2300)
  marca('fim')

  await cdp.send('Page.stopScreencast').catch(() => {})
  await espera(300)
  await ctx.close(); await browser.close()
  const fim = new Date()
  fs.writeFileSync('quadros.json', JSON.stringify(quadros))
  fs.writeFileSync('marcas.json', JSON.stringify({ inicio: inicio.toISOString(), fim: fim.toISOString(), quadros: quadros.length, marcas }, null, 2))
  console.log('quadros:', quadros.length, 'início', inicio.toLocaleString('pt-BR'), 'fim', fim.toLocaleString('pt-BR'))
})()
