import Link from 'next/link'
import { Squares2X2Icon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { HUB_TRABALHISTA, fazParteDoHub } from '@/lib/hubTrabalhista'

/**
 * Link das quatro calculadoras trabalhistas de volta para o hub (F58).
 *
 * É a metade que dá autoridade ao hub, e é a razão de ele não nascer órfão. O
 * F43 mostrou que o PageRank interno é o único capital de autoridade sob
 * controle total do site (Authority Score 2, um backlink reconhecido) — uma
 * página nova que recebesse link só do rodapé começaria no fim da fila. Aqui o
 * link vem das quatro páginas do cluster, incluindo `fgts` e `ferias`, que
 * estão entre as de maior impressão no GSC.
 *
 * Renderiza `null` nas outras 16 calculadoras: bloco vazio em página fora do
 * tema é exatamente o link sem sinal que o F43 removeu do rodapé.
 */
export function HubTrabalhistaCta({ slug }: { slug: string }) {
  if (!fazParteDoHub(slug)) return null

  return (
    <section className="mx-auto max-w-4xl px-4 pb-8" aria-labelledby={`hub-${slug}`}>
      <Link
        href={HUB_TRABALHISTA.path}
        className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5 transition-colors hover:bg-brand-100 md:p-6"
      >
        <Squares2X2Icon className="h-8 w-8 shrink-0 text-brand-600" aria-hidden />
        <span className="min-w-0 flex-1">
          <span id={`hub-${slug}`} className="block font-bold text-gray-900">
            {HUB_TRABALHISTA.titulo}
          </span>
          <span className="mt-1 block text-sm text-gray-600">
            Rescisão, 13º, férias e FGTS a partir dos mesmos dados — preencha uma vez e veja
            os quatro de uma só vez.
          </span>
        </span>
        <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
      </Link>
    </section>
  )
}
