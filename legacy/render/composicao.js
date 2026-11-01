// Estrutura C · composição livre (Etapa 4.1). Cada ficha traz, por composição e por formato,
// uma lista de elementos em coordenadas absolutas do quadro (px), desenhados na ordem:
//   foto     { slot, x, y, w, h, raio, opcional }  fotografia da biblioteca no retângulo (cobertura + D-01);
//            opcional: { placa } = espaço fotográfico extra: sem foto escolhida, mostra o logotipo sobre
//            uma placa clara (Areia por padrão), sem bloqueio.
//   bloco    { x, y, w, h, cor, raio }             bloco de cor Maré Cristal
//   gradiente{ y0, y1, alpha }                     escurecimento Oceano
//   pilula   { campo | valor(d), x | direita, y, fundo, cor }   pílula de texto (tag de local, n/total)
//   texto    { x, largura, base | topo, limite, padding, fundo, raio, modulo, filete, itens }
// Coordenadas de enquadramento continuam relativas à fotografia ORIGINAL; a chave do
// enquadramento é o formato (foto principal) ou "formato#n" (fotos 2 e 3).
import { COR, TITULO, COMPONENTES, LOGO } from './tokens.js';
import { janela, enquadramentoInicial, avisarAmpliacao } from './enquadramento.js';
import { ajustar, larguraTexto } from './texto.js';
import { comporFluxo } from './fluxo.js';

// Etapa 6: cores, fundo e opacidade podem depender dos campos (ex.: fundo Espuma/Areia); "se(c)" liga ou desliga um elemento.
const v = (x, c) => (typeof x === 'function' ? x(c) : x);

export const ESTILOS = {
  tag:     { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1.2 },
  titulo:  { ...TITULO },
  legenda: { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1.2 },
  detalhe: { familia: 'Inter', peso: 400, tracking: 0, entrelinha: 1.35 },
  rotulo:  { familia: 'Inter', peso: 600, tracking: 0.08, caixaAlta: true, entrelinha: 1.2 },
};

// Pílula de texto (galeria 4.1): 64 px de altura, 32 px de respiro lateral, Inter SemiBold.
export const PILULA_TEXTO = { altura: 64, padX: 32, fonte: { feed: 28, stories: 32, reels: 32 } };

export const NOMES_SLOT = { 1: 'Fotografia principal', 2: 'Fotografia secundária', 3: 'Terceira fotografia', 4: 'Quarta fotografia' };
export const chaveEnquadramento = (formato, slot) => (slot === 1 ? formato : `${formato}#${slot}`);
export const fotoDoSlot = (d, slot) => (slot === 1 ? d.fotoId : d.fotosExtras?.[slot - 2] ?? null);

const vazio = (v) => v == null || (typeof v === 'string' && !v.trim());
const bloqueio = (cena, campo, texto) => cena.bloqueios.push({ campo, texto });
const aviso = (cena, campo, texto) => cena.avisos.push({ campo, texto });

// Espaço fotográfico extra sem foto: placa clara com o logotipo centrado (nunca acima de 100%,
// respiro mínimo de 25% da largura do logotipo em volta), em vez de um bloco de cor sólida.
function espacoLogo(el, cena) {
  const { x, y, w, h, raio = 0 } = el;
  const k = Math.min(1, w / (LOGO.largura * (1 + 2 * LOGO.respiro)) * 0.8, h / (LOGO.altura + 2 * LOGO.respiro * LOGO.largura) * 0.8);
  const lw = Math.round(LOGO.largura * k), lh = Math.round(LOGO.altura * k);
  cena.comandos.push({ t: 'caixa', x, y, w, h, raio, cor: el.opcional.placa ?? COR.areia });
  cena.comandos.push({ t: 'logo', x: Math.round(x + (w - lw) / 2), y: Math.round(y + (h - lh) / 2), w: lw, h: lh });
}

function foto(el, d, rec, F, cena, vistos) {
  const { slot, x, y, w, h, raio = 0 } = el;
  const campo = slot === 1 ? 'foto' : `foto${slot}`;
  const fid = fotoDoSlot(d, slot);
  const img = rec.imagens?.[slot] ?? (slot === 1 ? rec.imagem : null);
  if (!fid && el.opcional) { espacoLogo(el, cena); return; }
  if (!fid || !img) {
    bloqueio(cena, campo, fid ? `${NOMES_SLOT[slot]}: a fotografia não está disponível. Escolha outra.` : `${NOMES_SLOT[slot]}: escolha uma fotografia da biblioteca.`);
    cena.comandos.push({ t: 'caixa', x, y, w, h, raio, cor: COR.turquesa, alpha: 0.15 });
    return;
  }
  const meta = img.meta;
  const chave = chaveEnquadramento(F.id, slot);
  const enq = d.enquadramentos?.[chave] ?? enquadramentoInicial(meta, w, h);
  const j = janela(enq, meta, w, h);
  cena.comandos.push({ t: 'foto', slot, x, y, w, h, raio, sx: j.sx, sy: j.sy, sw: j.sw, sh: j.sh });
  cena.quadros.push({ ...j, slot, chave, x, y, w, h, formato: F.id, fotoLargura: meta.largura, fotoAltura: meta.altura });
  avisarAmpliacao(cena, campo, j, slot === 1 ? '' : NOMES_SLOT[slot]);
  if (vistos.has(fid)) aviso(cena, campo, `A mesma fotografia aparece em dois espaços da peça.`);
  else if (Math.max(meta.largura, meta.altura) < 2160) aviso(cena, campo, `${NOMES_SLOT[slot]} tem menos de 2160 px no lado maior. Prefira arquivos maiores.`);
  vistos.add(fid);
}

function pilula(ctx, el, d, F, cena) {
  const valor = el.valor ? el.valor(d.campos, F) : d.campos[el.campo];
  if (vazio(valor)) return;
  const tam = PILULA_TEXTO.fonte[F.id], est = ESTILOS.tag;
  const larg = larguraTexto(ctx, valor, est, tam) + 2 * PILULA_TEXTO.padX;
  const x = el.direita != null ? F.largura - el.direita - larg : el.x;
  if (el.maxLargura && larg > el.maxLargura + 0.5) bloqueio(cena, el.campo, `${el.rotulo}: o texto não cabe na pílula. Encurte-o.`);
  if (el.fundo) cena.comandos.push({ t: 'caixa', x, y: el.y, w: larg, h: PILULA_TEXTO.altura, raio: PILULA_TEXTO.altura / 2, cor: el.fundo });
  cena.comandos.push({ t: 'texto', x: x + larg / 2, y: el.y, linhas: [String(valor)], tam, lh: PILULA_TEXTO.altura, est, cor: el.cor, alinh: 'centro' });
}

function grupoTexto(ctx, el, d, F, cena) {
  const pad = el.padding ?? 0;
  const largura = el.largura - 2 * pad;
  const ativos = el.itens.filter((it) => {
    const vz = vazio(d.campos[it.campo]);
    if (vz && it.obrigatorio) bloqueio(cena, it.campo, `${it.rotulo} é obrigatório.`);
    return !vz;
  });
  if (!ativos.length) return;
  const gap = (a) => a.it.gap ?? 24;
  const lim = el.limite ?? {};
  // Mede com o tamanho máximo de cada faixa reduzido em k px (passo de 2 px), nunca abaixo do mínimo.
  const medir = (k) => ativos.map((it) => {
    const est = ESTILOS[it.estilo];
    const faixa = it.faixa ? (Array.isArray(it.faixa) ? it.faixa : it.faixa[F.id]) : [it.tam[F.id] ?? it.tam, it.tam[F.id] ?? it.tam];
    const min = Math.max(faixa[0], F.minFonte); // nunca abaixo do mínimo da identidade
    const max = Math.max(min, faixa[1] - k);
    return { it, est, r: ajustar(ctx, String(d.campos[it.campo]), est, [min, max], largura, it.maxLinhas ?? Infinity, est.entrelinha), reduzivel: max > min };
  });
  const posicao = (medidos) => {
    const hTexto = medidos.reduce((s, m, i) => s + m.r.altura + (i < medidos.length - 1 ? gap(m) : 0), 0);
    const hCaixa = hTexto + 2 * pad;
    const topo = el.base != null ? el.base - hCaixa : el.topo;
    const cabe = !((lim.topo != null && topo < lim.topo) || (lim.base != null && topo + hCaixa > lim.base));
    return { hCaixa, topo, cabe };
  };
  let medidos = medir(0), pos = posicao(medidos);
  for (let k = 2; !pos.cabe && medidos.some((m) => m.reduzivel); k += 2) { medidos = medir(k); pos = posicao(medidos); }
  for (const m of medidos) if (!m.r.cabe) bloqueio(cena, m.it.campo, `${m.it.rotulo}: o texto não cabe (${m.r.motivo}). Encurte-o.`);
  if (!pos.cabe) bloqueio(cena, null, 'Os textos não cabem no espaço desta composição. Encurte-os ou escolha outra composição.');
  const { hCaixa, topo } = pos;
  if (el.fundo === 'vidro') cena.comandos.push({ t: 'vidro', x: el.x, y: topo, w: el.largura, h: hCaixa, ...COMPONENTES.vidro, raio: el.raio ?? COMPONENTES.vidro.raio });
  else if (el.fundo) cena.comandos.push({ t: 'caixa', x: el.x, y: topo, w: el.largura, h: hCaixa, raio: el.raio ?? 0, cor: el.fundo });
  if (el.filete) cena.comandos.push({ t: 'caixa', x: el.filete.x, y: topo, w: el.filete.w, h: hCaixa, raio: 0, cor: el.filete.cor });
  if (el.modulo) cena.comandos.push({ t: 'caixa', x: el.x + el.largura, y: topo, w: el.modulo.tam, h: el.modulo.tam, raio: 0, cor: el.modulo.cor });
  let y = topo + pad;
  medidos.forEach((m, i) => {
    cena.comandos.push({ t: 'texto', x: el.x + pad, y, linhas: m.r.linhas, tam: m.r.tam, lh: m.r.tam * m.est.entrelinha, est: m.est, cor: m.it.cor, alinh: 'esq' });
    y += m.r.altura + (i < medidos.length - 1 ? gap(m) : 0);
  });
}

export function comporComposicao(ficha, ctx, d, rec, F, cena) {
  const id = d.campos.composicao;
  const comp = ficha.composicoes?.[id]?.[F.id];
  if (!comp) { cena.comandos.push({ t: 'fundo', cor: COR.areia }); bloqueio(cena, 'composicao', 'Composição indisponível neste formato.'); return; }
  cena.quadros = [];
  cena.comandos.push({ t: 'fundo', cor: v(comp.fundo, d.campos) ?? COR.espuma });
  const vistos = new Set();
  for (const el of comp.elementos) {
    if (el.se && !el.se(d.campos)) continue;
    if (el.t === 'foto') foto(el, d, rec, F, cena, vistos);
    else if (el.t === 'bloco') cena.comandos.push({ t: 'caixa', x: el.x, y: el.y, w: el.w, h: el.h, raio: el.raio ?? 0, cor: v(el.cor, d.campos), ...(el.alpha != null ? { alpha: el.alpha } : {}) });
    else if (el.t === 'gradiente') cena.comandos.push({ t: 'gradiente', y0: el.y0, y1: el.y1, alpha: v(el.alpha, d.campos) });
    else if (el.t === 'fluxo') comporFluxo(ctx, el, d, F, cena);
    else if (el.t === 'anel') cena.comandos.push({ t: 'anel', cx: el.cx, cy: el.cy, r: el.r, esp: el.esp, cor: el.cor });
    else if (el.t === 'icone') { const id = el.id ?? d.campos[el.campo]; if (id) cena.comandos.push({ t: 'icone', id, cx: el.cx, cy: el.cy, tam: el.tam, cor: el.cor }); else if (el.obrigatorio) bloqueio(cena, el.campo, `${el.rotulo} é obrigatório.`); }
    else if (el.t === 'pilula') pilula(ctx, el, d, F, cena);
    else if (el.t === 'texto') grupoTexto(ctx, el, d, F, cena);
  }
  // Compatibilidade: cena.quadro é a foto principal (ou a primeira presente).
  cena.quadro = cena.quadros.find((q) => q.slot === 1) ?? cena.quadros[0] ?? null;
}

// Fotografias (slots) usadas por uma composição num formato.
export const slotsDe = (ficha, composicao, formato) =>
  (ficha.composicoes?.[composicao]?.[formato]?.elementos ?? []).filter((e) => e.t === 'foto').map((e) => e.slot);
