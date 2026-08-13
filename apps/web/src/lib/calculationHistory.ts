import type { CategoriaCalc, ResultadoFormato } from './calculators'

/**
 * Histórico local de cálculos salvos (F37) — IndexedDB, sem backend, sem
 * cadastro. Toda calculadora oferece "Salvar cálculo"; o usuário decide se
 * quer guardar, nada é salvo automaticamente. Reaproveita o mesmo
 * `inputData` (valores brutos do formulário) já usado no compartilhamento
 * por link (F32, `shareLink.ts`) — reabrir um cálculo salvo é navegar pra
 * `/calculadora/[slug]?d=<inputData codificado>`, sem lógica nova de
 * reidratação de formulário.
 *
 * Ao contrário do `LocalStorageRepository` do Recibo Fácil (que guarda
 * `Blob` de PDF e por isso precisou de migração de/para `localStorage`),
 * aqui o registro é só JSON pequeno — sem risco de estourar quota, sem
 * fallback de `localStorage` necessário.
 */

export interface CalculoSalvo {
  id: string
  slug: string
  titulo: string
  categoria: CategoriaCalc
  inputData: Record<string, unknown>
  resultadoValor: number
  resultadoFormato?: ResultadoFormato
  criadoEm: string
}

export interface SalvarCalculoInput {
  slug: string
  titulo: string
  categoria: CategoriaCalc
  inputData: Record<string, unknown>
  resultadoValor: number
  resultadoFormato?: ResultadoFormato
}

const DB_NAME = 'calculosonline-historico'
const STORE_NAME = 'calculos'
const DB_VERSION = 1
const INDEX_CRIADO_EM = 'criadoEm'

let dbPromise: Promise<IDBDatabase> | null = null

export function historicoDisponivel(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Erro no IndexedDB'))
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Transação IndexedDB falhou'))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Transação IndexedDB abortada'))
  })
}

function openDb(): Promise<IDBDatabase> {
  if (!historicoDisponivel()) {
    return Promise.reject(new Error('IndexedDB indisponível neste navegador'))
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex(INDEX_CRIADO_EM, INDEX_CRIADO_EM)
        }
      }

      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close()
          dbPromise = null
        }
        resolve(request.result)
      }

      request.onerror = () => reject(request.error ?? new Error('Falha ao abrir IndexedDB'))
    })
  }

  return dbPromise
}

function novoId(slug: string): string {
  return `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function salvarCalculo(input: SalvarCalculoInput): Promise<CalculoSalvo> {
  const registro: CalculoSalvo = {
    id: novoId(input.slug),
    slug: input.slug,
    titulo: input.titulo,
    categoria: input.categoria,
    inputData: input.inputData,
    resultadoValor: input.resultadoValor,
    criadoEm: new Date().toISOString(),
    ...(input.resultadoFormato !== undefined ? { resultadoFormato: input.resultadoFormato } : {}),
  }

  const db = await openDb()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).put(registro)
  await transactionDone(transaction)
  return registro
}

export async function listarCalculos(): Promise<CalculoSalvo[]> {
  const db = await openDb()
  const transaction = db.transaction(STORE_NAME, 'readonly')
  const request = transaction.objectStore(STORE_NAME).getAll()
  const resultado = await requestToPromise(request)
  await transactionDone(transaction)

  // Mais recente primeiro.
  return (resultado as CalculoSalvo[]).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export async function removerCalculo(id: string): Promise<void> {
  const db = await openDb()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).delete(id)
  await transactionDone(transaction)
}

export async function limparCalculos(): Promise<void> {
  const db = await openDb()
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).clear()
  await transactionDone(transaction)
}
