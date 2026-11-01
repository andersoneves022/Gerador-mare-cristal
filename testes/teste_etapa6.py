#!/usr/bin/env python3
"""Testes automáticos da Etapa 6 (INF-02, INF-03, INF-04, INS-02 e DES-01 integrados; listas editáveis com
adicionar, editar, remover e reordenar; listas gravando no campo do próprio template; clássicas; DES-01 1080 × 1080;
preservação de fotos, projetos antigos e proteção da biblioteca).
Uso: APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_etapa6.py
Requer: Python + Playwright (Chromium) + Pillow, servidor já em execução e as 4 fontes em public/fonts/."""
import os, sys, tempfile
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('APP_URL', 'http://localhost:8080/')
MODULOS = os.environ.get('APP_MODULOS', '/src/legacy/')
NOVOS = ['INF-02', 'INF-03', 'INF-04', 'INS-02', 'DES-01']
TODOS = ['FOT-01', 'FOT-02', 'INS-01', 'INS-02', 'INF-01', 'INF-02', 'INF-03', 'INF-04', 'COM-01', 'COM-02', 'VID-01', 'VID-02', 'DES-01']  # Etapa 7: VID-02 entre VID-01 e DES-01
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

# ---------- utilitários (mesmos seletores do teste da Etapa 4) ----------
def hashcv(pg):
    return pg.evaluate("""() => { const c = document.querySelector('[data-previa]'); const u = c.toDataURL(); let h = 0; for (let i = 0; i < u.length; i += 7) h = (h * 31 + u.charCodeAt(i)) | 0; return c.width + 'x' + c.height + ':' + u.length + ':' + h; }""")
def selo(pg): return pg.get_attribute('[data-previa]', 'data-pronto')
def apos_render(pg, fn):
    antes = selo(pg); fn()
    pg.wait_for_function("a => document.querySelector('[data-previa]').dataset.pronto !== a", arg=antes, timeout=8000)
    pg.wait_for_timeout(120)
def bloqueios(pg): return int(pg.get_attribute('[data-previa]', 'data-bloqueios'))
def avisos(pg): return int(pg.get_attribute('[data-previa]', 'data-avisos'))
def dim(pg): return pg.evaluate("() => { const c = document.querySelector('[data-previa]'); return [c.width, c.height]; }")
def salvo(pg): pg.wait_for_function("() => document.querySelector('[data-status]').textContent.startsWith('Salvo')", timeout=8000)
def digitar(pg, campo, texto): apos_render(pg, lambda: pg.fill(f'.painel [data-campo="{campo}"]', texto))  # .painel: o nome do projeto também usa data-campo="nome"
def clicar(pg, sel): apos_render(pg, lambda: pg.click(sel))
def sub(pg, i, s, texto): apos_render(pg, lambda: pg.fill(f'[data-item-sub="{i}:{s}"]', texto))
def novo(pg, tid):
    pg.goto(URL + '#/criar'); pg.click(f'[data-template="{tid}"]')
    pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")
    pg.wait_for_timeout(150)
    return pg.url.split('/')[-1]
def abrir(pg, pid):
    pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_selector('[data-previa]')
    pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(200)
def escolher(pg, nome, slot=1):
    pg.click(f'[data-escolher-foto="{slot}"]'); pg.wait_for_selector('[data-seletor] [data-foto-id]')
    botao = pg.locator('[data-seletor] [data-foto-id]', has_text=nome).first
    apos_render(pg, lambda: botao.click())
def registro(pg, pid): return pg.evaluate(f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")
def n_itens(pg, lista): return pg.locator(f'[data-lista="{lista}"] > li').count()
def compor_js(pg, tid, formato, campos):
    return pg.evaluate("""async ([M, tid, fmt, campos]) => { const Mo = await import(M + 'render/motor.js'); const T = await import(M + 'render/templates/index.js');
      const f = T.obterFicha(tid); const c = Mo.compor({ templateId: tid, formato: fmt, campos: { ...f.padroes(), ...campos }, fotoId: null, fotosExtras: [], enquadramentos: {} }, { imagem: null, imagens: {}, logo: null });
      return { bloqueios: c.bloqueios.map(b => b.texto), largura: c.largura, altura: c.altura }; }""", [MODULOS, tid, formato, campos])

def main():
    tmp = tempfile.mkdtemp(); cam = []
    for k, (w, h, s) in {'a': (3000, 4000, 0), 'b': (2400, 1800, 1)}.items():
        cam.append(f'{tmp}/e6_{k}.jpg'); foto(cam[-1], w, h, s)
    erros = []
    with sync_playwright() as p:
        nav = p.chromium.launch(); ctx = nav.new_context(viewport={'width': 1400, 'height': 1000}); pg = ctx.new_page()
        pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: erros.append(str(e)))
        executar(pg, cam)
        ok(not erros, 'nenhum erro de console/página durante todo o teste', ' | '.join(erros[:3]))
        nav.close()
    print(f'\n{total - len(falhas)} de {total} verificações passaram.')
    sys.exit(1 if falhas else 0)

def executar(pg, cam):
    pg.goto(URL); pg.wait_for_function("() => document.body.innerText.includes('Fontes: 4 de 4')", timeout=15000)
    # Os módulos importados pelo teste (APP_MODULOS) podem ser outra instância que a do app (servidor com bundle):
    # carrega as mesmas 4 fontes nessa instância para que compor() rode como no app (não conta como verificação).
    assert pg.evaluate("async (M) => { const F = await import(M + 'core/fonts.js'); if (!F.fontesCompletas()) await F.carregarFontes(); return F.fontesCompletas(); }", MODULOS), 'fontes não carregaram nos módulos do teste'
    pg.goto(URL + '#/fotografias'); pg.set_input_files('input[type=file]', cam)
    pg.wait_for_function("() => document.querySelectorAll('.foto').length >= 2", timeout=30000)
    n_fotos = pg.locator('.foto').count()

    # ---------- lista de templates ----------
    pg.goto(URL + '#/criar'); pg.wait_for_selector('[data-template]')
    ids = [pg.get_attribute(f'.modelo:nth-child({i + 1}) [data-template]', 'data-template') for i in range(pg.locator('[data-template]').count())]
    ok(ids == TODOS, 'Criar lista os 13 templates na ordem da Biblioteca (8 da Etapa 6 incluídos; VID-02 da Etapa 7)', ids)
    corpo = pg.inner_text('.principal__corpo')
    # Etapa 7: com o VID-02 implementado, não há mais "próximos modelos"; os 5 da Etapa 6 seguem fora dessa lista.
    ok('Próximos modelos' not in corpo and not any(t in corpo.split('Criar com este modelo')[-1] for t in NOVOS), 'INF-02, INF-03, INF-04, INS-02 e DES-01 saíram de "próximos modelos" (Etapa 7: lista vazia)')

    # ---------- INF-02: linhas rótulo/valor ----------
    pid = novo(pg, 'INF-02')
    ok(n_itens(pg, 'linhas') == 3 and pg.is_disabled('[data-lista="linhas"] [data-remover-item="0"]'), 'INF-02 abre com 3 linhas e não deixa remover abaixo do mínimo')
    digitar(pg, 'titulo', 'Tudo a poucos passos'); h0 = hashcv(pg)
    sub(pg, 1, 'valor', '14h às 22h'); sub(pg, 2, 'valor', '4 hóspedes')
    ok(hashcv(pg) != h0 and bloqueios(pg) == 0, 'INF-02: editar o valor de uma linha atualiza a prévia, sem bloqueios')
    for _ in range(3): clicar(pg, '[data-adicionar-item="linhas"]')
    ok(n_itens(pg, 'linhas') == 6 and pg.is_disabled('[data-adicionar-item="linhas"]'), 'INF-02: adicionar até 6 linhas; o botão desativa no máximo')
    ok(bloqueios(pg) >= 1, 'INF-02: linha nova vazia não passa sem conteúdo (validação mantida)', bloqueios(pg))
    for i in (3, 4, 5): sub(pg, i, 'rotulo', f'Rótulo {i}'); sub(pg, i, 'valor', f'Valor {i}')
    clicar(pg, '[data-lista="linhas"] [data-remover-item="5"]')
    ok(n_itens(pg, 'linhas') == 5 and not pg.is_disabled('[data-adicionar-item="linhas"]'), 'INF-02: remover uma linha')
    salvo(pg); antes = registro(pg, pid)['campos']['linhas']
    clicar(pg, '[data-lista="linhas"] [data-descer-item="0"]'); salvo(pg); depois = registro(pg, pid)['campos']['linhas']
    ok(depois[0] == antes[1] and depois[1] == antes[0] and depois[2:] == antes[2:], 'INF-02: descer troca a linha 1 com a 2 e grava a nova ordem')
    ok(pg.input_value('[data-item-sub="0:rotulo"]') == antes[1]['rotulo'], 'INF-02: os campos mostram a nova ordem')
    clicar(pg, '[data-lista="linhas"] [data-subir-item="1"]'); salvo(pg)
    ok(registro(pg, pid)['campos']['linhas'] == antes, 'INF-02: subir desfaz a troca')
    ok(pg.is_disabled('[data-lista="linhas"] [data-subir-item="0"]') and pg.is_disabled('[data-lista="linhas"] [data-descer-item="4"]'), 'INF-02: primeira não sobe, última não desce')
    reg = registro(pg, pid)['campos']
    ok('itens' not in reg and len(reg['linhas']) == 5, 'INF-02 grava em "linhas", sem criar campo "itens" do INF-01')
    for comp in 'ABC':
        for fmt in ('feed', 'stories'):
            r = compor_js(pg, 'INF-02', fmt, {**reg, 'composicao': comp, 'logotipo': False})
            ok(not r['bloqueios'], f'INF-02 {comp} {fmt} sem bloqueios', r['bloqueios'])
    r = compor_js(pg, 'INF-02', 'feed', {'linhas': reg['linhas'][:2], 'titulo': 'X'})
    ok('Use de 3 a 6 linhas.' in r['bloqueios'], 'INF-02: menos de 3 linhas continua bloqueando', r['bloqueios'])
    pg.reload(); pg.wait_for_selector('[data-previa]'); pg.wait_for_timeout(400)
    ok(n_itens(pg, 'linhas') == 5 and pg.input_value('[data-item-sub="4:valor"]') == 'Valor 4', 'INF-02: reabrir restaura as linhas')

    # ---------- INF-03: passos numerados ----------
    pid3 = novo(pg, 'INF-03')
    ok(n_itens(pg, 'passos') == 4 and pg.is_disabled('[data-adicionar-item="passos"]'), 'INF-03 abre com 4 passos e o máximo bloqueia novos')
    digitar(pg, 'titulo', 'Como reservar'); ok(bloqueios(pg) == 0, 'INF-03 com título: sem bloqueios')
    clicar(pg, '[data-lista="passos"] [data-remover-item="3"]')
    ok(n_itens(pg, 'passos') == 3 and pg.is_disabled('[data-lista="passos"] [data-remover-item="0"]'), 'INF-03: remover até o mínimo de 3')
    clicar(pg, '[data-adicionar-item="passos"]'); sub(pg, 3, 'titulo', 'Confirme pelo WhatsApp'); sub(pg, 3, 'apoio', 'Respondemos no mesmo dia')
    clicar(pg, '[data-lista="passos"] [data-subir-item="3"]'); salvo(pg)
    ps = registro(pg, pid3)['campos']['passos']
    ok(ps[2] == {'titulo': 'Confirme pelo WhatsApp', 'apoio': 'Respondemos no mesmo dia'} and len(ps) == 4, 'INF-03: adicionar, editar e subir um passo', ps)
    for comp in 'ABC':
        for fmt in ('feed', 'stories'):
            apos_render(pg, lambda: pg.select_option('[data-campo="composicao"]', comp)) if pg.input_value('[data-campo="composicao"]') != comp else None
            if fmt != pg.get_attribute('[data-previa]', 'data-formato'): clicar(pg, f'[data-formato="{fmt}"]')
            ok(bloqueios(pg) == 0 and dim(pg) == ([1080, 1350] if fmt == 'feed' else [1080, 1920]), f'INF-03 {comp} {fmt} sem bloqueios')
    sub(pg, 0, 'titulo', ''); ok(bloqueios(pg) >= 1, 'INF-03: passo sem título bloqueia (validação mantida)')

    # ---------- INF-01: grade de ícones continua (lista no campo do template) ----------
    pid1 = novo(pg, 'INF-01'); digitar(pg, 'titulo', 'O que a casa oferece')
    ok(n_itens(pg, 'itens') == 4 and bloqueios(pg) == 0, 'INF-01 abre com 4 itens, sem bloqueios')
    clicar(pg, '[data-adicionar-item="itens"]'); apos_render(pg, lambda: pg.fill('[data-item-texto="4"]', 'Rede na varanda'))
    clicar(pg, '[data-lista="itens"] [data-subir-item="4"]'); salvo(pg)
    it = registro(pg, pid1)['campos']['itens']
    ok(len(it) == 5 and it[3]['texto'] == 'Rede na varanda' and it[4]['texto'] == 'Wi-Fi', 'INF-01: adicionar, editar e reordenar itens', it)
    apos_render(pg, lambda: pg.select_option('[data-campo="composicao"]', 'classica'))
    ok(bloqueios(pg) == 0, 'INF-01 clássica continua disponível, sem bloqueios')

    # ---------- INF-04 e INS-02 ----------
    novo(pg, 'INF-04'); ok(bloqueios(pg) >= 2, 'INF-04 sem pergunta e resposta bloqueia', bloqueios(pg))
    digitar(pg, 'pergunta', 'Tem estacionamento?'); digitar(pg, 'resposta', 'Sim, o estacionamento é gratuito.')
    ok(bloqueios(pg) == 0, 'INF-04 preenchido: sem bloqueios')
    novo(pg, 'INS-02'); ok(bloqueios(pg) >= 3, 'INS-02 sem nome, ano e origem bloqueia', bloqueios(pg))
    digitar(pg, 'citacao', 'Lugar lindo e anfitriões atenciosos.'); digitar(pg, 'nome', 'Marina'); digitar(pg, 'ano', '2025'); digitar(pg, 'origem', 'site das Cabanas')
    ok(bloqueios(pg) == 0, 'INS-02 preenchido: sem bloqueios')
    digitar(pg, 'ano', '2999'); ok(bloqueios(pg) == 1, 'INS-02: ano no futuro bloqueia')

    # ---------- DES-01: quadrado 1080 × 1080 ----------
    pidd = novo(pg, 'DES-01')
    ok(dim(pg) == [1080, 1080] and pg.locator('button[data-formato]').count() == 0, 'DES-01 só existe no quadrado 1080 × 1080')
    ok(bloqueios(pg) == 1, 'DES-01 modo foto sem foto: 1 bloqueio', bloqueios(pg))
    escolher(pg, 'e6_a'); ok(bloqueios(pg) == 0, 'DES-01 com foto: sem bloqueios')
    for comp in 'BC':
        apos_render(pg, lambda: pg.select_option('[data-campo="composicao"]', comp)); ok(bloqueios(pg) == 0, f'DES-01 {comp} com foto: sem bloqueios')
    apos_render(pg, lambda: pg.select_option('[data-campo="modo"]', 'icone'))
    ok(bloqueios(pg) == 0 and not pg.is_visible('[data-escolher-foto="1"]') and pg.is_visible('[data-campo="icone"]'), 'DES-01 modo ícone: sem foto, com ícone, sem bloqueios')
    digitar(pg, 'rotulo', 'Acomodações e passeios'); ok(avisos(pg) >= 1, 'DES-01: nome com mais de 15 caracteres gera aviso')
    apos_render(pg, lambda: pg.select_option('[data-campo="modo"]', 'foto')); salvo(pg)
    r = pg.evaluate("async (M) => { const m = await import(M + 'biblioteca/fotos.js'); const f = (await m.listarFotos()).find(x => x.nomeOriginal.includes('e6_a')); try { await m.excluirFoto(f.id); return 'excluiu'; } catch (e) { return e.codigo; } }", MODULOS)
    ok(r == 'EXCLUSAO_BLOQUEADA', 'foto usada pelo DES-01 fica protegida contra exclusão', r)

    # ---------- projetos antigos (sem "composicao") abrem na clássica ----------
    antigos = pg.evaluate("""async (M) => { const S = await import(M + 'storage/index.js'); const base = { tipo: 'peca', estado: 'rascunho', situacao: 'ativo', fotoId: null, fotoIds: [], enquadramentos: {}, motorVersao: 1 };
      const a = await S.repo.inserir('projetos', { ...base, nome: 'INF-01 antigo', templateId: 'INF-01', formato: 'feed', campos: { titulo: 'Comodidades', rotulo: '', logotipo: true, itens: [{ icone: 'wifi', texto: 'Wi-Fi' }, { icone: 'cozinha', texto: 'Cozinha' }] } });
      const b = await S.repo.inserir('projetos', { ...base, nome: 'COM-02 antigo', templateId: 'COM-02', formato: 'stories', campos: { mensagem: 'Até breve', chamada: 'Reservar', apoio: 'link na bio' } });
      return [a.id, b.id]; }""", MODULOS)
    for aid, rot in zip(antigos, ['INF-01', 'COM-02']):
        abrir(pg, aid)
        ok(pg.input_value('[data-campo="composicao"]') == 'classica' and bloqueios(pg) == 0, f'{rot} gravado antes da Etapa 6 abre na clássica, sem bloqueios')
    ok(registro(pg, antigos[0])['campos']['itens'][0]['texto'] == 'Wi-Fi', 'projeto antigo mantém seus itens')

    # ---------- preservação ----------
    pg.goto(URL + '#/fotografias'); pg.wait_for_timeout(500)
    ok(pg.locator('.foto').count() == n_fotos, 'biblioteca intacta no fim', pg.locator('.foto').count())
    v = pg.evaluate("async (M) => { const S = await import(M + 'storage/index.js'); return (await S.repo.listar('projetos')).length; }", MODULOS)
    ok(v == 8, 'os 8 projetos do teste (6 novos + 2 antigos) continuam no IndexedDB', v)

if __name__ == '__main__':
    main()
