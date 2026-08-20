import { IDENTIDADE_CATEGORIA, superficieDe } from '@/lib/identidadeVisual'
import { calculatorIcons, categoryIcons, type HeroIcon } from '@/lib/iconesCalculadora'
import type { CategoriaCalc, IconeCalculadora } from '@/lib/identidadeVisual'

type IconSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeStyles: Record<IconSize, { box: string; icon: string }> = {
  sm: { box: 'h-7 w-7 rounded-lg', icon: 'h-4 w-4' },
  md: { box: 'h-9 w-9 rounded-lg', icon: 'h-5 w-5' },
  lg: { box: 'h-11 w-11 rounded-xl', icon: 'h-6 w-6' },
  xl: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
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
  const identidade = IDENTIDADE_CATEGORIA[categoria]

  return (
    <span
      className={[
        'relative inline-flex shrink-0 items-center justify-center ring-1',
        superficieDe(categoria),
        identidade.icone,
        sizeClass.box,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <Icon className={sizeClass.icon} />
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
