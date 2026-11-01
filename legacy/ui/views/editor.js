// Editor de artes: prévia (mesmo motor da exportação), campos do template, enquadramento,
// verificações e salvamento automático no IndexedDB.
import { h } from '../../core/dom.js';
import { estadoFontes, aoMudarFontes } from '../../core/fonts.js';
import { iniciarArmazenamento } from '../../storage/estado.js';
import { listarFotos, obterDerivado } from '../../biblioteca/fotos.js';
import { filtrarFotos } from '../../biblioteca/filtros.js';
import { CATEGORIAS } from '../../config.js';
import { obterProjeto, salvarProjeto, ESTADOS } from '../../projetos/projetos.js';
import { obterFicha } from '../../render/templates/index.js';
import { FORMATOS, ESCURECIMENTO_ROTULO } from '../../render/tokens.js';
import { compor, desenhar } from '../../render/motor.js';
import { prepararRecursos, carregarLogo } from '../../render/imagens.js';
import { normalizar } from '../../render/enquadramento.js';
import { LISTA_ICONES } from '../../render/icones.js';
import { NOMES_SLOT, fotoDoSlot } from '../../render/composicao.js';
import { painelIA } from '../../ia/painel.js';

const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const PCT = (n) => `${Math.round(n * 100)}%`;

function esperarFontes() {
  return new Promise((resolve) => {
    if (estadoFontes().pronto) return resolve();
    const parar = aoMudarFontes((e) => { if (e.pronto) { parar(); resolve(); } });
  });
}

export function renderEditor(id) {
  const raiz = h('div', { classe: 'editor', 'data-editor': id }, h('p', { role: 'status' }, 'Abrindo projeto…'));
  const est = { p: null, ficha: null, rec: null, cena: null, slot: 1, tk: 0, timer: null, sujo: false, cadeia: Promise.resolve(), morto: false, urls: new Set() };
  const ui = {};
  const campos = new Map(); // id do campo -> { linha, atualizar() }

  // ---------- salvamento ----------
  const status = (txt, erro = false) => { if (ui.status) { ui.status.textContent = txt; ui.status.dataset.estado = erro ? 'erro' : txt.startsWith('Salvo') ? 'salvo' : 'pendente'; } };
  function agendarSalvar() {
    est.sujo = true; status('Alterações pendentes');
    clearTimeout(est.timer);
    est.timer = setTimeout(flush, 500);
  }
  function flush() {
    clearTimeout(est.timer);
    if (!est.sujo || !est.p) return est.cadeia;
    est.sujo = false;
    const { nome, formato, campos: c, fotoId, fotosExtras, enquadramentos } = est.p;
    const snap = structuredClone({ nome, formato, campos: c, fotoId, fotosExtras, enquadramentos });
    status('Salvando…');
    est.cadeia = est.cadeia.then(() => salvarProjeto(id, snap))
      .then((r) => { if (!est.sujo) status(`Salvo às ${hora.format(r.atualizadoEm)}`); })
      .catch((e) => { est.sujo = true; status('Erro ao salvar', true); console.error('Salvar projeto:', e); });
    return est.cadeia;
  }
  const aoOcultar = () => { if (document.visibilityState === 'hidden') flush(); };
  document.addEventListener('visibilitychange', aoOcultar);
  window.addEventListener('pagehide', flush);
  raiz.limpar = () => {
    est.morto = true; ui.ia?.cancelar?.(); flush();
    document.removeEventListener('visibilitychange', aoOcultar);
    window.removeEventListener('pagehide', flush);
    est.urls.forEach((u) => URL.revokeObjectURL(u));
  };

  // ---------- renderização ----------
  let rAF = 0;
  const agendarRender = () => { cancelAnimationFrame(rAF); rAF = requestAnimationFrame(renderizar); };
  const dados = () => ({ templateId: est.p.templateId, formato: est.p.formato, campos: est.p.campos, fotoId: est.p.fotoId, fotosExtras: est.p.fotosExtras, enquadramentos: est.p.enquadramentos });

  async function renderizar() {
    if (est.morto || !est.p) return;
    const tk = ++est.tk;
    let rec;
    try { rec = await prepararRecursos([est.p.fotoId, ...(est.p.fotosExtras ?? [])]); } catch (e) { console.error('Imagem:', e); rec = { imagem: null, imagens: {}, logo: await carregarLogo() }; }
    if (tk !== est.tk || est.morto) return;
    const cena = compor(dados(), rec);
    const cv = ui.canvas;
    if (cv.width !== cena.largura || cv.height !== cena.altura) { cv.width = cena.largura; cv.height = cena.altura; }
    desenhar(cv.getContext('2d'), cena, rec);
    est.rec = rec; est.cena = cena;
    cv.dataset.formato = cena.formato; cv.dataset.bloqueios = cena.bloqueios.length; cv.dataset.avisos = cena.avisos.length;
    cv.dataset.pronto = String(tk);
    pintarVerificacoes(cena); pintarEnquadramento(cena); pintarGuias(cena);
  }

  // Prévia do recorte (Ficha VID-01 §14.11, RC-08): no 9:16, mostra a grade 3:4 (y 240–1680) e o
  // recorte 4:5 do Feed numa camada separada. A arte em si não muda (prévia = arquivo exportado).
  function pintarGuias(cena) {
    const g = ui.guias, F = FORMATOS[cena.formato];
    if (!g) return;
    if (g.width !== cena.largura || g.height !== cena.altura) { g.width = cena.largura; g.height = cena.altura; }
    const x = g.getContext('2d'); x.clearRect(0, 0, g.width, g.height);
    const ligado = !!F?.faixa34 && ui.mostrarGuias?.checked;
    g.hidden = !ligado; if (ui.linhaGuias) ui.linhaGuias.hidden = !F?.faixa34;
    if (!ligado) return;
    const faixa = (y1, y2, cor, rotulo) => {
      x.save(); x.setLineDash([24, 16]); x.lineWidth = 4; x.strokeStyle = cor;
      x.strokeRect(2, y1, g.width - 4, y2 - y1);
      x.font = '600 28px Inter'; x.fillStyle = cor; x.textBaseline = 'bottom'; x.fillText(rotulo, 16, y1 - 6); x.restore();
    };
    x.fillStyle = 'rgba(10,79,96,0.35)';
    x.fillRect(0, 0, g.width, F.faixa34.y1); x.fillRect(0, F.faixa34.y2, g.width, g.height - F.faixa34.y2);
    faixa(F.faixa34.y1, F.faixa34.y2, '#C6F000', 'Grade do perfil (3:4)');
    const h45 = Math.round(g.width * 5 / 4), y45 = Math.round((g.height - h45) / 2);
    faixa(y45, y45 + h45, '#14B8CE', 'Feed (4:5)');
  }

  function pintarVerificacoes(cena) {
    const rot = (campo) => (campo && est.ficha.campos.find((c) => c.id === campo)?.rotulo) || '';
    const li = (nivel, v) => h('li', { classe: `verif verif--${nivel}` },
      h('span', { classe: 'aviso__selo' }, nivel === 'bloqueio' ? 'Bloqueio' : 'Aviso'),
      h('span', {}, v.texto));
    ui.verif.replaceChildren(...(cena.bloqueios.length || cena.avisos.length
      ? [...cena.bloqueios.map((v) => li('bloqueio', v)), ...cena.avisos.map((v) => li('aviso', v))]
      : [h('li', { classe: 'verif verif--ok' }, h('span', { classe: 'aviso__selo' }, 'Ok'), h('span', {}, 'Sem pendências nesta peça.'))]));
    void rot;
  }

  // ---------- enquadramento ----------
  // Quadro ativo: a foto que o arraste, o zoom e as setas ajustam. Estruturas A/B têm uma só (o quadro inteiro).
  const quadros = () => est.cena?.quadros ?? (est.cena?.quadro ? [{ ...est.cena.quadro, slot: 1 }] : []);
  const quadroAtivo = () => quadros().find((q) => q.slot === est.slot) ?? quadros()[0] ?? null;
  const enqAtual = () => { const q = quadroAtivo(); return q ? { zoom: q.zoom, cx: q.cx, cy: q.cy } : null; };
  function definirEnquadramento(enq) {
    const q = quadroAtivo(); if (!q) return;
    const meta = (est.rec?.imagens?.[q.slot] ?? (q.slot === 1 ? est.rec?.imagem : null))?.meta;
    const F = FORMATOS[est.p.formato];
    if (!meta) return;
    const chave = q.chave ?? F.id;
    est.p.enquadramentos = { ...est.p.enquadramentos, [chave]: normalizar(enq, meta, q.w ?? F.largura, q.h ?? F.altura) };
    agendarSalvar(); agendarRender();
  }
  function pintarEnquadramento(cena) {
    const q = quadroAtivo();
    ui.enq.hidden = !q;
    if (!q) return;
    est.slot = q.slot;
    const lista = quadros();
    ui.slots.hidden = lista.length < 2;
    ui.slots.replaceChildren(...lista.map((x) => {
      const b = h('button', { type: 'button', classe: 'segmento', 'data-slot': String(x.slot), 'aria-pressed': String(x.slot === q.slot) }, NOMES_SLOT[x.slot]);
      b.addEventListener('click', () => { est.slot = x.slot; pintarEnquadramento(est.cena); });
      return b;
    }));
    ui.ajustando.textContent = lista.length > 1 ? `Ajustando: ${NOMES_SLOT[q.slot].toLowerCase()}. Clique numa foto da prévia para ajustá-la.` : '';
    const max = Math.floor(q.zoomMax * 100) / 100;
    ui.zoom.max = String(max); ui.zoom.min = '1'; ui.zoom.step = '0.01';
    ui.zoom.value = String(q.zoom); ui.zoom.disabled = max <= 1;
    ui.zoomTxt.textContent = `Zoom ${q.zoom.toFixed(2)}× (máximo ${max.toFixed(2)}×, limite de resolução)`;
    const nivel = { leve: 'ampliação leve', significativa: 'ampliação significativa', elevada: 'ampliação elevada: confirmar antes de exportar' }[q.nivelAmpliacao];
    ui.escala.textContent = `Resolução usada: ${PCT(q.escalaFinal)} do original${nivel ? ` (${nivel})` : ''}.`;
  }
  function ligarArraste(cv) {
    let ini = null;
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(), k = cv.width / r.width;
      const px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
      const alvo = quadros().find((x) => x.x == null || (px >= x.x && px <= x.x + x.w && py >= x.y && py <= x.y + x.h));
      if (!alvo) return;
      if (alvo.slot !== est.slot) { est.slot = alvo.slot; pintarEnquadramento(est.cena); }
      const q = quadroAtivo(); if (!q) return;
      cv.setPointerCapture(e.pointerId); ini = { x: e.clientX, y: e.clientY, cx: q.cx, cy: q.cy, zoom: q.zoom }; cv.classList.add('arrastando');
    });
    cv.addEventListener('pointermove', (e) => {
      const q = quadroAtivo();
      if (!ini || !q) return;
      const r = cv.getBoundingClientRect(), k = cv.width / r.width;
      definirEnquadramento({ zoom: ini.zoom, cx: ini.cx - ((e.clientX - ini.x) * k) / q.escalaFinal / q.fotoLargura, cy: ini.cy - ((e.clientY - ini.y) * k) / q.escalaFinal / q.fotoAltura });
    });
    const fim = () => { ini = null; cv.classList.remove('arrastando'); };
    cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
    cv.addEventListener('keydown', (e) => {
      const q = quadroAtivo(); const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!q || !d) return;
      e.preventDefault();
      definirEnquadramento({ zoom: q.zoom, cx: q.cx + (d[0] * 24) / q.escalaFinal / q.fotoLargura, cy: q.cy + (d[1] * 24) / q.escalaFinal / q.fotoAltura });
    });
  }

  // ---------- campos ----------
  function mudarCampo(cid, valor) {
    const def = est.ficha.campos.find((c) => c.id === cid);
    est.p.campos = { ...est.p.campos, [cid]: valor };
    // Alterar dado comercial invalida a confirmação (Ficha COM-01 §12.10).
    if (def?.comercial && est.p.campos.confirmacaoComercial) est.p.campos.confirmacaoComercial = false;
    sincronizarCampos(); agendarSalvar(); agendarRender();
  }
  const sincronizarCampos = () => { campos.forEach((c) => c.atualizar()); ui.ia?.atualizar(); };
  // Textos gerados pela IA: só campos de texto/lista já validados; fotos, enquadramento e estilo intactos.
  function aplicarGerados(novos) {
    est.p.campos = { ...est.p.campos, ...structuredClone(novos) };
    sincronizarCampos(); agendarSalvar(); flush(); agendarRender();
  }

  function contador(cid, ref) {
    if (!ref) return null;
    const el = h('span', { classe: 'nota contador' });
    const atualizar = () => { const n = (est.p.campos[cid] ?? '').length; el.textContent = `${n} de ${ref} caracteres (referência, não é limite)`; };
    return { el, atualizar };
  }

  function controle(def) {
    const v = () => est.p.campos[def.id];
    const rotulo = h('span', { classe: 'campo__rotulo' }, def.rotulo);
    let entrada, extra = [], atualizar = () => {};
    if (def.tipo === 'texto' || def.tipo === 'textoLongo') {
      entrada = h(def.tipo === 'texto' ? 'input' : 'textarea', { type: def.tipo === 'texto' ? 'text' : null, rows: def.tipo === 'texto' ? null : '2', 'data-campo': def.id, placeholder: def.placeholder });
      entrada.addEventListener('input', () => mudarCampo(def.id, entrada.value));
      const c = contador(def.id, def.ref); if (c) extra.push(c.el);
      atualizar = () => { if (entrada.value !== (v() ?? '')) entrada.value = v() ?? ''; c?.atualizar(); };
      for (const [texto, rot] of def.sugestoes ?? []) {
        const b = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno' }, rot);
        b.addEventListener('click', () => mudarCampo(def.id, texto)); extra.push(b);
      }
    } else if (def.tipo === 'selecao' || def.tipo === 'escurecimento' || def.tipo === 'fundo') {
      const ops = def.tipo === 'escurecimento' ? est.ficha.escurecimento.niveis.map((n) => [n, ESCURECIMENTO_ROTULO[n]])
        : def.tipo === 'fundo' ? [['espuma', 'Espuma'], ['areia', 'Areia']] : def.opcoes;
      entrada = h('select', { 'data-campo': def.id }, ops.map(([val, rot]) => h('option', { value: val }, rot)));
      entrada.addEventListener('change', () => mudarCampo(def.id, entrada.value));
      atualizar = () => { entrada.value = v(); };
    } else if (def.tipo === 'numero') {
      entrada = h('input', { type: 'number', inputmode: def.passo ? 'decimal' : 'numeric', min: def.min, max: def.max, step: String(def.passo ?? 1), 'data-campo': def.id });
      entrada.addEventListener('input', () => mudarCampo(def.id, entrada.value === '' ? null : Number(entrada.value)));
      atualizar = () => { const x = v() == null ? '' : String(v()); if (entrada.value !== x) entrada.value = x; };
    } else if (def.tipo === 'booleano') {
      entrada = h('input', { type: 'checkbox', 'data-campo': def.id });
      entrada.addEventListener('change', () => mudarCampo(def.id, entrada.checked));
      atualizar = () => { entrada.checked = !!v(); };
      const linha = h('label', { classe: 'campo campo--check', 'data-linha': def.id }, entrada, rotulo);
      return { linha, atualizar: () => { atualizar(); linha.hidden = def.visivelSe ? !def.visivelSe(est.p.campos) : false; } };
    } else if (def.tipo === 'foto') return controleFoto(def);
    else if (def.tipo === 'itens') return controleItens(def);
    else if (def.tipo === 'lista') return controleSubcampos(def);
    const linha = h('label', { classe: 'campo', 'data-linha': def.id }, rotulo, entrada, ...extra);
    return { linha, atualizar: () => { atualizar(); linha.hidden = def.visivelSe ? !def.visivelSe(est.p.campos) : false; } };
  }

  // Lista editável genérica (Etapa 6): adicionar, editar, remover e reordenar. Cada lista grava no
  // campo da própria ficha (def.id) e respeita os limites def.min/def.max (as validações da ficha
  // continuam bloqueando quantidades fora da faixa). "entradas(i)" cria os controles de um item e
  // devolve { nos, sincronizar(item) }; com o mesmo número de itens só os valores são sincronizados
  // (mantém o foco do campo em edição).
  function controleLista(def, { textoAdicionar, novoItem, entradas }) {
    const itens = () => (Array.isArray(est.p.campos[def.id]) ? est.p.campos[def.id] : []);
    const gravar = (n) => mudarCampo(def.id, n);
    const editar = (i, parcial) => gravar(itens().map((x, j) => (j === i ? { ...x, ...parcial } : x)));
    const mover = (i, d) => { const n = [...itens()], j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; gravar(n); };
    const lista = h('ul', { classe: 'itens', 'data-itens': def.id, 'data-lista': def.id });
    const novo = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-adicionar-item': def.id }, textoAdicionar);
    const limites = h('span', { classe: 'nota', 'data-limites': def.id });
    novo.addEventListener('click', () => { if (itens().length < def.max) gravar([...itens(), novoItem()]); });
    let linhas = [];
    const atualizar = () => {
      const xs = itens();
      if (linhas.length !== xs.length) {
        linhas = xs.map((_, i) => {
          const { nos, sincronizar } = entradas(i, editar);
          const subir = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'aria-label': `Mover item ${i + 1} para cima`, 'data-subir-item': i }, '↑');
          const descer = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'aria-label': `Mover item ${i + 1} para baixo`, 'data-descer-item': i }, '↓');
          const rem = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'aria-label': `Remover item ${i + 1}`, 'data-remover-item': i }, 'Remover');
          subir.addEventListener('click', () => mover(i, -1));
          descer.addEventListener('click', () => mover(i, 1));
          rem.addEventListener('click', () => { if (itens().length > def.min) gravar(itens().filter((_, j) => j !== i)); });
          const li = h('li', { classe: `item item--${def.tipo}`, 'data-item': i }, h('span', { classe: 'item__num' }, `${i + 1}.`), ...nos, h('span', { classe: 'item__acoes' }, subir, descer, rem));
          return { li, sincronizar, subir, descer, rem };
        });
        lista.replaceChildren(...linhas.map((l) => l.li));
      }
      linhas.forEach((l, i) => {
        l.sincronizar(xs[i]);
        l.subir.disabled = i === 0; l.descer.disabled = i === xs.length - 1; l.rem.disabled = xs.length <= def.min;
      });
      novo.disabled = xs.length >= def.max;
      limites.textContent = `${xs.length} de ${def.min} a ${def.max}.`;
    };
    const linha = h('div', { classe: 'campo', 'data-linha': def.id }, h('span', { classe: 'campo__rotulo' }, def.rotulo), lista, h('div', { classe: 'itens__rodape' }, novo, limites));
    return { linha, atualizar: () => { atualizar(); linha.hidden = def.visivelSe ? !def.visivelSe(est.p.campos) : false; } };
  }

  const sincronizarValor = (el, valor) => { const x = valor ?? ''; if (el.value !== x) el.value = x; };

  // Itens com ícone (grade de ícones).
  function controleItens(def) {
    return controleLista(def, {
      textoAdicionar: 'Adicionar item',
      novoItem: () => (def.novo ? def.novo() : { icone: 'estrela', texto: '' }),
      entradas: (i, editar) => {
        const sel = h('select', { 'aria-label': `Ícone do item ${i + 1}`, 'data-item-icone': i }, LISTA_ICONES.map((ic) => h('option', { value: ic.id }, ic.rotulo)));
        const txt = h('input', { type: 'text', 'aria-label': `Texto do item ${i + 1}`, 'data-item-texto': i, placeholder: 'Texto do item' });
        sel.addEventListener('change', () => editar(i, { icone: sel.value }));
        txt.addEventListener('input', () => editar(i, { texto: txt.value }));
        return { nos: [sel, txt], sincronizar: (it) => { sel.value = it?.icone ?? 'estrela'; sincronizarValor(txt, it?.texto); } };
      },
    });
  }

  // Itens com subcampos de texto declarados na ficha (linhas rótulo/valor, passos numerados…).
  function controleSubcampos(def) {
    const vazio = () => Object.fromEntries(def.subcampos.map((s) => [s.id, '']));
    return controleLista(def, {
      textoAdicionar: def.textoAdicionar ?? 'Adicionar',
      novoItem: () => (def.novo ? def.novo() : vazio()),
      entradas: (i, editar) => {
        const pares = def.subcampos.map((s) => {
          // Subcampo numérico (tempos do VID-02): grava número, ou '' quando vazio.
          const num = s.tipo === 'numero';
          const el = h('input', { type: num ? 'number' : 'text', step: num ? String(s.passo ?? 1) : null, min: num ? '0' : null, inputmode: num ? 'decimal' : null, 'aria-label': `${s.rotulo} ${i + 1}`, 'data-sub': s.id, 'data-item-sub': `${i}:${s.id}`, placeholder: s.rotulo });
          el.addEventListener('input', () => editar(i, { [s.id]: num ? (el.value === '' ? '' : Number(el.value)) : el.value }));
          return [s, el];
        });
        return {
          nos: [h('span', { classe: 'item__campos' }, ...pares.map(([s, el]) => h('label', { classe: 'item__sub' }, h('span', { classe: 'nota' }, s.ref ? `${s.rotulo} (ref. ${s.ref})` : s.rotulo), el)))],
          sincronizar: (it) => pares.forEach(([s, el]) => sincronizarValor(el, it?.[s.id] == null ? '' : String(it[s.id]))),
        };
      },
    });
  }

  function controleFoto(def) {
    const slot = def.slot ?? 1;
    const quadro = h('div', { classe: 'foto-atual' });
    const botao = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-escolher-foto': String(slot) }, 'Escolher fotografia');
    botao.addEventListener('click', () => escolherFoto(slot));
    let mostrada;
    const linha = h('div', { classe: 'campo', 'data-linha': def.id }, h('span', { classe: 'campo__rotulo' }, def.rotulo), quadro, botao);
    const atualizar = async () => {
      linha.hidden = def.visivelSe ? !def.visivelSe(est.p.campos) : false;
      const fid = fotoDoSlot(est.p, slot);
      botao.textContent = fid ? 'Trocar fotografia' : 'Escolher fotografia';
      if (mostrada === fid) return; mostrada = fid;
      if (!fid) { quadro.replaceChildren(h('span', { classe: 'nota' }, 'Nenhuma fotografia escolhida.')); return; }
      try {
        const blob = await obterDerivado(fid, 'miniatura');
        if (mostrada !== fid || !blob) { if (!blob) quadro.replaceChildren(h('span', { classe: 'nota' }, 'Fotografia indisponível.')); return; }
        const url = URL.createObjectURL(blob); est.urls.add(url);
        quadro.replaceChildren(h('img', { src: url, alt: 'Fotografia escolhida', 'data-foto-atual': fid }));
      } catch { quadro.replaceChildren(h('span', { classe: 'nota' }, 'Fotografia indisponível.')); }
    };
    return { linha, atualizar };
  }

  // ---------- seletor de fotografia (biblioteca) ----------
  async function escolherFoto(slot = 1) {
    const dlg = h('dialog', { classe: 'seletor', 'aria-label': `Escolher: ${NOMES_SLOT[slot].toLowerCase()}`, 'data-seletor': '' });
    const urls = [];
    const grade = h('ul', { classe: 'seletor__grade' });
    const filtro = h('select', { 'aria-label': 'Categoria' }, h('option', { value: '' }, 'Todas as categorias'),
      ...CATEGORIAS.map((c) => h('option', { value: c.id }, c.rotulo)));
    const fechar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno' }, 'Cancelar');
    fechar.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { urls.forEach((u) => URL.revokeObjectURL(u)); dlg.remove(); });
    dlg.append(h('div', { classe: 'seletor__topo' }, h('h2', {}, 'Fotografias'), filtro, fechar), grade);
    document.body.append(dlg); dlg.showModal();
    let todas = [];
    try { todas = await listarFotos(); } catch (e) { grade.replaceChildren(h('li', {}, 'Não foi possível ler a biblioteca.')); return; }
    const pintar = () => {
      const lista = filtrarFotos(todas, { categoria: filtro.value });
      if (!lista.length) { grade.replaceChildren(h('li', { classe: 'nota' }, todas.length ? 'Nenhuma fotografia nesta categoria.' : 'A biblioteca está vazia. Importe fotografias na área Fotografias.')); return; }
      grade.replaceChildren(...lista.map((f) => {
        const img = h('img', { alt: f.nomeOriginal, loading: 'lazy' });
        obterDerivado(f.id, 'miniatura').then((b) => { if (b && dlg.isConnected) { const u = URL.createObjectURL(b); urls.push(u); img.src = u; } });
        const b = h('button', { type: 'button', classe: 'seletor__foto', 'data-foto-id': f.id, title: f.nomeOriginal }, img, h('span', { classe: 'nota' }, f.nomeOriginal));
        b.addEventListener('click', () => { trocarFoto(f.id, slot); dlg.close(); });
        return h('li', {}, b);
      }));
    };
    filtro.addEventListener('change', pintar); pintar();
  }
  // Os enquadramentos são relativos à foto anterior: trocar uma foto limpa só os enquadramentos dela.
  function trocarFoto(fotoId, slot = 1) {
    const deste = (k) => (slot === 1 ? !k.includes('#') : k.endsWith(`#${slot}`));
    est.p.enquadramentos = Object.fromEntries(Object.entries(est.p.enquadramentos ?? {}).filter(([k]) => !deste(k)));
    if (slot === 1) est.p.fotoId = fotoId;
    else { const x = [...(est.p.fotosExtras ?? [])]; while (x.length < slot - 1) x.push(null); x[slot - 2] = fotoId; est.p.fotosExtras = x; }
    est.slot = slot;
    // Troca de foto grava na hora: a referência protege a fotografia contra exclusão (§5.10).
    sincronizarCampos(); agendarSalvar(); flush(); agendarRender();
  }

  // ---------- montagem ----------
  async function montar() {
    await iniciarArmazenamento();
    const p = await obterProjeto(id);
    if (est.morto) return;
    if (!p || p.situacao === 'lixeira') {
      raiz.replaceChildren(h('div', { classe: 'vazio' }, h('h2', {}, 'Projeto não encontrado'), h('p', {}, 'Ele pode ter sido removido.'), h('div', {}, h('a', { classe: 'botao', href: '#/projetos' }, 'Ver projetos'))));
      return;
    }
    est.p = p; est.ficha = obterFicha(p.templateId);
    if (!est.ficha) { raiz.replaceChildren(h('p', {}, `Template ${p.templateId} indisponível nesta versão.`)); return; }
    // "legado" cobre campos novos que projetos antigos não têm (ex.: FOT-01 abre na composição clássica).
    est.p.campos = { ...est.ficha.padroes(), ...(est.ficha.legado ?? {}), ...p.campos };
    est.p.fotosExtras = p.fotosExtras ?? [];
    await esperarFontes();
    if (est.morto) return;

    ui.canvas = h('canvas', { classe: 'previa__tela', 'data-previa': '', tabindex: '0', role: 'img', 'aria-label': 'Prévia da arte. Arraste ou use as setas para reposicionar a fotografia.' });
    ui.canvas.width = 1080; ui.canvas.height = 1350;
    ligarArraste(ui.canvas);
    ui.guias = h('canvas', { classe: 'previa__tela previa__guias', 'data-guias': '', 'aria-hidden': 'true' });
    ui.mostrarGuias = h('input', { type: 'checkbox', 'data-mostrar-guias': '' }); ui.mostrarGuias.checked = true;
    ui.mostrarGuias.addEventListener('change', () => est.cena && pintarGuias(est.cena));
    ui.linhaGuias = h('label', { classe: 'campo campo--check nota' }, ui.mostrarGuias, h('span', {}, 'Mostrar recortes (grade 3:4 e Feed 4:5). Só na tela; não entra no arquivo.'));
    ui.status = h('span', { classe: 'editor__status', role: 'status', 'data-status': '' }, 'Salvo');
    const nome = h('input', { type: 'text', classe: 'editor__nome', 'aria-label': 'Nome do projeto', 'data-campo': 'nome' }); nome.value = p.nome || '';
    nome.addEventListener('input', () => { est.p.nome = nome.value; agendarSalvar(); });
    const salvar = h('button', { type: 'button', classe: 'botao botao--pequeno', 'data-salvar': '' }, 'Salvar');
    salvar.addEventListener('click', flush);
    const botoesFormato = est.ficha.formatos.map((fid) => {
      const b = h('button', { type: 'button', classe: 'segmento', 'data-formato': fid, 'aria-pressed': String(fid === est.p.formato) }, FORMATOS[fid].rotulo);
      b.addEventListener('click', () => {
        est.p.formato = fid; botoesFormato.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.formato === fid)));
        agendarSalvar(); agendarRender();
      });
      return b;
    });
    ui.verif = h('ul', { classe: 'verifs', 'data-verificacoes': '', role: 'status' });
    ui.zoom = h('input', { type: 'range', 'data-zoom': '', 'aria-label': 'Zoom da fotografia' });
    ui.zoom.addEventListener('input', () => { const q = enqAtual(); if (q) definirEnquadramento({ ...q, zoom: Number(ui.zoom.value) }); });
    ui.zoomTxt = h('span', { classe: 'nota' });
    ui.slots = h('div', { classe: 'segmentos segmentos--slots', role: 'group', 'aria-label': 'Fotografia a ajustar', 'data-slots': '' });
    ui.ajustando = h('span', { classe: 'nota', 'data-ajustando': '' });
    ui.escala = h('span', { classe: 'nota', 'data-escala': '' });
    const centralizar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-centralizar': '' }, 'Voltar ao ponto focal');
    centralizar.addEventListener('click', () => {
      const q = quadroAtivo(); const m = q && (est.rec?.imagens?.[q.slot] ?? est.rec?.imagem)?.meta; if (!m) return;
      definirEnquadramento({ zoom: 1, cx: m.pontoFocal?.x ?? 0.5, cy: m.pontoFocal?.y ?? 0.5 });
    });
    ui.enq = h('section', { classe: 'painel__bloco', 'data-enquadramento': '' }, h('h3', {}, 'Enquadramento'),
      h('p', { classe: 'nota' }, 'Arraste a fotografia na prévia. Cada formato tem seu próprio enquadramento.'),
      ui.slots, ui.ajustando, ui.zoom, ui.zoomTxt, ui.escala, centralizar);

    for (const def of est.ficha.campos) { const c = controle(def); campos.set(def.id, c); }
    const ordem = est.ficha.campos.map((d) => campos.get(d.id).linha);
    // Enquadramento logo depois da última fotografia, quando houver.
    const ultimaFoto = est.ficha.campos.map((d) => d.tipo).lastIndexOf('foto');
    ordem.splice(ultimaFoto >= 0 ? ultimaFoto + 1 : 1, 0, ui.enq);
    if (!est.ficha.foto) ordem.splice(ordem.indexOf(ui.enq), 1);
    ui.ia = painelIA({ projeto: () => est.p, ficha: () => est.ficha, aplicar: aplicarGerados, registrarUrl: (u) => est.urls.add(u) });
    ordem.splice(est.ficha.foto ? ordem.indexOf(ui.enq) + 1 : 0, 0, ui.ia.secao);

    raiz.replaceChildren(
      h('div', { classe: 'editor__topo' },
        h('a', { classe: 'botao botao--secundario botao--pequeno', href: '#/projetos' }, 'Projetos'),
        nome, h('span', { classe: 'selo', 'data-estado-projeto': '' }, ESTADOS[p.estado] ?? p.estado),
        h('span', { classe: 'editor__modelo' }, `${est.ficha.id} · ${est.ficha.nome}`),
        ui.status, salvar,
        h('a', { classe: 'botao botao--escuro botao--pequeno', href: `#/exportar/${id}`, 'data-ir-exportar': '' }, 'Exportar')),
      h('div', { classe: 'editor__corpo' },
        h('div', { classe: 'previa' },
          est.ficha.formatos.length > 1 ? h('div', { classe: 'segmentos', role: 'group', 'aria-label': 'Formato' }, botoesFormato) : h('span', { classe: 'nota' }, FORMATOS[est.ficha.formatos[0]].rotulo),
          h('div', { classe: 'previa__moldura' }, h('div', { classe: 'previa__palco' }, ui.canvas, ui.guias)), ui.linhaGuias),
        h('div', { classe: 'painel' }, ...ordem, h('section', { classe: 'painel__bloco' }, h('h3', {}, 'Verificações'), ui.verif))));
    sincronizarCampos();
    renderizar();
  }
  montar().catch((e) => {
    console.error('Editor:', e);
    raiz.replaceChildren(h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Problema'), h('p', {}, e?.mensagemUsuario ?? 'Não foi possível abrir o projeto.')));
  });
  return raiz;
}
