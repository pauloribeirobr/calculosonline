#!/usr/bin/env python3
"""Folha de conferência: quadros de um vídeo nos instantes pedidos, dois por linha, com o tempo escrito.

Para a regra do AGENTS.md §2.3, "Nenhum dado pessoal legível na tela" (13/11/2026): "Antes de entregar, conferir nos
quadros cada momento em que um desses dados entraria". Cada quadro sai com 960 px de largura (metade do 1080p), o
bastante para ver se um CPF está em pontos; para ler um texto pequeno (a prévia, os cartões da home), pedir o quadro
inteiro com --largura 1920 e um instante por folha.

Uso:  python3 -I folha-conferir.py <vídeo> <saída.jpg> <t1> <t2> …   (t em segundos ou m:ss)
      opções: --largura 960 (de cada quadro), --colunas 2
"""
import os
import subprocess
import sys
import tempfile

FONTE = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'


def segundos(t):
    if ':' in t:
        m, s = t.split(':')
        return int(m) * 60 + float(s)
    return float(t)


args = sys.argv[1:]
largura, colunas = 960, 2
for nome in ('--largura', '--colunas'):
    if nome in args:
        i = args.index(nome)
        valor = int(args[i + 1])
        del args[i:i + 2]
        if nome == '--largura':
            largura = valor
        else:
            colunas = valor
video, saida, tempos = args[0], args[1], [segundos(t) for t in args[2:]]
with tempfile.TemporaryDirectory() as tmp:
    quadros = []
    for n, t in enumerate(tempos):
        q = os.path.join(tmp, f'{n:03d}.png')
        rotulo = f'{int(t // 60)}\\:{t % 60:04.1f}'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', f'{t:.3f}', '-i', video,
                        '-frames:v', '1', '-vf', f"scale={largura}:-2,drawtext=fontfile={FONTE}:text='{rotulo}':"
                        f"x=8:y=8:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.8:boxborderw=6", q], check=True)
        quadros.append(q)
    while len(quadros) % colunas:
        quadros.append(quadros[-1])  # completa a última linha repetindo o último quadro
    entradas = [x for q in quadros for x in ('-i', q)]
    linhas = []
    for r in range(len(quadros) // colunas):
        ids = ''.join(f'[{r * colunas + c}]' for c in range(colunas))
        linhas.append(f'{ids}hstack=inputs={colunas}[l{r}]' if colunas > 1 else f'{ids}copy[l{r}]')
    n = len(linhas)
    grafo = ';'.join(linhas) + (';' + ''.join(f'[l{r}]' for r in range(n)) + f'vstack=inputs={n}[v]' if n > 1 else ';[l0]copy[v]')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *entradas, '-filter_complex', grafo,
                    '-map', '[v]', '-q:v', '3', saida], check=True)
print(f'{saida}: {len(tempos)} quadro(s)')
