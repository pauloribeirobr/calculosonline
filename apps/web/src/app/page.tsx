import { Hero } from '@/components/home/Hero'
import { CalculatorTypes } from '@/components/home/CalculatorTypes'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Features } from '@/components/home/Features'
import { Stats } from '@/components/home/Stats'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQ, faqItems } from '@/components/home/FAQ'
import { FinalCta } from '@/components/home/FinalCta'
import { SeoContent } from '@/components/home/SeoContent'
import { PageSeo } from '@/components/seo/PageSeo'

export default function HomePage() {
  return (
    <>
      <PageSeo
        title="Calculos Online — Calculadoras Online Grátis e Atualizadas para 2026"
        description="Calculadoras online grátis e atualizadas para 2026: rescisão, férias, 13º, FGTS, IRPF, INSS, juros compostos, IMC e mais. Sem cadastro."
        path="/"
        breadcrumbs={[{ name: 'Calculos Online', path: '/' }]}
        faqItems={faqItems}
      />
      <Hero />
      <CalculatorTypes />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <FAQ />
      <FinalCta />
      <SeoContent />
    </>
  )
}
