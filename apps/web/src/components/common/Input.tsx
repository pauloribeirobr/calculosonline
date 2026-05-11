import { type ChangeEvent, type InputHTMLAttributes, forwardRef } from 'react'
import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatCurrencyInput,
  formatPhone,
} from '@/lib/formatters'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

type Mask = 'cpf' | 'cnpj' | 'cep' | 'phone' | 'currency'

function inferMask(context: string): Mask | null {
  const c = context.toLowerCase()
  if (c.includes('cpf')) return 'cpf'
  if (c.includes('cnpj')) return 'cnpj'
  if (c.includes('cep')) return 'cep'
  if (c.includes('telefone') || c.includes('celular') || c.includes('phone')) return 'phone'
  if (c.includes('valor') && !c.includes('extenso')) return 'currency'
  return null
}

function applyMask(value: string, mask: Mask | null): string {
  switch (mask) {
    case 'cpf':
      return formatCpf(value)
    case 'cnpj':
      return formatCnpj(value)
    case 'cep':
      return formatCep(value)
    case 'phone':
      return formatPhone(value)
    case 'currency':
      return formatCurrencyInput(value)
    default:
      return value
  }
}

/**
 * Input com máscara automática inferida pelo `name`/`id`/`label`.
 * Suporta CPF, CNPJ, CEP, telefone e moeda BRL.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = '', id, ...props },
  ref,
) {
  const inputId = id || props.name
  const context = `${props.name ?? ''} ${id ?? ''} ${label ?? ''}`
  const mask = inferMask(context)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!props.onChange) return
    const masked = applyMask(event.target.value, mask)
    if (masked === event.target.value) {
      props.onChange(event)
      return
    }
    const maskedEvent = {
      ...event,
      target: { ...event.target, value: masked },
      currentTarget: { ...event.currentTarget, value: masked },
    } as ChangeEvent<HTMLInputElement>
    props.onChange(maskedEvent)
  }

  const autoInputMode =
    props.inputMode ||
    (props.type === 'number'
      ? 'numeric'
      : mask === 'currency'
        ? 'decimal'
        : mask
          ? 'numeric'
          : undefined)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`block w-full rounded-md shadow-sm sm:text-sm ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
        } ${className}`}
        {...props}
        data-clarity-mask="true"
        inputMode={autoInputMode}
        onChange={handleChange}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  )
})
