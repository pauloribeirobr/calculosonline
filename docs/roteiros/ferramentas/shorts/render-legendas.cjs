// Legenda da fala dos Shorts (1080×1920, PNG transparente), em Inter como as outras sobreposições.
// Uso: node render-legendas.cjs <legendas.json> <pasta-saida>
// legendas.json: [{ "png": "leg-01.png", "texto": "Quem declara: nome," }, ...]
// Posição: no alto, logo abaixo da pílula do passo (topo em y = 250), largura até 900 px centrada.
// Ali só ficam a barra de progresso e o título da página; abaixo do meio (como na prévia de 24/10) a
// tarja cobria o campo sendo preenchido e, no Gerar, o botão "Baixar grátis" que a voz cita (conferido
// nos quadros em 06/11). A interface do YouTube ocupa o rodapé e a coluna da direita a partir do meio.
// Estilo da prévia de 24/10 (texto branco, tarja por linha), linhas equilibradas.
const { chromium } = require('/home/paulo/projects/next/calculosonline/apps/web/node_modules/@playwright/test')
const fs = require('fs')
const path = require('path')

const FRONT = '/home/paulo/projects/next/calculosonline/apps/web'
const inter = fs.readFileSync(path.join(FRONT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64')
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const html = (texto) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: transparent; font-family: Inter, sans-serif; }
.caixa { position: absolute; left: 90px; right: 90px; top: 250px; text-align: center; text-wrap: balance; }
.caixa span { background: rgba(0,0,0,.86); color: #fff; font-weight: 800; font-size: 58px; line-height: 1.42;
              padding: 6px 22px; border-radius: 12px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
</style></head><body><div class="caixa"><span>${esc(texto)}</span></div></body></html>`

;(async () => {
  const [arq, saida] = process.argv.slice(2)
  const itens = JSON.parse(fs.readFileSync(arq, 'utf-8'))
  fs.mkdirSync(saida, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
  for (const it of itens) {
    await page.setContent(html(it.texto)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(60)
    await page.screenshot({ path: path.join(saida, it.png), omitBackground: true })
  }
  await browser.close()
  console.log(`${itens.length} legendas em ${saida}`)
})()
