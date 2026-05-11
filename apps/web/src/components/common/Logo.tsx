import Link from 'next/link'

interface LogoProps {
  variant?: 'light' | 'dark'
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { box: 32, textClass: 'text-lg' },
  md: { box: 40, textClass: 'text-xl' },
  lg: { box: 48, textClass: 'text-2xl' },
}

/**
 * Logo do Calculos Online: pictograma de calculadora estilizado.
 * Placeholder em SVG inline (sem dependência de asset estático).
 */
export function Logo({ variant = 'light', showText = true, size = 'md' }: LogoProps) {
  const { box, textClass } = sizes[size]
  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900'
  const bgColor = variant === 'dark' ? 'bg-brand-500' : 'bg-brand-600'

  return (
    <Link href="/" className="flex items-center" aria-label="Calculos Online — início">
      <span
        className={`inline-flex items-center justify-center rounded-lg ${bgColor} text-white shadow-sm`}
        style={{ width: box, height: box }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width={box * 0.6}
          height={box * 0.6}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8" />
          <path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
        </svg>
      </span>
      {showText && (
        <span className={`ml-2 font-bold ${textClass} ${textColor}`}>Calculos Online</span>
      )}
    </Link>
  )
}
