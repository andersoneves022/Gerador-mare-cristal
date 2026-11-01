// Estrutura V · sobreposição sobre vídeo (VID-02, Ficha §15). O gerador não toca no vídeo:
// cada entrada vira um PNG transparente de 1080 × 1920 (título, legenda e tag, com o escurecimento
// da entrada) e a lista de entradas vira os arquivos de tempo (CSV e JSON).
// A prévia do editor mostra a entrada ativa sobre a fotografia de referência (que nunca é exportada)
// ou só a sobreposição, exatamente como o PNG exportado.
import { COR, TITULO, ESCURECIMENTO, ESCURECIMENTO_ZONA } from './tokens.js';
import { janela, enquadramentoInicial } from './enquadramento.js';
import { ajustar } from './texto.js';

const vazio = (v) => v == null || (typeof v === 'string' && !v.trim());
const bloqueio = (cena, campo, texto) => cena.bloqueios.push({ campo, texto });
const aviso = (cena, campo, texto) => cena.avisos.push({ campo, texto });

// Valores locais (IT) para pendências da ficha (§15.5, §15.7, §15.9), num só lugar.
export const VID02 = {
  zona: { x1: 72, y1: 250, x2: 1008, y2: 1580 },        // zona útil (RA)
  titulo: { faixa: [80, 104], maxLinhas: 2 },             // Sora Bold, até 2 linhas (RA)
  legenda: { tam: 32, maxLinhas: 2, max: 60, padX: 32, padY: 16, raio: 32, opacidade: 0.6 }, // pílula Oceano 60% (RA)
  tag: { tam: 32, max: 28 },                              // Inter SemiBold, mínimo 32
  gap: 24,                                                // espaçamento entre elementos (24/48/72)
  tempo: { min: 1.5, max: 3 },                            // cada texto na tela (RA)
  duracao: { min: 7, max: 30 },                           // Reel inteiro (RA)
  telaFinal: 1.5,                                         // COM-02 no fim; nenhum texto passa do seu início (RA)
};

const EST = {
  titulo: { ...TITULO },
  inter: { familia: 'Inter', peso: 600, tracking: 0, entrelinha: 1.2 },
};

export const numero = (v) => (v === '' || v == null ? NaN : Number(String(v).replace(',', '.')));
export const segundos = (v) => Math.round(v * 10) / 10; // precisão de 0,1 s (IT)
export const textoDaEntrada = (e) => [e?.titulo, e?.legenda, e?.tag].filter((x) => !vazio(x)).map((x) => String(x).trim().replace(/\s+/g, ' ')).join(' / ');

// Mede uma entrada (sem desenhar). Devolve { pecas, altura, problemas } com coordenadas relativas ao topo do bloco.
function medirEntrada(ctx, e, nivel) {
  const Z = VID02.zona, larg = Z.x2 - Z.x1;
  const pecas = [], problemas = [];
  let y = 0;
  const empilhar = (altura, cmds) => { if (pecas.length) y += VID02.gap; pecas.push({ y, altura, cmds }); y += altura; };
  if (!vazio(e.tag)) {
    const tag = String(e.tag).trim();
    if (tag.length > VID02.tag.max) problemas.push(['aviso', 'tag', `a tag tem ${tag.length} caracteres (referência: ${VID02.tag.max}).`]);
    const r = ajustar(ctx, tag, EST.inter, [VID02.tag.tam, VID02.tag.tam], larg, 1, 1.2);
    if (!r.cabe) problemas.push(['bloqueio', 'tag', 'a tag não cabe numa linha.']);
    // Tag lima só sobre escurecimento (mesma regra do VID-01; sem escurecimento, Espuma).
    const cor = nivel !== 'nenhum' ? COR.lima : COR.espuma;
    empilhar(r.altura, (y0) => [{ t: 'texto', x: Z.x1, y: y0, linhas: r.linhas, tam: r.tam, lh: r.tam * 1.2, est: EST.inter, cor, alinh: 'esq' }]);
  }
  if (!vazio(e.titulo)) {
    const r = ajustar(ctx, String(e.titulo).trim(), EST.titulo, VID02.titulo.faixa, larg, VID02.titulo.maxLinhas, TITULO.entrelinha);
    if (!r.cabe) problemas.push(['bloqueio', 'titulo', `o título não cabe em ${VID02.titulo.maxLinhas} linhas com 80 px (${r.motivo}). Encurte-o.`]);
    empilhar(r.altura, (y0) => [{ t: 'texto', x: Z.x1, y: y0, linhas: r.linhas, tam: r.tam, lh: r.tam * TITULO.entrelinha, est: EST.titulo, cor: COR.espuma, alinh: 'esq' }]);
  }
  if (!vazio(e.legenda)) {
    const L = VID02.legenda, txt = String(e.legenda).trim();
    if (txt.length > L.max) problemas.push(['bloqueio', 'legenda', `a legenda tem ${txt.length} caracteres (máximo ${L.max}).`]);
    const r = ajustar(ctx, txt, EST.inter, [L.tam, L.tam], larg - 2 * L.padX, L.maxLinhas, 1.2);
    if (!r.cabe) problemas.push(['bloqueio', 'legenda', `a legenda passa de ${L.maxLinhas} linhas. Encurte-a.`]);
    const w = Math.ceil(r.largura + 2 * L.padX), hh = Math.ceil(r.altura + 2 * L.padY);
    empilhar(hh, (y0) => [
      { t: 'caixa', x: Z.x1, y: y0, w, h: hh, raio: Math.min(L.raio, hh / 2), cor: COR.oceano, alpha: L.opacidade },
      { t: 'texto', x: Z.x1 + L.padX, y: y0 + L.padY, linhas: r.linhas, tam: r.tam, lh: r.tam * 1.2, est: EST.inter, cor: COR.espuma, alinh: 'esq' },
    ]);
  }
  return { pecas, altura: y, problemas };
}

// Verifica os tempos (ESP §8.4). Devolve a lista de problemas [nivel, texto].
export function verificarTempos(campos) {
  const T = VID02, out = [];
  const entradas = Array.isArray(campos.entradas) ? campos.entradas : [];
  const total = numero(campos.duracao);
  if (!Number.isFinite(total) || total < T.duracao.min || total > T.duracao.max) out.push(['bloqueio', 'duracao', `A duração total do Reel deve ficar entre ${T.duracao.min} e ${T.duracao.max} s.`]);
  const inicioFinal = Number.isFinite(total) ? segundos(total - T.telaFinal) : NaN;
  const ok = [];
  entradas.forEach((e, i) => {
    const n = i + 1, a = numero(e?.inicio), b = numero(e?.fim);
    if (!Number.isFinite(a) || !Number.isFinite(b)) { out.push(['bloqueio', 'entradas', `Entrada ${n}: informe a entrada e a saída em segundos.`]); return; }
    if (a < 0) out.push(['bloqueio', 'entradas', `Entrada ${n}: o tempo de entrada não pode ser negativo.`]);
    const dur = segundos(b - a);
    if (dur < T.tempo.min || dur > T.tempo.max) out.push(['bloqueio', 'entradas', `Entrada ${n}: o texto fica ${dur.toLocaleString('pt-BR')} s na tela; use de 1,5 a 3 s.`]);
    if (Number.isFinite(inicioFinal) && b > inicioFinal + 1e-9) out.push(['bloqueio', 'entradas', `Entrada ${n}: o texto invade a tela final (que começa em ${inicioFinal.toLocaleString('pt-BR')} s).`]);
    ok.push({ n, a, b });
  });
  ok.sort((x, y) => x.a - y.a);
  for (let i = 1; i < ok.length; i++) if (ok[i].a < ok[i - 1].b - 1e-9) out.push(['aviso', 'entradas', `Entradas ${ok[i - 1].n} e ${ok[i].n} ficam na tela ao mesmo tempo. Confira se é intencional.`]);
  return out;
}

export function comporSobreposicao(ficha, ctx, d, rec, F, cena) {
  const c = d.campos, W = F.largura, H = F.altura;
  const entradas = Array.isArray(c.entradas) ? c.entradas : [];
  const sobre = !!d.sobreposicao || c.previa === 'sobreposicao';
  cena.transparente = sobre;
  cena.quadros = [];

  // Fotografia de referência: só na prévia; não é exportada, então resolução e ausência são avisos.
  if (!sobre) {
    const img = d.fotoId ? rec.imagem : null;
    if (!img) {
      cena.comandos.push({ t: 'fundo', cor: COR.oceano });
      aviso(cena, 'foto', 'Sem fotografia de referência: escolha um frame do vídeo para conferir a posição dos textos (não entra no PNG).');
    } else {
      const meta = img.meta, enq = d.enquadramentos?.[F.id] ?? enquadramentoInicial(meta, W, H), j = janela(enq, meta, W, H);
      cena.comandos.push({ t: 'foto', sx: j.sx, sy: j.sy, sw: j.sw, sh: j.sh });
      cena.quadro = { ...j, formato: F.id, fotoLargura: meta.largura, fotoAltura: meta.altura };
      if (j.ampliacao) aviso(cena, 'foto', 'A fotografia de referência é menor que 1080 × 1920; serve só para conferir a posição dos textos.');
    }
  }

  // Todas as entradas são verificadas (a exportação gera todas); só a ativa é desenhada.
  if (!entradas.length) bloqueio(cena, 'entradas', 'Inclua pelo menos uma entrada de texto.');
  const nivel = c.escurecimento ?? ficha.escurecimento.padrao;
  const ativa = Math.min(Math.max(1, Math.round(numero(c.entradaAtiva) || 1)), Math.max(1, entradas.length));
  cena.entradaAtiva = ativa;
  const Z = VID02.zona;
  entradas.forEach((e, i) => {
    const n = i + 1;
    if (vazio(e?.titulo) && vazio(e?.legenda) && vazio(e?.tag)) { bloqueio(cena, 'entradas', `Entrada ${n}: preencha o título, a legenda ou a tag.`); return; }
    const m = medirEntrada(ctx, e, nivel);
    for (const [nv, , txt] of m.problemas) (nv === 'bloqueio' ? bloqueio : aviso)(cena, 'entradas', `Entrada ${n}: ${txt}`);
    const topo = Z.y2 - m.altura;
    if (topo < Z.y1) bloqueio(cena, 'entradas', `Entrada ${n}: os textos não cabem na zona útil. Encurte-os.`);
    if (n !== ativa) return;
    const alpha = ESCURECIMENTO[nivel] ?? 0, gy0 = H * (1 - ESCURECIMENTO_ZONA);
    cena.nivel = nivel; cena.gradY0 = gy0;
    // Escurecimento "conforme o elemento de texto" (ESP §7.4): entra no PNG da entrada (decisão local L-01).
    if (alpha > 0) cena.comandos.push({ t: 'gradiente', y0: gy0, y1: H, alpha });
    if (nivel === 'nenhum' && !sobre) aviso(cena, 'escurecimento', 'Sem escurecimento: confira o contraste do texto sobre o vídeo.');
    if (topo < gy0 && alpha > 0) aviso(cena, null, `Entrada ${n}: o bloco sobe além do escurecimento. Confira o contraste.`);
    for (const p of m.pecas) cena.comandos.push(...p.cmds(topo + p.y));
  });

  for (const [nv, campo, txt] of verificarTempos(c)) (nv === 'bloqueio' ? bloqueio : aviso)(cena, campo, txt);
  if (entradas.length && !sobre) aviso(cena, null, 'Confira na prévia se os textos não cobrem rostos (verificação humana).');
}

// Arquivos de tempo (ESP §8.6): número da entrada, nome do PNG, texto, início, término e duração;
// a última linha é a tela final.
export function tabelaTempos(campos, nomePng) {
  const entradas = Array.isArray(campos.entradas) ? campos.entradas : [];
  const total = segundos(numero(campos.duracao));
  const linhas = entradas.map((e, i) => {
    const a = segundos(numero(e.inicio)), b = segundos(numero(e.fim));
    return { entrada: i + 1, arquivo: nomePng(i + 1), texto: textoDaEntrada(e), inicio: a, termino: b, duracao: segundos(b - a),
      elementos: { titulo: e.titulo ?? '', legenda: e.legenda ?? '', tag: e.tag ?? '' } };
  });
  linhas.push({ entrada: entradas.length + 1, arquivo: 'tela-final.png', texto: 'Tela final (COM-02)', inicio: segundos(total - VID02.telaFinal), termino: total, duracao: VID02.telaFinal, telaFinal: true });
  return linhas;
}
const campoCsv = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function csvTempos(linhas) {
  const cab = ['entrada', 'arquivo', 'texto', 'inicio', 'termino', 'duracao'];
  return '\uFEFF' + [cab.join(','), ...linhas.map((l) => cab.map((k) => campoCsv(['inicio', 'termino', 'duracao'].includes(k) ? l[k].toFixed(1) : l[k])).join(','))].join('\r\n') + '\r\n';
}
export function jsonTempos(linhas, info) {
  return JSON.stringify({ ...info, unidade: 's', precisao: 0.1, entradas: linhas }, null, 2) + '\n';
}
