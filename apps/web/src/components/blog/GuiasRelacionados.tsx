import Link from 'next/link'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { postsDaCalculadora, formatarDataPorExtenso } from '@/lib/blog'

/**
 * Link da calculadora de volta para os guias do blog que a citam (F22).
 *
 * É a metade recíproca do que o post já faz. A disciplina do F43 vale nos dois
 * sentidos: o post manda a busca informacional ("quando cai o 13º") para a
 * ferramenta, e a calculadora entrega ao usuário o contexto que o formulário
 * não cabe — datas, regra dos 15 dias, por que a 2ª parcela vem menor.
 *
 * Não renderiza nada quando não há post para a calculadora, que hoje é o caso
 * de 19 das 20 — o blog começou com um artigo só, e um bloco vazio em 19
 * páginas seria exatamente o tipo de link sem sinal que o F43 removeu.
 */
export function GuiasRelacionados({ slug }: { slug: string }) {
  const posts = postsDaCalculadora(slug)
  if (posts.length === 0) return null

  return (
    <section
      className="mx-auto max-w-4xl px-4 pb-8"
      aria-labelledby={`guias-${slug}`}
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 md:p-6">
        <h2
          id={`guias-${slug}`}
          className="flex items-center gap-2 text-lg font-bold text-gray-900"
        >
          <BookOpenIcon className="h-5 w-5 text-brand-600" aria-hidden />
          {posts.length === 1 ? 'Guia sobre este tema' : 'Guias sobre este tema'}
        </h2>
        <ul className="mt-4 space-y-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <span className="block font-medium text-gray-900">{post.titulo}</span>
                <span className="mt-1 block text-sm text-gray-600">{post.resumo}</span>
                <span className="mt-2 block text-xs text-gray-500">
                  {formatarDataPorExtenso(post.dataPublicacao)} · {post.tempoLeituraMin} min
                  de leitura
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
