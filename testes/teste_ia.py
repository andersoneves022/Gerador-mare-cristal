#!/usr/bin/env python3
"""Testes da geração de textos com IA no editor (fluxo do navegador, com o serviço de IA simulado).
Cobre: objetivo obrigatório, geração sem fotografias, nenhum dado de imagem no pedido, observação opcional
sobre as imagens, confirmação antes de substituir, preenchimento dos campos reais, salvamento/reabertura
e exportação após a geração.
Uso: APP_URL=http://localhost:8080/ APP_MODULOS=/src/legacy/ python3 testes/teste_ia.py
Para testar contra um deploy Netlify real (sem simulação): IA_REAL=1 APP_URL=https://seu-site.netlify.app/ ..."""
import os, sys, json, tempfile
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

URL = os.environ.get('APP_URL', 'http://localhost:8080/')
MODULOS = os.environ.get('APP_MODULOS', '/src/legacy/')
REAL = os.environ.get('IA_REAL') == '1'
falhas, total = [], 0

def ok(cond, nome, detalhe=''):
    global total
    total += 1
    print(('OK    ' if cond else 'FALHA ') + nome + (f'  [{detalhe}]' if detalhe and not cond else ''))
    if not cond: falhas.append(nome)

def foto(caminho):
    im = Image.new('RGB', (2400, 1800)); d = ImageDraw.Draw(im)
    for y in range(0, 1800, 8): d.rectangle([0, y, 2400, y + 8], fill=(40 + y * 150 // 1800, 140, 200 - y * 100 // 1800))
    d.ellipse([800, 600, 1800, 1400], fill=(30, 160, 90)); im.save(caminho, 'JPEG', quality=90)

def selo(pg): return pg.get_attribute('[data-previa]', 'data-pronto')
def salvo(pg): pg.wait_for_function("() => document.querySelector('[data-status]').textContent.startsWith('Salvo')", timeout=8000)
def valor(pg, campo): return pg.input_value(f'.painel [data-campo="{campo}"]')

def main():
    tmp = tempfile.mkdtemp(); cam = os.path.join(tmp, 'praia.jpg'); foto(cam)
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True); pg = b.new_page(viewport={'width': 1280, 'height': 1800})
        erros = []; pg.on('pageerror', lambda e: erros.append(str(e)))
        pedidos = []
        def simular(route):
            corpo = json.loads(route.request.post_data); pedidos.append(corpo)
            gerados = pg.evaluate("async ([M, t, c]) => { const C = await import(M + 'ia/contrato.js'); const T = await import(M + 'render/templates/index.js');"
                                  " const f = T.obterFicha(t); const o = {}; for (const d of C.camposGeraveis(f, c)) o[d.id] = ['lista','itens'].includes(d.tipo) ? (c[d.id] ?? []) : 'Gerado ' + d.id; return o; }",
                                  [MODULOS, corpo['templateId'], corpo['campos']])
            linhas = [{'tipo': 'provedor', 'provedor': 'OpenRouter'}, {'tipo': 'resultado', 'campos': gerados, 'provedor': 'OpenRouter', 'fallback': False}]
            route.fulfill(status=200, headers={'content-type': 'application/x-ndjson'}, body='\n'.join(json.dumps(l) for l in linhas) + '\n')
        if not REAL: pg.route('**/api/copywriting', simular)

        pg.goto(URL); pg.wait_for_function("() => document.body.innerText.includes('Fontes: 4 de 4')", timeout=20000)
        pg.goto(URL + '#/criar'); pg.click('[data-template="FOT-01"]')
        pg.wait_for_selector('[data-previa]'); pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")
        pid = pg.url.split('/')[-1]
        # Nenhuma fotografia é selecionada: a geração deve funcionar mesmo assim.
        ok(pg.locator('[data-ia-foto]').count() == 0 and pg.locator('[data-ia-consentimento]').count() == 0, 'painel não pede fotografias nem consentimento de envio de imagens')
        pg.fill('.painel [data-campo="titulo"]', 'Meu título antigo'); salvo(pg)

        pg.click('[data-ia-gerar]')
        ok('objetivo' in pg.inner_text('[data-ia-status]').lower() and not pedidos, 'sem objetivo não envia nada')
        pg.fill('[data-ia-objetivo]', 'Divulgar a cabana na baixa temporada')
        pg.fill('[data-ia-observacao]', 'A foto mostra a varanda ao entardecer')

        pg.click('[data-ia-gerar]'); pg.wait_for_selector('[data-confirmar]', timeout=60000)
        if not REAL:
            ok(len(pedidos) == 1, 'um único pedido enviado')
            corpo = json.dumps(pedidos[0])
            ok('fotos' not in pedidos[0] and 'base64' not in corpo and 'data:image' not in corpo, 'nenhum dado de imagem é enviado')
            ok(pedidos[0]['templateId'] == 'FOT-01' and pedidos[0]['observacaoImagens'] == 'A foto mostra a varanda ao entardecer', 'pedido leva o modelo real e a observação digitada')
            ok(set(pedidos[0]['campos']).issubset({'composicao', 'versao', 'titulo', 'tag', 'apoio', 'chamada', 'escurecimento', 'logotipo'}), 'pedido não leva campos fictícios', list(pedidos[0]['campos']))
        pg.click('[data-confirmar-nao]')
        ok(valor(pg, 'titulo') == 'Meu título antigo', 'cancelar a confirmação preserva os textos existentes')

        pg.click('[data-ia-gerar]'); pg.wait_for_selector('[data-confirmar]', timeout=60000)
        antes = selo(pg); pg.click('[data-confirmar-sim]')
        pg.wait_for_function("a => document.querySelector('[data-previa]').dataset.pronto !== a", arg=antes, timeout=8000)
        novo = valor(pg, 'titulo')
        ok(novo != 'Meu título antigo' and novo.strip() != '', 'confirmar aplica o texto gerado ao campo real', novo)
        salvo(pg)

        pg.goto(URL + '#/projetos'); pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_selector('[data-previa]')
        pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")
        ok(valor(pg, 'titulo') == novo, 'texto gerado continua salvo após reabrir o projeto')

        # A fotografia volta a ser necessária apenas para a arte/exportação, nunca para a IA.
        pg.goto(URL + '#/fotografias'); pg.set_input_files('input[type=file]', cam)
        pg.wait_for_function("() => document.querySelectorAll('.foto').length >= 1", timeout=30000)
        pg.goto(URL + f'#/criar/{pid}'); pg.wait_for_selector('[data-previa]')
        pg.click('[data-escolher-foto="1"]'); pg.wait_for_selector('[data-seletor] [data-foto-id]'); pg.locator('[data-seletor] [data-foto-id]').first.click()
        pg.wait_for_function("() => document.querySelector('[data-previa]').dataset.pronto")

        pg.goto(URL + f'#/exportar/{pid}'); pg.wait_for_selector('[data-exportar]', timeout=15000); pg.click('[data-exportar]')
        pg.wait_for_function("() => document.querySelector('[data-baixar-arquivo], [data-baixar-todos], [data-baixar-zip]') || /falhou|Nenhuma|bloque/i.test(document.querySelector('[data-exportar-estado]')?.innerText ?? '')", timeout=30000)
        print('estado exportação:', pg.evaluate("() => document.querySelector('[data-exportar-estado]')?.innerText"))
        with pg.expect_download(timeout=30000) as d:
            pg.locator('[data-baixar-arquivo], [data-baixar-zip]').first.click()
        ok(d.value.suggested_filename.lower().endswith(('.png', '.jpg', '.zip')), 'exportação funciona após a geração', d.value.suggested_filename)
        ok(not erros, 'sem erros na página', erros)
        b.close()
    print(f'\n{total - len(falhas)}/{total} verificações ok')
    sys.exit(1 if falhas else 0)

main()
