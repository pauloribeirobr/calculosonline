import { redirect } from 'next/navigation'

// Redireciona para a URL canônica usada no Footer e Sitemap
export default function PrivacidadePage() {
  redirect('/politica-de-privacidade')
}
