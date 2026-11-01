#!/usr/bin/env python3
"""Testes automáticos da Etapa 5 (exportação PNG/JPEG, Feed/Stories/Reels, todos os templates e composições,
carrossel, lote, ZIP, nomes e ordem, integridade visual e dimensões, projetos da 0.0.4, preservação dos dados).
Uso: APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa5.py
Requer: Python + Playwright (Chromium) + Pillow, servidor já em execução e as 4 fontes em public/fonts/."""
import base64, io, os, sys, tempfile, zipfile
from PIL import Image, ImageChops, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('APP_URL', 'http://localhost:8080/')
MODULOS = os.environ.get('APP_MODULOS', '/src/legacy/')
DIM = {'feed': (1080, 1350), 'stories': (1080, 1920), 'reels': (1080, 1920), 'destaque': (1080, 1080)}
# Combinações template × composição × formato realmente registradas (Etapa 6 concluída):
#   27 da Etapa 5 (FOT-01 8, FOT-02 6, INS-01 6, INF-01 2, COM-01 2, COM-02 2, VID-01 1)
# + 18 da Etapa 6 parcial (A/B/C em INF-01, COM-01 e COM-02: as clássicas continuam, 3 × 2 formatos × 3 templates)
# + 27 da Etapa 6 final (INF-02, INF-03, INF-04, INS-02: 3 × 2 cada = 24; DES-01: 3 no quadrado 1080 × 1080)
# + 2 da Etapa 7 (VID-02 em Reels e Stories com vídeo; o VID-01 continua com 1)
COMBINACOES = 74
falhas, total = [], 0

def ok(cond, nome, detalhe=''):
    global total
    total += 1
    print(('OK    ' if cond else 'FALHA ') + nome + (f'  [{detalhe}]' if detalhe and not cond else ''))
    if not cond: falhas.append(nome)

def foto(caminho, w, h, s):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(0, h, 8): d.rectangle([0, y, w, y + 8], fill=(40 + s * 60 + y * 150 // h, 120 + y * 100 // h, 200 - y * 120 // h))
    d.ellipse([w // 3, h // 3, w - w // 4, h - h // 4], fill=(30, 140 + s * 40, 90))
    im.save(caminho, 'JPEG', quality=90)

TEXTOS = {'titulo': 'Acordar na Praia do Rosa', 'legenda': 'Manhã na varanda', 'detalhe': 'Cabana com vista para o mar',
          'rotulo': 'Cabana', 'mensagem': 'Reserve sua estadia', 'periodo': 'Janeiro', 'acomodacao': 'Cabana Lobo',
          'apoio': 'Silêncio e mar', 'condicao': 'Mínimo 2 noites', 'confirmacaoComercial': True,
          'pergunta': 'Tem estacionamento?', 'resposta': 'Sim, o estacionamento é gratuito.',
          'citacao': 'Lugar lindo e anfitriões muito atenciosos.', 'nome': 'Marina', 'ano': 2025, 'origem': 'site das Cabanas'}

JS_CRIAR = """async ([M, tid, formato, extra, fotos]) => {
  const P = await import(M + 'projetos/projetos.js'); const T = await import(M + 'render/templates/index.js');
  const f = T.obterFicha(tid); const p = await P.criarProjeto(tid);
  const campos = { ...f.padroes(), ...extra };
  return (await P.salvarProjeto(p.id, { formato, campos, fotoId: f.foto ? fotos[0] : null, fotosExtras: f.foto ? fotos.slice(1) : [], nome: `${tid} ${extra.composicao ?? ''} ${formato}` })).id;
}"""
JS_RENDER = """async ([M, id, tipo]) => {
  const E = await import(M + 'exportar/exportador.js'); const P = await import(M + 'projetos/projetos.js');
  try { const r = await E.renderizarProjeto(await P.obterProjeto(id), tipo);
    const b = new Uint8Array(await r.blob.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768));
    return { ok: true, mime: r.blob.type, dados: btoa(s) };
  } catch (e) { return { ok: false, erro: e.mensagemUsuario ?? String(e) }; } }"""
JS_EXPORTAR = """async ([M, ids, op]) => {
  const E = await import(M + 'exportar/exportador.js'); const r = await E.exportar(ids, op);
  let dados = null; if (r.zip) { const b = new Uint8Array(await r.zip.arrayBuffer()); let s = ''; for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768)); dados = btoa(s); }
  return { nomes: r.arquivos.map(a => a.nome), erros: r.erros, nomeZip: r.nomeZip, dados }; }"""
JS_SNAP = """async (M) => { const S = await import(M + 'storage/index.js');
  const ps = await S.repo.listar('projetos'); const fs = await S.repo.listar('fotos');
  return JSON.stringify({ ps: ps.map(p => [p.id, p.atualizadoEm, JSON.stringify(p.campos), JSON.stringify(p.enquadramentos), p.estado, p.fotoId, JSON.stringify(p.fotosExtras)]).sort(),
    fs: fs.map(f => [f.id, f.atualizadoEm, f.largura, f.altura, JSON.stringify(f.pontoFocal ?? null)]).sort() }); }"""

def img(r): return Image.open(io.BytesIO(base64.b64decode(r['dados'])))
def nao_vazia(im):
    ext = im.convert('L').getextrema(); return ext[1] - ext[0] > 40

def main():
    tmp = tempfile.mkdtemp(); cam = []
    for k, (w, h, s) in {'a': (3000, 4000, 0), 'b': (2400, 1800, 1), 'd': (3200, 2400, 2)}.items():
        cam.append(f'{tmp}/exp_{k}.jpg'); foto(cam[-1], w, h, s)
    erros = []
    with sync_playwright() as p:
        nav = p.chromium.launch(); ctx = nav.new_context(viewport={'width': 1400, 'height': 1000}, accept_downloads=True); pg = ctx.new_page()
        pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' and 'Exportação' not in m.text else None)
        pg.on('pageerror', lambda e: erros.append(str(e)))
        executar(pg, cam, tmp)
        ok(not erros, 'nenhum erro inesperado de console/página', ' | '.join(erros[:3]))
        nav.close()
    print(f'\n{total - len(falhas)} de {total} verificações passaram.')
    sys.exit(1 if falhas else 0)

def executar(pg, cam, tmp):
    pg.goto(URL); pg.wait_for_function("() => document.body.innerText.includes('Fontes: 4 de 4')", timeout=15000)
    # Os módulos importados pelo teste (APP_MODULOS) podem ser outra instância que a do app (servidor com bundle):
    # carrega as mesmas 4 fontes nessa instância para que compor() rode como no app (não conta como verificação).
    assert pg.evaluate("async (M) => { const F = await import(M + 'core/fonts.js'); if (!F.fontesCompletas()) await F.carregarFontes(); return F.fontesCompletas(); }", MODULOS), 'fontes não carregaram nos módulos do teste'
    pg.goto(URL + '#/fotografias'); pg.set_input_files('input[type=file]', cam)
    pg.wait_for_function("() => document.querySelectorAll('.foto').length >= 3", timeout=30000)
    fotos = pg.evaluate("async (M) => { const m = await import(M + 'biblioteca/fotos.js'); const l = await m.listarFotos(); return ['exp_a','exp_b','exp_d'].map(n => l.find(f => f.nomeOriginal.includes(n)).id); }", MODULOS)
    fichas = pg.evaluate("async (M) => { const T = await import(M + 'render/templates/index.js'); return T.FICHAS.map(f => ({ id: f.id, formatos: f.formatos, comp: (f.campos.find(c => c.id === 'composicao')?.opcoes ?? []).map(o => o[0] ?? o.valor ?? o) })); }", MODULOS)

    # ---------- todos os templates, composições e formatos, em PNG ----------
    gerados, bloqueados, criados = 0, [], {}
    for f in fichas:
        for fmt in f['formatos']:
            for comp in (f['comp'] or [None]):
                extra = {k: v for k, v in TEXTOS.items()}
                if comp: extra['composicao'] = comp
                if f['id'] == 'FOT-02': extra.update(posicao=1, total=3)
                pid = pg.evaluate(JS_CRIAR, [MODULOS, f['id'], fmt, extra, fotos])
                criados[(f['id'], comp, fmt)] = pid
                r = pg.evaluate(JS_RENDER, [MODULOS, pid, 'png'])
                rot = f"{f['id']} {comp or ''} {fmt}".replace('  ', ' ')
                if not r['ok']: bloqueados.append(f'{rot}: {r["erro"][:80]}'); continue
                im = img(r); gerados += 1
                ok(im.format == 'PNG' and im.size == DIM[fmt] and nao_vazia(im), f'PNG {rot}: {DIM[fmt][0]}×{DIM[fmt][1]} com conteúdo', f'{im.format} {im.size}')
    for b in bloqueados: print('INFO  sem exportar (pendência mostrada no editor):', b)
    esperadas = sum(len(f['formatos']) * max(1, len(f['comp'])) for f in fichas)
    ok(esperadas == COMBINACOES, f'registro tem as {COMBINACOES} combinações de template, composição e formato', esperadas)
    ok(gerados == COMBINACOES and not bloqueados, f'todas as {COMBINACOES} combinações exportadas em PNG ({gerados})')

    # ---------- JPEG ----------
    for chave in [('FOT-01', 'A', 'feed'), ('FOT-01', 'A', 'stories'), ('VID-01', None, 'reels'), ('DES-01', 'B', 'destaque'), ('INF-02', 'C', 'stories')]:
        r = pg.evaluate(JS_RENDER, [MODULOS, criados[chave], 'jpeg']); im = img(r)
        ok(r['mime'] == 'image/jpeg' and im.format == 'JPEG' and im.size == DIM[chave[2]], f'JPEG {chave[0]} {chave[2]}: tipo e dimensões')
        q = im.quantization; ok(q and max(q[0]) <= 16, 'JPEG em alta qualidade (tabela de quantização baixa)', max(q[0]) if q else None)

    # ---------- pendência bloqueia e não gera arquivo ----------
    pid_vazio = pg.evaluate(JS_CRIAR, [MODULOS, 'FOT-01', 'feed', {}, fotos])
    r = pg.evaluate(JS_RENDER, [MODULOS, pid_vazio, 'png'])
    ok(not r['ok'] and 'pendências' in r['erro'], 'peça com pendência não é exportada e explica o motivo')

    # ---------- exportado = prévia do editor ----------
    for chave in [('FOT-01', 'classica', 'feed'), ('FOT-02', 'B', 'stories'), ('INS-01', 'A', 'feed'), ('INF-01', 'classica', 'feed'), ('INF-01', 'A', 'feed'),
                  ('COM-02', 'classica', 'stories'), ('COM-02', 'B', 'stories'), ('VID-01', None, 'reels'),
                  ('INF-02', 'A', 'feed'), ('INF-03', 'B', 'stories'), ('INF-04', 'C', 'feed'), ('INS-02', 'A', 'stories'), ('DES-01', 'C', 'destaque')]:
        pid = criados[chave]
        pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_function("() => document.querySelector('[data-previa]')?.dataset.pronto", timeout=10000); pg.wait_for_timeout(300)
        previa = Image.open(io.BytesIO(base64.b64decode(pg.evaluate("() => document.querySelector('[data-previa]').toDataURL('image/png').split(',')[1]")))).convert('RGB')
        r = pg.evaluate(JS_RENDER, [MODULOS, pid, 'png'])
        if not r['ok']: ok(False, f'{chave}: exporta para comparar com a prévia', r['erro']); continue
        dif = ImageChops.difference(previa, img(r).convert('RGB')).getbbox()
        ok(dif is None, f'{chave[0]} {chave[2]}: arquivo idêntico, pixel a pixel, à prévia do editor', dif)

    # ---------- projeto antigo da versão 0.0.4 ----------
    antigo = pg.evaluate("""async ([M, foto]) => { const S = await import(M + 'storage/index.js');
      const p = await S.repo.inserir('projetos', { nome: 'Projeto 0.0.4', tipo: 'peca', estado: 'rascunho', situacao: 'ativo', templateId: 'FOT-01', formato: 'feed',
        campos: { versao: 'discreta', titulo: 'Projeto antigo', tag: 'Praia do Rosa · SC', apoio: '', chamada: 'Ver cotação', escurecimento: 'suave', logotipo: false },
        fotoId: foto, fotoIds: [foto], enquadramentos: { feed: { zoom: 1.2, cx: 0.4, cy: 0.5 } }, motorVersao: 1 }); return p.id; }""", [MODULOS, fotos[0]])
    r = pg.evaluate(JS_RENDER, [MODULOS, antigo, 'png'])
    ok(r['ok'] and img(r).size == (1080, 1350), 'projeto da 0.0.4 (sem campos novos) exporta na composição clássica', r.get('erro'))
    rc = pg.evaluate(JS_RENDER, [MODULOS, criados[('FOT-01', 'classica', 'feed')], 'png'])
    ok(r['ok'] and rc['ok'] and ImageChops.difference(img(r).convert('RGB'), img(rc).convert('RGB')).getbbox() is not None, 'enquadramento salvo do projeto antigo é respeitado')

    snap = pg.evaluate(JS_SNAP, MODULOS)

    # ---------- carrossel: ordem e numeração ----------
    car = [criados[('FOT-02', 'C', 'feed')], criados[('FOT-02', 'A', 'feed')], criados[('FOT-02', 'B', 'feed')]]
    r = pg.evaluate(JS_EXPORTAR, [MODULOS, car, {'tipo': 'png', 'modo': 'carrossel', 'nomeCarrossel': 'Verão no Rosa'}])
    z = zipfile.ZipFile(io.BytesIO(base64.b64decode(r['dados'])))
    nomes = z.namelist()
    ok(nomes == ['carrossel-verao-no-rosa/01-fot-02-c-feed-feed.png', 'carrossel-verao-no-rosa/02-fot-02-a-feed-feed.png', 'carrossel-verao-no-rosa/03-fot-02-b-feed-feed.png'],
       'carrossel: arquivos numerados 01..03 na ordem escolhida, numa pasta com o nome do carrossel', nomes)
    ok(z.testzip() is None, 'ZIP do carrossel íntegro (CRC conferido)')
    ok(all(Image.open(z.open(n)).size == (1080, 1350) for n in nomes), 'cada slide do carrossel mantém 1080×1350')
    ok(r['nomeZip'].startswith('carrossel-verao-no-rosa-') and r['nomeZip'].endswith('.zip'), 'nome do ZIP do carrossel identificável', r['nomeZip'])

    # ---------- lote: vários projetos, pastas por projeto, sem sobrescrever ----------
    lote = [criados[('FOT-01', 'A', 'feed')], criados[('FOT-01', 'A', 'stories')], criados[('COM-01', 'classica', 'feed')], criados[('VID-01', None, 'reels')]]
    pg.evaluate("async ([M, ids]) => { const P = await import(M + 'projetos/projetos.js'); for (const id of ids) await P.salvarProjeto(id, { nome: 'Mesmo nome' }); }", [MODULOS, lote[:2]])
    snap = pg.evaluate(JS_SNAP, MODULOS)
    r = pg.evaluate(JS_EXPORTAR, [MODULOS, lote, {'tipo': 'jpeg', 'modo': 'pecas'}])
    z = zipfile.ZipFile(io.BytesIO(base64.b64decode(r['dados']))); nomes = z.namelist()
    ok(len(nomes) == 4 and len(set(nomes)) == 4, 'lote de 4 projetos gera 4 arquivos distintos', nomes)
    ok('mesmo-nome/mesmo-nome-feed.jpg' in nomes and 'mesmo-nome/mesmo-nome-stories.jpg' in nomes, 'pastas por projeto e nomes previsíveis', nomes)
    ok(all(n.endswith('.jpg') and Image.open(z.open(n)).format == 'JPEG' for n in nomes), 'lote JPEG: todos os arquivos são JPEG')
    dims = [Image.open(z.open(n)).size for n in nomes]
    ok(dims == [(1080, 1350), (1080, 1920), (1080, 1350), (1080, 1920)], 'lote: Feed, Stories e Reels nas dimensões exatas', dims)
    pg.evaluate("async ([M, ids]) => { const P = await import(M + 'projetos/projetos.js'); for (const id of ids) await P.salvarProjeto(id, { nome: 'Igual', formato: 'feed' }); }", [MODULOS, lote[:2]])
    r2 = pg.evaluate(JS_EXPORTAR, [MODULOS, lote[:2], {'tipo': 'png', 'modo': 'pecas'}])
    ok(r2['nomes'] == ['igual/igual-feed.png', 'igual/igual-feed-2.png'], 'nomes repetidos não se sobrescrevem (sufixo -2)', r2['nomes'])
    pg.evaluate("async ([M, ids]) => { const P = await import(M + 'projetos/projetos.js'); await P.salvarProjeto(ids[1], { formato: 'stories' }); }", [MODULOS, lote[:2]])
    snap = pg.evaluate(JS_SNAP, MODULOS)

    # ---------- Etapa 6: lote com os novos templates (inclui o quadrado DES-01) ----------
    novos = [('INF-02', 'A', 'feed'), ('INF-03', 'A', 'stories'), ('INF-04', 'B', 'feed'), ('INS-02', 'C', 'stories'), ('DES-01', 'A', 'destaque')]
    for tipo, ext, fmt_pil in [('png', '.png', 'PNG'), ('jpeg', '.jpg', 'JPEG')]:
        r = pg.evaluate(JS_EXPORTAR, [MODULOS, [criados[k] for k in novos], {'tipo': tipo, 'modo': 'pecas'}])
        z = zipfile.ZipFile(io.BytesIO(base64.b64decode(r['dados']))); nomes = z.namelist()
        ok(len(nomes) == 5 and not r['erros'] and z.testzip() is None, f'ZIP {fmt_pil} dos novos templates: 5 arquivos, íntegro', (nomes, r['erros']))
        ok(all(n.endswith(ext) and Image.open(z.open(n)).format == fmt_pil for n in nomes), f'ZIP {fmt_pil}: todos os arquivos no tipo pedido')
        ok([Image.open(z.open(n)).size for n in nomes] == [DIM[k[2]] for k in novos], f'ZIP {fmt_pil}: Feed, Stories e destaque 1080×1080 nas dimensões exatas')
    icone = pg.evaluate(JS_CRIAR, [MODULOS, 'DES-01', 'destaque', {'composicao': 'C', 'modo': 'icone', 'icone': 'estrela'}, fotos])
    r = pg.evaluate(JS_RENDER, [MODULOS, icone, 'png'])
    ok(r['ok'] and img(r).size == (1080, 1080) and nao_vazia(img(r)), 'DES-01 no modo ícone exporta 1080×1080', r.get('erro'))
    snap = pg.evaluate(JS_SNAP, MODULOS)

    # ---------- interface: seleção, resumo, progresso, ZIP baixado ----------
    pg.goto(URL + '#/exportar'); pg.wait_for_selector('[data-exportar-projeto]')
    for pid in car: pg.click(f'[data-exportar-projeto="{pid}"] input')
    ok(pg.get_attribute('[data-exportar-resumo]', 'data-quantidade') == '3' and '3 peças' in pg.inner_text('[data-exportar-resumo]'), 'tela mostra quantas peças serão geradas')
    pg.click('[data-tipo="jpeg"]'); ok('JPEG' in pg.inner_text('[data-exportar-resumo]'), 'tela mostra o tipo de arquivo selecionado')
    pg.click('[data-modo="carrossel"]'); pg.fill('[data-nome-carrossel]', 'Teste UI')
    ok([pg.inner_text(f'[data-exportar-projeto="{x}"] [data-ordem]') for x in car] == ['01', '02', '03'], 'modo carrossel mostra a ordem dos slides')
    ok('carrossel-teste-ui/01-' in pg.inner_text('[data-exportar-plano]'), 'tela mostra os nomes dos arquivos antes de exportar')
    pg.click('[data-exportar]')
    pg.wait_for_selector('[data-exportar-estado="ok"]', timeout=30000)
    with pg.expect_download() as d: pg.click('[data-baixar-zip]')
    dl = d.value; caminho = f'{tmp}/{dl.suggested_filename}'; dl.save_as(caminho)
    z = zipfile.ZipFile(caminho)
    ok(dl.suggested_filename.startswith('carrossel-teste-ui-') and len(z.namelist()) == 3 and z.testzip() is None, 'botão Baixar ZIP entrega o arquivo com 3 slides', dl.suggested_filename)
    # arquivos separados
    pg.click('[data-destino="arquivos"]'); pg.click('[data-modo="pecas"]'); pg.click('[data-exportar]')
    pg.wait_for_selector('[data-exportar-estado="ok"] [data-baixar-arquivo]', timeout=30000)
    with pg.expect_download() as d: pg.locator('[data-baixar-arquivo]').first.click()
    ok(d.value.suggested_filename.endswith('-feed.jpg'), 'arquivo avulso baixado com nome identificável', d.value.suggested_filename)
    # botão Exportar do editor pré-seleciona o projeto
    pg.goto(URL + f'#/criar/{car[0]}'); pg.wait_for_selector('[data-ir-exportar]'); pg.click('[data-ir-exportar]')
    pg.wait_for_selector('[data-exportar-projeto]')
    ok(pg.get_attribute('[data-exportar-resumo]', 'data-quantidade') == '1' and pg.is_checked(f'[data-exportar-projeto="{car[0]}"] input'), 'botão Exportar do editor abre a exportação com a peça marcada')
    pg.goto(URL + '#/exportar'); pg.wait_for_selector('[data-exportar-projeto]')

    # ---------- preservação ----------
    ok(pg.evaluate(JS_SNAP, MODULOS) == snap, 'exportar não altera projetos (campos, enquadramentos, estado, fotos) nem fotografias')
    n = pg.evaluate("async (M) => { const S = await import(M + 'storage/index.js'); const r = {}; for (const s of ['projetos','fotos']) r[s] = (await S.repo.listar(s)).length; return r; }", MODULOS)
    ok(n['fotos'] == 3, 'biblioteca intacta após exportar: 3 fotografias', n)
    nexp = pg.evaluate("async (M) => { const S = await import(M + 'storage/index.js'); return (await S.repo.listar('exportacoes')).length; }", MODULOS)
    ok(nexp == 0, 'nenhuma cópia das imagens exportadas gravada no IndexedDB', nexp)

if __name__ == '__main__':
    main()
