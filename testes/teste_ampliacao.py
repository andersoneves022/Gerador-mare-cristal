#!/usr/bin/env python3
"""Testes do ajuste da regra D-01 (ampliação fotográfica): avisos por nível em vez de bloqueio,
confirmação por peça acima de 150% antes da exportação, prévia = arquivo e projetos antigos.
Uso: APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_ampliacao.py
Requer: Python + Playwright (Chromium) + Pillow, servidor já em execução e as 4 fontes em public/fonts/."""
import base64, io, os, sys, tempfile
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('APP_URL', 'http://localhost:8080/')
MODULOS = os.environ.get('APP_MODULOS', '/src/legacy/')
MSG = {
    'leve': 'Esta fotografia será ampliada para preencher o espaço. A qualidade poderá apresentar uma pequena redução.',
    'significativa': 'Esta fotografia precisará de ampliação significativa. Verifique a nitidez do resultado.',
    'elevada': 'A ampliação será elevada e poderá comprometer a nitidez. Confirme visualmente antes de exportar.',
}
falhas, total = [], 0

def ok(cond, nome, detalhe=''):
    global total
    total += 1
    print(('OK    ' if cond else 'FALHA ') + nome + (f'  [{detalhe}]' if detalhe and not cond else ''))
    if not cond: falhas.append(nome)

def foto(caminho, w, h, s):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(0, h, 8): d.rectangle([0, y, w, y + 8], fill=(200 - s * 30, 180 + y * 60 // h, 120 + y * 100 // h))
    d.ellipse([w // 3, h // 3, w - w // 4, h - h // 4], fill=(230, 90 + s * 30, 60))
    im.save(caminho, 'JPEG', quality=90)

def selo(pg): return pg.get_attribute('[data-previa]', 'data-pronto')
def bloqueios(pg): return int(pg.get_attribute('[data-previa]', 'data-bloqueios'))
def verifs(pg): return pg.inner_text('[data-verificacoes]')
def abrir(pg, pid):
    pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_selector('[data-previa]')
    pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(300)
def previa_img(pg):
    return Image.open(io.BytesIO(base64.b64decode(pg.evaluate("() => document.querySelector('[data-previa]').toDataURL('image/png').split(',')[1]"))))
def registro(pg, pid): return pg.evaluate(f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")

B64 = "const b = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768)); return btoa(s);"
JS_EXPORTAR = """async ([M, ids, op]) => {
  const E = await import(M + 'exportar/exportador.js'); const blobs = [];
  const r = await E.exportar(ids, { ...op, destino: 'arquivos', aoArquivo: (b) => blobs.push(b) });
  const dados = []; for (const blob of blobs) dados.push(await (async () => { """ + B64 + """ })());
  return { nomes: r.arquivos.map(a => a.nome), erros: r.erros, dados }; }"""
JS_CRIAR = """async ([M, tid, formato, campos, foto, enq]) => { const P = await import(M + 'projetos/projetos.js');
  const p = await P.criarProjeto(tid);
  await P.salvarProjeto(p.id, { formato, campos: { ...p.campos, ...campos }, fotoId: foto, fotoIds: [foto], ...(enq ? { enquadramentos: enq } : {}) });
  return p.id; }"""
JS_QUADRO = """async ([M, id]) => { const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js');
  const Mo = await import(M + 'render/motor.js'); const I = await import(M + 'render/imagens.js');
  const p = await P.obterProjeto(id); const d = E.dadosDoProjeto(p); const c = Mo.compor(d, await I.prepararRecursos([d.fotoId]));
  const q = c.quadro; return { escala: q.escalaFinal, w: q.w ?? c.largura, h: q.h ?? c.altura, fw: q.fotoLargura, fh: q.fotoAltura, zoom: q.zoom,
    bloqueios: c.bloqueios.map(b => b.texto), avisos: c.avisos.map(a => a.texto), elevadas: c.ampliacoesElevadas.length }; }"""

def main():
    tmp = tempfile.mkdtemp(); cam = []
    # a896: a fotografia real do problema; sig e alta: exigem 135% e 180% no Feed.
    for k, (w, h, s) in {'a896': (896, 1193, 0), 'sig800': (800, 1000, 1), 'alta600': (600, 800, 2)}.items():
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
    assert pg.evaluate("async (M) => { const F = await import(M + 'core/fonts.js'); if (!F.fontesCompletas()) await F.carregarFontes(); return F.fontesCompletas(); }", MODULOS), 'fontes não carregaram nos módulos do teste'
    pg.goto(URL + '#/fotografias'); pg.set_input_files('input[type=file]', cam)
    pg.wait_for_function("() => [...document.querySelectorAll('.foto')].filter(e => /a896|sig800|alta600/.test(e.textContent)).length >= 3", timeout=30000)
    fotos = pg.evaluate("async (M) => { const m = await import(M + 'biblioteca/fotos.js'); return Object.fromEntries((await m.listarFotos()).map(f => [f.nomeOriginal.split('.')[0], [f.id, f.largura, f.altura]])); }", MODULOS)
    ok(fotos['a896'][1:] == [896, 1193], 'dimensões do ORIGINAL registradas (896 × 1193)', fotos['a896'])
    fa, fs, fh = fotos['a896'][0], fotos['sig800'][0], fotos['alta600'][0]

    def caso(rotulo, tid, formato, campos, fid, nivel):
        pid = pg.evaluate(JS_CRIAR, [MODULOS, tid, formato, campos, fid, None])
        abrir(pg, pid)
        q = pg.evaluate(JS_QUADRO, [MODULOS, pid])
        esperado = max(q['w'] / q['fw'], q['h'] / q['fh']) * q['zoom']
        ok(abs(q['escala'] - esperado) < 1e-6, f'{rotulo}: escala = área real da foto ({q["w"]:.0f} × {q["h"]:.0f}) sobre o original', q)
        ok(bloqueios(pg) == 0 and not q['bloqueios'], f'{rotulo}: sem bloqueio por resolução ({round(q["escala"] * 100)}%)', q['bloqueios'])
        v = verifs(pg)
        if nivel: ok(MSG[nivel] in v and all(MSG[n] not in v for n in MSG if n != nivel), f'{rotulo}: aviso de ampliação "{nivel}"', v)
        ok(q['elevadas'] == (1 if nivel == 'elevada' else 0), f'{rotulo}: confirmação exigida só acima de 150%', q['elevadas'])
        return pid, q

    # 1–3: a fotografia de 896 × 1193 em FOT-01, FOT-02 e VID-01
    p1, q1 = caso('1 FOT-01 Feed 896×1193', 'FOT-01', 'feed', {'titulo': 'Pôr do sol na Praia do Rosa'}, fa, 'leve')
    p1s, _ = caso('1 FOT-01 Stories 896×1193', 'FOT-01', 'stories', {'titulo': 'Pôr do sol na Praia do Rosa'}, fa, 'elevada')
    p2, _ = caso('2 FOT-02 Feed 896×1193', 'FOT-02', 'feed', {'legenda': 'Manhã na varanda'}, fa, 'leve')
    p3, q3 = caso('3 VID-01 Reels 896×1193', 'VID-01', 'reels', {'titulo': 'Uma volta pelo Pico da Tribo'}, fa, 'elevada')
    # 4–6: os três níveis
    ok(1.0 < q1['escala'] <= 1.25, '4 ampliação entre 100% e 125% (896 × 1193 no Feed)', q1['escala'])
    p5, q5 = caso('5 FOT-01 Feed 800×1000', 'FOT-01', 'feed', {'titulo': 'Cabana ao entardecer'}, fs, 'significativa')
    ok(1.25 < q5['escala'] <= 1.5, '5 ampliação entre 125% e 150%', q5['escala'])
    p6, q6 = caso('6 FOT-01 Feed 600×800', 'FOT-01', 'feed', {'titulo': 'Trilha até o mirante'}, fh, 'elevada')
    ok(q6['escala'] > 1.5, '6 ampliação acima de 150%', q6['escala'])
    # INS-01 (várias fotos, espaços menores que o canvas) também segue a regra
    pi = pg.evaluate(JS_CRIAR, [MODULOS, 'INS-01', 'feed', {}, fh, None]); abrir(pg, pi)
    ok('pequena demais' not in verifs(pg) and 'acima de 100%' not in verifs(pg), 'INS-01: nenhuma mensagem de bloqueio por resolução', verifs(pg))

    # 7: confirmação por peça e exportação acima de 150%
    sem = pg.evaluate(JS_EXPORTAR, [MODULOS, [p6], {'tipo': 'png'}])
    ok(not sem['nomes'] and sem['erros'] and 'Confirme' in sem['erros'][0]['texto'], '7 sem confirmação a peça acima de 150% não sai', sem['erros'])
    com = pg.evaluate(JS_EXPORTAR, [MODULOS, [p6], {'tipo': 'png', 'ampliacaoConfirmada': [p6]}])
    ok(len(com['nomes']) == 1 and not com['erros'], '7 com confirmação a peça acima de 150% é exportada', com['erros'])
    pg.goto(URL + f'#/exportar/{p3}'); pg.wait_for_selector('[data-exportar-projeto]'); pg.wait_for_timeout(300)
    pg.click('[data-exportar]'); pg.wait_for_selector('[data-exportar-estado="confirmar"]', timeout=15000)
    ok(MSG['elevada'] in pg.inner_text('[data-exportar-estado="confirmar"]') and pg.is_disabled('[data-confirmar-ampliacao]'), '7 tela Exportar pede confirmação da peça (botão desabilitado até marcar)')
    pg.check(f'[data-confirmar-peca="{p3}"]'); pg.click('[data-confirmar-ampliacao]')
    pg.wait_for_selector('[data-exportar-estado="ok"]', timeout=20000)
    ok(pg.locator('[data-baixar-zip]').count() == 1, '7 após confirmar, VID-01 com 896 × 1193 é exportado (ZIP pronto)')

    # 8: nenhuma ampliação gera bloqueio definitivo (todas as peças acima exportam)
    todas = [p1, p1s, p2, p3, p5, p6]
    r = pg.evaluate(JS_EXPORTAR, [MODULOS, todas, {'tipo': 'png', 'ampliacaoConfirmada': todas}])
    ok(len(r['nomes']) == len(todas) and not r['erros'], '8 todas as peças com ampliação são exportadas', r['erros'])

    # 9: prévia = arquivo (mesmo enquadramento), inclusive com enquadramento manual
    for pid, rot in [(p1, 'FOT-01 Feed'), (p3, 'VID-01 Reels'), (p6, 'FOT-01 600×800')]:
        abrir(pg, pid)
        pg.focus('[data-previa]'); antes = selo(pg); pg.keyboard.press('ArrowUp')
        pg.wait_for_function("a => document.querySelector('[data-previa]').dataset.pronto !== a", arg=antes, timeout=8000)
        pg.wait_for_function("() => document.querySelector('[data-status]').textContent.startsWith('Salvo')", timeout=8000)
        pv = previa_img(pg).convert('RGB')
        r = pg.evaluate(JS_EXPORTAR, [MODULOS, [pid], {'tipo': 'png', 'ampliacaoConfirmada': [pid]}])
        im = Image.open(io.BytesIO(base64.b64decode(r['dados'][0]))).convert('RGB') if r['dados'] else None
        ok(im is not None and ImageChops.difference(pv, im).getbbox() is None, f'9 {rot}: arquivo idêntico, pixel a pixel, à prévia', r['erros'])

    # 10: projeto antigo (enquadramento gravado) abre normalmente e não é alterado
    antigo = pg.evaluate("""async ([M, foto]) => { const S = await import(M + 'storage/index.js');
      const p = await S.repo.inserir('projetos', { nome: 'FOT-01 0.0.4', tipo: 'peca', estado: 'rascunho', situacao: 'ativo', templateId: 'FOT-01', formato: 'feed',
        campos: { titulo: 'Projeto antigo', tag: 'Praia do Rosa · SC' }, fotoId: foto, fotoIds: [foto], enquadramentos: { feed: { zoom: 1, cx: 0.5, cy: 0.4 } }, motorVersao: 1 }); return p.id; }""", [MODULOS, fa])
    antes = registro(pg, antigo)
    abrir(pg, antigo)
    ok(bloqueios(pg) == 0 and pg.input_value('.painel [data-campo="titulo"]') == 'Projeto antigo', '10 projeto antigo abre normalmente, sem bloqueio')
    depois = registro(pg, antigo)
    ok(depois['enquadramentos'] == antes['enquadramentos'] and depois['fotoId'] == antes['fotoId'], '10 projeto antigo: registro preservado')

if __name__ == '__main__':
    main()
