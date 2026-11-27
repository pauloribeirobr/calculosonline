// Thumbnail da V2 (2ª parcela do 13º), 26/11/2026, no molde da V1: fundo escuro, "A 2ª PARCELA VEIO MENOR?" em caixa alta
// e, inclinado no canto, o resultado da 2ª parcela (R$ 4.000, ano inteiro) com as três linhas do INSS destacadas; selo
// "NÃO É ERRO". Sem rosto, sem nome de instituição.
// Rodar na pasta da V2: cd ~/Vídeos/calculosonline-v2 && node <repo>/docs/roteiros/ferramentas/v2/thumbnail-v2.cjs
// O recorte sai da página em produção (visitante anônimo, analytics bloqueados, nada salvo), em escala 2, sem cursor:
// thumb-resultado.png. Saída: v2-thumbnail.png (1280 × 720).
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const WEB = '/home/paulo/projects/next/calculosonline/apps/web'
const ID = '/home/paulo/projects/next/calculosonline/docs/roteiros/identidade'
const b64 = (arq) => fs.readFileSync(arq).toString('base64')

async function recortar(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: 'pt-BR' })
  await ctx.route(/googletagmanager|google-analytics|clarity\.ms|doubleclick|googlesyndication|adservice|_vercel\/insights|vitals\.vercel/, (r) => r.abort())
  const p = await ctx.newPage()
  await p.goto('https://calculosonline.com.br/calculadora/decimo-terceiro', { waitUntil: 'load' })
  await p.locator('#salarioBruto').click(); await p.keyboard.type('400000')
  await p.selectOption('#parcela', 'segunda')
  await p.getByRole('button', { name: /Calcular 13/ }).click()
  const lista = p.locator('#detalhamento-lista'); await lista.waitFor()
  if (!(await lista.innerText()).includes('R$ 1.631,40')) throw new Error('resultado diferente do roteiro')
  await lista.scrollIntoViewIfNeeded(); await p.mouse.move(0, 0); await p.waitForTimeout(400)
  // Do topo do card azul ("Resultado") até a linha da 2ª parcela líquida.
  const m = await p.evaluate(() => {
    const l = document.querySelector('#detalhamento-lista')
    const lis = [...l.querySelectorAll('li')]
    const inss = lis.filter((li) => /^INSS/.test(li.innerText.trim()))
    const liq = lis.find((li) => /2ª Parcela líquida/.test(li.innerText))
    let card = l; while (card && !/Resultado/.test(card.innerText.slice(0, 40))) card = card.parentElement
    const c = card.getBoundingClientRect(), a = inss[0].getBoundingClientRect(), z = inss[inss.length - 1].getBoundingClientRect(), f = liq.getBoundingClientRect()
    return { x: c.left, y: c.top, w: c.width, h: f.bottom + 8 - c.top, hlTop: a.top - 4 - c.top, hlH: z.bottom - a.top + 8 }
  })
  await p.screenshot({ path: 'thumb-resultado.png', clip: { x: m.x, y: m.y, width: m.w, height: m.h } })
  await ctx.close()
  return m
}

;(async () => {
  const b = await chromium.launch()
  const m = await recortar(b)
  const inter = b64(`${WEB}/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`)
  const logo = b64(`${ID}/logo-horizontal-escuro.png`)
  const resultado = b64('thumb-resultado.png')
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1280px; height: 720px; overflow: hidden; }
body { font-family: Inter, sans-serif; position: relative;
  background: radial-gradient(circle at 80% 45%, rgba(59,130,246,.35) 0%, rgba(59,130,246,0) 45%), linear-gradient(135deg, #0B1220 0%, #0F1B33 100%); }
.tag { position: absolute; left: 62px; top: 58px; background: #10B981; color: #fff; font-weight: 800; font-size: 30px; letter-spacing: .02em;
  padding: 6px 18px; border-radius: 10px; }
h1 { position: absolute; left: 60px; top: 140px; font-weight: 900; font-size: 92px; line-height: 1.0; letter-spacing: -0.035em;
  color: #fff; text-transform: uppercase; }
h1 .destaque { color: #FACC15; }
.logo { position: absolute; left: 64px; bottom: 48px; height: 50px; }
.res { position: absolute; right: 44px; top: 130px; width: 470px; transform: rotate(4deg); }
.res img { width: 100%; display: block; border-radius: 10px; box-shadow: 0 30px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08); }
.res .hl { position: absolute; left: 1.2%; right: 1.2%; top: ${(m.hlTop / m.h) * 100}%; height: ${(m.hlH / m.h) * 100}%;
  border: 5px solid #F59E0B; border-radius: 10px; background: rgba(245,158,11,.16); }
.selo { position: absolute; right: 60px; bottom: 60px; background: #DC2626; color: #fff; font-weight: 900; font-size: 44px;
  padding: 8px 22px; border-radius: 12px; transform: rotate(-4deg); box-shadow: 0 10px 24px rgba(0,0,0,.45); }
</style></head><body>
  <div class="tag">13º SALÁRIO</div>
  <h1>A 2ª parcela<br>veio<br><span class="destaque">menor?</span></h1>
  <div class="res"><img src="data:image/png;base64,${resultado}"><div class="hl"></div></div>
  <div class="selo">NÃO É ERRO</div>
  <img class="logo" src="data:image/png;base64,${logo}">
</body></html>`
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
  const r = await p.evaluate(() => {
    const h = document.querySelector('h1').getBoundingClientRect(), d = document.querySelector('.res').getBoundingClientRect()
    return { dir: h.right, baixo: h.bottom, resEsq: d.left, resBaixo: d.bottom }
  })
  await p.screenshot({ path: 'v2-thumbnail.png' }); await b.close()
  console.log('v2-thumbnail.png | título até x =', Math.round(r.dir), 'y =', Math.round(r.baixo), '| resultado de x =', Math.round(r.resEsq), 'até y =', Math.round(r.resBaixo))
})()
