// Identidade do canal do YouTube (F91): logo horizontal, foto de perfil, marca d'água, banner,
// abertura de 1 s e tela final; e a foto do Instagram/Facebook. Saída em docs/roteiros/identidade/.
// Porte do ../recibofacil/frontend/scripts/gen-identidade-video.mjs (F101). Não precisa de dev
// server: o Chromium do Playwright desenha cada quadro (CSS com as animações pausadas e posicionadas
// no tempo) e o ffmpeg monta o vídeo. Uso: `pnpm --filter web gen:identidade-video` (ffmpeg no PATH).
import { chromium } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(WEB, '..', '..', 'docs', 'roteiros', 'identidade')
const FPS = 30
const NOME = 'Calculos Online' // como no cabeçalho do site (siteConfig.name)

const inter = readFileSync(join(WEB, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')).toString('base64')

// Mesmo desenho de public/images/logo.svg (claro, #2563EB) e logo-dark.svg (escuro, #3B82F6), com o
// selo verde do "+" separado num <g> para poder animar sozinho.
const icone = (azul) => `
<svg class="icone" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="${azul}"/>
  <g transform="translate(20 20) scale(1.06) translate(-20 -20)">
    <rect x="10" y="7" width="20" height="26" rx="3" fill="white"/>
    <rect x="13.5" y="10.5" width="13" height="5" rx="1.2" fill="#DBEAFE" stroke="${azul}" stroke-width="1.4"/>
    <circle cx="15" cy="20" r="1.45" fill="${azul}"/>
    <circle cx="20" cy="20" r="1.45" fill="${azul}"/>
    <circle cx="25" cy="20" r="1.45" fill="${azul}"/>
    <circle cx="15" cy="25" r="1.45" fill="${azul}"/>
    <circle cx="20" cy="25" r="1.45" fill="${azul}"/>
    <rect x="23.4" y="23.6" width="3.2" height="7.2" rx="1.3" fill="${azul}"/>
    <g class="check">
      <circle cx="28" cy="28" r="7" fill="#10B981"/>
      <path d="M24 28h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 24v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>
</svg>`

const FUNDO = 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 52%, #ECFDF5 100%)'

const pagina = ({ largura, altura, fundo, corpo, css = '' }) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Inter; src: url(data:font/woff2;base64,${inter}) format('woff2'); font-weight: 100 900; }
html, body { margin: 0; width: ${largura}px; height: ${altura}px; overflow: hidden; }
body { background: ${fundo}; font-family: Inter, sans-serif; }
.marca { display: flex; align-items: center; }
.nome { font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.check { transform-box: fill-box; transform-origin: center; }
${css}
</style></head><body>${corpo}</body></html>`

const marca = (azul, corTexto, tamIcone) => `
<div class="marca">${icone(azul).replace('class="icone"', `class="icone" width="${tamIcone}" height="${tamIcone}"`)}
  <span class="nome" style="color:${corTexto}; font-size:${Math.round(tamIcone * 0.62)}px; margin-left:${Math.round(tamIcone * 0.3)}px">${NOME}</span>
</div>`

// Ícone em quadrado cheio, para foto de perfil (o YouTube e o Instagram cortam em círculo).
const iconeQuadrado = (lado) =>
  icone('#2563EB')
    .replace('class="icone"', `class="icone" width="${lado}" height="${lado}"`)
    .replace('<circle cx="20" cy="20" r="20" fill="#2563EB"/>', '<rect width="40" height="40" fill="#2563EB"/>')
    .replace('translate(20 20) scale(1.06) translate(-20 -20)', 'translate(20 20) scale(0.8) translate(-21.5 -21)')

const ANIM_ABERTURA = `
.icone { animation: entra-icone 380ms cubic-bezier(.34,1.56,.64,1) both; }
.check { animation: entra-check 300ms cubic-bezier(.34,1.56,.64,1) 260ms both; }
.nome { animation: entra-nome 340ms cubic-bezier(.22,1,.36,1) 240ms both; }
@keyframes entra-icone { from { transform: scale(.4); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes entra-check { from { transform: scale(0) rotate(-90deg) } to { transform: scale(1) rotate(0) } }
@keyframes entra-nome { from { transform: translateX(-24px); opacity: 0; clip-path: inset(0 100% 0 0) } to { transform: none; opacity: 1; clip-path: inset(0 0 0 0) } }
`

async function quadros(page, html, segundos, dir, transparente) {
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()))
  const total = Math.round(segundos * FPS)
  for (let i = 0; i < total; i++) {
    const ms = (i * 1000) / FPS
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.currentTime = t }), ms)
    await page.screenshot({ path: join(dir, `q${String(i).padStart(4, '0')}.png`), omitBackground: transparente })
  }
}

const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' })

async function estatica(browser, arquivo, largura, altura, html, transparente = false) {
  const page = await browser.newPage({ viewport: { width: largura, height: altura } })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(OUT, arquivo), omitBackground: transparente })
  await page.close()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const tmp = mkdtempSync(join(tmpdir(), 'co-identidade-'))
  const browser = await chromium.launch()
  try {
    // 1. Logo horizontal (PNG transparente, 2×): claro para fundo branco, escuro para thumbnail escura.
    for (const [nome, azul, texto] of [['logo-horizontal-claro', '#2563EB', '#111827'], ['logo-horizontal-escuro', '#3B82F6', '#FFFFFF']]) {
      const page = await browser.newPage({ viewport: { width: 1400, height: 220 }, deviceScaleFactor: 2 })
      await page.setContent(pagina({ largura: 1400, altura: 220, fundo: 'transparent', corpo: `<div id="m" style="display:inline-block;padding:20px">${marca(azul, texto, 160)}</div>` }))
      await page.evaluate(() => document.fonts.ready)
      await page.locator('#m').screenshot({ path: join(OUT, `${nome}.png`), omitBackground: true })
      await page.close()
    }

    // 2. Fotos de perfil: YouTube 800×800 e Instagram/Facebook 1080×1080, quadrado azul inteiro com o
    //    ícone a ~80%: o corte em círculo não come nada.
    await estatica(browser, 'foto-perfil-800.png', 800, 800, pagina({ largura: 800, altura: 800, fundo: '#2563EB', corpo: iconeQuadrado(800) }))
    await estatica(browser, 'foto-perfil-1080.png', 1080, 1080, pagina({ largura: 1080, altura: 1080, fundo: '#2563EB', corpo: iconeQuadrado(1080) }))

    // 3. Marca d'água do YouTube: 150×150, PNG transparente.
    await estatica(browser, 'marca-dagua-150.png', 150, 150,
      pagina({ largura: 150, altura: 150, fundo: 'transparent', corpo: icone('#2563EB').replace('class="icone"', 'class="icone" width="150" height="150"') }), true)

    // 4. Banner do YouTube: 2560×1440. Tudo o que importa fica na área segura de 1546×423 do centro,
    //    a única que aparece em todos os aparelhos; o resto é fundo.
    await estatica(browser, 'banner-2560x1440.png', 2560, 1440, pagina({
      largura: 2560, altura: 1440, fundo: FUNDO,
      css: `.seg { position:absolute; left:507px; top:508px; width:1546px; height:423px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px; }
            .frase { font-size:52px; font-weight:600; color:#1E293B; letter-spacing:-0.01em; }
            .temas { font-size:36px; font-weight:500; color:#475569; }`,
      corpo: `<div class="seg">${marca('#2563EB', '#111827', 130)}<div class="frase">A conta feita na tela, com o passo a passo.</div><div class="temas">Investimentos · Trabalhistas · Impostos</div></div>`,
    }))

    const video = { viewport: { width: 1920, height: 1080 } }
    const centro = (fundo) => pagina({
      largura: 1920, altura: 1080, fundo, css: ANIM_ABERTURA + 'body { display:flex; align-items:center; justify-content:center; }',
      corpo: marca('#2563EB', '#111827', 180),
    })

    // 5. Abertura de 1 s em tela cheia (entra depois do gancho, nunca antes).
    {
      const dir = join(tmp, 'abertura'); mkdirSync(dir)
      const page = await browser.newPage(video)
      await quadros(page, centro(FUNDO), 1, dir, false)
      await page.close()
      ffmpeg(['-framerate', String(FPS), '-i', join(dir, 'q%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-movflags', '+faststart', join(OUT, 'abertura-1s.mp4')])
    }

    // 5b. A mesma abertura sem fundo (WebM com alfa), para pôr por cima da gravação de tela.
    {
      const dir = join(tmp, 'sobreposicao'); mkdirSync(dir)
      const page = await browser.newPage(video)
      await quadros(page, centro('transparent'), 1, dir, true)
      await page.close()
      ffmpeg(['-framerate', String(FPS), '-i', join(dir, 'q%04d.png'), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '20', join(OUT, 'abertura-1s-sobreposicao.webm')])
    }

    // 6. Tela final de 10 s: marca e endereço à esquerda; o lado direito fica livre para os elementos
    //    da tela final do YouTube (vídeo seguinte + inscrever-se), postos no Studio.
    {
      const dir = join(tmp, 'final'); mkdirSync(dir)
      const page = await browser.newPage(video)
      const html = pagina({
        largura: 1920, altura: 1080, fundo: FUNDO,
        css: `
          .esq { position:absolute; left:140px; top:0; bottom:0; width:820px; display:flex; flex-direction:column; justify-content:center; gap:36px; animation: sobe 600ms cubic-bezier(.22,1,.36,1) both; }
          .url { font-size:52px; font-weight:600; color:#2563EB; letter-spacing:-0.01em; }
          .frase { font-size:36px; font-weight:500; color:#475569; }
          @keyframes sobe { from { opacity:0; transform: translateY(24px) } to { opacity:1; transform:none } }`,
        corpo: `<div class="esq">${marca('#2563EB', '#111827', 120)}<div class="url">calculosonline.com.br</div><div class="frase">A conta pronta, com o passo a passo,<br>direto no navegador.</div></div>`,
      })
      await quadros(page, html, 0.8, dir, false)
      await page.close()
      ffmpeg(['-framerate', String(FPS), '-i', join(dir, 'q%04d.png'), '-vf', 'tpad=stop_mode=clone:stop_duration=9.2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-movflags', '+faststart', join(OUT, 'tela-final-10s.mp4')])
    }
  } finally {
    await browser.close()
    rmSync(tmp, { recursive: true, force: true })
  }
  console.log(`ok → ${OUT}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
