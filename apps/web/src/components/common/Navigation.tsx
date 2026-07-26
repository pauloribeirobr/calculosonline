'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { CATEGORIAS_LABEL, getCalculatorsByCategory, type CategoriaCalc } from '@/lib/calculators'

interface NavigationProps {
  mobile?: boolean
  onItemClick?: () => void
}

// Quais categorias aparecem como dropdowns no topo (compactas).
const navCategorias: CategoriaCalc[] = [
  'trabalhista',
  'impostos',
  'financeiro',
  'investimentos',
]

export function Navigation({ mobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href
  const grouped = getCalculatorsByCategory()

  if (mobile) {
    const handleClick = onItemClick ?? (() => {})
    return (
      <div className="space-y-1">
        {navCategorias.map((cat) => (
          <div key={cat} className="py-2">
            <p className="px-3 text-sm font-semibold text-gray-900">{CATEGORIAS_LABEL[cat]}</p>
            {grouped[cat].map((item) => (
              <Link
                key={item.slug}
                href={`/calculadora/${item.slug}`}
                onClick={handleClick}
                className={`flex items-center justify-between px-3 py-2 text-base ${
                  isActive(`/calculadora/${item.slug}`)
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.titulo}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {navCategorias.map((cat) => (
        <Menu as="div" key={cat} className="relative">
          <Menu.Button className="inline-flex items-center gap-x-1 text-sm font-semibold text-gray-900 hover:text-brand-600">
            {CATEGORIAS_LABEL[cat]}
            <ChevronDownIcon className="h-5 w-5" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Menu.Items className="absolute left-0 z-10 mt-3 w-64 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {grouped[cat].map((item) => (
                  <Menu.Item key={item.slug}>
                    {({ active }) => (
                      <Link
                        href={`/calculadora/${item.slug}`}
                        className={`flex items-center justify-between px-4 py-2 text-sm ${
                          active || isActive(`/calculadora/${item.slug}`)
                            ? 'bg-gray-100 text-brand-600'
                            : 'text-gray-700'
                        }`}
                      >
                        <span>{item.titulo}</span>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ))}
    </>
  )
}
