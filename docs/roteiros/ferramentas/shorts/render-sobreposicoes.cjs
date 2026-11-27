// Sobreposições dos Shorts (1080×1920, PNG transparente), na fonte da marca (Inter, a mesma do
// site e da identidade do canal). Uso: node render-sobreposicoes.cjs <config.json> <pasta-saida>
// config: { gancho: "TEXTO", rotulos: { id: "TEXTO" }, cta: { pagina: "/calculadora/tesouro-reserva" } }
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')
const path = require('path')

const FRONT = '/home/paulo/projects/next/calculosonline/apps/web'
const ID = '/home/paulo/projects/next/calculosonline/docs/roteiros/identidade'
const inter = fs.readFileSync(path.join(FRONT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64')
const logo = fs.readFileSync(path.join(ID, 'logo-horizontal-claro.png')).toString('base64')

const base = (corpo, fundo = 'transparent') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${fundo}; font-family: Inter, sans-serif; }
</style></head><body>${corpo}</body></html>`

// Rótulo do passo: pílula azul no topo, por cima do cabeçalho do site (fora da zona da interface do
// YouTube, que ocupa o rodapé e a lateral direita).
const rotulo = (texto) => base(`
<div style="position:absolute; left:0; right:0; top:118px; display:flex; justify-content:center;">
  <div style="background:#2563EB; color:#fff; font-weight:800; font-size:60px; letter-spacing:.01em; padding:22px 44px; border-radius:999px;
              box-shadow:0 14px 34px rgba(15,23,42,.35), 0 0 0 6px rgba(255,255,255,.9); white-space:nowrap;">${texto}</div>
</div>`)

// Gancho: faixa escura no terço de cima do meio, texto grande em caixa alta.
const gancho = (texto) => {
  const [l1, ...resto] = texto.split('|')
  return base(`
<div style="position:absolute; left:0; right:0; top:600px; padding:70px 70px; background:rgba(11,18,32,.88);">
  <div style="color:#fff; font-weight:900; font-size:118px; line-height:1.02; letter-spacing:-.03em; text-transform:uppercase;">${l1}${resto.length ? `<br><span style="color:#FACC15">${resto.join('<br>')}</span>` : ''}</div>
</div>`)
}

// Cartão final (tela inteira): marca, endereço grande, página e "Link fixado nos comentários".
const cta = ({ pagina }) => base(`
<div style="position:absolute; inset:0; background:linear-gradient(160deg,#F8FAFF 0%,#E8F0FF 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:56px; padding:0 70px;">
  <img src="data:image/png;base64,${logo}" style="width:620px;">
  <div style="font-weight:800; font-size:76px; color:#2563EB; letter-spacing:-.02em;">calculosonline.com.br</div>
  <div style="font-weight:600; font-size:46px; color:#334155; background:#fff; border:3px solid #CBD5E1; border-radius:20px; padding:16px 30px;">${pagina}</div>
  <div style="margin-top:40px; font-weight:700; font-size:56px; color:#0F172A; display:flex; align-items:center; gap:22px;">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M5 12l7 7 7-7"/></svg>
    Link fixado nos comentários
  </div>
</div>`, '#F8FAFF')

;(async () => {
  const [cfgArq, saida] = process.argv.slice(2)
  const cfg = JSON.parse(fs.readFileSync(cfgArq, 'utf-8'))
  fs.mkdirSync(saida, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  const render = async (html, nome, transparente = true) => {
    await page.setContent(html); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(100)
    await page.screenshot({ path: path.join(saida, nome), omitBackground: transparente })
    console.log(nome)
  }
  await render(gancho(cfg.gancho), 'gancho.png')
  for (const [id, texto] of Object.entries(cfg.rotulos)) await render(rotulo(texto), `rotulo-${id}.png`)
  await render(cta(cfg.cta), 'cta.png', false)
  await browser.close()
})()
