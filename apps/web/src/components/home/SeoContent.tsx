/**
 * Bloco editorial de SEO no final da home: parágrafo introdutório,
 * lista de palavras-chave naturais e links âncora para categorias.
 * Espelha o `SeoContent` do Recibo Fácil.
 */
export function SeoContent() {
  return (
    <section className="bg-white py-16">
      <div className="prose prose-gray mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2>Calculadoras online grátis e atualizadas para 2026</h2>
        <p className="lead">
          O <strong>calculosonline.com.br</strong> reúne as 20 calculadoras mais usadas no
          cotidiano brasileiro — trabalhistas, fiscais, financeiras, de investimentos, saúde e
          negócios — em uma única plataforma gratuita, com tabelas oficiais atualizadas e base
          legal explícita em cada resultado.
        </p>
        <h3>Cálculos trabalhistas (CLT)</h3>
        <p>
          Calcule rescisão, férias, 13º salário, hora extra, FGTS e salário líquido seguindo a
          Consolidação das Leis do Trabalho (CLT), Lei 12.506/2011 (aviso prévio proporcional) e
          Lei 8.036/1990 (FGTS). As tabelas progressivas do INSS (Decreto 11.936/2024) e do IRRF
          (Lei 11.482/2007) são aplicadas automaticamente.
        </p>
        <h3>Impostos: IRPF, IRRF, INSS e DAS MEI</h3>
        <p>
          Compare modelos simplificado e completo no IRPF anual, simule a retenção mensal do IRRF
          com pensão e dependentes, calcule a contribuição correta do INSS para sua categoria
          (CLT, autônomo, facultativo ou MEI) e estime o DAS mensal do MEI por tipo de atividade
          (comércio, indústria, serviço).
        </p>
        <h3>Calculadoras financeiras e de investimentos</h3>
        <p>
          Faça simulações de juros compostos com aportes mensais, monte tabelas Price e SAC para
          empréstimos e financiamentos, e compare a rentabilidade líquida de CDB, Poupança e
          Tesouro Direto com IR regressivo (Lei 11.033/2004) já abatido.
        </p>
        <h3>Saúde e Negócios</h3>
        <p>
          Saiba seu IMC com a classificação da OMS, planeje sua meta calórica diária (TDEE pela
          fórmula Mifflin-St Jeor com macronutrientes) e calcule margem de lucro × markup para
          precificar produtos e serviços corretamente.
        </p>
        <p>
          Tudo gratuito, sem cadastro, com tabelas oficiais vigentes em 2026 e base legal
          verificável em cada resultado.
        </p>
      </div>
    </section>
  )
}
