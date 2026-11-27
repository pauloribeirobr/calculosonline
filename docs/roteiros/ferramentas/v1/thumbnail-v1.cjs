// Thumbnail da V1 (Tesouro Reserva), 25/11/2026, no molde das do Recibo Fácil: fundo escuro, "RESGATOU ANTES DE 30 DIAS?"
// em caixa alta e, inclinado no canto, o resultado de R$ 1.000 por 15 dias recortado da gravação, com a linha do IOF
// destacada. Sem rosto, sem nome de instituição.
// Rodar na pasta da V1: cd ~/Vídeos/calculosonline-v1 && node <repo>/docs/roteiros/ferramentas/v1/thumbnail-v1.cjs
// Entrada: thumb-resultado.png (recorte 1036 × 440 do v1-tela-voz.mp4 em 34,95 s, sem o cursor:
//   ffmpeg -ss 34.95 -i v1-tela-voz.mp4 -frames:v 1 -vf "crop=1036:440:433:105" thumb-resultado.png).
// Saída: v1-thumbnail.png (1280 × 720).
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')

const WEB = '/home/paulo/projects/next/calculosonline/apps/web'
const ID = '/home/paulo/projects/next/calculosonline/docs/roteiros/identidade'
const b64 = (arq) => fs.readFileSync(arq).toString('base64')
const inter = b64(`${WEB}/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2`)
const logo = b64(`${ID}/logo-horizontal-escuro.png`)
const resultado = b64('thumb-resultado.png')

// A linha do IOF no recorte: y 322–358 de 440 (largura 1036).
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1280px; height: 720px; overflow: hidden; }
body { font-family: Inter, sans-serif; position: relative;
  background: radial-gradient(circle at 80% 45%, rgba(59,130,246,.35) 0%, rgba(59,130,246,0) 45%), linear-gradient(135deg, #0B1220 0%, #0F1B33 100%); }
.tag { position: absolute; left: 62px; top: 58px; background: #10B981; color: #fff; font-weight: 800; font-size: 30px; letter-spacing: .02em;
  padding: 6px 18px; border-radius: 10px; }
h1 { position: absolute; left: 60px; top: 128px; font-weight: 900; font-size: 104px; line-height: .98; letter-spacing: -0.035em;
  color: #fff; text-transform: uppercase; }
h1 .destaque { color: #FACC15; }
.logo { position: absolute; left: 64px; bottom: 48px; height: 50px; }
.res { position: absolute; right: 44px; top: 200px; width: 560px; transform: rotate(4deg); }
.res img { width: 100%; display: block; border-radius: 10px; box-shadow: 0 30px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.08); }
.res .hl { position: absolute; left: 1.2%; right: 1.2%; top: ${(314 / 440) * 100}%; height: ${(50 / 440) * 100}%;
  border: 5px solid #F59E0B; border-radius: 10px; background: rgba(245,158,11,.16); }
.selo { position: absolute; right: 60px; bottom: 80px; background: #DC2626; color: #fff; font-weight: 900; font-size: 44px;
  padding: 8px 22px; border-radius: 12px; transform: rotate(-4deg); box-shadow: 0 10px 24px rgba(0,0,0,.45); }
</style></head><body>
  <div class="tag">TESOURO RESERVA</div>
  <h1>Resgatou<br>antes de<br><span class="destaque">30 dias?</span></h1>
  <div class="res"><img src="data:image/png;base64,${resultado}"><div class="hl"></div></div>
  <div class="selo">IOF LEVA 50%</div>
  <img class="logo" src="data:image/png;base64,${logo}">
</body></html>`

;(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } })
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
  const r = await p.evaluate(() => {
    const h = document.querySelector('h1').getBoundingClientRect(), d = document.querySelector('.res').getBoundingClientRect()
    return { dir: h.right, baixo: h.bottom, resEsq: d.left }
  })
  await p.screenshot({ path: 'v1-thumbnail.png' }); await b.close()
  console.log('v1-thumbnail.png | título termina em x =', Math.round(r.dir), 'e y =', Math.round(r.baixo), '| o resultado começa em x =', Math.round(r.resEsq))
})()
