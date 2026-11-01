#!/usr/bin/env python3
"""Testes automáticos da Etapa 4 e 4.1 (motor de composição, editor, projetos e composições da galeria).
Uso: python3 testes/teste_etapa4.py [pasta_do_app] [porta]
     ou: APP_URL=http://localhost:8080/ python3 testes/teste_etapa4.py (servidor já em execução)
Requer: Python + Playwright (Chromium) + Pillow. As 4 fontes WOFF2 precisam estar em fonts/.
Cada verificação imprime OK/FALHA; o código de saída é 1 se qualquer uma falhar."""
import io, os, subprocess, sys, time, tempfile
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

APP = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..'))
PORTA = int(sys.argv[2]) if len(sys.argv) > 2 else 8124
URL = os.environ.get('APP_URL') or f'http://localhost:{PORTA}/'
# Caminho dos módulos no navegador: '/js/' na versão estática; '/src/legacy/' no servidor de desenvolvimento do Lovable.
MODULOS = os.environ.get('APP_MODULOS', '/js/')
ESPUMA, AREIA = (244, 250, 249), (239, 229, 207)
OCEANO, TURQUESA = (10, 79, 96), (20, 184, 206)
falhas, total = [], 0

def ok(cond, nome, detalhe=''):
    global total
    total += 1
    print(('OK    ' if cond else 'FALHA ') + nome + (f'  [{detalhe}]' if detalhe and not cond else ''))
    if not cond: falhas.append(nome)

def foto(caminho, w, h, semente):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(0, h, 8): d.rectangle([0, y, w, y + 8], fill=(40 + semente * 60 + y * 150 // h, 120 + y * 100 // h, 200 - y * 120 // h))
    d.rectangle([w // 8, h // 8, w // 2, h // 3], fill=(250, 220, 90)); d.ellipse([w // 2, h // 2, w - w // 8, h - w // 8], fill=(30, 140 + semente * 40, 90))
    d.polygon([(0, h), (w // 3, h // 2), (w // 2, h)], fill=(180, 60 + semente * 50, 60))
    im.save(caminho, 'JPEG', quality=90)

def main():
    tmp = tempfile.mkdtemp()
    fotos = {'a': (3000, 4000, 0), 'b': (2400, 1800, 1), 'c': (800, 600, 2)}
    caminhos = {}
    for k, (w, h, s) in fotos.items(): caminhos[k] = f'{tmp}/foto_{k}.jpg'; foto(caminhos[k], w, h, s)
    srv = None if os.environ.get('APP_URL') else subprocess.Popen([sys.executable, '-m', 'http.server', str(PORTA), '--directory', APP], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if srv: time.sleep(1)
    erros = []
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch(); ctx = nav.new_context(viewport={'width': 1400, 'height': 1000}); pg = ctx.new_page()
            pg.on('console', lambda m: erros.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: erros.append(str(e)))
            executar(pg, caminhos)
            ok(not erros, 'nenhum erro de console/página durante todo o teste', ' | '.join(erros[:3]))
            nav.close()
    finally:
        if srv: srv.terminate()
    print(f'\n{total - len(falhas)} de {total} verificações passaram.')
    sys.exit(1 if falhas else 0)

# ---------- utilitários ----------
def hashcv(pg):
    return pg.evaluate("""() => { const c = document.querySelector('[data-previa]'); const u = c.toDataURL(); let h = 0; for (let i = 0; i < u.length; i += 7) h = (h * 31 + u.charCodeAt(i)) | 0; return c.width + 'x' + c.height + ':' + u.length + ':' + h; }""")
def pixel(pg, x, y):
    return tuple(pg.evaluate("([x,y]) => [...document.querySelector('[data-previa]').getContext('2d').getImageData(x,y,1,1).data].slice(0,3)", [x, y]))
def selo(pg): return pg.get_attribute('[data-previa]', 'data-pronto')
def apos_render(pg, fn):
    antes = selo(pg); fn()
    pg.wait_for_function("a => document.querySelector('[data-previa]').dataset.pronto !== a", arg=antes, timeout=8000)
    pg.wait_for_timeout(120)
def bloqueios(pg): return int(pg.get_attribute('[data-previa]', 'data-bloqueios'))
def avisos(pg): return int(pg.get_attribute('[data-previa]', 'data-avisos'))
def dim(pg): return pg.evaluate("() => { const c = document.querySelector('[data-previa]'); return [c.width, c.height]; }")
def salvo(pg): pg.wait_for_function("() => document.querySelector('[data-status]').textContent.startsWith('Salvo')", timeout=8000)
def digitar(pg, campo, texto):
    apos_render(pg, lambda: pg.fill(f'[data-campo="{campo}"]', texto))
def novo(pg, tid):
    pg.goto(URL + '#/criar'); pg.click(f'[data-template="{tid}"]')
    pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")
    pg.wait_for_timeout(150)
    return pg.url.split('/')[-1]
def escolher(pg, nome, slot=1):
    pg.click(f'[data-escolher-foto="{slot}"]'); pg.wait_for_selector('[data-seletor] [data-foto-id]')
    botao = pg.locator('[data-seletor] [data-foto-id]', has_text=nome).first
    apos_render(pg, lambda: botao.click())
def banco(pg, js): return pg.evaluate(js)
def registro(pg, pid): return banco(pg, f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")
def compor_(pg, valor): apos_render(pg, lambda: pg.select_option('[data-campo="composicao"]', valor))
def formato(pg, f): apos_render(pg, lambda: pg.click(f'[data-formato="{f}"]'))
def perto(a, b, tol=6): return all(abs(x - y) <= tol for x, y in zip(a, b))
def clicar_previa(pg, x, y):
    cx = pg.locator('[data-previa]').bounding_box(); w = pg.evaluate("() => document.querySelector('[data-previa]').width")
    k = cx['width'] / w; pg.mouse.click(cx['x'] + x * k, cx['y'] + y * k)

def executar(pg, c):
    # ---------- base e biblioteca (regressão) ----------
    pg.goto(URL); pg.wait_for_function("() => document.body.innerText.includes('Armazenamento: pronto')", timeout=10000)
    pg.wait_for_function("() => document.body.innerText.includes('Fontes: 4 de 4')", timeout=10000)
    ok(True, 'aplicativo abre, armazenamento pronto e 4 fontes carregadas')
    ok('0.0.4' in pg.inner_text('.lateral__rodape'), 'versão 0.0.4 exibida')
    for area in ['inicio', 'fotografias', 'criar', 'projetos', 'exportar', 'dados']:
        pg.goto(URL + f'#/{area}'); pg.wait_for_timeout(250)
        ok(pg.locator('main h1').inner_text() != '', f'área "{area}" abre')
    pg.goto(URL + '#/fotografias')
    pg.set_input_files('input[type=file]', [c['a'], c['b'], c['c']])
    pg.wait_for_function("() => document.querySelectorAll('.foto').length >= 3", timeout=20000)
    ok(pg.locator('.foto').count() == 3, 'importação de 3 fotografias (regressão da biblioteca)')

    # ---------- escolha de template ----------
    pg.goto(URL + '#/criar')
    ok(pg.locator('[data-template]').count() == 13, 'a tela Criar lista os 13 templates implementados (Etapa 6 + VID-01 e VID-02 da Etapa 7)')

    # ---------- FOT-01 ----------
    pid = novo(pg, 'FOT-01')
    ok(dim(pg) == [1080, 1350], 'FOT-01 abre em Feed 1080×1350')
    ok(bloqueios(pg) >= 2, 'FOT-01 sem foto e sem título: bloqueios exibidos', bloqueios(pg))
    escolher(pg, 'foto_a')
    ok(bloqueios(pg) == 1, 'FOT-01 com foto, falta só o título', bloqueios(pg))
    h0 = hashcv(pg)
    digitar(pg, 'titulo', 'Acordar na Praia do Rosa')
    ok(bloqueios(pg) == 0, 'FOT-01 com título: sem bloqueios')
    ok(pg.input_value('[data-campo="composicao"]') == 'A', 'FOT-01 novo abre na composição A da galeria')
    compor_(pg, 'classica')  # os testes da versão 0.0.4 seguem na composição clássica
    h1 = hashcv(pg)
    ok(h1 != h0, 'FOT-01: editar o texto atualiza a composição')
    digitar(pg, 'titulo', 'Outro título bem diferente')
    ok(hashcv(pg) != h1, 'FOT-01: nova edição de texto atualiza novamente')
    # versão com chamada
    apos_render(pg, lambda: pg.select_option('[data-campo="versao"]', 'chamada'))
    ok(pg.is_visible('[data-campo="chamada"]'), 'versão com chamada mostra o campo da chamada')
    apos_render(pg, lambda: pg.select_option('[data-campo="escurecimento"]', 'intenso'))
    ok(pixel(pg, 1070, 1340) != (0, 0, 0), 'escurecimento intenso aplicado (base escurecida)')
    # enquadramento: arrastar
    caixa = pg.locator('[data-previa]').bounding_box()
    hf = hashcv(pg)
    def arrastar():
        pg.mouse.move(caixa['x'] + caixa['width'] / 2, caixa['y'] + caixa['height'] / 2); pg.mouse.down()
        pg.mouse.move(caixa['x'] + caixa['width'] / 2 - 60, caixa['y'] + caixa['height'] / 2 - 10, steps=5); pg.mouse.up()
    apos_render(pg, lambda: pg.select_option('[data-campo="escurecimento"]', 'suave'))  # só estabiliza
    pg.fill('[data-zoom]', '1.5')  # zoom para ter folga de arraste
    pg.wait_for_timeout(300)
    hz = hashcv(pg)
    ok(hz != hf, 'FOT-01: zoom altera o recorte')
    arrastar(); pg.wait_for_timeout(400)
    ok(hashcv(pg) != hz, 'FOT-01: arrastar a foto reposiciona o enquadramento')
    zmax = float(pg.get_attribute('[data-zoom]', 'max'))
    ok(zmax <= 1000 / (max(1080 / 3000, 1350 / 4000) * 1000) + 1e-6 and zmax > 2.7, 'D-01: zoom máximo = 1/escala de cobertura', zmax)
    pg.evaluate("() => { const z = document.querySelector('[data-zoom]'); z.value = 99; z.dispatchEvent(new Event('input', {bubbles:true})); }")
    pg.wait_for_timeout(400)
    esc = pg.inner_text('[data-escala]')
    pct = int(esc.split('original')[0].split(':')[1].strip().rstrip('% ').strip().split()[0].rstrip('%'))
    ok(pct <= 100 and 'bloqueada' not in esc, 'D-01: zoom no máximo nunca passa de 100% da resolução original', esc)
    # formato Stories com enquadramento próprio
    apos_render(pg, lambda: pg.click('[data-formato="stories"]'))
    ok(dim(pg) == [1080, 1920], 'FOT-01 em Stories renderiza 1080×1920')
    ok(float(pg.input_value('[data-zoom]')) == 1.0, 'Stories tem enquadramento independente (zoom inicial 1,00)')
    pg.wait_for_timeout(300); salvo(pg)
    reg = banco(pg, f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")
    ok(set(reg['enquadramentos'].keys()) == {'feed'}, 'só o Feed foi ajustado; Stories não herdou o recorte', list(reg['enquadramentos'].keys()))
    ok(reg['estado'] == 'rascunho' and reg['templateId'] == 'FOT-01' and reg['formato'] == 'stories', 'projeto salvo como rascunho, com template e formato')
    ok(len(reg['fotoIds']) == 1 and reg['fotoId'] == reg['fotoIds'][0], 'projeto referencia a foto por ID')
    ok('Blob' not in str(type(reg)) and 'data:image' not in str(reg), 'projeto não guarda imagens duplicadas')
    h_antes = hashcv(pg)
    # persistência após recarregar e reabrir pela lista
    pg.reload(); pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(300)
    ok(hashcv(pg) == h_antes, 'recarregar a página reabre o projeto com a mesma composição')
    pg.goto(URL + '#/projetos'); pg.wait_for_selector('[data-projeto]')
    ok(pg.locator(f'[data-projeto="{pid}"]').count() == 1 and 'Rascunho' in pg.inner_text(f'[data-projeto="{pid}"]'), 'Projetos lista o rascunho')
    pg.click(f'[data-projeto="{pid}"] a'); pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(300)
    ok(hashcv(pg) == h_antes and pg.input_value('[data-campo="titulo"]') == 'Outro título bem diferente', 'reabrir pela lista restaura campos e composição')
    ok(pg.get_attribute('[data-formato="stories"]', 'aria-pressed') == 'true', 'reabrir restaura o formato')
    # continuar editando e atualizar
    digitar(pg, 'titulo', 'Título atualizado'); salvo(pg)
    reg = banco(pg, f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")
    ok(reg['campos']['titulo'] == 'Título atualizado', 'continuar editando atualiza o projeto salvo')
    # trocar fotografia
    h_t = hashcv(pg)
    escolher(pg, 'foto_b')
    ok(hashcv(pg) != h_t, 'trocar a fotografia atualiza a composição')
    salvo(pg)
    reg = banco(pg, f"(async()=>{{const m=await import('{MODULOS}storage/index.js');return m.repo.obter('projetos','{pid}')}})()")
    ok(reg['enquadramentos'] == {}, 'trocar a fotografia limpa os enquadramentos antigos')
    # foto pequena: ampliação com aviso, sem bloqueio (D-01 revisada)
    escolher(pg, 'foto_c')
    ok(bloqueios(pg) == 0 and 'ampliação' in pg.inner_text('[data-escala]') and 'ampliação' in pg.inner_text('[data-verificacoes]'), 'foto pequena (800×600): ampliação com aviso, sem bloqueio (D-01)')
    ok(pg.is_disabled('[data-zoom]'), 'foto pequena: zoom travado em 1,00')
    ok(avisos(pg) >= 1, 'foto com menos de 2160 px gera aviso')
    # texto que não cabe
    escolher(pg, 'foto_a')
    digitar(pg, 'titulo', 'Hospedagem familiar com cozinha completa churrasqueira e estacionamento gratuito para toda a família durante o ano inteiro')
    ok(bloqueios(pg) >= 1, 'título que não cabe bloqueia e informa (sem reduzir a fonte abaixo do mínimo)')
    ok('não cabe' in pg.inner_text('[data-verificacoes]'), 'a mensagem indica o campo que não cabe')

    # ---------- INF-01 ----------
    novo(pg, 'INF-01')
    ok(pixel(pg, 5, 5) == ESPUMA, 'INF-01: fundo Espuma')
    ok(bloqueios(pg) == 1, 'INF-01 sem título: bloqueio', bloqueios(pg))
    digitar(pg, 'titulo', 'O que a casa oferece')
    ok(bloqueios(pg) == 0, 'INF-01 com título e 4 itens: sem bloqueios')
    apos_render(pg, lambda: pg.select_option('[data-campo="fundo"]', 'areia'))
    ok(pixel(pg, 5, 5) == AREIA, 'INF-01: fundo Areia')
    hi = hashcv(pg)
    for _ in range(4): apos_render(pg, lambda: pg.click('[data-adicionar-item]'))
    ok(pg.is_disabled('[data-adicionar-item]'), 'INF-01: máximo de 8 itens')
    ok(bloqueios(pg) >= 1, 'INF-01: itens novos sem texto bloqueiam')
    for i in range(4, 8): pg.fill(f'[data-item-texto="{i}"]', f'Item {i + 1}')
    pg.wait_for_timeout(300)
    ok(bloqueios(pg) == 0 and hashcv(pg) != hi, 'INF-01 com 8 itens preenchidos renderiza sem bloqueios')
    apos_render(pg, lambda: pg.click('[data-remover-item="7"]'))
    ok(pg.locator('[data-item-texto]').count() == 7, 'INF-01: remover item')
    apos_render(pg, lambda: pg.click('[data-formato="stories"]'))
    ok(dim(pg) == [1080, 1920] and bloqueios(pg) == 0, 'INF-01 em Stories 1080×1920')

    # ---------- COM-01 ----------
    pid3 = novo(pg, 'COM-01')
    escolher(pg, 'foto_a')
    digitar(pg, 'titulo', 'Últimas vagas em novembro'); digitar(pg, 'periodo', '8 a 15 de novembro')
    ok(bloqueios(pg) == 1 and 'confirmação' in pg.inner_text('[data-verificacoes]'), 'COM-01 exige confirmação comercial')
    apos_render(pg, lambda: pg.check('[data-campo="confirmacaoComercial"]'))
    ok(bloqueios(pg) == 0, 'COM-01 confirmado: sem bloqueios')
    digitar(pg, 'condicao', 'Mínimo de 3 noites')
    ok(not pg.is_checked('[data-campo="confirmacaoComercial"]') and bloqueios(pg) == 1, 'COM-01: alterar dado comercial invalida a confirmação')
    apos_render(pg, lambda: pg.select_option('[data-campo="tipo"]', 'datas-especiais'))
    apos_render(pg, lambda: pg.click('[data-formato="stories"]'))
    ok(dim(pg) == [1080, 1920], 'COM-01 em Stories 1080×1920')

    # ---------- COM-02 ----------
    novo(pg, 'COM-02')
    ok(pixel(pg, 5, 5) == ESPUMA and bloqueios(pg) == 0, 'COM-02 renderiza sem foto e sem bloqueios')
    h2 = hashcv(pg)
    digitar(pg, 'mensagem', 'Reserve direto com quem cuida da casa.')
    ok(hashcv(pg) != h2, 'COM-02: a mensagem atualiza a composição')
    digitar(pg, 'chamada', '')
    ok(bloqueios(pg) == 1, 'COM-02: chamada vazia bloqueia')

    # ---------- VID-01 ----------
    novo(pg, 'VID-01')
    ok(dim(pg) == [1080, 1920] and pg.locator('button[data-formato]').count() == 0, 'VID-01 só existe em Reels 1080×1920')
    escolher(pg, 'foto_a'); digitar(pg, 'titulo', 'Uma volta pelo Pico da Tribo')
    ok(bloqueios(pg) == 0, 'VID-01 com foto e título: sem bloqueios')

    # ---------- Etapa 4.1 · projeto gravado na 0.0.4 continua igual ----------
    fa = banco(pg, "(async()=>{const m=await import('" + MODULOS + "biblioteca/fotos.js');return (await m.listarFotos()).find(x=>x.nomeOriginal.includes('foto_a')).id})()")
    fb = banco(pg, "(async()=>{const m=await import('" + MODULOS + "biblioteca/fotos.js');return (await m.listarFotos()).find(x=>x.nomeOriginal.includes('foto_b')).id})()")
    pid_l = banco(pg, "(async()=>{const m=await import('" + MODULOS + "storage/index.js');const p=await m.repo.inserir('projetos',{nome:'Projeto 0.0.4',tipo:'peca',estado:'rascunho',situacao:'ativo',templateId:'FOT-01',formato:'feed',campos:{versao:'discreta',titulo:'Projeto antigo',tag:'Praia do Rosa · SC',apoio:'',chamada:'Ver cotação',escurecimento:'suave',logotipo:false},fotoId:'" + fa + "',fotoIds:['" + fa + "'],enquadramentos:{feed:{zoom:1.2,cx:0.5,cy:0.4}},motorVersao:1});return p.id})()")
    pg.goto(URL + f'#/criar/{pid_l}'); pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(300)
    ok(pg.input_value('[data-campo="composicao"]') == 'classica' and bloqueios(pg) == 0, 'projeto antigo (0.0.4) abre na composição clássica, sem bloqueios')
    ok(float(pg.input_value('[data-zoom]')) == 1.2 and pg.input_value('[data-campo="titulo"]') == 'Projeto antigo', 'projeto antigo mantém título e enquadramento')
    h_l = hashcv(pg); compor_(pg, 'B'); compor_(pg, 'classica')
    ok(hashcv(pg) == h_l, 'voltar à clássica reproduz exatamente a peça antiga')
    reg = registro(pg, pid_l)
    ok(reg['enquadramentos']['feed']['zoom'] == 1.2 and reg['fotoIds'] == [fa], 'registro antigo preservado (foto e enquadramento)')

    # ---------- Etapa 4.1 · FOT-01 A/B/C ----------
    pid4 = novo(pg, 'FOT-01'); escolher(pg, 'foto_a'); digitar(pg, 'titulo', 'Acordar na Praia do Rosa')
    ok(bloqueios(pg) == 0 and perto(pixel(pg, 300, 1340), OCEANO), 'FOT-01 A Feed: bloco Oceano na base, sem bloqueios')
    ok(not pg.is_visible('[data-campo="escurecimento"]') and not pg.is_visible('[data-escolher-foto="2"]'), 'FOT-01 A: só os campos da composição aparecem')
    hA = hashcv(pg)
    compor_(pg, 'B')
    # Layout aprovado (confirmado pelo usuário na Etapa 6): foto em 0–800 e bloco Areia em 800–1350, sem módulo Turquesa no encaixe.
    ok(perto(pixel(pg, 500, 1300), AREIA) and perto(pixel(pg, 100, 805), AREIA) and not perto(pixel(pg, 100, 795), AREIA)
       and not perto(pixel(pg, 100, 750), TURQUESA) and bloqueios(pg) == 0, 'FOT-01 B Feed: foto até y = 800 e bloco Areia no encaixe, sem módulo')
    compor_(pg, 'C')
    ok(bloqueios(pg) == 1 and pg.is_visible('[data-escolher-foto="2"]'), 'FOT-01 C pede a fotografia secundária')
    escolher(pg, 'foto_b', 2)
    ok(bloqueios(pg) == 0 and perto(pixel(pg, 760, 10), AREIA) and perto(pixel(pg, 720, 1000), ESPUMA), 'FOT-01 C Feed: foto secundária, espaço vazio vira placa com logotipo e fundo Espuma')
    ok(pg.locator('[data-slots] [data-slot]').count() == 2, 'duas fotos: o editor oferece escolher qual enquadrar')
    clicar_previa(pg, 900, 700); pg.wait_for_timeout(150)
    ok(pg.get_attribute('[data-slot="2"]', 'aria-pressed') == 'true', 'clicar na foto secundária da prévia seleciona o enquadramento dela')
    zmax2 = float(pg.get_attribute('[data-zoom]', 'max'))
    ok(abs(zmax2 - (int(1000 / max(332 / 2400, 320 / 1800)) / 1000)) < 0.011, 'D-01 por foto: zoom máximo calculado para o espaço da secundária', zmax2)
    h_c = hashcv(pg); pg.fill('[data-zoom]', '1.4'); pg.wait_for_timeout(400)
    ok(hashcv(pg) != h_c, 'zoom da foto secundária altera a peça')
    formato(pg, 'stories')
    ok(dim(pg) == [1080, 1920] and perto(pixel(pg, 10, 1300), TURQUESA) and perto(pixel(pg, 530, 1000), ESPUMA), 'FOT-01 C Stories: composição própria (moldura Espuma e filete Turquesa)')
    salvo(pg); reg = registro(pg, pid4)
    ok(set(reg['fotoIds']) == {fa, fb} and reg['fotoId'] == fa and reg['fotosExtras'][0] == fb, 'projeto guarda as duas fotos por ID, sem duplicar imagens')
    ok('feed#2' in reg['enquadramentos'] and 'stories#2' not in reg['enquadramentos'], 'enquadramento da secundária é próprio de cada formato')
    pg.reload(); pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto"); pg.wait_for_timeout(300)
    h_s = hashcv(pg); formato(pg, 'feed'); formato(pg, 'stories')
    ok(hashcv(pg) == h_s and pg.input_value('[data-campo="composicao"]') == 'C', 'reabrir restaura composição, fotos e formato')
    for comp in 'AB':
        compor_(pg, comp); ok(bloqueios(pg) == 0 and dim(pg) == [1080, 1920], f'FOT-01 {comp} Stories sem bloqueios')
    compor_(pg, 'B'); digitar(pg, 'titulo', 'Acordar na Praia do Rosa com o barulho do mar e o canto dos passarinhos')
    ok(bloqueios(pg) >= 1 and 'não cabe' in pg.inner_text('[data-verificacoes]'), 'título longo demais bloqueia em vez de reduzir abaixo do mínimo')

    # ---------- Etapa 4.1 · FOT-02 ----------
    pid5 = novo(pg, 'FOT-02')
    ok(bloqueios(pg) == 2, 'FOT-02 sem foto e sem legenda: 2 bloqueios', bloqueios(pg))
    escolher(pg, 'foto_b'); digitar(pg, 'legenda', 'Cozinha com varanda e rede'); digitar(pg, 'detalhe', 'Balcão de madeira, rede armada e vista para o verde.')
    # Layout aprovado (confirmado pelo usuário na Etapa 6): foto em 0–1010 e faixa Oceano em 1010–1350, sem módulo Turquesa no encaixe.
    ok(bloqueios(pg) == 0 and perto(pixel(pg, 500, 1300), OCEANO) and perto(pixel(pg, 100, 1015), OCEANO) and not perto(pixel(pg, 100, 1005), OCEANO)
       and not perto(pixel(pg, 100, 950), TURQUESA), 'FOT-02 A Feed: foto até y = 1010 e faixa Oceano no encaixe, sem módulo')
    h0 = hashcv(pg); digitar(pg, 'total', '4')
    ok(hashcv(pg) != h0 and bloqueios(pg) == 0, 'FOT-02: indicador 1/4 aparece no Feed')
    digitar(pg, 'posicao', '5'); ok(bloqueios(pg) == 1, 'FOT-02: posição maior que o total bloqueia'); digitar(pg, 'posicao', '1')
    compor_(pg, 'B'); ok(perto(pixel(pg, 200, 700), AREIA) and bloqueios(pg) == 0, 'FOT-02 B Feed: coluna Areia + foto vertical')
    compor_(pg, 'C'); ok(perto(pixel(pg, 400, 30), ESPUMA) and perto(pixel(pg, 1060, 330), AREIA) and bloqueios(pg) == 0, 'FOT-02 C Feed: faixa Espuma + espaço com logotipo')
    formato(pg, 'stories'); hs = {}
    for comp in 'ABC':
        compor_(pg, comp)
        if comp == 'C':
            # C Stories é foto sangrada em 1080 × 1920: a foto_b (2400 × 1800) só preenche com ampliação
            # de 1920/1800 = 107%. A regra D-01 revisada avisa (até 125%) sem bloquear; com uma foto
            # que tem altura suficiente (foto_a, 3000 × 4000) a mesma composição fica sem o aviso.
            ok(bloqueios(pg) == 0 and 'será ampliada' in pg.inner_text('[data-verificacoes]'), 'FOT-02 C Stories: foto baixa para a foto sangrada gera aviso de ampliação, sem bloqueio (D-01)')
            escolher(pg, 'foto_a')
        hs[comp] = hashcv(pg)
        ok(bloqueios(pg) == 0 and dim(pg) == [1080, 1920], f'FOT-02 {comp} Stories sem bloqueios')
    ok(len(set(hs.values())) == 3, 'FOT-02 Stories: as três composições são diferentes')
    h1 = hashcv(pg); digitar(pg, 'total', '6'); ok(hashcv(pg) == h1, 'FOT-02 Stories não mostra o indicador do carrossel')
    compor_(pg, 'A'); ok(perto(pixel(pg, 500, 1800), OCEANO), 'FOT-02 A Stories: faixa Oceano de 660 px')

    # ---------- Etapa 4.1 · INS-01 ----------
    pid6 = novo(pg, 'INS-01')
    ok(perto(pixel(pg, 5, 5), ESPUMA) and bloqueios(pg) == 3, 'INS-01 sem fotos e sem título: 3 bloqueios', bloqueios(pg))
    escolher(pg, 'foto_a'); escolher(pg, 'foto_b', 2); digitar(pg, 'titulo', 'Madeira, verde e o mar por perto')
    ok(bloqueios(pg) == 0 and perto(pixel(pg, 710, 720), AREIA), 'INS-01 A Feed: mosaico com espaço com logotipo')
    compor_(pg, 'B'); ok(perto(pixel(pg, 5, 5), AREIA) and perto(pixel(pg, 590, 150), ESPUMA), 'INS-01 B Feed: encaixe sobre Areia com placa Espuma com logotipo')
    compor_(pg, 'C'); ok(bloqueios(pg) == 1 and pg.is_visible('[data-escolher-foto="3"]'), 'INS-01 C Feed pede a terceira fotografia')
    escolher(pg, 'foto_a', 3); ok(bloqueios(pg) == 0 and avisos(pg) >= 1, 'INS-01 C: a mesma foto em dois espaços gera aviso, não bloqueio')
    formato(pg, 'stories'); ok(bloqueios(pg) == 0 and pg.locator('[data-slots] [data-slot]').count() == 3, 'INS-01 C Stories aproveita a terceira foto no espaço antes sólido')
    for comp in 'AB':
        compor_(pg, comp); ok(bloqueios(pg) == 0, f'INS-01 {comp} Stories sem bloqueios')
    formato(pg, 'feed'); compor_(pg, 'A'); escolher(pg, 'foto_c')
    ok(bloqueios(pg) == 0 and 'ampliação' in pg.inner_text('[data-verificacoes]'), 'D-01 por espaço: foto pequena na moldura principal gera aviso de ampliação, sem bloqueio')
    escolher(pg, 'foto_a'); escolher(pg, 'foto_c', 2)
    ok(bloqueios(pg) == 0, 'a mesma foto pequena cabe sem ampliação na moldura secundária')
    digitar(pg, 'titulo', 'Madeira, verde, o mar por perto, a rede na varanda e o silêncio da Praia do Rosa ao entardecer')
    ok(bloqueios(pg) >= 1, 'INS-01: texto que não cabe no espaço bloqueia')
    r = pg.evaluate("async () => { const m = await import('" + MODULOS + "biblioteca/fotos.js'); const f = (await m.listarFotos()).find(x => x.nomeOriginal.includes('foto_c')); try { await m.excluirFoto(f.id); return 'excluiu'; } catch (e) { return e.codigo; } }")
    ok(r == 'EXCLUSAO_BLOQUEADA', 'foto usada só como secundária também fica protegida contra exclusão', r)

    # ---------- regressão: proteção da biblioteca e lista ----------
    r = pg.evaluate("""async () => { const m = await import('""" + MODULOS + """biblioteca/fotos.js'); const f = (await m.listarFotos())[0];
      const usada = (await m.listarFotos()).find(x => x.nomeOriginal.includes('foto_a')); try { await m.excluirFoto(usada.id); return 'excluiu'; } catch (e) { return e.codigo; } }""")
    ok(r == 'EXCLUSAO_BLOQUEADA', 'foto usada por projeto não pode ser excluída (proteção existente)', r)
    pg.goto(URL + '#/projetos'); pg.wait_for_selector('[data-projeto]')
    ok(pg.locator('[data-projeto]').count() == 9, 'Projetos lista os 9 rascunhos criados', pg.locator('[data-projeto]').count())
    pg.goto(URL + '#/fotografias'); pg.wait_for_timeout(500)
    ok(pg.locator('.foto').count() == 3, 'biblioteca intacta no fim: 3 fotografias')

main()
