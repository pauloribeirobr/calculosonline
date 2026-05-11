import { cn } from '../utils/cn'

export interface UpdatedBadgeProps {
  /** Data de referência em ISO (`AAAA-MM-DD`) ou Date-parseable string */
  dataAtualizacao: string
  className?: string
}

export function UpdatedBadge({ dataAtualizacao, className }: UpdatedBadgeProps) {
  const data = new Date(dataAtualizacao + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700',
        className,
      )}
      title="Tabelas atualizadas"
    >
      <span aria-hidden>✅</span> Tabelas {data}
    </span>
  )
}
