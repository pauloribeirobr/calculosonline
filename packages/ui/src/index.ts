/**
 * @calculosonline/ui
 *
 * Componentes React reutilizáveis específicos de calculadora.
 * Compartilhados entre Web (Next.js), Desktop (Tauri) e plugin Sheets.
 *
 * Componentes de marketing (Header, Footer, Hero, etc.) ficam em
 * apps/web/src/components/ porque são específicos do site e copiados/adaptados
 * do projeto irmão Recibo Fácil.
 */

export { CalculatorForm } from './CalculatorForm'
export type { CalculatorFormProps, FieldMeta, QuickAddButton } from './CalculatorForm'

export { CalculatorResult } from './CalculatorResult'
export type { CalculatorResultProps, CalculatorResultFormato } from './CalculatorResult'

export { CalculatorLayout } from './CalculatorLayout'
export type { CalculatorLayoutProps } from './CalculatorLayout'

export { AdSlot } from './AdSlot'
export type { AdSlotProps, AdFormat } from './AdSlot'

export { RelatedCalculators } from './RelatedCalculators'
export type { RelatedItem, RelatedCalculatorsProps } from './RelatedCalculators'

export { LegalBadge } from './LegalBadge'
export type { LegalBadgeProps } from './LegalBadge'

export { UpdatedBadge } from './UpdatedBadge'
export type { UpdatedBadgeProps } from './UpdatedBadge'

export { Breadcrumb } from './Breadcrumb'
export type { BreadcrumbItem, BreadcrumbProps } from './Breadcrumb'

export { cn } from './utils/cn'
