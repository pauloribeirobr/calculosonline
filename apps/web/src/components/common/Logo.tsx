import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'light' | 'dark'
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { width: 32, height: 32, textClass: 'text-lg' },
  md: { width: 40, height: 40, textClass: 'text-xl' },
  lg: { width: 48, height: 48, textClass: 'text-2xl' },
}

export function Logo({ variant = 'light', showText = true, size = 'md' }: LogoProps) {
  const { width, height, textClass } = sizes[size]
  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900'
  const logoSrc = variant === 'dark' ? '/images/logo-dark.svg' : '/images/logo.svg'

  return (
    <Link href="/" className="flex items-center" aria-label="Calculos Online — início">
      <Image
        src={logoSrc}
        alt="Calculos Online"
        width={width}
        height={height}
        // Tamanho fixo no estilo (27/11/2026): o `h-auto w-auto` de antes e o `height: auto` do
        // CSS base do Tailwind anulavam o width/height do <img>, e o Lighthouse o contava como
        // imagem sem tamanho (causa de layout shift).
        className="shrink-0"
        style={{ width, height }}
      />
      {showText && (
        <span className={`ml-2 font-bold ${textClass} ${textColor}`}>Calculos Online</span>
      )}
    </Link>
  )
}
