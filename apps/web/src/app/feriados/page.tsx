import type { Metadata } from 'next'
import Link from 'next/link'
import { UpdatedBadge } from '@calculosonline/ui'
import { listarFeriados, diasUteisPorMes } from '@calculosonline/core/tempo'
import { buildMetadata } from '@/lib/seo'
import { ANOS_FERIADOS, FERIADOS_DATA_ATUALIZACAO, FERIADOS_PATH, pathDoAno } from '@/lib/feriados'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CategoryIcon } from '@/components/common/CalculatorIcon'
import { PageSeo } from '@/components/seo/PageSeo'
import { ItemListJsonLd } from '@/components/seo/JsonLd'
import { HojeEFeriado } from '@/components/feriados/HojeEFeriado'

/**
 * Entrada de `feriados` (74K/KD 25) e `hoje é feriado` (110K/KD 29). Não
 * repete a lista de um ano — isso é a página do ano, e duas páginas com a
 * mesma tabela dividiriam o sinal. Aqui a resposta é a do dia, calculada no
 * navegador, e a escolha do ano.
 */

const TITULO = 'Feriados Nacionais 2026 e 2027 — Hoje é Feriado?'
const DESCRICAO =
  'Veja se hoje é feriado e quando é o próximo feriado nacional. Calendário completo de 2026 e 2027, com a lei de cada data e os dias úteis do ano.'

export const metadata: Metadata = buildMetadata({
  title: TITULO,
  description: DESCRICAO,
  keywords: ['feriados', 'hoje é feriado', 'próximo feriado', 'feriados nacionais'],
  path: FERIADOS_PATH,
})

export default function FeriadosPage() {
  const anos = ANOS_FERIADOS.map((ano) => ({
    ano,
    feriados: listarFeriados(ano).length,
    emDiaUtil: listarFeriados(ano).filter((f) => !f.fimDeSemana).length,
    diasUteis: diasUteisPorMes(ano, 'nacionais').reduce((t, m) => t + m.diasUteis, 0),
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <PageSeo
        title={TITULO}
        description={DESCRICAO}
        path={FERIADOS_PATH}
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Feriados', path: FERIADOS_PATH },
        ]}
      />
      <ItemListJsonLd
        items={anos.map((a) => ({
          name: `Feriados nacionais ${a.ano}`,
          path: pathDoAno(a.ano),
        }))}
      />
      <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Feriados' }]} />

      <header>
        <div className="flex items-start gap-3 md:gap-4">
          <CategoryIcon categoria="tempo" size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
              Feriados nacionais
            </h1>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              Se hoje é feriado, quando é o próximo e o calendário completo de cada ano, com a lei
              que cria cada data.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <UpdatedBadge dataAtualizacao={FERIADOS_DATA_ATUALIZACAO} />
        </div>
      </header>

      <HojeEFeriado />

      <section aria-labelledby="por-ano">
        <h2 id="por-ano" className="text-lg font-bold text-gray-900">
          Calendário por ano
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {anos.map((a) => (
            <li key={a.ano}>
              <Link
                href={pathDoAno(a.ano)}
                className="hover:border-brand-300 block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm"
              >
                <span className="block font-semibold text-gray-900">Feriados {a.ano}</span>
                <span className="mt-1 block text-sm text-gray-600">
                  {a.feriados} feriados nacionais, {a.emDiaUtil} em dia útil · {a.diasUteis} dias
                  úteis no ano
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prose prose-gray max-w-none">
        <h2>Feriado nacional, ponto facultativo e feriado local</h2>
        <p>
          <strong>Feriado nacional</strong> é o que está em lei federal e vale no país inteiro. São
          10 por ano desde 2024, quando o 20 de novembro (Dia Nacional de Zumbi e da Consciência
          Negra) passou a ser feriado nacional.
        </p>
        <p>
          <strong>Ponto facultativo</strong>, como o Carnaval e o Corpus Christi, é a dispensa dos
          servidores federais definida todo ano em portaria. A empresa privada não é obrigada a
          seguir.
        </p>
        <p>
          <strong>Feriados estaduais e municipais</strong> não estão nesta página. Cada estado e
          cada cidade tem a sua lista.
        </p>
        <p>
          Precisa contar um prazo em dias úteis? A{' '}
          <Link href="/calculadora/datas">calculadora de datas</Link> já desconta os feriados
          nacionais.
        </p>
      </section>
    </div>
  )
}
