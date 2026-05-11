'use client'

import { Disclosure, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export const faqItems = [
  {
    question: 'As calculadoras são realmente gratuitas?',
    answer:
      'Sim. Todas as 20 calculadoras são 100% gratuitas, sem cadastro, sem trial. Cobrimos os custos com publicidade discreta — nunca com seus dados pessoais.',
  },
  {
    question: 'As tabelas (INSS, IRRF, salário mínimo) estão atualizadas?',
    answer:
      'Sim. Usamos as tabelas vigentes em 2026 — Portaria Interministerial MPS/MF nº 2/2024 (INSS), Lei 11.482/2007 (IRRF) e Decreto 12.342/2024 (salário mínimo). Cada resultado mostra a fonte legal explícita.',
  },
  {
    question: 'Posso confiar nos resultados?',
    answer:
      'Cada calculadora é coberta por testes automatizados com 100% de cobertura e validação cruzada contra calculadoras oficiais (Receita Federal, INSS). Mostramos a fórmula aplicada em cada linha do detalhamento.',
  },
  {
    question: 'Meus dados ficam salvos em algum servidor?',
    answer:
      'Não. Todo o cálculo acontece no seu navegador. Não enviamos nada para nossos servidores — não tem login, não tem rastreamento de inputs individuais.',
  },
  {
    question: 'Funciona offline?',
    answer:
      'Sim. O site é uma PWA: depois da primeira visita, você pode instalar o ícone na tela inicial do celular e usar sem conexão. Versões nativas para Android e Desktop chegam na fase 2.',
  },
  {
    question: 'Como vocês ganham dinheiro?',
    answer:
      'Apenas com Google AdSense — anúncios contextuais discretos em posições que não atrapalham o uso. Sem venda de dados, sem trackers de terceiros além dos absolutamente necessários (analytics agregado).',
  },
]

export function FAQ() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Perguntas frequentes</h2>
          <p className="mt-4 text-base text-gray-600">Tudo que você precisa saber antes de usar.</p>
        </div>
        <dl className="mt-12 space-y-4">
          {faqItems.map((item) => (
            <Disclosure as="div" key={item.question} className="rounded-lg bg-white shadow-sm">
              {({ open }) => (
                <>
                  <dt>
                    <Disclosure.Button className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold text-gray-900 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      <span>{item.question}</span>
                      <ChevronDownIcon
                        className={`${open ? 'rotate-180' : ''} h-5 w-5 text-gray-400 transition-transform`}
                        aria-hidden
                      />
                    </Disclosure.Button>
                  </dt>
                  <Transition
                    enter="transition duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition duration-100 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Disclosure.Panel as="dd" className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                      {item.answer}
                    </Disclosure.Panel>
                  </Transition>
                </>
              )}
            </Disclosure>
          ))}
        </dl>
      </div>
    </section>
  )
}
