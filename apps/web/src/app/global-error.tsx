'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    analytics.errorOccurred(error, { digest: error.digest })
  }, [error])

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <p className="text-6xl font-bold text-red-600">Erro</p>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Algo deu errado</h1>
            <p className="mt-2 text-gray-600">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Ir para página inicial
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
