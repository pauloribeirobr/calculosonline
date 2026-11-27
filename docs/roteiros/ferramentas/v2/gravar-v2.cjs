// Gravação da tela da V2 (2ª parcela do 13º) em PRODUÇÃO, seguindo docs/roteiros/v2-segunda-parcela-13.md (texto aprovado
// em 25/11/2026). A partir do gravar-v1.cjs. Voz antes da tela: cada ação cai no instante em que a fala a cita (tempos das
// palavras tirados de ~/Vídeos/calculosonline-v2/voz/resposta-completa.json), medidos a partir do início da cena (a voz
// entra 0,3 s depois do corte; no gancho, 0,1 s), e a montagem usa a tela em velocidade normal.
//
// Rodar na pasta do vídeo: cd ~/Vídeos/calculosonline-v2 && node <repo>/docs/roteiros/ferramentas/v2/gravar-v2.cjs
// Saídas: frames/, quadros.json e marcas.json.
//
// Nada fica em produção além do que um visitante anônimo deixa: GA4, Clarity, AdSense e Vercel Analytics bloqueados; nada
// salvo; o valor do resultado não é clicado (copiaria, F70); o WhatsApp não é aberto. A "Parcela" é lista nativa (não sai
// no screencast): o cursor vai até ela, o anel do clique aparece e o valor muda pelo selectOption. O destaque das linhas
// (caixa âmbar) é desenhado por cima da página, só no vídeo.
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const BASE = 'https://calculosonline.com.br'
const URL = `${BASE}/calculadora/decimo-terceiro`
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
  // Rola só o necessário para o elemento caber na tela (com folga embaixo).
  const caber = async (loc, ms = 500) => {
    const r = await loc.evaluate((el) => { const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom } })
    if (r.bottom > H - 90) await rolarAte(await page.evaluate(() => window.scrollY) + (r.bottom - (H - 90)), ms)
    else if (r.top < 80) await rolarAte(Math.max(0, await page.evaluate(() => window.scrollY) - (80 - r.top)), ms)
  }
  // Caixa âmbar em volta de um ou mais elementos (a união deles); some no próximo destaque ou com limpar().
  const destacar = async (...locs) => {
    const rs = []
    for (const l of locs) rs.push(await l.evaluate((el) => { const r = el.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY } }))
    const u = { l: Math.min(...rs.map((r) => r.l)), t: Math.min(...rs.map((r) => r.t)), r: Math.max(...rs.map((r) => r.r)), b: Math.max(...rs.map((r) => r.b)) }
    await page.evaluate((u) => {
      document.querySelectorAll('.__hl').forEach((e) => e.remove())
      const d = document.createElement('div')
      d.className = '__hl'
      Object.assign(d.style, { position: 'absolute', left: (u.l - 8) + 'px', top: (u.t - 4) + 'px', width: (u.r - u.l + 16) + 'px', height: (u.b - u.t + 8) + 'px',
        border: '3px solid #F59E0B', borderRadius: '10px', background: 'rgba(245,158,11,.12)', pointerEvents: 'none', zIndex: 2147483640 })
      document.body.appendChild(d)
    }, u)
  }
  const limpar = () => page.evaluate(() => document.querySelectorAll('.__hl').forEach((e) => e.remove()))
  const lista = page.locator('#detalhamento-lista')
  const linha = (re) => lista.locator('li').filter({ hasText: re }).first()
  const salario = page.locator('#salarioBruto')
  const admissao = page.locator('#mesAdmissao')
  const parcela = page.locator('#parcela')
  const calcular = page.getByRole('button', { name: /Calcular 13/ })
  const escolher = async (valor, ms = 450) => { await clicar(parcela, ms); await espera(150); await parcela.selectOption(valor) }
  const confere = async (esperado) => {
    const txt = await lista.innerText()
    if (!txt.includes(esperado)) throw new Error(`resultado sem "${esperado}" — tomada descartada`)
  }
  const verResultado = async (esperado, folga = 200, ms = 800) => {
    await lista.waitFor()
    await espera(250)
    await confere(esperado)
    await rolarPara(lista, folga, ms)
  }

  await page.goto(URL, { waitUntil: 'load' })
  await page.locator('h1').first().waitFor()
  const prazos = page.getByRole('heading', { name: 'Prazos de pagamento' })
  await prazos.waitFor({ state: 'attached', timeout: 15000 })
  await espera(1500)
  await page.mouse.move(cur.x, cur.y)
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  await espera(300)

  // [01] Gancho (voz 8,6 s, entra em 0,1 s) — H1 · "A segunda vem menor" (3,6–4,5): o campo "Parcela" · "todos os
  //      descontos" (6,7–7,3): fica nele.
  cena('01-gancho')
  await irPara(page.locator('h1').first(), 1800)
  await ate(3.5)
  await irPara(parcela, 1000)
  await ate(9.0)

  // [02] As duas parcelas (voz 12,2 s) — a tabela de "Prazos de pagamento": "A primeira parcela" (0,5) · "sem desconto
  //      nenhum" (4,7–5,5): "Metade do valor bruto, sem descontos" · "A segunda" (6,3) · "entram o INSS e o imposto de
  //      renda" (9,6–12,1): "Saldo + INSS + IRRF".
  cena('02-parcelas')
  const tabela = prazos.locator('xpath=following-sibling::div[1]//table')
  await rolarPara(prazos, 200, 1500)
  const lin1 = tabela.locator('tbody tr').nth(0), lin2 = tabela.locator('tbody tr').nth(1)
  await destacar(lin1); await irPara(lin1.locator('td').nth(0), 500)
  await ate(4.6)
  await destacar(lin1.locator('td').nth(3)); await irPara(lin1.locator('td').nth(3), 500)
  await ate(6.2)
  await destacar(lin2); await irPara(lin2.locator('td').nth(0), 600)
  await ate(9.5)
  await destacar(lin2.locator('td').nth(3)); await irPara(lin2.locator('td').nth(3), 500)
  await ate(12.6)
  await limpar()

  // [03] Preencher (voz 8,1 s) — "o salário" (2,4) · "o mês em que entrou" (3,3) · "escolhe a parcela" (5,0–5,4) ·
  //      "Quatro mil reais" (6,3–6,8): digita · "primeira parcela" (7,5–7,8): escolhe → Calcular.
  cena('03-preencher')
  await rolarPara(salario, 260, 1300)
  await ate(2.3)
  await irPara(salario, 500)
  await ate(3.2)
  await irPara(admissao, 500)
  await ate(4.9)
  await irPara(parcela, 450)
  await ate(6.1)
  await clicar(salario, 350); await page.keyboard.press('Control+A'); await page.keyboard.type('400000', { delay: 45 })
  await ate(7.3)
  await escolher('primeira', 300)
  await clicar(calcular, 350)
  await ate(8.4)

  // [04] A primeira (voz 4,7 s) — "Metade do décimo terceiro" (0,4–1,5) · "sem nenhum desconto" (2,2–2,8): a linha
  //      "1ª Parcela (50%)" · "Agora, a segunda" (3,7–4,4): Parcela → 2ª, Calcular (na 1ª tomada, a troca dentro da cena 05
  //      atrasava o INSS em ~1 s).
  cena('04-primeira')
  await verResultado('R$ 2.000,00', 260, 700)
  if ((await lista.innerText()).includes('INSS')) throw new Error('1ª parcela com INSS — tomada descartada')
  await destacar(linha(/1ª Parcela \(50%\)/)); await irPara(linha(/1ª Parcela \(50%\)/), 500, 260)
  await ate(3.5)
  await limpar()
  await rolarPara(parcela, 300, 450)
  await escolher('segunda', 300)
  await clicar(calcular, 300)
  await ate(5.3)

  // [05] A segunda (voz 11,5 s) — o resultado da 2ª · "o décimo terceiro inteiro" (1,5–2,3) · "menos o INSS" (3,1–4,5):
  //      as três linhas do INSS · "menos a primeira parcela" (6,7–7,6) · "Por isso a segunda vem menor" (9,7): a líquida.
  cena('05-segunda')
  await verResultado('R$ 1.631,40', 120, 700)
  await ate(1.4)
  await destacar(linha(/13º proporcional/)); await irPara(linha(/13º proporcional/), 400, 260)
  await ate(3.0)
  const inss = lista.locator('li').filter({ hasText: /^INSS/ })
  await destacar(inss.first(), inss.last()); await irPara(inss.nth(1), 400, 260)
  await ate(6.6)
  await caber(linha(/2ª Parcela líquida/), 500)
  await destacar(linha(/1ª Parcela \(já recebida\)/)); await irPara(linha(/1ª Parcela \(já recebida\)/), 400, 260)
  await ate(9.6)
  await destacar(linha(/2ª Parcela líquida/)); await irPara(linha(/2ª Parcela líquida/), 400, 260)
  await ate(12.1)

  // [06] O imposto de renda (voz 9,3 s) — "E o imposto de renda?" (0,5–1,1): "IRRF pela tabela" · "não paga" (6,1):
  //      "Desconto IRRF (isento)" · "redutor da lei nova" (7,5–8,4): o redutor · "Está aqui" (9,0): os dois.
  cena('06-imposto')
  await ate(0.4)
  await destacar(linha(/IRRF pela tabela/)); await irPara(linha(/IRRF pela tabela/), 500, 260)
  await ate(6.0)
  await destacar(linha(/Desconto IRRF/)); await irPara(linha(/Desconto IRRF/), 400, 260)
  await ate(7.4)
  await destacar(linha(/Redutor da Lei 15\.270/)); await irPara(linha(/Redutor da Lei 15\.270/), 400, 260)
  await ate(8.9)
  await destacar(linha(/Redutor da Lei 15\.270/), linha(/Desconto IRRF/))
  await ate(9.9)
  await limpar()

  // [07] O total (voz 5,8 s) — "Escolhendo o total" (0,3–1,1): Parcela → Total, Calcular · "quanto entra no ano" (2,0–2,9):
  //      "13º Líquido".
  cena('07-total')
  await rolarPara(parcela, 300, 500)
  await escolher('total', 300)
  await clicar(calcular, 300)
  await verResultado('R$ 3.631,40', 120, 600)
  await caber(linha(/13º Líquido/), 400)
  await destacar(linha(/13º Líquido/)); await irPara(linha(/13º Líquido/), 400, 260)
  await ate(6.4)

  // [08] Compartilhar (voz 5,1 s) — "O botão do WhatsApp" (2,2–2,8): o botão, sem clicar · "o cálculo abre pronto"
  //      (4,2–5,0): o link do cálculo aberto, já no resultado (F59).
  cena('08-compartilhar')
  await limpar()
  const wa = page.getByRole('link', { name: /Compartilhar via WhatsApp/ })
  await rolarPara(wa, 520, 700)
  await ate(2.0)
  await destacar(wa); await irPara(wa, 450)
  const href = await wa.getAttribute('href')
  const link = decodeURIComponent(href).match(/https:\/\/calculosonline\.com\.br\S+\?d=\S+/)[0]
  await ate(3.3)
  marca('08a-link')
  await page.goto(link, { waitUntil: 'load' })
  await lista.waitFor({ timeout: 15000 })
  await espera(600)
  await rolarPara(lista, 120, 500)
  await confere('R$ 3.631,40')
  await caber(linha(/13º Líquido/), 300)
  await destacar(linha(/13º Líquido/)); await irPara(linha(/13º Líquido/), 400, 260)
  await ate(6.6)
  await limpar()

  // [09] Fechamento (voz 9,1 s) — volta ao topo e ao H1 · "confira aqui" (3,1–3,6): o salário · "O link está na descrição" (8,0).
  cena('09-fechamento')
  await rolarAte(0, 2400)
  await irPara(page.locator('h1').first(), 1000)
  await ate(3.0)
  await irPara(salario, 700)
  await ate(9.8)
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
