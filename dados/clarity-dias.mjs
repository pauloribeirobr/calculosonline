#!/usr/bin/env node
// F89 — traz do servidor os dias do Clarity (coleta diária, dados/clarity-coletar.sh) e resume: o dia a dia contra o GA4
// (cobertura), os sinais de atrito (clique morto, de raiva, volta rápida, erro de script), aparelho, canal e página.
// Não gasta nenhuma das 10 chamadas do dia da API do Clarity: lê o que o cron já guardou. Porte do
// ../recibofacil/dados/clarity-dias.mjs (F289).
//
// Uso:  node dados/clarity-dias.mjs [--de AAAA-MM-DD] [--ate AAAA-MM-DD] [--sem-trazer] [--sem-ga4] [--amostra 10]
//   padrão: todos os dias coletados · --sem-trazer: não roda o rsync · --sem-ga4: sem a coluna de cobertura
//   --amostra: sessões mínimas de uma página × aparelho para entrar na tabela por página (padrão 10: o site é pequeno)
// Saída: as tabelas no terminal e em dados/saida/clarity/resumo-<de>_<ate>.md, e os CSVs ao lado.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { argumentos, exigir, falhar, pastaSaida } from './lib/config.mjs'
import { diasDisponiveis, resumo, rolagem, SERVIDOR, PASTA_REMOTA, SINAIS, taxa, totais, trazer } from './lib/clarity.mjs'
import { google } from './lib/google.mjs'
import { br, csv, markdown } from './lib/tabela.mjs'

const args = argumentos()
if (!args['sem-trazer']) {
  try {
    trazer()
  } catch {
    console.error(`⚠️ rsync falhou (${SERVIDOR}:${PASTA_REMOTA}): sigo com os dias que já estão em dados/saida/clarity/dias/.`)
  }
}
const disp = diasDisponiveis()
if (!disp.length)
  falhar(`Nenhum dia do Clarity em dados/saida/clarity/dias/. A coleta do servidor foi instalada? (dados/README.md; ssh ${SERVIDOR} tail ~/dados/clarity-calculosonline.log)`)
const de = args.de && args.de !== true ? args.de : disp[0]
const ate = args.ate && args.ate !== true ? args.ate : disp.at(-1)
const minAmostra = Number(args.amostra || 10)
const r = resumo(de, ate)
if (!r.dias.length) falhar(`Nenhum dia coletado entre ${de} e ${ate}. Disponíveis: ${disp[0]} → ${disp.at(-1)}.`)

/** Sessões e usuários do GA4 por dia, para ver quanto do tráfego o Clarity enxerga. */
async function ga4PorDia() {
  const j = await google(`https://analyticsdata.googleapis.com/v1beta/properties/${exigir('GA4_PROPRIEDADE')}:runReport`, {
    body: { dateRanges: [{ startDate: de, endDate: ate }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }], limit: 400 },
  })
  return new Map(
    (j.rows || []).map((l) => {
      const d = l.dimensionValues[0].value
      return [`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`, l.metricValues.map((m) => Number(m.value))]
    }),
  )
}
const ga = args['sem-ga4'] ? new Map() : await ga4PorDia()

const n1 = (v) => (v === null || v === undefined ? '—' : br(v, 1))
const semana = (d) => ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][new Date(`${d}T12:00:00Z`).getUTCDay()]
const md = []
const add = (...l) => md.push(...l)

add(
  `# Clarity — ${de} → ${ate}`,
  '',
  `Coleta diária no servidor (\`dados/clarity-coletar.sh\`, 00:10 de Brasília); ${r.dias.length} dia(s)${r.faltando.length ? `, **faltando ${r.faltando.join(', ')}**` : ''}. Gerado por \`node dados/clarity-dias.mjs --de ${de} --ate ${ate}\` (F89).`,
  '',
)

add('## Dia a dia (o site inteiro)', '')
const cabDia = ['Dia', 'Sessões Clarity', 'Bots', 'Sessões GA4', 'Cobertura %', 'Usuários Clarity', 'Usuários GA4', 'Págs/sessão', 'Rolagem %', 'Tempo ativo (s)', ...SINAIS.slice(0, 5).map(([, n]) => `${n} %`)]
const linhasDia = r.dias.map((x) => {
  const [gs, gu] = ga.get(x.dia) || []
  return [`${x.dia} (${semana(x.dia)})`, x.sessoes, x.bots, gs ?? '—', gs ? n1((100 * x.sessoes) / gs) : '—', x.usuarios, gu ?? '—', n1(x.paginasPorSessao), n1(x.rolagem), x.tempoAtivo ?? '—', ...SINAIS.slice(0, 5).map(([m]) => n1(x.sinal[m]))]
})
const t = totais(r)
const gsT = r.dias.reduce((a, x) => a + (ga.get(x.dia)?.[0] || 0), 0)
linhasDia.push(['**Período**', t.sessoes, t.bots, gsT || '—', gsT ? n1((100 * t.sessoes) / gsT) : '—', '', '', '', n1(t.rolagem), n1(t.tempoAtivo), ...SINAIS.slice(0, 5).map(([m]) => n1(t.sinal[m]))])
add(
  markdown(cabDia, linhasDia),
  '',
  '_Cobertura = sessões do Clarity ÷ sessões do GA4. Os dois contam sessão de jeitos diferentes: o que importa é ela ficar estável. Sinais em % das sessões; o período pondera pelas sessões de cada dia._',
  '',
)

add('## Aparelho', '')
const linhasAp = [...r.aparelhos].map(([k, o]) => [k, o.sessoes, n1(rolagem(o)), ...SINAIS.slice(0, 5).map(([m]) => n1(taxa(o, m)))]).sort((a, b) => b[1] - a[1])
add(markdown(['Aparelho', 'Sessões', 'Rolagem %', ...SINAIS.slice(0, 5).map(([, n]) => `${n} %`)], linhasAp), '')

add('## Canal (como o Clarity classifica)', '')
add(
  markdown(['Canal', 'Sessões', 'Clique morto %', 'Volta rápida %'], [...r.canais].map(([k, o]) => [k, o.sessoes, n1(taxa(o, 'DeadClickCount')), n1(taxa(o, 'QuickbackClick'))]).sort((a, b) => b[1] - a[1])),
  '',
  '_Uma sessão pode contar em mais de uma origem: a soma passa do total. "Other" com origem vazia é o acesso direto._',
  '',
)

add('## Páginas mais vistas (as 10 de cada dia, somadas)', '')
add(markdown(['Página', 'Visitas'], [...r.visitas].sort((a, b) => b[1] - a[1]).slice(0, 15)), '')

add(`## Atrito por página × aparelho (amostra ≥ ${minAmostra} sessões)`, '')
if (r.cortados.length) add(`⚠️ **A URL bateu no teto de 1.000 linhas da API em ${r.cortados.join(', ')}**: ficam as linhas com mais sessões.`, '')
const linhasPg = [...r.paginas]
  .map(([k, o]) => {
    const [pg, ap] = k.split('\u0000')
    return [pg, ap, o.base, n1(taxa(o, 'DeadClickCount')), n1(taxa(o, 'QuickbackClick')), n1(taxa(o, 'RageClickCount')), n1(taxa(o, 'ScriptErrorCount')), n1(rolagem(o))]
  })
  .filter((l) => l[2] >= minAmostra)
  .sort((a, b) => b[2] - a[2])
add(markdown(['Página', 'Aparelho', 'Amostra (sessões)', 'Clique morto %', 'Volta rápida %', 'Clique de raiva %', 'Erro de script %', 'Rolagem %'], linhasPg.slice(0, 30)), '')

const pasta = pastaSaida('clarity')
const base = `${de}_${ate}`
writeFileSync(join(pasta, `resumo-${base}.md`), md.join('\n') + '\n')
csv(join(pasta, `dias-${base}.csv`), cabDia, linhasDia)
csv(join(pasta, `paginas-${base}.csv`), ['pagina', 'aparelho', 'amostra', 'clique_morto_pct', 'volta_rapida_pct', 'raiva_pct', 'erro_script_pct', 'rolagem_pct'], linhasPg)
console.log(md.join('\n'))
console.log(`\n✓ ${join(pasta, `resumo-${base}.md`)}`)
