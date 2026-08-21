#!/usr/bin/env node
/**
 * Notifica o IndexNow (Bing, Yandex, Seznam, Naver) das URLs do site.
 *
 * O Bing responde por ~95% do tráfego real do calculosonline, e o IndexNow é
 * o único canal que o avisa em minutos em vez de semanas — por isso este
 * script vale mais, neste projeto, que qualquer ação no Search Console.
 *
 * O segredo sai de `apps/web/.env.local` (carregado pelo `--env-file-if-exists`
 * no script do package.json, e fora do git) ou da variável de ambiente.
 *
 * Uso:
 *   pnpm --filter web indexnow              # todas as URLs do sitemap
 *   pnpm --filter web indexnow ferias inss  # só essas calculadoras
 *
 * Sem argumentos, envia a home, as institucionais e as 20 calculadoras.
 */

const SITE = process.env.SITE_URL ?? 'https://calculosonline.com.br'
const SEGREDO = process.env.INTERNAL_API_KEY

if (!SEGREDO) {
  console.error(
    [
      'INTERNAL_API_KEY não encontrada.',
      '',
      'Pegue o valor em Vercel > Settings > Environment Variables (Production)',
      'e guarde em apps/web/.env.local (fora do git) para não repetir:',
      '',
      '  echo "INTERNAL_API_KEY=<valor>" >> apps/web/.env.local',
      '',
      'Ou passe direto:  INTERNAL_API_KEY=<valor> pnpm --filter web indexnow',
    ].join('\n'),
  )
  process.exit(1)
}

const slugs = process.argv.slice(2)

// Lido do sitemap em produção para não duplicar aqui a lista de rotas — o
// sitemap já é a fonte canônica de "o que existe e deve ser indexado".
const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`sitemap.xml respondeu ${r.status}`)
  return r.text()
})

let urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (slugs.length > 0) {
  urls = urls.filter((u) => slugs.some((s) => u.endsWith(`/calculadora/${s}`)))
  if (urls.length === 0) {
    console.error(`Nenhuma URL casou com: ${slugs.join(', ')}`)
    process.exit(1)
  }
}

console.log(`Enviando ${urls.length} URLs para o IndexNow...`)

const resposta = await fetch(`${SITE}/api/indexnow`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': SEGREDO },
  body: JSON.stringify({ urls }),
})

const corpo = await resposta.json().catch(() => ({}))

if (!resposta.ok) {
  console.error(`Falhou (${resposta.status}):`, corpo)
  process.exit(1)
}

// A API do IndexNow devolve 200 ou 202 quando aceita; o corpo repassa o
// status dela para diferenciar "aceito" de "recebido e na fila".
console.log(`OK — IndexNow respondeu ${corpo.status}. URLs enviadas:`)
for (const u of urls) console.log(`  ${u}`)
