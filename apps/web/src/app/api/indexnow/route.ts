import { NextRequest, NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? ''
const INDEXNOW_KEY_LOCATION = `https://calculosonline.com.br/${INDEXNOW_KEY}.txt`
const INDEXNOW_API = 'https://api.indexnow.org/indexnow'

export async function POST(request: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { error: 'INDEXNOW_KEY não configurada' },
      { status: 500 },
    )
  }

  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
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
