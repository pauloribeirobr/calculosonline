import Link from 'next/link'
import { Logo } from './Logo'

interface FooterLink {
  name: string
  href: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const footerSections: FooterSection[] = [
  {
    title: 'Trabalhistas',
    links: [
      { name: 'Rescisão Trabalhista', href: '/calculadora/rescisao-trabalhista' },
      { name: 'Férias', href: '/calculadora/ferias' },
      { name: '13º Salário', href: '/calculadora/decimo-terceiro' },
      { name: 'Hora Extra', href: '/calculadora/hora-extra' },
      { name: 'FGTS', href: '/calculadora/fgts' },
      { name: 'Salário Líquido', href: '/calculadora/salario-liquido' },
    ],
  },
  {
    title: 'Impostos',
    links: [
      { name: 'IRPF (Anual)', href: '/calculadora/irpf' },
      { name: 'IRRF (Mensal)', href: '/calculadora/irrf' },
      { name: 'INSS', href: '/calculadora/inss' },
      { name: 'DAS MEI', href: '/calculadora/das-mei' },
    ],
  },
  {
    title: 'Financeiras',
    links: [
      { name: 'Juros Compostos', href: '/calculadora/juros-compostos' },
      { name: 'Empréstimo', href: '/calculadora/emprestimo' },
      { name: 'Financiamento', href: '/calculadora/financiamento' },
      { name: 'Porcentagem', href: '/calculadora/porcentagem' },
    ],
  },
  {
    title: 'Investimentos',
    links: [
      { name: 'CDB', href: '/calculadora/cdb' },
      { name: 'Poupança', href: '/calculadora/poupanca' },
      { name: 'Tesouro Direto', href: '/calculadora/tesouro-direto' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { name: 'Sobre', href: '/sobre' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contato', href: '/contato' },
      { name: 'Termos de Uso', href: '/termos-de-uso' },
      { name: 'Política de Privacidade', href: '/politica-de-privacidade' },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Logo variant="dark" />
            <p className="text-sm leading-6 text-gray-300">
              Calculadoras online grátis e atualizadas para o mercado brasileiro: trabalhistas,
              impostos, financeiras, investimentos, saúde e negócios.
            </p>
            <div className="rounded-lg border border-blue-800 bg-blue-900/50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">100% Gratuito e sem cadastro</p>
                  <p className="mt-1 text-xs text-gray-300">
                    Use todas as calculadoras quantas vezes quiser. Seus dados não saem do seu
                    navegador.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerSections.slice(0, 2).map((section) => (
                <div key={section.title} className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">{section.title}</h3>
                  <ul className="mt-6 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-300 hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-3 md:gap-6">
              {footerSections.slice(2).map((section) => (
                <div key={section.title} className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">{section.title}</h3>
                  <ul className="mt-6 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-300 hover:text-white"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; {currentYear} calculosonline.com.br. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
