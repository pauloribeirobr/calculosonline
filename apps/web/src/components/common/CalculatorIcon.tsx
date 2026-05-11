import type { ComponentType, SVGProps } from 'react'
import {
  BanknotesIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  CircleStackIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  FireIcon,
  GiftIcon,
  HeartIcon,
  HomeModernIcon,
  IdentificationIcon,
  PercentBadgeIcon,
  PresentationChartLineIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SunIcon,
  TagIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import type { CategoriaCalc, IconeCalculadora } from '@/lib/calculators'

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>
type IconSize = 'sm' | 'md' | 'lg' | 'xl'

const calculatorIcons: Record<IconeCalculadora, HeroIcon> = {
  rescisao: DocumentTextIcon,
  ferias: SunIcon,
  decimoTerceiro: GiftIcon,
  horaExtra: ClockIcon,
  fgts: BanknotesIcon,
  salarioLiquido: BriefcaseIcon,
  inss: ShieldCheckIcon,
  irrf: ReceiptPercentIcon,
  irpf: DocumentChartBarIcon,
  dasMei: IdentificationIcon,
  porcentagem: PercentBadgeIcon,
  jurosCompostos: PresentationChartLineIcon,
  emprestimo: CreditCardIcon,
  financiamento: HomeModernIcon,
  cdb: CircleStackIcon,
  poupanca: WalletIcon,
  tesouroDireto: BuildingLibraryIcon,
  imc: ScaleIcon,
  calorias: FireIcon,
  margemLucro: TagIcon,
}

const categoryIcons: Record<CategoriaCalc, HeroIcon> = {
  trabalhista: BriefcaseIcon,
  impostos: ReceiptPercentIcon,
  financeiro: BanknotesIcon,
  investimentos: ChartBarIcon,
  saude: HeartIcon,
  negocios: BuildingStorefrontIcon,
}

const categoryStyles: Record<CategoriaCalc, string> = {
  trabalhista: 'bg-blue-50 text-blue-700 ring-blue-100',
  impostos: 'bg-amber-50 text-amber-700 ring-amber-100',
  financeiro: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  investimentos: 'bg-purple-50 text-purple-700 ring-purple-100',
  saude: 'bg-pink-50 text-pink-700 ring-pink-100',
  negocios: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
}

const sizeStyles: Record<IconSize, { box: string; icon: string; accent: string }> = {
  sm: { box: 'h-7 w-7 rounded-md', icon: 'h-4 w-4', accent: 'h-1 w-1' },
  md: { box: 'h-9 w-9 rounded-lg', icon: 'h-5 w-5', accent: 'h-1.5 w-1.5' },
  lg: { box: 'h-11 w-11 rounded-xl', icon: 'h-6 w-6', accent: 'h-2 w-2' },
  xl: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7', accent: 'h-2.5 w-2.5' },
}

interface CalculatorIconProps {
  icon: IconeCalculadora
  categoria: CategoriaCalc
  size?: IconSize
  className?: string | undefined
}

interface CategoryIconProps {
  categoria: CategoriaCalc
  size?: IconSize
  className?: string | undefined
}

function StyledIcon({
  Icon,
  categoria,
  size = 'md',
  className = '',
}: {
  Icon: HeroIcon
  categoria: CategoriaCalc
  size?: IconSize
  className?: string | undefined
}) {
  const sizeClass = sizeStyles[size]

  return (
    <span
      className={[
        'relative inline-flex shrink-0 items-center justify-center ring-1',
        categoryStyles[categoria],
        sizeClass.box,
        className,
      ].join(' ')}
      aria-hidden
    >
      <Icon className={sizeClass.icon} strokeWidth={1.9} />
      <span
        className={[
          'absolute right-1 top-1 rounded-full bg-current opacity-25',
          sizeClass.accent,
        ].join(' ')}
      />
    </span>
  )
}

export function CalculatorIcon({
  icon,
  categoria,
  size = 'md',
  className,
}: CalculatorIconProps) {
  return (
    <StyledIcon
      Icon={calculatorIcons[icon]}
      categoria={categoria}
      size={size}
      className={className}
    />
  )
}

export function CategoryIcon({ categoria, size = 'md', className }: CategoryIconProps) {
  return (
    <StyledIcon
      Icon={categoryIcons[categoria]}
      categoria={categoria}
      size={size}
      className={className}
    />
  )
}
