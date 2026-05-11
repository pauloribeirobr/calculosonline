'use client'

import { useEffect } from 'react'
import { Button } from '@/components/common/Button'
import { analytics } from '@/lib/analytics'

export default function Error({
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-red-600">Erro</p>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Algo deu errado</h1>
        <p className="mt-2 text-gray-600">Ocorreu um erro inesperado. Tente novamente.</p>
        <div className="mt-6">
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </div>
    </div>
  )
}
