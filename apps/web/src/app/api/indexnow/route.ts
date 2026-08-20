import { NextRequest, NextResponse } from 'next/server'

/**
 * A chave do IndexNow é **pública por design**: o protocolo exige que ela
 * esteja legível em `/<chave>.txt` para provar a posse do domínio. Guardá-la
 * em variável de ambiente não protegia nada e criava um modo de falha
 * silencioso — se a env var e o nome do arquivo em `public/` divergissem, a
 * API rejeitava e a rota devolvia 502 sem explicar. Como constante, os dois
 * não têm como sair de sincronia.
 *
 * O segredo de verdade é o `INTERNAL_API_KEY` abaixo, que impede terceiros de
 * usarem este endpoint para submeter URLs em nome do site.
 */
const INDEXNOW_KEY = '7a2b357b3e5402cd1a0b1d9931a28185'
const INDEXNOW_KEY_LOCATION = `https://calculosonline.com.br/${INDEXNOW_KEY}.txt`
const INDEXNOW_API = 'https://api.indexnow.org/indexnow'

export async function POST(request: NextRequest) {
  const segredo = process.env.INTERNAL_API_KEY
  if (!segredo) {
    // Sem o segredo configurado o endpoint ficaria aberto; recusar explicando
    // é melhor que devolver 401 genérico e mandar procurar erro na chamada.
    return NextResponse.json(
      { error: 'INTERNAL_API_KEY não configurada no ambiente' },
      { status: 500 },
    )
  }

  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== segredo) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let urls: string[]
  try {
    const body = await request.json()
    urls = Array.isArray(body.urls) ? body.urls : [body.url]
    if (!urls || urls.length === 0) {
      return NextResponse.json(
        { error: 'Forneça ao menos uma URL' },
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const payload = {
    host: 'calculosonline.com.br',
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  }

  const response = await fetch(INDEXNOW_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  return NextResponse.json(
    { status: response.status, urls },
    { status: response.ok ? 200 : 502 },
  )
}
