'use client'

import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z, ZodObject, ZodRawShape } from 'zod'
import { cn } from '../utils/cn'

/**
 * Metadados descritivos por campo. Combinados com o schema Zod,
 * permitem renderizar formulários de calculadora automaticamente.
 */
export interface FieldMeta {
  label: string
  placeholder?: string
  /** Texto de ajuda exibido abaixo do campo quando não há erro */
  hint?: string
  /** Símbolo à esquerda do input ("R$", "%", "kg") */
  prefix?: string
  /** Símbolo à direita do input ("/mês", "anos") */
  suffix?: string
  type?: 'number' | 'text' | 'select' | 'radio' | 'date'
  options?: Array<{ value: string; label: string }>
}

export interface CalculatorFormProps<T extends ZodRawShape> {
  schema: ZodObject<T>
  fields: Record<keyof z.infer<ZodObject<T>>, FieldMeta>
  onSubmit: (data: z.infer<ZodObject<T>>) => void
  submitLabel?: string
  isLoading?: boolean
  defaultValues?: Partial<z.infer<ZodObject<T>>>
}

export function CalculatorForm<T extends ZodRawShape>({
  schema,
  fields,
  onSubmit,
  submitLabel = 'Calcular',
  isLoading,
  defaultValues,
}: CalculatorFormProps<T>) {
  // react-hook-form não consome bem os generics de Zod em wrappers, então
  // tratamos o estado interno como FieldValues e expomos o tipo correto no onSubmit.
  type FormValues = z.infer<typeof schema> & FieldValues
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: defaultValues as DefaultValues<FormValues>,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit as SubmitHandler<FormValues>)}
      className="space-y-4"
      noValidate
      aria-label="Formulário de cálculo"
      data-clarity-mask="true"
    >
      {Object.entries(fields).map(([name, meta]) => {
        const fieldMeta = meta as FieldMeta
        const error = errors[name as keyof typeof errors]
        const fieldName = name as Path<FormValues>

        return (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
              {fieldMeta.label}
            </label>

            <div className="relative flex items-center">
              {fieldMeta.prefix && (
                <span className="pointer-events-none absolute left-3 select-none text-sm text-gray-500">
                  {fieldMeta.prefix}
                </span>
              )}

              {fieldMeta.type === 'select' ? (
                <select
                  id={name}
                  {...register(fieldName)}
                  className={cn(
                    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500',
                    error ? 'border-red-400' : 'border-gray-300',
                  )}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${name}-error` : undefined}
                  data-clarity-mask="true"
                >
                  {fieldMeta.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : fieldMeta.type === 'radio' ? (
                <fieldset className="flex flex-wrap gap-3">
                  {fieldMeta.options?.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register(fieldName)}
                        className="accent-brand-600"
                        data-clarity-mask="true"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <input
                  id={name}
                  type={fieldMeta.type ?? 'number'}
                  inputMode={
                    fieldMeta.type === 'text' || fieldMeta.type === 'date'
                      ? 'text'
                      : 'decimal'
                  }
                  placeholder={fieldMeta.placeholder}
                  {...register(fieldName, {
                    // Não usar `valueAsNumber`: ele converte campo vazio em NaN, e o
                    // `.default(0)` do Zod só resgata `undefined` — NaN faz a validação
                    // falhar mesmo em campos opcionais deixados em branco. `undefined`
                    // deixa o default do schema (quando houver) assumir corretamente.
                    setValueAs:
                      (fieldMeta.type ?? 'number') === 'number'
                        ? (v: string) => (v === '' ? undefined : Number(v))
                        : (v: string) => v,
                  })}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500',
                    fieldMeta.prefix && 'pl-10',
                    fieldMeta.suffix && 'pr-14',
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
                  )}
                  aria-invalid={!!error}
                  aria-describedby={
                    [error ? `${name}-error` : null, fieldMeta.hint ? `${name}-hint` : null]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                  data-clarity-mask="true"
                />
              )}

              {fieldMeta.suffix && (
                <span className="pointer-events-none absolute right-3 select-none text-sm text-gray-500">
                  {fieldMeta.suffix}
                </span>
              )}
            </div>

            {fieldMeta.hint && !error && (
              <p id={`${name}-hint`} className="text-xs text-gray-500">
                {fieldMeta.hint}
              </p>
            )}
            {error && (
              <p id={`${name}-error`} role="alert" className="text-xs text-red-600">
                {error.message as string}
              </p>
            )}
          </div>
        )
      })}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white',
          'hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-150',
        )}
        aria-busy={isLoading}
      >
        {isLoading ? 'Calculando...' : submitLabel}
      </button>
    </form>
  )
}
