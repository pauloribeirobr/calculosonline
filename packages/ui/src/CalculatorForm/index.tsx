'use client'

import { useEffect, useRef } from 'react'
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type Control,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { z, ZodObject, ZodRawShape } from 'zod'
import { Utils } from '@calculosonline/core'
import { cn } from '../utils/cn'

/** Um chip de valor rápido — soma `value` ao valor atual do campo ao clicar. */
export interface QuickAddButton {
  label: string
  value: number
}

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
  type?: 'number' | 'text' | 'select' | 'radio' | 'date' | 'currency' | 'stepper' | 'itemList'
  options?: Array<{ value: string; label: string }>
  /**
   * Chips de valor rápido abaixo do campo, mesmo padrão visual do Recibo
   * Fácil: "Zerar" zera o campo; cada chip SOMA ao valor atual (não
   * substitui). Só se aplica a campos `currency`/`number` simples.
   */
  quickAdd?: QuickAddButton[]
  /** `stepper`: valor mínimo permitido (padrão 0). */
  min?: number
  /**
   * `itemList`: chips de sugestão que adicionam uma linha já com a
   * descrição preenchida (o usuário só digita o valor). A lista continua
   * livre — o usuário pode digitar qualquer descrição própria também.
   */
  itemSuggestions?: string[]
  /** `itemList`: placeholder do campo de descrição de cada item. */
  itemPlaceholder?: string
}

export interface CalculatorFormProps<T extends ZodRawShape> {
  schema: ZodObject<T>
  fields: Record<keyof z.infer<ZodObject<T>>, FieldMeta>
  onSubmit: (data: z.infer<ZodObject<T>>) => void
  submitLabel?: string
  isLoading?: boolean
  defaultValues?: Partial<z.infer<ZodObject<T>>> | undefined
  /**
   * Quando true, dispara o cálculo automaticamente assim que `defaultValues`
   * chega — usado ao abrir um link de cálculo compartilhado (a página já
   * chega com o resultado calculado, sem exigir clique em "Calcular").
   */
  autoSubmit?: boolean | undefined
}

/**
 * Deriva os valores iniciais visíveis no formulário a partir dos `.default()`
 * já declarados no schema Zod de cada calculadora — em vez de deixar campos
 * opcionais (dependentes, descontos, meses etc.) em branco até o envio, o
 * mesmo valor que o schema assumiria (0, "não", "moderado"...) já aparece
 * preenchido. Evita duplicar o default em cada formulário e mantém uma única
 * fonte de verdade (o schema). Campos obrigatórios (sem `.default()`) não são
 * tocados — continuam em branco, com placeholder de exemplo.
 */
function extractSchemaDefaults<T extends ZodRawShape>(
  schema: ZodObject<T>,
): Partial<Record<keyof T, unknown>> {
  const defaults: Partial<Record<keyof T, unknown>> = {}
  for (const key of Object.keys(schema.shape) as Array<keyof T>) {
    const fieldSchema = schema.shape[key] as unknown as {
      _def?: { typeName?: string; defaultValue?: () => unknown }
    }
    if (
      fieldSchema?._def?.typeName === 'ZodDefault' &&
      typeof fieldSchema._def.defaultValue === 'function'
    ) {
      defaults[key] = fieldSchema._def.defaultValue()
    }
  }
  return defaults
}

/** Desembrulha ZodDefault/ZodOptional pra achar o tipo base do campo (ex. detectar um <select> que representa um número, como "mês"). */
function isNumericSchemaField<T extends ZodRawShape>(schema: ZodObject<T>, key: string): boolean {
  let fieldSchema = schema.shape[key as keyof T] as unknown as {
    _def?: { typeName?: string; innerType?: unknown }
  }
  while (
    fieldSchema?._def?.typeName === 'ZodDefault' ||
    fieldSchema?._def?.typeName === 'ZodOptional'
  ) {
    fieldSchema = fieldSchema._def.innerType as typeof fieldSchema
  }
  return fieldSchema?._def?.typeName === 'ZodNumber'
}

/** Formata um número (reais) como string mascarada "1.234,56" — dígitos digitados são tratados como centavos. */
function formatarCentavos(valor: unknown): string {
  const centavos = Math.round((Number(valor) || 0) * 100)
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Converte o texto digitado num campo de moeda (dígitos = centavos) de volta pra número. */
function parseCentavosInput(texto: string): number {
  const digitos = texto.replace(/\D/g, '')
  return digitos === '' ? 0 : parseInt(digitos, 10) / 100
}

const currencyInputClassName = cn(
  'w-full rounded-lg border px-3 py-2.5 text-sm',
  'focus:ring-brand-500 focus:outline-none focus:ring-2',
  'border-gray-300 bg-white',
)

/** Campo de moeda mascarado (dígitos-como-centavos), ex.: "1234" → "R$ 12,34". */
function CurrencyField({
  control,
  name,
  id,
  disabled,
  hasError,
  ariaDescribedBy,
  hasPrefix,
}: {
  control: Control<FieldValues>
  name: Path<FieldValues>
  id: string
  disabled?: boolean | undefined
  hasError: boolean
  ariaDescribedBy?: string | undefined
  hasPrefix?: boolean | undefined
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={formatarCentavos(field.value)}
          onChange={(e) => field.onChange(parseCentavosInput(e.target.value))}
          onBlur={field.onBlur}
          disabled={disabled}
          className={cn(currencyInputClassName, hasPrefix && 'pl-10', hasError && 'border-red-400 bg-red-50')}
          aria-invalid={hasError}
          aria-describedby={ariaDescribedBy}
          data-clarity-mask="true"
        />
      )}
    />
  )
}

/** Campo numérico com botões +/− (ex.: nº de dependentes) — sempre ≥ `min`. */
function StepperField({
  control,
  name,
  id,
  min = 0,
  disabled,
  hasError,
  ariaDescribedBy,
}: {
  control: Control<FieldValues>
  name: Path<FieldValues>
  id: string
  min?: number | undefined
  disabled?: boolean | undefined
  hasError: boolean
  ariaDescribedBy?: string | undefined
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const valor = Number(field.value) || 0
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => field.onChange(Math.max(min, valor - 1))}
              disabled={disabled || valor <= min}
              aria-label="Diminuir"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MinusIcon className="h-4 w-4" aria-hidden />
            </button>
            <input
              id={id}
              type="number"
              inputMode="numeric"
              value={valor}
              onChange={(e) => {
                const n = e.target.value === '' ? min : Math.trunc(Number(e.target.value))
                field.onChange(Number.isFinite(n) ? Math.max(min, n) : min)
              }}
              onBlur={field.onBlur}
              disabled={disabled}
              aria-invalid={hasError}
              aria-describedby={ariaDescribedBy}
              className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-2 text-center text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              data-clarity-mask="true"
            />
            <button
              type="button"
              onClick={() => field.onChange(valor + 1)}
              disabled={disabled}
              aria-label="Aumentar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )
      }}
    />
  )
}

/**
 * Lista livre de itens (descrição + valor) — usada em "outras deduções",
 * "outros descontos" e "adicionais". O usuário adiciona/remove linhas à
 * vontade; chips de sugestão só pré-preenchem a descrição de uma nova linha.
 */
/**
 * Limites defensivos pro link de compartilhamento (`?d=` em base64, ver
 * `lib/shareLink.ts`) não crescer sem controle — sem eles, o campo de
 * descrição livre aceitaria qualquer tamanho de texto colado. 20 itens ×
 * 60 chars por lista mantém o link bem abaixo de qualquer limite prático de
 * URL/CDN mesmo com várias listas cheias ao mesmo tempo. Espelhado no
 * `.max()` do schema Zod de cada formulário (defesa em profundidade — um
 * link compartilhado adulterado não contorna o limite só por pular a UI).
 */
const ITEM_LIST_MAX_ITEMS = 20
const ITEM_LIST_DESCRICAO_MAX_LENGTH = 60

function ItemListField({
  control,
  name,
  suggestions,
  itemPlaceholder,
  valuePrefix,
  disabled,
}: {
  control: Control<FieldValues>
  name: Path<FieldValues>
  suggestions?: string[] | undefined
  itemPlaceholder?: string | undefined
  valuePrefix?: string | undefined
  disabled?: boolean | undefined
}) {
  const { fields, append, remove } = useFieldArray({ control, name: name as never })
  const itensAtuais = useWatch({ control, name }) as
    | Array<{ valor?: number }>
    | undefined
  const total = (itensAtuais ?? []).reduce((soma, item) => soma + (Number(item?.valor) || 0), 0)
  const atingiuLimite = fields.length >= ITEM_LIST_MAX_ITEMS

  return (
    <div className="flex flex-col gap-2">
      {fields.length > 0 && (
        <ul className="flex flex-col gap-2" role="list">
          {fields.map((row, index) => (
            <li key={row.id} className="flex items-center gap-2">
              <Controller
                control={control}
                name={`${name}.${index}.descricao` as Path<FieldValues>}
                render={({ field }) => (
                  <input
                    type="text"
                    placeholder={itemPlaceholder ?? 'Descrição'}
                    value={(field.value as string) ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    disabled={disabled}
                    maxLength={ITEM_LIST_DESCRICAO_MAX_LENGTH}
                    aria-label={`Descrição do item ${index + 1}`}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    data-clarity-mask="true"
                  />
                )}
              />
              <div className="relative w-32 shrink-0 sm:w-36">
                {valuePrefix && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm text-gray-500">
                    {valuePrefix}
                  </span>
                )}
                <Controller
                  control={control}
                  name={`${name}.${index}.valor` as Path<FieldValues>}
                  render={({ field }) => (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formatarCentavos(field.value)}
                      onChange={(e) => field.onChange(parseCentavosInput(e.target.value))}
                      onBlur={field.onBlur}
                      disabled={disabled}
                      aria-label={`Valor do item ${index + 1}`}
                      className={cn(currencyInputClassName, valuePrefix && 'pl-9')}
                      data-clarity-mask="true"
                    />
                  )}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remover item ${index + 1}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => append({ descricao: '', valor: 0 } as never)}
          disabled={disabled || atingiuLimite}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="h-3.5 w-3.5" aria-hidden /> Adicionar item
        </button>
        {suggestions?.map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            onClick={() => append({ descricao: sugestao, valor: 0 } as never)}
            disabled={disabled || atingiuLimite}
            className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + {sugestao}
          </button>
        ))}
        {fields.length > 0 && (
          <span className="ml-auto text-xs font-medium tabular-nums text-gray-500">
            Total: {Utils.formatarBRL(total)}
          </span>
        )}
      </div>
      {atingiuLimite && (
        <p className="text-xs text-gray-500">Máximo de {ITEM_LIST_MAX_ITEMS} itens por lista.</p>
      )}
    </div>
  )
}

export function CalculatorForm<T extends ZodRawShape>({
  schema,
  fields,
  onSubmit,
  submitLabel = 'Calcular',
  isLoading,
  defaultValues,
  autoSubmit,
}: CalculatorFormProps<T>) {
  // react-hook-form não consome bem os generics de Zod em wrappers, então
  // tratamos o estado interno como FieldValues e expomos o tipo correto no onSubmit.
  type FormValues = z.infer<typeof schema> & FieldValues
  const resolvedDefaultValues = {
    ...extractSchemaDefaults(schema),
    ...defaultValues,
  } as DefaultValues<FormValues>

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: resolvedDefaultValues,
  })

  const autoSubmitDone = useRef(false)
  useEffect(() => {
    if (autoSubmit && defaultValues && !autoSubmitDone.current) {
      autoSubmitDone.current = true
      reset(resolvedDefaultValues)
      void handleSubmit(onSubmit as SubmitHandler<FormValues>)()
    }
  }, [autoSubmit, defaultValues, handleSubmit, onSubmit, reset, resolvedDefaultValues])

  function handleQuickAdd(fieldName: Path<FormValues>, addValue: number) {
    const atual = Number(getValues(fieldName)) || 0
    const proximo = Math.round((atual + addValue) * 100) / 100
    setValue(fieldName, proximo as never, { shouldValidate: true, shouldDirty: true })
  }

  function handleClearField(fieldName: Path<FormValues>) {
    setValue(fieldName, 0 as never, { shouldValidate: true, shouldDirty: true })
  }

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
        const describedBy =
          [error ? `${name}-error` : null, fieldMeta.hint ? `${name}-hint` : null]
            .filter(Boolean)
            .join(' ') || undefined

        // `itemList` não cabe na moldura de linha única (prefix/input/suffix) —
        // renderiza um bloco próprio (linhas + botão adicionar) abaixo do label.
        if (fieldMeta.type === 'itemList') {
          return (
            <div
              key={name}
              className="flex flex-col gap-1"
              role="group"
              aria-labelledby={`${name}-label`}
            >
              <label id={`${name}-label`} className="text-sm font-medium text-gray-700">
                {fieldMeta.label}
              </label>
              <ItemListField
                control={control as unknown as Control<FieldValues>}
                name={fieldName as unknown as Path<FieldValues>}
                suggestions={fieldMeta.itemSuggestions}
                itemPlaceholder={fieldMeta.itemPlaceholder}
                valuePrefix={fieldMeta.prefix}
                disabled={!!isLoading}
              />
              {fieldMeta.hint && (
                <p id={`${name}-hint`} className="text-xs text-gray-500">
                  {fieldMeta.hint}
                </p>
              )}
            </div>
          )
        }

        return (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
              {fieldMeta.label}
            </label>

            <div className="relative flex items-center">
              {fieldMeta.prefix && fieldMeta.type !== 'stepper' && (
                <span className="pointer-events-none absolute left-3 select-none text-sm text-gray-500">
                  {fieldMeta.prefix}
                </span>
              )}

              {fieldMeta.type === 'currency' ? (
                <CurrencyField
                  control={control as unknown as Control<FieldValues>}
                  name={fieldName as unknown as Path<FieldValues>}
                  id={name}
                  disabled={!!isLoading}
                  hasError={!!error}
                  hasPrefix={!!fieldMeta.prefix}
                  ariaDescribedBy={describedBy}
                />
              ) : fieldMeta.type === 'stepper' ? (
                <StepperField
                  control={control as unknown as Control<FieldValues>}
                  name={fieldName as unknown as Path<FieldValues>}
                  id={name}
                  min={fieldMeta.min}
                  disabled={!!isLoading}
                  hasError={!!error}
                  ariaDescribedBy={describedBy}
                />
              ) : fieldMeta.type === 'select' ? (
                <select
                  id={name}
                  {...register(
                    fieldName,
                    isNumericSchemaField(schema, name)
                      ? { setValueAs: (v: string) => (v === '' ? undefined : Number(v)) }
                      : undefined,
                  )}
                  className={cn(
                    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm',
                    'focus:ring-brand-500 focus:outline-none focus:ring-2',
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
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2">
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
                    fieldMeta.type === 'text' || fieldMeta.type === 'date' ? 'text' : 'decimal'
                  }
                  placeholder={fieldMeta.placeholder}
                  {...register(fieldName, {
                    // Não usar `valueAsNumber`: ele converte campo vazio em NaN, e o
                    // `.default(0)` do Zod só resgata `undefined`, nunca `NaN` — travando
                    // a validação mesmo em campos opcionais deixados em branco.
                    // `undefined` deixa o default do schema (quando houver) assumir corretamente.
                    setValueAs:
                      (fieldMeta.type ?? 'number') === 'number'
                        ? (v: string) => (v === '' ? undefined : Number(v))
                        : (v: string) => v,
                  })}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2.5 text-sm',
                    'focus:ring-brand-500 focus:outline-none focus:ring-2',
                    fieldMeta.prefix && 'pl-10',
                    fieldMeta.suffix && 'pr-14',
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
                  )}
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  data-clarity-mask="true"
                />
              )}

              {fieldMeta.suffix && fieldMeta.type !== 'stepper' && (
                <span className="pointer-events-none absolute right-3 select-none text-sm text-gray-500">
                  {fieldMeta.suffix}
                </span>
              )}
            </div>

            {fieldMeta.quickAdd && fieldMeta.quickAdd.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleClearField(fieldName)}
                  disabled={isLoading}
                  title="Zerar valor"
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span aria-hidden>×</span> Zerar
                </button>
                {fieldMeta.quickAdd.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleQuickAdd(fieldName, btn.value)}
                    disabled={isLoading}
                    title={`Adicionar ${fieldMeta.prefix ?? ''} ${btn.value.toLocaleString('pt-BR')}`.trim()}
                    className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

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
          'bg-brand-600 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white',
          'hover:bg-brand-700 focus:ring-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2',
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
