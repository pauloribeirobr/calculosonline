import { describe, it, expect } from 'vitest'
import {
  PORTARIAS_ANUAIS,
  calcularPascoa,
  feriadosDoCalendario,
  listarFeriados,
  proximoFeriado,
} from '../feriados'

describe('calcularPascoa', () => {
  it.each([
    [2000, '2000-04-23'],
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    // Os extremos do calendário gregoriano: a mais tardia e a mais cedo.
    [2038, '2038-04-25'],
    [2285, '2285-03-22'],
  ])('Páscoa de %i é %s', (ano, esperado) => {
    expect(calcularPascoa(ano)).toBe(esperado)
  })
})

describe('listarFeriados — conferido contra a fonte oficial', () => {
  it('2026 bate data a data com o art. 1º da Portaria MGI nº 11.460/2025', () => {
    // Transcrito do DOU de 30/12/2025, seção 1, p. 59. É a única lista
    // oficial do ano: se a lei mudar, este teste é o que avisa.
    const portaria = [
      ['2026-01-01', 'Confraternização Universal'],
      ['2026-04-03', 'Paixão de Cristo'],
      ['2026-04-21', 'Tiradentes'],
      ['2026-05-01', 'Dia Mundial do Trabalho'],
      ['2026-09-07', 'Independência do Brasil'],
      ['2026-10-12', 'Nossa Senhora Aparecida'],
      ['2026-11-02', 'Finados'],
      ['2026-11-15', 'Proclamação da República'],
      ['2026-11-20', 'Dia Nacional de Zumbi e da Consciência Negra'],
      ['2026-12-25', 'Natal'],
    ]
    expect(listarFeriados(2026).map((f) => [f.data, f.nome])).toEqual(portaria)
  })

  it('os facultativos calculados de 2026 estão todos na portaria', () => {
    const daPortaria = new Set(PORTARIAS_ANUAIS[2026]?.facultativos.map((f) => f.data))
    const calculados = listarFeriados(2026, { incluirFacultativos: true }).filter(
      (f) => f.tipo === 'facultativo',
    )
    expect(calculados.map((f) => f.data)).toEqual(['2026-02-16', '2026-02-17', '2026-06-04'])
    for (const f of calculados) expect(daPortaria.has(f.data)).toBe(true)
  })

  it('2027: datas móveis da Páscoa de 28/03', () => {
    const datas = Object.fromEntries(
      listarFeriados(2027, { incluirFacultativos: true }).map((f) => [f.nome, f.data]),
    )
    expect(datas['Segunda-feira de Carnaval']).toBe('2027-02-08')
    expect(datas['Terça-feira de Carnaval']).toBe('2027-02-09')
    expect(datas['Paixão de Cristo']).toBe('2027-03-26')
    expect(datas['Corpus Christi']).toBe('2027-05-27')
  })

  it('o 20 de novembro só é feriado a partir de 2024 (Lei 14.759, de 21/12/2023)', () => {
    expect(listarFeriados(2023).some((f) => f.data === '2023-11-20')).toBe(false)
    expect(listarFeriados(2024).some((f) => f.data === '2024-11-20')).toBe(true)
    expect(listarFeriados(2023)).toHaveLength(9)
    expect(listarFeriados(2024)).toHaveLength(10)
  })

  it('marca os que caem no fim de semana — em 2027 são três, todos no sábado', () => {
    const fds = listarFeriados(2027).filter((f) => f.fimDeSemana)
    expect(fds.map((f) => f.data)).toEqual(['2027-05-01', '2027-11-20', '2027-12-25'])
    expect(fds.every((f) => f.diaSemana === 'sábado')).toBe(true)
  })

  it('todo feriado cita a lei com link para o texto oficial', () => {
    for (const f of listarFeriados(2026, { incluirFacultativos: true })) {
      expect(f.fundamento).not.toBe('')
      expect(f.fonteUrl).toMatch(/^https:\/\/www\.(planalto\.gov\.br|in\.gov\.br)\//)
    }
  })

  it('fora do intervalo suportado devolve lista vazia', () => {
    expect(listarFeriados(999)).toEqual([])
    expect(listarFeriados(2026.5)).toEqual([])
  })

  it('o calendário "nenhum" não devolve feriado', () => {
    expect(feriadosDoCalendario(2026, 'nenhum')).toEqual([])
    expect(feriadosDoCalendario(2026, 'nacionais')).toHaveLength(10)
    expect(feriadosDoCalendario(2026, 'nacionais-facultativos')).toHaveLength(13)
  })
})

describe('proximoFeriado', () => {
  it('devolve o próximo feriado e quantos dias faltam', () => {
    const r = proximoFeriado('2026-10-04')
    expect(r?.feriado.nome).toBe('Nossa Senhora Aparecida')
    expect(r?.diasAte).toBe(8)
  })

  it('no próprio dia, o feriado é hoje', () => {
    expect(proximoFeriado('2026-12-25')?.diasAte).toBe(0)
  })

  it('depois do Natal, atravessa para o ano seguinte', () => {
    const r = proximoFeriado('2026-12-26')
    expect(r?.feriado.data).toBe('2027-01-01')
    expect(r?.diasAte).toBe(6)
  })

  it('com facultativos, o Carnaval entra na fila', () => {
    expect(proximoFeriado('2026-02-02', { incluirFacultativos: true })?.feriado.data).toBe(
      '2026-02-16',
    )
    expect(proximoFeriado('2026-02-02')?.feriado.data).toBe('2026-04-03')
  })

  it('data inválida devolve null', () => {
    expect(proximoFeriado('2026-02-30')).toBeNull()
  })
})
