/**
 * Mapa de ícone por calculadora e por categoria (F7), extraído do
 * `CalculatorIcon.tsx` no F42 para ser reusado pelo gerador de og-image, que
 * precisa dos mesmos glifos sem o wrapper visual do componente.
 *
 * Fica separado de `lib/identidadeVisual.ts` de propósito: aqui há componentes
 * React, e aquele arquivo é lido por `sitemap.ts`/`schema.ts` no server.
 */
import type { ComponentType, ReactElement, SVGProps } from 'react'
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
import type { CategoriaCalc, IconeCalculadora } from '@/lib/identidadeVisual'

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>

export const calculatorIcons: Record<IconeCalculadora, HeroIcon> = {
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

export const categoryIcons: Record<CategoriaCalc, HeroIcon> = {
  trabalhista: BriefcaseIcon,
  impostos: ReceiptPercentIcon,
  financeiro: BanknotesIcon,
  investimentos: ChartBarIcon,
  saude: HeartIcon,
  negocios: BuildingStorefrontIcon,
}

/**
 * Devolve o `<svg>` intrínseco de um Heroicon, pronto para o Satori (motor do
 * `ImageResponse` que gera as og-images no F42).
 *
 * O Satori **não renderiza componentes `forwardRef`**, que é exatamente o que
 * os Heroicons são — passar `<Icone />` direto produz um quadro vazio, sem
 * erro nenhum. Desembrulhar o `render` entrega a árvore `svg > path`, que o
 * Satori entende. Serializar com `react-dom/server` seria a alternativa
 * óbvia, mas o Next proíbe esse import dentro de `app/`.
 */
type HeroIconForwardRef = {
  render: (props: SVGProps<SVGSVGElement>, ref: null) => ReactElement
}

export function glifoHeroicon(
  Icone: HeroIcon,
  { cor, tamanho }: { cor: string; tamanho: number },
): ReactElement {
  const { render } = Icone as unknown as HeroIconForwardRef
  return render(
    {
      width: tamanho,
      height: tamanho,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: cor,
      strokeWidth: 1.5,
    },
    null,
  )
}
