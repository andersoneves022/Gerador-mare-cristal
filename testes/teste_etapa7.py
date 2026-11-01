#!/usr/bin/env python3
"""Testes automáticos da Etapa 7 (VID-01 · Capa de Reel e VID-02 · Texto sobre vídeo).
Registro na tela Criar, variações (escurecimento), formatos, renderização, edição, persistência e reabertura,
validações de texto, enquadramento e D-01, recortes 3:4/4:5 fora do arquivo, exportação PNG/JPEG,
PNG transparente do VID-02, tempos em CSV/JSON, prévia = arquivo e projetos antigos.
Uso: APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa7.py
Requer: Python + Playwright (Chromium) + Pillow, servidor já em execução e as 4 fontes em public/fonts/."""
import base64, csv, io, json, os, sys, tempfile, zipfile
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('APP_URL', 'http://localhost:8080/')
MODULOS = os.environ.get('APP_MODULOS', '/src/legacy/')
LIMA, ESPUMA, OCEANO = (198, 240, 0), (244, 250, 249), (10, 79, 96)
falhas, total = [], 0

def ok(cond, nome, detalhe=''):
    global total
    total += 1
    print(('OK    ' if cond else 'FALHA ') + nome + (f'  [{detalhe}]' if detalhe and not cond else ''))
    if not cond: falhas.append(nome)

def foto(caminho, w, h, s):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(0, h, 8): d.rectangle([0, y, w, y + 8], fill=(200 - s * 40, 180 + y * 60 // h, 120 + y * 100 // h))
    d.ellipse([w // 3, h // 3, w - w // 4, h - h // 4], fill=(230, 90 + s * 40, 60))
    im.save(caminho, 'JPEG', quality=90)

# ---------- utilitários (mesmos seletores das Etapas 4 a 6) ----------
def selo(pg): return pg.get_attribute('[data-previa]', 'data-pronto')
def apos_render(pg, fn):
    antes = selo(pg); fn()
    pg.wait_for_function("a => document.querySelector('[data-previa]').dataset.pronto !== a", arg=antes, timeout=8000)
    pg.wait_for_timeout(120)
def bloqueios(pg): return int(pg.get_attribute('[data-previa]', 'data-bloqueios'))
def avisos(pg): return int(pg.get_attribute('[data-previa]', 'data-avisos'))
def verifs(pg): return pg.inner_text('[data-verificacoes]')
def dim(pg): return pg.evaluate("() => { const c = document.querySelector('[data-previa]'); return [c.width, c.height]; }")
def salvo(pg): pg.wait_for_function("() => document.querySelector('[data-status]').textContent.startsWith('Salvo')", timeout=8000)
def digitar(pg, campo, texto): apos_render(pg, lambda: pg.fill(f'.painel [data-campo="{campo}"]', texto))
def sub(pg, i, campo, texto): apos_render(pg, lambda: pg.fill(f'[data-item-sub="{i}:{campo}"]', str(texto)))
def selecionar(pg, campo, valor): apos_render(pg, lambda: pg.select_option(f'.painel [data-campo="{campo}"]', valor))
def clicar(pg, sel): apos_render(pg, lambda: pg.click(sel))
def abrir(pg, pid):
    pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_selector('[data-previa]')
    pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(250)
def novo(pg, tid):
    pg.goto(URL + '#/criar'); pg.click(f'[data-template="{tid}"]')
    pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")
    pg.wait_for_timeout(150)
    return pg.url.split('/')[-1]
def escolher(pg, nome):
    pg.click('[data-escolher-foto="1"]'); pg.wait_for_selector('[data-seletor] [data-foto-id]')
    botao = pg.locator('[data-seletor] [data-foto-id]', has_text=nome).first
    apos_render(pg, lambda: botao.click())
def previa_img(pg):
    return Image.open(io.BytesIO(base64.b64decode(pg.evaluate("() => document.querySelector('[data-previa]').toDataURL('image/png').split(',')[1]"))))
def pixel(pg, x, y):
    return tuple(pg.evaluate("([x,y]) => [...document.querySelector('[data-previa]').getContext('2d').getImageData(x,y,1,1).data]", [x, y]))
def perto(a, b, tol=40): return all(abs(int(x) - int(y)) <= tol for x, y in zip(a, b))
def registro(pg, pid): return pg.evaluate(f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")

B64 = "const b = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768)); return btoa(s);"
JS_RENDER = """async ([M, id, tipo, idx]) => {
  const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js');
  const p = await P.obterProjeto(id); const partes = E.partesDoProjeto(p);
  const parte = idx == null ? null : partes[idx];
  try { const r = await E.renderizarProjeto(p, tipo, parte); const blob = r.blob;
    const dados = await (async () => { """ + B64 + """ })();
    return { ok: true, mime: blob.type, dados };
  } catch (e) { return { ok: false, erro: e.mensagemUsuario ?? String(e) }; } }"""
JS_PLANO = """async ([M, ids, op]) => { const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js');
  const ps = []; for (const id of ids) ps.push(await P.obterProjeto(id)); return E.planejar(ps, op).map(x => x.caminho); }"""
JS_EXPORTAR = """async ([M, ids, op]) => {
  const E = await import(M + 'exportar/exportador.js'); const r = await E.exportar(ids, op);
  let dados = null; if (r.zip) { const blob = r.zip; dados = await (async () => { """ + B64 + """ })(); }
  return { nomes: r.arquivos.map(a => a.nome), erros: r.erros, nomeZip: r.nomeZip, dados }; }"""
JS_SNAP = """async (M) => { const S = await import(M + 'storage/index.js');
  const ps = await S.repo.listar('projetos'); const fs = await S.repo.listar('fotos');
  return JSON.stringify({ ps: ps.map(p => [p.id, p.atualizadoEm, JSON.stringify(p.campos), JSON.stringify(p.enquadramentos), p.fotoId]).sort(),
    fs: fs.map(f => [f.id, f.atualizadoEm, f.largura, f.altura]).sort() }); }"""
def img(r): return Image.open(io.BytesIO(base64.b64decode(r['dados'])))
def texto(r): return base64.b64decode(r['dados']).decode('utf-8')

def main():
    tmp = tempfile.mkdtemp(); cam = []
    for k, (w, h, s) in {'r7a': (2400, 4000, 0), 'r7b': (3200, 2400, 1), 'r7p': (900, 1600, 2)}.items():
        cam.append(f'{tmp}/{k}.jpg'); foto(cam[-1], w, h, s)
    erros = []
    with sync_playwright() as p:
        nav = p.chromium.launch(); ctx = nav.new_context(viewport={'width': 1400, 'height': 1000}, accept_downloads=True); pg = ctx.new_page()
        pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' and 'Exportação' not in m.text else None)
        pg.on('pageerror', lambda e: erros.append(str(e)))
        executar(pg, cam)
        ok(not erros, 'nenhum erro inesperado de console/página', ' | '.join(erros[:3]))
        nav.close()
    print(f'\n{total - len(falhas)} de {total} verificações passaram.')
    sys.exit(1 if falhas else 0)

def executar(pg, cam):
    pg.goto(URL); pg.wait_for_function("() => document.body.innerText.includes('Fontes: 4 de 4')", timeout=15000)
    # Os módulos importados pelo teste (APP_MODULOS) podem ser outra instância que a do app (servidor com bundle):
    # carrega as mesmas 4 fontes nessa instância para que compor() rode como no app (não conta como verificação).
    assert pg.evaluate("async (M) => { const F = await import(M + 'core/fonts.js'); if (!F.fontesCompletas()) await F.carregarFontes(); return F.fontesCompletas(); }", MODULOS), 'fontes não carregaram nos módulos do teste'
    pg.goto(URL + '#/fotografias'); pg.set_input_files('input[type=file]', cam)
    pg.wait_for_function("() => [...document.querySelectorAll('.foto')].filter(e => /r7[abp]/.test(e.textContent)).length >= 3", timeout=30000)

    # ---------- registro na tela Criar ----------
    pg.goto(URL + '#/criar'); pg.wait_for_selector('[data-template]')
    ids = [pg.get_attribute(f'.modelo:nth-child({i + 1}) [data-template]', 'data-template') for i in range(pg.locator('[data-template]').count())]
    ok(len(ids) == 13, 'Criar lista os 13 templates da Biblioteca', ids)
    ok(ids.index('VID-01') == 10 and ids.index('VID-02') == 11 and ids[-1] == 'DES-01', 'VID-01 e VID-02 na posição da Biblioteca (Vídeo, antes de Destaques)', ids)
    ok(pg.locator('[data-biblioteca-completa]').count() == 1 and 'Próximos modelos' not in pg.inner_text('.principal__corpo'), 'não há mais "próximos modelos" pendentes')
    fichas = pg.evaluate("async (M) => { const T = await import(M + 'render/templates/index.js'); return Object.fromEntries(['VID-01','VID-02'].map(id => { const f = T.obterFicha(id); return [id, { formatos: f.formatos, niveis: f.escurecimento.niveis, padrao: f.escurecimento.padrao, logo: f.logo, campos: f.campos.map(c => c.id) }]; })); }", MODULOS)
    ok(fichas['VID-01']['formatos'] == ['reels'] and fichas['VID-02']['formatos'] == ['reels', 'stories'], 'formatos: VID-01 só Reels; VID-02 Reels e Stories com vídeo', fichas)
    ok(all(fichas[t]['niveis'] == ['nenhum', 'suave', 'intenso'] and fichas[t]['padrao'] == 'suave' and fichas[t]['logo'] is False for t in fichas), 'variações de escurecimento Nenhum/Suave/Intenso, padrão Suave, sem logotipo')
    ok(not any(c in fichas['VID-01']['campos'] for c in ['chamada', 'logotipo', 'apoio']), 'VID-01 sem chamada, apoio ou logotipo (Ficha §14.3)')

    # ================= VID-01 · Capa de Reel =================
    pid1 = novo(pg, 'VID-01')
    ok(dim(pg) == [1080, 1920] and pg.locator('button[data-formato]').count() == 0, 'VID-01: 1080 × 1920, só Reels')
    ok(bloqueios(pg) >= 2, 'VID-01 sem quadro e sem título: bloqueia (obrigatórios)')
    escolher(pg, 'r7a'); digitar(pg, 'titulo', 'Uma volta pelo Pico da Tribo')
    ok(bloqueios(pg) == 0, 'VID-01 com quadro real da biblioteca e título: sem bloqueios', verifs(pg))
    ok(pg.is_visible('[data-guias]') and pg.locator('[data-mostrar-guias]').is_checked(), 'VID-01: prévia do recorte (grade 3:4 e Feed 4:5) visível')
    salvo(pg)  # lê o projeto gravado: aguarda o salvamento do editor
    cmds = pg.evaluate("async (M) => { const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js'); const Mo = await import(M + 'render/motor.js'); const I = await import(M + 'render/imagens.js'); const p = await P.obterProjeto(location.hash.split('/').pop()); const d = E.dadosDoProjeto(p); const rec = await I.prepararRecursos([d.fotoId]); const c = Mo.compor(d, rec); return c.comandos.filter(x => x.t === 'texto').map(x => ({ x: x.x, y: x.y, h: x.linhas.length * x.lh, tam: x.tam, cor: x.cor, linhas: x.linhas.length })); }", MODULOS)
    tit, tag = cmds[-1], cmds[0]
    ok(len(cmds) == 2 and tit['x'] == 72 and tag['x'] == 72, 'VID-01: tag e título alinhados à esquerda em x = 72', cmds)
    ok(abs(tit['y'] + tit['h'] - 1580) < 1 and tag['y'] >= 250 and tag['y'] >= 240 and tit['y'] + tit['h'] <= 1680, 'VID-01: bloco com base em y = 1580, dentro da faixa 3:4 e topo ≥ 250', cmds)
    ok(80 <= tit['tam'] <= 104 and tag['tam'] == 32, 'VID-01: título Sora 80–104 px; tag Inter 32 px', cmds)
    ok(tag['cor'] == '#C6F000', 'VID-01: tag em lima sobre escurecimento')
    p_suave = pixel(pg, 1060, 1900)
    selecionar(pg, 'escurecimento', 'intenso'); p_int = pixel(pg, 1060, 1900)
    selecionar(pg, 'escurecimento', 'nenhum'); p_nen = pixel(pg, 1060, 1900)
    ok(sum(p_int[:3]) < sum(p_suave[:3]) < sum(p_nen[:3]), 'VID-01: Nenhum, Suave e Intenso escurecem a base em ordem crescente', (p_nen, p_suave, p_int))
    ok(any('contraste' in t for t in [verifs(pg)]) and bloqueios(pg) == 0, 'VID-01 sem escurecimento: aviso de contraste, sem bloqueio')
    salvo(pg)
    tagcor = pg.evaluate("async (M) => { const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js'); const Mo = await import(M + 'render/motor.js'); const I = await import(M + 'render/imagens.js'); const p = await P.obterProjeto(location.hash.split('/').pop()); const d = E.dadosDoProjeto(p); const c = Mo.compor(d, await I.prepararRecursos([d.fotoId])); return c.comandos.filter(x => x.t === 'texto')[0].cor; }", MODULOS)
    ok(tagcor == '#F4FAF9', 'VID-01: com nível Nenhum, a tag não é lima (Espuma)', tagcor)
    selecionar(pg, 'escurecimento', 'suave')
    digitar(pg, 'titulo', 'Uma volta muito longa pelo Pico da Tribo e por todas as praias escondidas do litoral catarinense até o fim da tarde de verão')
    ok(bloqueios(pg) >= 1 and 'não cabe' in verifs(pg), 'VID-01: título que não cabe entre y = 250 e 1580 bloqueia (fonte nunca abaixo de 80)')
    digitar(pg, 'titulo', 'Uma volta pelo Pico da Tribo')
    digitar(pg, 'tag', 'Praia do Rosa · Imbituba · Santa Catarina · Brasil · América do Sul')
    ok(bloqueios(pg) == 0 and avisos(pg) >= 1, 'VID-01: tag opcional longa só gera aviso')
    digitar(pg, 'tag', 'Praia do Rosa · SC')
    # D-01 revisada: foto pequena gera aviso de ampliação, sem bloqueio; zoom limitado à resolução
    escolher(pg, 'r7p')
    ok(bloqueios(pg) == 0 and 'ampliação' in verifs(pg), 'VID-01 D-01: quadro de 900 × 1600 (120%) gera aviso de ampliação, sem bloqueio')
    escolher(pg, 'r7a')
    zmax = float(pg.get_attribute('[data-zoom]', 'max'))
    ok(abs(zmax - min(2400 / 1080, 4000 / 1920)) < 0.02, 'VID-01 D-01: zoom máximo = limite de resolução (quadro 2400 × 4000: 4000 / 1920)', zmax)
    apos_render(pg, lambda: pg.fill('[data-zoom]', '1.5'))
    apos_render(pg, lambda: (pg.focus('[data-previa]'), pg.keyboard.press('ArrowLeft')))
    salvo(pg)
    reg = registro(pg, pid1)
    ok(abs(reg['enquadramentos']['reels']['zoom'] - 1.5) < 1e-6, 'VID-01: enquadramento salvo no IndexedDB', reg['enquadramentos'])
    previa1 = previa_img(pg).convert('RGB')
    abrir(pg, pid1)
    ok(pg.input_value('.painel [data-campo="titulo"]') == 'Uma volta pelo Pico da Tribo' and float(pg.input_value('[data-zoom]')) == 1.5, 'VID-01: reabrir mantém título e enquadramento')
    ok(ImageChops.difference(previa1, previa_img(pg).convert('RGB')).getbbox() is None, 'VID-01: reabrir reproduz a mesma arte')
    r = pg.evaluate(JS_RENDER, [MODULOS, pid1, 'png', None]); im = img(r)
    ok(r['ok'] and im.format == 'PNG' and im.size == (1080, 1920), 'VID-01: exporta PNG 1080 × 1920', r.get('erro'))
    ok(im.mode in ('RGB', 'RGBA') and im.convert('RGBA').getextrema()[3] == (255, 255), 'VID-01: PNG opaco (Ficha §14.15)')
    ok(ImageChops.difference(previa_img(pg).convert('RGB'), im.convert('RGB')).getbbox() is None, 'VID-01: arquivo idêntico, pixel a pixel, à prévia (guias de recorte fora do arquivo)')
    r = pg.evaluate(JS_RENDER, [MODULOS, pid1, 'jpeg', None]); im = img(r)
    ok(r['ok'] and im.format == 'JPEG' and im.size == (1080, 1920), 'VID-01: exporta JPEG 1080 × 1920')
    pl1 = pg.evaluate(JS_PLANO, [MODULOS, [pid1], {'tipo': 'png'}])
    ok(len(pl1) == 1 and pl1[0].endswith('-reels.png'), 'VID-01: um arquivo por peça, como antes', pl1)

    # ================= VID-02 · Texto sobre vídeo =================
    pid2 = novo(pg, 'VID-02')
    ok(dim(pg) == [1080, 1920] and pg.locator('button[data-formato]').count() == 2, 'VID-02: 1080 × 1920 em Reels e Stories com vídeo')
    ok(bloqueios(pg) == 0, 'VID-02 com a entrada padrão: sem bloqueios (fotografia de referência é opcional)', verifs(pg))
    ok('referência' in verifs(pg) and 'rostos' in verifs(pg), 'VID-02: avisos de foto de referência e de rostos (verificação humana)')
    escolher(pg, 'r7b')
    ok(bloqueios(pg) == 0, 'VID-02: foto real da biblioteca como referência')
    sub(pg, 0, 'titulo', 'No mesmo quarteirão'); sub(pg, 0, 'legenda', 'A 200 m da areia'); sub(pg, 0, 'tag', 'Praia do Rosa · SC')
    ok(bloqueios(pg) == 0, 'VID-02: título, legenda e tag juntos cabem', verifs(pg))
    pg.click('[data-adicionar-item="entradas"]'); pg.wait_for_selector('[data-item-sub="1:titulo"]'); pg.wait_for_timeout(200)
    ok(bloqueios(pg) >= 1, 'VID-02: nova entrada vazia bloqueia (sem texto e sem tempos)')
    sub(pg, 1, 'legenda', 'Café da manhã na varanda'); sub(pg, 1, 'inicio', '4'); sub(pg, 1, 'fim', '6.5')
    ok(bloqueios(pg) == 0, 'VID-02: segunda entrada só com legenda e tempos válidos', verifs(pg))
    h1 = previa_img(pg).convert('RGB'); digitar(pg, 'entradaAtiva', '2')
    ok(ImageChops.difference(h1, previa_img(pg).convert('RGB')).getbbox() is not None, 'VID-02: a prévia mostra a entrada escolhida')
    sub(pg, 1, 'legenda', 'Café na varanda e o mar')
    h2 = previa_img(pg).convert('RGB'); ok(h2 is not None and bloqueios(pg) == 0, 'VID-02: editar o texto atualiza a prévia na hora')
    # legenda: Oceano a 60% (pílula) e texto Espuma; posição base 1580
    salvo(pg)  # lê o projeto gravado: aguarda o salvamento do editor
    cmds = pg.evaluate("async (M) => { const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js'); const Mo = await import(M + 'render/motor.js'); const p = await P.obterProjeto(location.hash.split('/').pop()); const d = E.dadosDoProjeto(p); d.campos = { ...d.campos, entradaAtiva: 1 }; d.sobreposicao = true; const c = Mo.compor(d, { imagem: null, imagens: {} }); return c.comandos.map(x => ({ t: x.t, x: x.x, y: x.y, w: x.w, h: x.h, alpha: x.alpha, cor: x.cor, tam: x.tam, lh: x.lh, n: x.linhas?.length, est: x.est?.familia })); }", MODULOS)
    txt = [c for c in cmds if c['t'] == 'texto']; caixa = [c for c in cmds if c['t'] == 'caixa']
    ok(len(txt) == 3 and txt[0]['cor'] == '#C6F000' and txt[1]['est'] == 'Sora' and txt[2]['est'] == 'Inter', 'VID-02: ordem tag (lima) · título (Sora) · legenda (Inter)', txt)
    ok(len(caixa) == 1 and caixa[0]['cor'] == '#0A4F60' and abs(caixa[0]['alpha'] - 0.6) < 1e-9, 'VID-02: legenda em pílula Oceano a 60%', caixa)
    ok(abs(caixa[0]['y'] + caixa[0]['h'] - 1580) < 1.01 and all(c['x'] >= 72 for c in txt) and txt[0]['y'] >= 250, 'VID-02: âncora embaixo à esquerda, base em y = 1580, dentro da zona útil', cmds)
    ok(80 <= txt[1]['tam'] <= 104 and txt[0]['tam'] >= 32 and txt[2]['tam'] >= 32, 'VID-02: título 80–104 px; tag e legenda ≥ 32 px')
    ok(any(c['t'] == 'gradiente' for c in cmds), 'VID-02: escurecimento suave da entrada incluído')
    # validações de texto
    sub(pg, 0, 'titulo', 'Um título comprido demais para caber em apenas duas linhas no Reel vertical')
    ok(bloqueios(pg) >= 1 and '2 linhas' in verifs(pg), 'VID-02: título com mais de 2 linhas bloqueia')
    sub(pg, 0, 'titulo', 'No mesmo quarteirão')
    sub(pg, 0, 'legenda', 'Uma legenda que passa bastante dos sessenta caracteres previstos na ficha')
    ok(bloqueios(pg) >= 1 and '60' in verifs(pg), 'VID-02: legenda acima de 60 caracteres bloqueia')
    sub(pg, 0, 'legenda', 'A 200 m da areia')
    sub(pg, 0, 'tag', 'Praia do Rosa · Imbituba · Santa Catarina')
    ok(bloqueios(pg) == 0 and 'referência' in verifs(pg), 'VID-02: tag acima de 28 caracteres só avisa')
    sub(pg, 0, 'tag', 'Praia do Rosa · SC')
    # validações de tempo
    sub(pg, 0, 'fim', '1.9'); ok(bloqueios(pg) >= 1 and '1,5 a 3' in verifs(pg), 'VID-02: texto com menos de 1,5 s na tela bloqueia')
    sub(pg, 0, 'fim', '4.5'); ok(bloqueios(pg) >= 1 and '1,5 a 3' in verifs(pg), 'VID-02: texto com mais de 3 s na tela bloqueia')
    sub(pg, 0, 'fim', '3.5'); ok(bloqueios(pg) == 0, 'VID-02: 2,5 s na tela é aceito')
    sub(pg, 1, 'inicio', '3'); sub(pg, 1, 'fim', '5')
    ok(bloqueios(pg) == 0 and 'mesmo tempo' in verifs(pg), 'VID-02: entradas sobrepostas no tempo geram aviso')
    sub(pg, 1, 'inicio', '4'); sub(pg, 1, 'fim', '6.5')
    digitar(pg, 'duracao', '7')
    ok(bloqueios(pg) >= 1 and 'tela final' in verifs(pg), 'VID-02: texto que invade a tela final (últimos 1,5 s) bloqueia')
    digitar(pg, 'duracao', '35'); ok(bloqueios(pg) >= 1 and 'entre 7 e 30' in verifs(pg), 'VID-02: duração total acima de 30 s bloqueia')
    digitar(pg, 'duracao', '6'); ok(bloqueios(pg) >= 1 and 'entre 7 e 30' in verifs(pg), 'VID-02: duração total abaixo de 7 s bloqueia')
    digitar(pg, 'duracao', '12'); ok(bloqueios(pg) == 0, 'VID-02: duração de 12 s com tela final em 10,5 s é aceita', verifs(pg))
    # prévia: sobre a foto ou só a sobreposição
    digitar(pg, 'entradaAtiva', '1')
    ok(pixel(pg, 540, 100)[3] == 255, 'VID-02: prévia sobre a fotografia de referência')
    selecionar(pg, 'previa', 'sobreposicao')
    ok(pixel(pg, 540, 100)[3] == 0, 'VID-02: prévia "só a sobreposição" é transparente fora dos elementos')
    salvo(pg)
    previa_sob = previa_img(pg)
    # persistência e reabertura
    reg2 = registro(pg, pid2)
    ok(len(reg2['campos']['entradas']) == 2 and reg2['campos']['entradas'][1]['legenda'] == 'Café na varanda e o mar' and reg2['campos']['entradas'][1]['fim'] == 6.5, 'VID-02: entradas, textos e tempos salvos no IndexedDB', reg2['campos'])
    ok(reg2['campos']['duracao'] == 12 and reg2['campos']['previa'] == 'sobreposicao' and reg2['fotoId'], 'VID-02: duração, modo de prévia e foto de referência salvos')
    abrir(pg, pid2)
    ok(pg.input_value('[data-item-sub="1:legenda"]') == 'Café na varanda e o mar' and pg.input_value('[data-item-sub="0:fim"]') == '3.5' and pg.input_value('.painel [data-campo="duracao"]') == '12', 'VID-02: reabrir mantém entradas, tempos e duração')
    ok(ImageChops.difference(previa_sob, previa_img(pg)).getbbox() is None, 'VID-02: reabrir reproduz a mesma sobreposição')

    # exportação
    plano = pg.evaluate(JS_PLANO, [MODULOS, [pid2], {'tipo': 'jpeg'}])
    base = plano[0].split('/')[0]
    ok(len(plano) == 4 and plano[0].endswith('-reels-sobreposicao-01.png') and plano[1].endswith('-sobreposicao-02.png') and plano[2].endswith('-tempos.csv') and plano[3].endswith('-tempos.json'), 'VID-02: plano com 1 PNG por entrada + tempos CSV e JSON, na pasta do projeto', plano)
    r = pg.evaluate(JS_RENDER, [MODULOS, pid2, 'jpeg', 0]); im = img(r)
    ok(r['ok'] and im.format == 'PNG' and im.size == (1080, 1920) and im.mode == 'RGBA', 'VID-02: sobreposição é PNG RGBA 1080 × 1920 mesmo com JPEG escolhido', (r.get('erro'), im.format, im.mode))
    a = im.getchannel('A')
    ok(a.getpixel((540, 100)) == 0 and a.getpixel((540, 900)) == 0, 'VID-02: transparente acima do escurecimento (sem fotografia no PNG)')
    ok(0 < a.getpixel((1060, 1900)) < 255, 'VID-02: escurecimento semitransparente na base')
    ok(ImageChops.difference(previa_sob, im).getbbox() is None, 'VID-02: PNG idêntico, pixel a pixel (com transparência), à prévia "só a sobreposição"')
    ok(max(a.crop((72, 1300, 1008, 1580)).getdata()) == 255, 'VID-02: textos opacos na zona do bloco')
    r2 = pg.evaluate(JS_RENDER, [MODULOS, pid2, 'png', 1]); im2 = img(r2)
    ok(r2['ok'] and ImageChops.difference(im, im2).getbbox() is not None, 'VID-02: cada entrada gera seu próprio PNG')
    rc = pg.evaluate(JS_RENDER, [MODULOS, pid2, 'png', 2]); linhas = list(csv.reader(io.StringIO(texto(rc).lstrip('\ufeff'))))
    ok(rc['ok'] and rc['mime'].startswith('text/csv') and linhas[0] == ['entrada', 'arquivo', 'texto', 'inicio', 'termino', 'duracao'], 'CSV de tempos: cabeçalho entrada, arquivo, texto, início, término, duração', linhas[:1])
    ok(linhas[1] == ['1', plano[0].split('/')[-1], 'No mesmo quarteirão / A 200 m da areia / Praia do Rosa · SC', '1.0', '3.5', '2.5'], 'CSV: linha da entrada 1 com nome do PNG, texto e tempos', linhas[1])
    ok(linhas[2] == ['2', plano[1].split('/')[-1], 'Café na varanda e o mar', '4.0', '6.5', '2.5'], 'CSV: linha da entrada 2', linhas[2])
    ok(linhas[3] == ['3', 'tela-final.png', 'Tela final (COM-02)', '10.5', '12.0', '1.5'] and len(linhas) == 4, 'CSV: última linha é a tela final de 1,5 s', linhas[3:])
    rj = pg.evaluate(JS_RENDER, [MODULOS, pid2, 'png', 3]); js = json.loads(texto(rj))
    ok(js['template'] == 'VID-02' and js['duracaoTotal'] == 12 and js['unidade'] == 's' and len(js['entradas']) == 3, 'JSON de tempos: template, duração total, unidade e entradas', js)
    ok(js['entradas'][0]['arquivo'] == linhas[1][1] and js['entradas'][0]['elementos']['legenda'] == 'A 200 m da areia' and js['entradas'][-1].get('telaFinal') is True, 'JSON: mesmos arquivos do CSV, elementos por entrada e tela final no fim')
    # Stories com vídeo
    pg.click('button[data-formato="stories"]'); pg.wait_for_timeout(600)
    ok(dim(pg) == [1080, 1920] and bloqueios(pg) == 0 and not pg.is_visible('[data-guias]'), 'VID-02 Stories: 1080 × 1920, sem pendências (zonas de Stories; grade 3:4 só no Reels)')
    salvo(pg)
    plano_s = pg.evaluate(JS_PLANO, [MODULOS, [pid2], {'tipo': 'png'}])
    ok(plano_s[0].endswith('-stories-sobreposicao-01.png'), 'VID-02 Stories: arquivos identificados pelo formato', plano_s)
    pg.click('button[data-formato="reels"]'); pg.wait_for_timeout(600); salvo(pg)
    # ZIP com o VID-01 e o VID-02, sem alterar nada no banco
    snap = pg.evaluate(JS_SNAP, MODULOS)
    rz = pg.evaluate(JS_EXPORTAR, [MODULOS, [pid1, pid2], {'tipo': 'png', 'modo': 'pecas'}])
    z = zipfile.ZipFile(io.BytesIO(base64.b64decode(rz['dados']))); nomes = z.namelist()
    ok(len(nomes) == 5 and not rz['erros'] and z.testzip() is None, 'ZIP: capa VID-01 + 2 sobreposições + CSV + JSON, íntegro', (nomes, rz['erros']))
    ok(Image.open(z.open(nomes[1])).mode == 'RGBA' and Image.open(z.open(nomes[0])).size == (1080, 1920), 'ZIP: sobreposições transparentes e capa 1080 × 1920')
    ok(pg.evaluate(JS_SNAP, MODULOS) == snap, 'exportar não altera projetos nem fotografias no IndexedDB')
    # pendência impede exportar a entrada e os tempos
    pg.evaluate("async ([M, id]) => { const P = await import(M + 'projetos/projetos.js'); const p = await P.obterProjeto(id); await P.salvarProjeto(id, { campos: { ...p.campos, duracao: 40 } }); }", [MODULOS, pid2])
    rb = pg.evaluate(JS_EXPORTAR, [MODULOS, [pid2], {'tipo': 'png', 'modo': 'pecas'}])
    ok(not rb['nomes'] and len(rb['erros']) == 4 and 'pendências' in rb['erros'][0]['texto'], 'VID-02 com pendência: nenhum PNG nem arquivo de tempos é gerado', rb)
    pg.evaluate("async ([M, id]) => { const P = await import(M + 'projetos/projetos.js'); const p = await P.obterProjeto(id); await P.salvarProjeto(id, { campos: { ...p.campos, duracao: 12 } }); }", [MODULOS, pid2])
    # tela Exportar mostra os arquivos do VID-02
    pg.goto(URL + f'#/exportar/{pid2}'); pg.wait_for_selector('[data-exportar-projeto]'); pg.wait_for_timeout(400)
    resumo = pg.inner_text('.exportar')
    ok('sobreposições em PNG transparente' in resumo and 'tempos.csv' in resumo and 'tempos.json' in resumo, 'tela Exportar: resumo lista as sobreposições e os tempos do VID-02')

    # ---------- compatibilidade com projetos antigos ----------
    fa = pg.evaluate("async (M) => { const m = await import(M + 'biblioteca/fotos.js'); return (await m.listarFotos()).find(x => x.nomeOriginal.includes('r7a')).id; }", MODULOS)
    antigo = pg.evaluate("""async ([M, foto]) => { const S = await import(M + 'storage/index.js');
      const p = await S.repo.inserir('projetos', { nome: 'Capa 0.0.4', tipo: 'peca', estado: 'rascunho', situacao: 'ativo', templateId: 'VID-01', formato: 'reels',
        campos: { titulo: 'Capa antiga', tag: 'Praia do Rosa · SC', escurecimento: 'intenso' }, fotoId: foto, fotoIds: [foto], enquadramentos: { reels: { zoom: 1.3, cx: 0.5, cy: 0.45 } }, motorVersao: 1 }); return p.id; }""", [MODULOS, fa])
    abrir(pg, antigo)
    ok(bloqueios(pg) == 0 and pg.input_value('.painel [data-campo="escurecimento"]') == 'intenso' and float(pg.input_value('[data-zoom]')) == 1.3, 'VID-01 gravado na 0.0.4 abre igual (texto, escurecimento e enquadramento)')
    ra = pg.evaluate(JS_RENDER, [MODULOS, antigo, 'png', None])
    ok(ra['ok'] and ImageChops.difference(previa_img(pg).convert('RGB'), img(ra).convert('RGB')).getbbox() is None, 'VID-01 antigo: exporta idêntico à prévia')
    ok(registro(pg, antigo)['enquadramentos']['reels']['zoom'] == 1.3, 'VID-01 antigo: registro preservado')
    # Templates anteriores continuam com um arquivo por peça
    fot = pg.evaluate("async (M) => { const P = await import(M + 'projetos/projetos.js'); const p = await P.criarProjeto('FOT-01'); return p.id; }", MODULOS)
    pf = pg.evaluate(JS_PLANO, [MODULOS, [fot], {'tipo': 'png'}])
    ok(len(pf) == 1 and pf[0].endswith('-feed.png'), 'FOT-01: exportação inalterada (um arquivo por peça)', pf)

if __name__ == '__main__':
    main()
