import { cn } from '../utils/cn'

export interface LegalBadgeProps {
  fonteJuridica: string
  className?: string
}

export function LegalBadge({ fonteJuridica, className }: LegalBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700',
        className,
      )}
      title={`Base legal: ${fonteJuridica}`}
    >
      <span aria-hidden>⚖️</span>
      <span className="hidden sm:inline">Base legal:</span>
      <span className="font-mono">{fonteJuridica.split('|')[0]?.trim()}</span>
    </span>
  )
}
