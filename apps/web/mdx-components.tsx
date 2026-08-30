import type { MDXComponents } from 'mdx/types'

/**
 * Componentes globais disponíveis em todos os arquivos MDX.
 * Necessário para o Next.js App Router reconhecer os arquivos .mdx.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Estilos padrão para elementos do MDX
    h2: ({ children, ...props }) => (
      <h2 className="mt-8 scroll-mt-20 text-xl font-bold text-gray-900" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="mt-6 scroll-mt-20 text-lg font-semibold text-gray-800" {...props}>
        {children}
      </h3>
    ),
    // O wrapper rolável é o que impede a tabela de empurrar a página inteira
    // na horizontal no celular (F56). Ele só passou a funcionar quando este
    // arquivo entrou nos globs do `tailwind.config.ts` — antes disso o
    // `overflow-x-auto` era classe morta. `tabIndex`/`role`/`aria-label`
    // tornam a região rolável alcançável por teclado e anunciada por leitor
    // de tela, exigência de quem só consegue rolar com Tab.
    table: ({ children, ...props }) => (
      <div
        className="my-6 overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Tabela de referência (rolável na horizontal)"
      >
        <table className="min-w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-700"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-gray-200 px-3 py-2 text-gray-700" {...props}>
        {children}
      </td>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-brand-500 bg-brand-50 px-4 py-3 italic text-gray-700 my-4"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ...components,
  }
}
