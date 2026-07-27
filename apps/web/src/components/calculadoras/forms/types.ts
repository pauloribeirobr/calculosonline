import type { ErroValidacao, ResultadoCalculo } from '@calculosonline/core'

export interface FormProps {
  /** `data` é o input validado que gerou o resultado — usado pra montar o link de compartilhamento. */
  onResult: (r: ResultadoCalculo<unknown>, data?: Record<string, unknown>) => void
  onError?: (errors: ErroValidacao[]) => void
  isLoading?: boolean
  /** Valores decodificados de um link de cálculo compartilhado (query param `d`). */
  sharedData?: Record<string, unknown> | undefined
  /** Recalcula automaticamente assim que `sharedData` chega, sem exigir clique em "Calcular". */
  autoSubmit?: boolean | undefined
}
