import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UpdatedBadge } from '@calculosonline/ui'
import {
  PORTARIAS_ANUAIS,
  diasUteisPorMes,
  formatarDataBR,
  listarFeriados,
  type Feriado,
} from '@calculosonline/core/tempo'
import { buildMetadata } from '@/lib/seo'
import {
  ANOS_FERIADOS,
  FERIADOS_DATA_ATUALIZACAO,
  FERIADOS_PATH,
  ehAnoPublicado,
  pathDoAno,
} from '@/lib/feriados'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CategoryIcon } from '@/components/common/CalculatorIcon'
import { PageSeo } from '@/components/seo/PageSeo'
import { HojeEFeriado } from '@/components/feriados/HojeEFeriado'

export function generateStaticParams() {
  return ANOS_FERIADOS.map((ano) => ({ ano: String(ano) }))
}

// Só os anos publicados. Qualquer outro ano é 404, não uma página gerada sob
// demanda com o mesmo template e nenhuma busca por trás.
export const dynamicParams = false

/** Dia e mês, sem o ano que o título da página já diz: "21/04". */
function diaMes(iso: string): string {
  return formatarDataBR(iso).slice(0, 5)
}

function lista(itens: string[]): string {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

/**
 * Feriado colado no fim de semana. Segunda ou sexta dá três dias seguidos sem
 * ponte nenhuma; terça ou quinta dá quatro com a ponte (o "enforcamento"),
 * que a empresa decide se concede.
 */
function prolongamento(f: Feriado): 'tres-dias' | 'ponte' | null {
  if (f.fimDeSemana) return null
  if (f.diaSemana === 'segunda-feira' || f.diaSemana === 'sexta-feira') return 'tres-dias'
  if (f.diaSemana === 'terça-feira' || f.diaSemana === 'quinta-feira') return 'ponte'
  return null
}

function montarConteudo(ano: number) {
  const nacionais = listarFeriados(ano)
  const comFacultativos = listarFeriados(ano, { incluirFacultativos: true })
  const facultativosCalculados = comFacultativos.filter((f) => f.tipo === 'facultativo')
  const emDiaUtil = nacionais.filter((f) => !f.fimDeSemana)
  const noFimDeSemana = nacionais.filter((f) => f.fimDeSemana)
  const tresDias = nacionais.filter((f) => prolongamento(f) === 'tres-dias')
  const pontes = nacionais.filter((f) => prolongamento(f) === 'ponte')
  const meses = diasUteisPorMes(ano, 'nacionais')
  const totalUteis = meses.reduce((t, m) => t + m.diasUteis, 0)
  const totalSemFeriado = diasUteisPorMes(ano, 'nenhum').reduce((t, m) => t + m.diasUteis, 0)
  const totalComFacultativos = diasUteisPorMes(ano, 'nacionais-facultativos').reduce(
    (t, m) => t + m.diasUteis,
    0,
  )
  const portaria = PORTARIAS_ANUAIS[ano]
  const paixao = nacionais.find((f) => f.movel)
  const carnaval = facultativosCalculados.filter((f) => f.nome.includes('Carnaval'))
  const corpus = facultativosCalculados.find((f) => f.nome === 'Corpus Christi')

  const faq = [
    {
      question: `Quantos feriados nacionais tem ${ano}?`,
      answer: `${ano} tem ${nacionais.length} feriados nacionais. ${emDiaUtil.length} caem em dia útil${
        noFimDeSemana.length > 0
          ? ` e ${noFimDeSemana.length} no fim de semana (${lista(noFimDeSemana.map((f) => `${f.nome}, ${diaMes(f.data)}`))})`
          : ''
      }.`,
    },
    {
      question: `Quantos dias úteis tem ${ano}?`,
      answer: `${ano} tem ${totalUteis} dias úteis descontando os feriados nacionais: são ${totalSemFeriado} dias de segunda a sexta, menos ${totalSemFeriado - totalUteis} feriados em dia útil. Quem também não trabalha no Carnaval e no Corpus Christi fica com ${totalComFacultativos}.`,
    },
    {
      question: `Carnaval é feriado em ${ano}?`,
      answer: `Não pela lei federal. O Carnaval${
        carnaval.length === 2
          ? ` (${diaMes(carnaval[0]!.data)} e ${diaMes(carnaval[1]!.data)})`
          : ''
      } é ponto facultativo: o governo federal dispensa os servidores e bancos costumam fechar, mas a empresa privada não é obrigada a dar folga. Alguns estados e cidades fazem dele feriado por lei local.`,
    },
    {
      question: `Quando é a Sexta-feira da Paixão em ${ano}?`,
      answer: paixao
        ? `Em ${formatarDataBR(paixao.data)}. A data muda todo ano porque é dois dias antes da Páscoa. A Lei 9.093/1995 a trata como feriado religioso, e a portaria do governo federal a lista entre os feriados nacionais.`
        : '',
    },
    {
      question: `Quais feriados de ${ano} emendam com o fim de semana?`,
      answer: `${
        tresDias.length > 0
          ? `Caem na segunda ou na sexta, e dão três dias seguidos: ${lista(tresDias.map((f) => `${f.nome} (${diaMes(f.data)})`))}.`
          : 'Nenhum cai na segunda ou na sexta.'
      } ${
        pontes.length > 0
          ? `Caem na terça ou na quinta, e viram quatro dias com a ponte: ${lista(pontes.map((f) => `${f.nome} (${diaMes(f.data)})`))}. A ponte depende da empresa.`
          : 'Nenhum cai na terça ou na quinta.'
      }`,
    },
  ].filter((item) => item.answer !== '')

  return {
    nacionais,
    facultativosCalculados,
    emDiaUtil,
    noFimDeSemana,
    tresDias,
    pontes,
    meses,
    totalUteis,
    totalSemFeriado,
    portaria,
    corpus,
    faq,
  }
}

function titulo(ano: number) {
  return `Feriados ${ano}: Calendário de Feriados Nacionais`
}

function descricao(ano: number) {
  const { nacionais, emDiaUtil, totalUteis } = montarConteudo(ano)
  return `Os ${nacionais.length} feriados nacionais de ${ano}, com dia da semana e a lei de cada um. ${emDiaUtil.length} caem em dia útil, e o ano tem ${totalUteis} dias úteis.`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ano: string }>
}): Promise<Metadata> {
  const ano = Number((await params).ano)
  if (!ehAnoPublicado(ano)) return {}
  return buildMetadata({
    title: titulo(ano),
    description: descricao(ano),
    keywords: [
      `feriados ${ano}`,
      `feriados nacionais ${ano}`,
      `calendário de feriados ${ano}`,
      `dias úteis ${ano}`,
    ],
    path: pathDoAno(ano),
  })
}

export default async function FeriadosDoAnoPage({ params }: { params: Promise<{ ano: string }> }) {
  const ano = Number((await params).ano)
  if (!ehAnoPublicado(ano)) notFound()

  const c = montarConteudo(ano)
  const outrosAnos = ANOS_FERIADOS.filter((a) => a !== ano)

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <PageSeo
        title={titulo(ano)}
        description={descricao(ano)}
        path={pathDoAno(ano)}
        breadcrumbs={[
          { name: 'Início', path: '/' },
          { name: 'Feriados', path: FERIADOS_PATH },
          { name: `Feriados ${ano}`, path: pathDoAno(ano) },
        ]}
        faqItems={c.faq}
      />
      <Breadcrumbs
        items={[
          { label: 'Início', href: '/' },
          { label: 'Feriados', href: FERIADOS_PATH },
          { label: String(ano) },
        ]}
      />

      <header>
        <div className="flex items-start gap-3 md:gap-4">
          <CategoryIcon categoria="tempo" size="xl" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
              Feriados nacionais {ano}
            </h1>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {ano} tem <strong>{c.nacionais.length} feriados nacionais</strong>:{' '}
              {c.emDiaUtil.length} caem em dia útil e {c.noFimDeSemana.length} no fim de semana.
              Descontados os feriados, são <strong>{c.totalUteis} dias úteis</strong> no ano.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <UpdatedBadge dataAtualizacao={FERIADOS_DATA_ATUALIZACAO} />
        </div>
      </header>

      <HojeEFeriado />

      <section aria-labelledby="lista-feriados">
        <h2 id="lista-feriados" className="text-lg font-bold text-gray-900">
          Lista dos feriados nacionais de {ano}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm" data-testid="tabela-feriados">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 pr-3 font-medium">Dia da semana</th>
                <th className="py-2 pr-3 font-medium">Feriado</th>
                <th className="py-2 font-medium">Lei</th>
              </tr>
            </thead>
            <tbody>
              {c.nacionais.map((f) => (
                <tr key={f.data} className="border-b border-gray-100">
                  <td className="py-2 pr-3 font-mono">{formatarDataBR(f.data)}</td>
                  <td className={`py-2 pr-3 ${f.fimDeSemana ? 'text-gray-400' : ''}`}>
                    {f.diaSemana}
                  </td>
                  <td className="py-2 pr-3 font-medium text-gray-900">{f.nome}</td>
                  <td className="py-2">
                    <a
                      href={f.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 underline"
                    >
                      {f.fundamento.replace(/ \(.*\)$/, '')}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Em cinza, os que caem no sábado ou no domingo e por isso não tiram nenhum dia útil.
        </p>
      </section>

      <section aria-labelledby="prolongados" className="prose prose-gray max-w-none">
        <h2 id="prolongados">Feriados prolongados em {ano}</h2>
        {c.tresDias.length > 0 && (
          <p>
            <strong>Três dias seguidos</strong>, sem ponte:{' '}
            {lista(c.tresDias.map((f) => `${f.nome} (${f.diaSemana}, ${diaMes(f.data)})`))}.
          </p>
        )}
        {c.pontes.length > 0 && (
          <p>
            <strong>Quatro dias com a ponte</strong>, se a empresa liberar o dia entre o feriado e o
            fim de semana:{' '}
            {lista(c.pontes.map((f) => `${f.nome} (${f.diaSemana}, ${diaMes(f.data)})`))}. A ponte
            não é direito do trabalhador; quando concedida, costuma ser compensada.
          </p>
        )}
      </section>

      <section aria-labelledby="facultativos" className="prose prose-gray max-w-none">
        <h2 id="facultativos">Pontos facultativos: Carnaval e Corpus Christi não são feriado</h2>
        <p>
          Ponto facultativo é dia em que o governo federal dispensa os próprios servidores. Ele não
          está em lei federal de feriados, então{' '}
          <strong>a empresa privada não é obrigada a dar folga</strong>, embora bancos e muitas
          empresas sigam. Alguns estados e cidades transformam o Carnaval em feriado por lei local.
        </p>
        {c.portaria ? (
          <>
            <p>
              Os pontos facultativos de {ano} estão na{' '}
              <a href={c.portaria.url} target="_blank" rel="noopener noreferrer">
                {c.portaria.titulo}
              </a>{' '}
              ({c.portaria.publicacao}):
            </p>
            <ul>
              {c.portaria.facultativos.map((f) => (
                <li key={`${f.data}-${f.nome}`}>
                  <strong>{formatarDataBR(f.data)}</strong> — {f.nome}
                  {f.observacao ? ` (${f.observacao})` : ''}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p>
              A portaria com os pontos facultativos de {ano} sai no fim de dezembro de {ano - 1}.
              Até lá, as datas que dependem da Páscoa já são conhecidas:
            </p>
            <ul>
              {c.facultativosCalculados.map((f) => (
                <li key={f.data}>
                  <strong>{formatarDataBR(f.data)}</strong> ({f.diaSemana}) — {f.nome}
                </li>
              ))}
            </ul>
            <p>
              As demais (Quarta-feira de Cinzas, vésperas de Natal e Ano-Novo, pontes) são decididas
              na portaria e serão acrescentadas aqui quando ela sair.
            </p>
          </>
        )}
      </section>

      <section aria-labelledby="dias-uteis">
        <h2 id="dias-uteis" className="text-lg font-bold text-gray-900">
          Dias úteis por mês em {ano}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Segunda a sexta, menos os feriados nacionais. Sem descontar feriado nenhum, o ano teria{' '}
          {c.totalSemFeriado}.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm" data-testid="tabela-dias-uteis">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-medium">Mês</th>
                <th className="py-2 pr-3 font-medium">Dias úteis</th>
                <th className="py-2 font-medium">Feriados descontados</th>
              </tr>
            </thead>
            <tbody>
              {c.meses.map((m) => (
                <tr key={m.mes} className="border-b border-gray-100">
                  <td className="py-2 pr-3 capitalize">{m.nomeMes}</td>
                  <td className="py-2 pr-3 font-mono">{m.diasUteis}</td>
                  <td className="py-2 text-gray-600">
                    {m.feriados.length > 0
                      ? m.feriados.map((f) => `${f.nome} (${diaMes(f.data)})`).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-3">Total</td>
                <td className="py-2 pr-3 font-mono">{c.totalUteis}</td>
                <td className="py-2" />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-700">
          Para contar um prazo em dias úteis com esses feriados, use a{' '}
          <Link href="/calculadora/datas" className="text-brand-700 underline">
            calculadora de datas
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="o-que-nao-entra" className="prose prose-gray max-w-none">
        <h2 id="o-que-nao-entra">O que esta lista não inclui</h2>
        <p>
          <strong>Feriados estaduais e municipais.</strong> Pela Lei 9.093/1995, cada estado pode
          ter a sua data magna, fixada em lei estadual (como o 9 de julho em São Paulo), e cada
          cidade pode ter até quatro feriados religiosos, contando a Sexta-feira da Paixão. São
          centenas de listas; confira a da sua cidade antes de contar um prazo.
        </p>
      </section>

      <section aria-labelledby="perguntas" className="prose prose-gray max-w-none">
        <h2 id="perguntas">Perguntas frequentes</h2>
        {c.faq.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="fontes" className="prose prose-gray max-w-none">
        <h2 id="fontes">Fontes</h2>
        <ul>
          {[...new Map(c.nacionais.map((f) => [f.fonteUrl, f.fundamento])).entries()].map(
            ([url, fundamento]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {fundamento}
                </a>
              </li>
            ),
          )}
          {c.portaria && (
            <li>
              <a href={c.portaria.url} target="_blank" rel="noopener noreferrer">
                {c.portaria.titulo}
              </a>{' '}
              — {c.portaria.publicacao}
            </li>
          )}
        </ul>
        <p>
          Datas móveis calculadas a partir da Páscoa (calendário gregoriano). Fontes conferidas no
          texto oficial do Planalto e do Diário Oficial da União.
        </p>
      </section>

      <nav aria-label="Outros anos" className="border-t border-gray-100 pt-6 text-sm">
        Veja também:{' '}
        {outrosAnos.map((a, i) => (
          <span key={a}>
            {i > 0 && ' · '}
            <Link href={pathDoAno(a)} className="text-brand-700 underline">
              Feriados {a}
            </Link>
          </span>
        ))}
        {' · '}
        <Link href={FERIADOS_PATH} className="text-brand-700 underline">
          Próximo feriado
        </Link>
      </nav>
    </div>
  )
}
