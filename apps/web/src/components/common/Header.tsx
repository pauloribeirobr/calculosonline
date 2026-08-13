'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bars3Icon,
  XMarkIcon,
  CalculatorIcon,
  ClockIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Transition } from '@headlessui/react'
import { Logo } from './Logo'
import { Navigation } from './Navigation'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <Navigation />
            <Link
              href="/meus-calculos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-brand-600"
            >
              <ClockIcon className="h-4 w-4" />
              Meus Cálculos
            </Link>
            <Link
              href="/categorias"
              className="inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-100"
            >
              <Squares2X2Icon className="h-4 w-4" />
              Categorias
            </Link>
            <Link
              href="/#calculadoras"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calcular agora
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Abrir menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pb-3 lg:hidden">
          <Link
            href="/#calculadoras"
            className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <CalculatorIcon className="h-4 w-4 shrink-0" />
            <span>Calcular agora</span>
          </Link>
        </div>

        <Transition
          show={mobileMenuOpen}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div className="lg:hidden" id="mobile-menu">
            <div className="space-y-1 border-t border-gray-200 pb-3 pt-2">
              <Link
                href="/meus-calculos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-base text-gray-600 hover:bg-gray-50"
              >
                <ClockIcon className="h-5 w-5" />
                Meus Cálculos
              </Link>
              <Navigation mobile onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </Transition>
      </nav>
    </header>
  )
}
