// Gravação da tela da V1 (Tesouro Reserva) em PRODUÇÃO, seguindo docs/roteiros/v1-tesouro-reserva.md (texto aprovado em
// 25/11/2026). Porte do gravar-v6-hq.cjs do Recibo Fácil. Voz antes da tela: cada ação cai no instante em que a fala a cita
// (tempos das palavras tirados de ~/Vídeos/calculosonline-v1/voz/resposta-completa.json), medidos a partir do início da
// cena (a voz entra 0,3 s depois do corte; no gancho, 0,1 s), e a montagem usa a tela em velocidade normal.
//
// Rodar na pasta do vídeo: cd ~/Vídeos/calculosonline-v1 && node <repo>/docs/roteiros/ferramentas/v1/gravar-v1.cjs
// Saídas: frames/, quadros.json e marcas.json.
//
// Nada fica em produção além do que um visitante anônimo deixa: GA4, Clarity, AdSense e Vercel Analytics bloqueados; nada
// salvo ("Salvar cálculo" não é tocado); o valor do resultado não é clicado (copiaria, F70); o WhatsApp não é aberto.
// O destaque das linhas (caixa âmbar) é desenhado por cima da página, só no vídeo.
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const BASE = 'https://calculosonline.com.br'
const URL = `${BASE}/calculadora/tesouro-reserva`
const W = 1536, H = 864 // CSS; com escala 1,25 o Chrome entrega 1920×1080 nativos

const CURSOR = `
(() => {
  if (window.__cursor) return; window.__cursor = true
  const ready = () => {
    const st = document.createElement('style'); st.textContent = 'html,body{scroll-behavior:auto!important}'; document.head.appendChild(st)
    const c = document.createElement('div')
    c.id = '__fake_cursor'
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.6 L12 13.8 L19 13.8 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    Object.assign(c.style, { position: 'fixed', left: '0px', top: '0px', zIndex: 2147483647, pointerEvents: 'none', transform: 'translate(-3px,-2px)', transition: 'none' })
    document.documentElement.appendChild(c)
    const pos = JSON.parse(sessionStorage.getItem('__cur') || '{"x":760,"y":420}')
    c.style.left = pos.x + 'px'; c.style.top = pos.y + 'px'
    document.addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; sessionStorage.setItem('__cur', JSON.stringify({ x: e.clientX, y: e.clientY })) }, true)
    document.addEventListener('mousedown', (e) => {
      const r = document.createElement('div')
      Object.assign(r.style, { position: 'fixed', left: (e.clientX - 18) + 'px', top: (e.clientY - 18) + 'px', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(37,99,235,.35)', zIndex: 2147483646, pointerEvents: 'none', transition: 'transform .45s ease-out, opacity .45s ease-out' })
      document.documentElement.appendChild(r)
      requestAnimationFrame(() => { r.style.transform = 'scale(1.8)'; r.style.opacity = '0' })
      setTimeout(() => r.remove(), 600)
    }, true)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready()
})()`

;(async () => {
  fs.rmSync('frames', { recursive: true, force: true }); fs.mkdirSync('frames')
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=1.25'], ignoreDefaultArgs: ['--hide-scrollbars'] })
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.25, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' })
  await ctx.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|googlesyndication|adservice|_vercel\/insights|vitals\.vercel/, (r) => r.abort())
  await ctx.addInitScript(CURSOR)
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  const quadros = []
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const nome = `frames/${String(quadros.length + 1).padStart(6, '0')}.jpg`
    fs.writeFileSync(nome, Buffer.from(data, 'base64'))
    quadros.push({ nome, ts: metadata.timestamp })
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  const t0 = Date.now()
  const inicio = new Date()
  const marcas = []
  const marca = (nome) => { const t = (Date.now() - t0) / 1000; marcas.push({ nome, t, epoch: Date.now() / 1000 }); console.log(t.toFixed(1).padStart(6), nome) }
  const espera = (ms) => page.waitForTimeout(ms)
  let cenaT0 = Date.now(), cenaNome = ''
  const cena = (nome) => { marca(nome); cenaT0 = Date.now(); cenaNome = nome }
  const ate = async (s) => {
    const falta = cenaT0 + s * 1000 - Date.now()
    if (falta > 0) await espera(falta); else if (falta < -250) console.log(`   ⚠️ ${cenaNome}: ${(-falta / 1000).toFixed(2)} s atrasado para ${s} s`)
  }
  let cur = { x: 760, y: 420 }
  const mover = async (x, y, ms = 700) => { const steps = Math.max(8, Math.round(ms / 16)); await page.mouse.move(x, y, { steps }); cur = { x, y } }
  const centro = async (loc) => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, b } }
  const irPara = async (loc, ms = 700, dx = 0) => { const c = await centro(loc); await mover(c.x + dx, c.y, ms); return c }
  const clicarAqui = async () => { await page.mouse.down(); await espera(70); await page.mouse.up() }
  const clicar = async (loc, ms = 600) => { await irPara(loc, ms); await espera(120); await clicarAqui() }
  const rolarAte = async (y, ms = 1500) => {
    await page.evaluate(async ({ y, ms }) => {
      const y0 = window.scrollY, dy = y - y0, t0 = performance.now()
      await new Promise((res) => { const f = (t) => { const k = Math.min(1, (t - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo({ top: y0 + dy * e, behavior: 'instant' }); k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) })
    }, { y, ms })
  }
  const rolarPara = async (loc, folgaTopo = 140, ms = 1500) => {
    const y = await loc.evaluate((el, f) => el.getBoundingClientRect().top + window.scrollY - f, folgaTopo)
    await rolarAte(Math.max(0, y), ms)
  }
  // Caixa âmbar em volta de uma linha do resultado (só no vídeo; some no próximo destaque ou com limpar()).
  const destacar = (loc) => loc.evaluate((el) => {
    document.querySelectorAll('.__hl').forEach((e) => e.remove())
    const r = el.getBoundingClientRect(), d = document.createElement('div')
    d.className = '__hl'
    Object.assign(d.style, { position: 'absolute', left: (r.left + scrollX - 8) + 'px', top: (r.top + scrollY - 4) + 'px', width: (r.width + 16) + 'px', height: (r.height + 8) + 'px',
      border: '3px solid #F59E0B', borderRadius: '10px', background: 'rgba(245,158,11,.12)', pointerEvents: 'none', zIndex: 2147483640 })
    document.body.appendChild(d)
  })
  const limpar = () => page.evaluate(() => document.querySelectorAll('.__hl').forEach((e) => e.remove()))
  const linha = (re) => page.locator('#detalhamento-lista li').filter({ hasText: re }).first()
  const valor = page.locator('#valorInicial')
  const prazo = page.locator('#prazo')
  const radio = (t) => page.getByLabel(t, { exact: true })
  const simular = page.getByRole('button', { name: 'Simular Tesouro Reserva' })
  const trocarPrazo = async (n) => { await clicar(prazo, 450); await page.keyboard.press('Control+A'); await page.keyboard.type(String(n), { delay: 90 }) }
  const confere = async (esperado) => {
    const txt = await page.locator('#detalhamento-lista').innerText()
    if (!txt.includes(esperado)) throw new Error(`resultado sem "${esperado}" — tomada descartada`)
  }

  await page.goto(URL, { waitUntil: 'load' })
  await page.locator('h1').first().waitFor()
  await espera(1500)
  await page.mouse.move(cur.x, cur.y)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  await espera(300)

  // [01] Gancho (voz 9,2 s, entra em 0,1 s) — H1 · "antes de trinta dias" (5,4–6,3): a dica "Use dias para ver o IOF…".
  cena('01-gancho')
  await irPara(page.locator('h1').first(), 1800)
  await ate(5.2)
  await irPara(page.getByText('Use dias para ver o IOF').first(), 1100)
  await ate(9.7)

  // [02] O que é (voz 10,0 s) — a lista de regras de "O que é o Tesouro Reserva": "rende cem por cento da Selic" (3,8) ·
  //      "começa com um real" (5,9) · "o resgate cai no Pix" (7,6).
  cena('02-o-que-e')
  const oque = page.getByRole('heading', { name: 'O que é o Tesouro Reserva' })
  await rolarPara(oque, 120, 2400)
  const regras = oque.locator('xpath=following-sibling::ul[1]/li')
  await ate(3.7)
  await destacar(regras.nth(0)); await irPara(regras.nth(0), 500, -200)
  await ate(5.8)
  await destacar(regras.nth(1)); await irPara(regras.nth(1), 500, -200)
  await ate(7.5)
  await destacar(regras.nth(2)); await irPara(regras.nth(2), 500, -200)
  await ate(10.6)
  await limpar()

  // [03] Preencher (voz 11,3 s) — "quanto você vai aplicar" (4,0) · "por quanto tempo" (5,6) · "meses ou em dias" (7,9–8,7) ·
  //      "Mil reais" (9,7) · "quinze dias" (10,8) → Simular.
  cena('03-preencher')
  await rolarPara(page.getByText('Valor aplicado', { exact: true }).first(), 150, 1600)
  await ate(3.9)
  await irPara(valor, 600)
  await ate(5.5)
  await irPara(prazo, 500)
  await ate(7.8)
  await irPara(radio('Meses'), 400)
  await ate(8.5)
  await irPara(radio('Dias'), 300)
  await ate(9.6)
  await clicar(valor, 300); await page.keyboard.type('100000', { delay: 70 })
  await ate(10.7)
  await trocarPrazo(15)
  await clicar(radio('Dias'), 300)
  await ate(11.4)
  await clicar(simular, 350)
  await ate(11.9)

  // [04] O IOF (voz 12,0 s) — "Olha o IOF" (0,6) · "ele leva metade do rendimento" (2,8–4,2) · "imposto de renda" (6,0) ·
  //      "a poupança… não rendeu nada" (7,3–9,5).
  cena('04-iof')
  await page.locator('#detalhamento-lista').waitFor()
  await rolarPara(page.locator('#detalhamento-lista'), 260, 900)
  await confere('R$ 1.002,05'); await confere('IOF (50% do rendimento, resgate com 15 dias)')
  await ate(0.7)
  await destacar(linha(/IOF/)); await irPara(linha(/IOF/), 600, 260)
  await ate(5.9)
  await destacar(linha(/\(-\) IR/)); await irPara(linha(/\(-\) IR/), 500, 260)
  await ate(7.2)
  await destacar(linha(/Poupança no mesmo prazo/)); await irPara(linha(/Poupança no mesmo prazo/), 500, 300)
  await ate(12.6)
  await limpar()

  // [05] A tabela dia a dia (voz 7,0 s) — "Na tabela" (0,5): abre · "dia por dia… diminuindo" (1,1–3,8): rola · "zera no
  //      trigésimo" (6,1).
  cena('05-tabela')
  const resumo = page.locator('summary').filter({ hasText: 'Evolução dia a dia' }).first()
  await rolarPara(resumo, 300, 600)
  await clicar(resumo, 400)
  await espera(300)
  const tabela = page.locator('details[open] table').first()
  await rolarPara(tabela, 130, 900)
  await irPara(tabela.locator('th').filter({ hasText: 'IOF' }).first(), 500)
  await ate(1.4)
  // A tabela rola dentro da própria caixa (1ª tomada de 25/11: a página rolava e a tabela parava no dia 11).
  const rolouTabela = await tabela.evaluate(async (t, ms) => {
    let el = t.parentElement
    while (el && !(el.scrollHeight > el.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement
    if (!el || el === document.body || el === document.documentElement) return false
    const y0 = el.scrollTop, dy = el.scrollHeight - el.clientHeight - y0, t0 = performance.now()
    await new Promise((res) => { const f = (tt) => { const k = Math.min(1, (tt - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.scrollTop = y0 + dy * e; k < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) })
    return true
  }, 3800)
  if (!rolouTabela) console.log('   ⚠️ 05-tabela: a caixa da tabela não rola')
  await irPara(tabela.locator('tbody tr').last(), 400)
  await ate(7.4)

  // [06] Trinta dias (voz 5,2 s) — "Com trinta dias" (0,6–1,0): prazo 30 e Simular · "Sai só o imposto de renda" (3,1–4,2).
  cena('06-trinta-dias')
  await rolarPara(prazo, 260, 700)
  await trocarPrazo(30)
  await clicar(simular, 300)
  await espera(500)
  await rolarPara(page.locator('#detalhamento-lista'), 260, 700)
  await confere('R$ 1.008,25')
  if ((await page.locator('#detalhamento-lista').innerText()).includes('IOF (')) throw new Error('30 dias com linha de IOF — tomada descartada')
  await ate(3.2)
  await destacar(linha(/\(-\) IR/)); await irPara(linha(/\(-\) IR/), 500, 260)
  await ate(6.0)
  await limpar()

  // [07] Doze meses (voz 9,0 s) — "doze meses" (0,6–0,9): Meses, 12, Simular · "bem à frente da poupança" (3,1–4,2) ·
  //      "empatado com um CDB" (5,7–7,0).
  cena('07-doze-meses')
  await rolarPara(prazo, 260, 600)
  await clicar(radio('Meses'), 350)
  await trocarPrazo(12)
  await clicar(simular, 300)
  await espera(400)
  await rolarPara(page.locator('#detalhamento-lista'), 260, 700)
  await confere('R$ 1.113,44')
  await destacar(linha(/Valor líquido no resgate/)); await irPara(linha(/Valor líquido no resgate/), 500, 260)
  await ate(3.6)
  await destacar(linha(/Poupança no mesmo prazo/)); await irPara(linha(/Poupança no mesmo prazo/), 500, 300)
  await ate(6.1)
  await destacar(linha(/CDB de 100% do CDI/)); await irPara(linha(/CDB de 100% do CDI/), 500, 300)
  await ate(9.8)

  // [08] Custódia (voz 7,3 s) — "taxa de custódia da B3" (2,3–3,5): a linha da custódia.
  cena('08-custodia')
  await ate(2.2)
  await destacar(linha(/Custódia B3/)); await irPara(linha(/Custódia B3/), 600, 260)
  await ate(7.8)
  await limpar()

  // [09] Compartilhar (voz 7,2 s) — "O botão do WhatsApp" (2,1–2,8): o botão, sem clicar · "quem abre já vê o cálculo pronto"
  //      (4,3–5,7): o link do cálculo aberto, já no resultado (F59).
  cena('09-compartilhar')
  const wa = page.getByRole('link', { name: /Compartilhar via WhatsApp/ })
  await rolarPara(wa, 520, 800)
  await ate(1.9)
  await destacar(wa); await irPara(wa, 500)
  const href = await wa.getAttribute('href')
  const link = decodeURIComponent(href).match(/https:\/\/calculosonline\.com\.br\S+\?d=\S+/)[0]
  await ate(4.0)
  marca('09a-link')
  await page.goto(link, { waitUntil: 'load' })
  await page.locator('#detalhamento-lista').waitFor({ timeout: 15000 })
  await espera(900)
  await rolarPara(page.locator('#detalhamento-lista'), 300, 600)
  await confere('R$ 1.113,44')
  await destacar(linha(/Valor líquido no resgate/)); await irPara(linha(/Valor líquido no resgate/), 500, 260)
  await ate(8.0)
  await limpar()

  // [10] Fechamento (voz 10,4 s) — volta ao topo e ao H1; "O link está na descrição" (9,2).
  cena('10-fechamento')
  await rolarAte(0, 2600)
  await irPara(page.locator('h1').first(), 1400)
  await ate(11.2)
  marca('fim')

  await cdp.send('Page.stopScreencast').catch(() => {})
  await espera(300)
  await ctx.close()
  await browser.close()
  const fim = new Date()
  fs.writeFileSync('quadros.json', JSON.stringify(quadros))
  fs.writeFileSync('marcas.json', JSON.stringify({ inicio: inicio.toISOString(), fim: fim.toISOString(), quadros: quadros.length, primeiroQuadro: quadros[0]?.ts, marcas }, null, 2))
  console.log('quadros:', quadros.length, 'início', inicio.toLocaleString('pt-BR'), 'fim', fim.toLocaleString('pt-BR'))
})()
