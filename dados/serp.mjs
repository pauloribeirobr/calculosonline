#!/usr/bin/env node
// F89 — a rodada de concorrência: o top 10 do Google Brasil de cada palavra de dados/leituras/palavras-chave.json, pelo
// Serper. Porte do ../recibofacil/dados/serp.mjs (F290).
//
// Uso:  node dados/serp.mjs [--max 120] [--forcar] [--so "palavra 1,palavra 2"] [--dia AAAA-MM-DD]
//   --max: no máximo N palavras (as fixas primeiro, depois as de mais impressões) · --forcar: passa do teto por rodada
//   --so: só essas palavras (fora da lista também) · --dia: o dia da rodada (padrão: hoje); no mesmo dia, nada é pedido de novo
// Gasta 1 crédito por palavra (saldo antes e depois no fim; o saldo é dividido com o Recibo Fácil). Saída: o relatório no
// terminal e em dados/saida/serp/<dia>/resumo.md, os JSONs de cada busca ao lado, e o resumo compacto versionado em
// docs/concorrentes/serp/<dia>.json.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { argumentos, falhar, hojeBrasilia, pastaSaida } from './lib/config.mjs'
import { guardarSerie, palavrasDaLista, relatorio, rodada, rodadaAnterior, saldo, TETO } from './lib/serp.mjs'

const args = argumentos()
const dia = args.dia && args.dia !== true ? args.dia : hojeBrasilia()
const avulsa = args.so && args.so !== true
let palavras
try {
  palavras = avulsa
    ? String(args.so)
        .split(',')
        .map((p) => ({ palavra: p.trim(), pagina: '(avulsa)', impressoes: 0, posicao: null, motivo: 'avulsa' }))
    : palavrasDaLista()
} catch (e) {
  falhar(e.message)
}

const antes = await saldo()
const max = Number(args.max && args.max !== true ? args.max : TETO)
console.log(`Rodada ${dia}: ${Math.min(palavras.length, max)} palavras · saldo do Serper ${antes}`)
if (Math.min(palavras.length, max) > antes) falhar(`O saldo (${antes}) não cobre a rodada.`)
let r
try {
  r = await rodada(palavras, {
    dia,
    max,
    forcar: !!args.forcar,
    aoAvancar: (n, t) => {
      if (n % 10 === 0 || n === t) process.stdout.write(`  ${n}/${t}\n`)
    },
  })
} catch (e) {
  falhar(e.message)
}
const depois = await saldo()

const md = [
  `# Concorrência por palavra-chave — ${dia}`,
  '',
  `Gerado por \`node dados/serp.mjs\` (F89). ${r.gastas} consultas gastas nesta execução (pelas respostas); saldo do Serper ${antes} antes e ${depois} logo depois (o saldo da API atualiza com atraso).`,
  '',
]
const ant = avulsa ? null : rodadaAnterior(dia)
md.push(...relatorio(r, ant, { concorrentes: 30, palavras: 120, cabecalho: '##' }))
md.push('## Top 10 de cada palavra', '')
for (const x of r.itens)
  md.push(`- **${x.palavra}** (${x.impressoes || '—'} impr., site ${x.site ?? 'fora'}${x.recursos.length ? `; ${x.recursos.join(', ')}` : ''}): ${x.top.map((o) => `${o.pos}. ${o.dominio}`).join(' · ')}`)
const arq = join(pastaSaida('serp', dia), 'resumo.md')
writeFileSync(arq, md.join('\n') + '\n')
console.log('\n' + md.join('\n'))
if (!avulsa) console.log(`\n✓ ${guardarSerie(r)}`)
console.log(`✓ ${arq}`)
