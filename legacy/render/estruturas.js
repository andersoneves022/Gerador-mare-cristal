// Estruturas A (foto cheia) e B (cartão). Os templates só trazem dados (fichas); a lógica é comum.
import { COR, ESCURECIMENTO, ESCURECIMENTO_ZONA, COMPONENTES, LOGO, ESP, FORMATOS } from './tokens.js';
import { janela, enquadramentoInicial, avisarAmpliacao } from './enquadramento.js';
import { COMPONENTES_REGISTRO } from './componentes.js';
import { ajustar } from './texto.js';

const vazio = (v) => v == null || (typeof v === 'string' && !v.trim());
const bloqueio = (cena, campo, texto) => cena.bloqueios.push({ campo, texto });
const aviso = (cena, campo, texto) => cena.avisos.push({ campo, texto });
const problemas = (cena, lista) => lista.forEach((p) => (p.nivel === 'bloqueio' ? bloqueio : aviso)(cena, p.campo, p.texto));

// ---------- fotografia: cobertura, enquadramento e resolução (RC-08) ----------
function comporFoto(cena, d, rec, F) {
  const { largura: W, altura: H } = F;
  if (!d.fotoId) { bloqueio(cena, 'foto', 'Escolha uma fotografia da biblioteca.'); cena.comandos.push({ t: 'fundo', cor: COR.areia }); return; }
  if (!rec.imagem) { bloqueio(cena, 'foto', 'A fotografia deste projeto não está disponível. Escolha outra.'); cena.comandos.push({ t: 'fundo', cor: COR.areia }); return; }
  const meta = rec.imagem.meta;
  const enq = d.enquadramentos?.[F.id] ?? enquadramentoInicial(meta, W, H);
  const j = janela(enq, meta, W, H);
  cena.quadro = { ...j, formato: F.id, fotoLargura: meta.largura, fotoAltura: meta.altura };
  cena.comandos.push({ t: 'foto', sx: j.sx, sy: j.sy, sw: j.sw, sh: j.sh });
  avisarAmpliacao(cena, 'foto', j);
  if (Math.max(meta.largura, meta.altura) < 2160) aviso(cena, 'foto', 'A fotografia tem menos de 2160 px no lado maior. Prefira arquivos maiores.');
}

function escurecer(cena, F, nivel) {
  const alpha = ESCURECIMENTO[nivel] ?? 0;
  cena.nivel = nivel;
  cena.gradY0 = F.altura * (1 - ESCURECIMENTO_ZONA);
  if (alpha > 0) cena.comandos.push({ t: 'gradiente', y0: cena.gradY0, y1: F.altura, alpha });
}

function logoNaPlaca(cena, rec, F, L, x, y) {
  const w = L.logo[F.id], h = Math.round(w * LOGO.altura / LOGO.largura), pad = w * LOGO.respiro;
  cena.comandos.push({ t: 'caixa', x, y, w: w + 2 * pad, h: h + 2 * pad, raio: COMPONENTES.placaLogo.raio, cor: COR.espuma, alpha: COMPONENTES.placaLogo.opacidade });
  cena.comandos.push({ t: 'logo', x: x + pad, y: y + pad, w, h });
}

// Itens ativos de uma lista de fichas de item, já medidos.
function medirItens(ctx, itens, d, F, larguraMax, cena) {
  const lista = [];
  for (const it of itens) {
    if (it.ativoSe && !it.ativoSe(d.campos)) continue;
    const valor = d.campos[it.campo];
    if (vazio(valor)) { if (it.obrigatorio) bloqueio(cena, it.campo, `${it.rotulo} é obrigatório.`); continue; }
    const b = COMPONENTES_REGISTRO[it.componente](ctx, it, it.formatar ? it.formatar(valor) : String(valor), F, larguraMax, d, cena);
    problemas(cena, b.problemas);
    lista.push({ it, b });
  }
  return lista;
}
// Espaço entre itens vizinhos: gapAntes do seguinte, senão gapApos do anterior, senão 24.
const gapEntre = (a, b) => b.it.gapAntes ?? a.it.gapApos ?? ESP.u;
const alturaTotal = (lista) => lista.reduce((s, x, i) => s + x.b.altura + (i < lista.length - 1 ? gapEntre(x, lista[i + 1]) : 0), 0);
function desenharLista(lista, x, y, alinh, cena) {
  lista.forEach((item, i) => {
    cena.comandos.push(...item.b.desenhar(x, y, alinh));
    y += item.b.altura + (i < lista.length - 1 ? gapEntre(item, lista[i + 1]) : 0);
  });
}

// ---------- Estrutura A · foto cheia (opcional: painel de vidro) ----------
export function comporFotoCheia(ficha, ctx, d, rec, F, cena) {
  const L = ficha.layout, z = F.zona;
  comporFoto(cena, d, rec, F);
  escurecer(cena, F, d.campos.escurecimento ?? ficha.escurecimento.padrao);
  cena.temPilula = ficha.itens.some((it) => it.componente === 'pilula' && (!it.ativoSe || it.ativoSe(d.campos)) && !vazio(d.campos[it.campo]));

  const pad = L.painel ? COMPONENTES.vidro.padding : 0;
  const larguraBloco = L.painel ? z.x2 - z.x1 - 2 * pad : L.larguraBloco;
  const lista = medirItens(ctx, ficha.itens, d, F, larguraBloco, cena);
  const h = alturaTotal(lista);
  if (!lista.length) return;

  let topo = z.y2 - h - 2 * pad;
  if (L.painel) {
    cena.comandos.push({ t: 'vidro', x: z.x1, y: topo, w: z.x2 - z.x1, h: h + 2 * pad, ...COMPONENTES.vidro });
  }
  if (topo < z.y1) bloqueio(cena, null, 'O conteúdo não cabe na área disponível da peça. Encurte os textos.');
  else if (cena.nivel !== 'nenhum' && topo + pad < cena.gradY0 && !L.painel) aviso(cena, null, 'O bloco de texto sobe além do escurecimento. Confira o contraste ou encurte os textos.');
  if (cena.nivel === 'nenhum' && !L.painel) aviso(cena, 'escurecimento', 'Sem escurecimento: confira se o texto tem contraste suficiente sobre a fotografia.');
  desenharLista(lista, z.x1 + pad, topo + pad, 'esq', cena);

  if (d.campos.logotipo && ficha.logo) logoNaPlaca(cena, rec, F, L, z.x1, z.y1);
}

// ---------- Estrutura B · cartão ----------
const CORPOS = {
  // INF-01: 2 colunas por até 4 linhas, azulejo de ícone + rótulo.
  'grade-icones'(ficha, ctx, d, rec, F, cena, { topo, base }) {
    const G = ficha.layout.grade, z = F.zona, itens = d.campos.itens ?? [];
    if (itens.length < 2 || itens.length > 8) bloqueio(cena, 'itens', 'Use de 2 a 8 itens.');
    const colW = (z.x2 - z.x1 - G.gapColuna) / G.colunas;
    const textoW = colW - G.azulejo - G.gapItem;
    const est = { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1.25 };
    const linhas = [];
    itens.slice(0, 8).forEach((item, i) => {
      if (vazio(item.texto)) bloqueio(cena, 'itens', `Item ${i + 1}: escreva o texto.`);
      if (!item.icone) bloqueio(cena, 'itens', `Item ${i + 1}: escolha um ícone.`);
      const r = ajustar(ctx, item.texto ?? '', est, [G.fonte[F.id], G.fonte[F.id]], textoW, G.maxLinhasRotulo, est.entrelinha);
      if (!r.cabe) bloqueio(cena, 'itens', `Item ${i + 1}: o texto não cabe (${r.motivo}). Encurte-o.`);
      linhas.push({ item, r, col: i % G.colunas, linha: Math.floor(i / G.colunas) });
    });
    const nLin = Math.ceil(linhas.length / G.colunas);
    const gradeH = nLin * G.azulejo + Math.max(0, nLin - 1) * G.gapLinha;
    const livre = base - topo;
    if (gradeH > livre) bloqueio(cena, 'itens', 'A grade não cabe entre o cabeçalho e o rodapé. Use menos itens ou um título menor.');
    const y0 = topo + Math.max(0, (livre - gradeH) / 2);
    for (const { item, r, col, linha } of linhas) {
      const x = z.x1 + col * (colW + G.gapColuna), y = y0 + linha * (G.azulejo + G.gapLinha);
      cena.comandos.push({ t: 'caixa', x, y, w: G.azulejo, h: G.azulejo, raio: G.raioAzulejo, cor: COR.turquesa, alpha: 0.15 });
      cena.comandos.push({ t: 'icone', id: item.icone, cx: x + G.azulejo / 2, cy: y + G.azulejo / 2, tam: G.icone, cor: COR.oceano });
      const hTxt = r.linhas.length * r.tam * est.entrelinha;
      cena.comandos.push({ t: 'texto', x: x + G.azulejo + G.gapItem, y: y + (G.azulejo - hTxt) / 2, linhas: r.linhas, tam: r.tam, lh: r.tam * est.entrelinha, est, cor: COR.oceano, alinh: 'esq' });
    }
  },

  // COM-02: conjunto centrado (logotipo, mensagem, pílula, linha de apoio).
  encerramento(ficha, ctx, d, rec, F, cena) {
    const L = ficha.layout, z = F.zona, cx = F.largura / 2;
    const w = L.logo[F.id], h = Math.round(w * LOGO.altura / LOGO.largura);
    const respiro = Math.ceil(w * LOGO.respiro);
    const lista = medirItens(ctx, ficha.itens, d, F, z.x2 - z.x1, cena);
    const total = h + (lista.length ? respiro : 0) + alturaTotal(lista);
    if (total > z.y2 - z.y1) bloqueio(cena, null, 'O conjunto não cabe na área segura. Encurte a mensagem.');
    let y = (z.y1 + z.y2) / 2 - total / 2;
    cena.comandos.push({ t: 'logo', x: cx - w / 2, y, w, h });
    y += h + respiro;
    desenharLista(lista, cx, y, 'centro', cena);
  },
};

export function comporCartao(ficha, ctx, d, rec, F, cena) {
  const L = ficha.layout, z = F.zona;
  const fundo = d.campos.fundo === 'areia' ? COR.areia : COR.espuma;
  cena.comandos.push({ t: 'fundo', cor: fundo });
  let topo = z.y1;
  if (ficha.itens?.length && ficha.cabecalho) {
    const lista = medirItens(ctx, ficha.itens, d, F, z.x2 - z.x1, cena);
    desenharLista(lista, z.x1, z.y1, 'esq', cena);
    topo = z.y1 + alturaTotal(lista) + ESP.m;
  }
  let base = z.y2;
  if (ficha.logo && d.campos.logotipo) {
    const w = L.logo[F.id], h = Math.round(w * LOGO.altura / LOGO.largura);
    cena.comandos.push({ t: 'logo', x: z.x1, y: z.y2 - h, w, h });
    base = z.y2 - h - Math.max(ESP.m, Math.ceil(w * LOGO.respiro));
  }
  CORPOS[ficha.corpo](ficha, ctx, d, rec, F, cena, { topo, base });
}

export const ESTRUTURAS = { A: comporFotoCheia, B: comporCartao };
export { FORMATOS };
