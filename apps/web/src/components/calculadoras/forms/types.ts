import type { ErroValidacao, ResultadoCalculo } from '@calculosonline/core'

export interface FormProps {
  onResult: (r: ResultadoCalculo<unknown>) => void
  onError?: (errors: ErroValidacao[]) => void
  isLoading?: boolean
}
