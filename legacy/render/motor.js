// Motor único de composição: a prévia e a exportação usam compor() + desenhar().
import { COR, FORMATOS } from './tokens.js';
import { ESTRUTURAS } from './estruturas.js';
import { comporComposicao } from './composicao.js';
import { comporSobreposicao } from './sobreposicao.js';
import { contextoMedida } from './texto.js';
import { desenharIcone } from './icones.js';
import { obterFicha } from './templates/index.js';
import { fontesCompletas } from '../core/fonts.js';

// dados: { templateId, formato, campos, fotoId, fotosExtras, enquadramentos }; rec: { imagem, imagens, logo }.
const ESTRUTURA_FN = { ...ESTRUTURAS, C: comporComposicao, V: comporSobreposicao };
export function compor(dados, rec) {
  const ficha = obterFicha(dados.templateId);
  const F = FORMATOS[dados.formato];
  const cena = { formato: F.id, largura: F.largura, altura: F.altura, comandos: [], avisos: [], bloqueios: [], ampliacoesElevadas: [], quadro: null };
  if (!ficha || !F || !ficha.formatos.includes(F.id)) {
    cena.bloqueios.push({ campo: null, texto: 'Template ou formato inválido.' });
    return cena;
  }
  if (!fontesCompletas()) {
    cena.comandos.push({ t: 'fundo', cor: COR.areia });
    cena.bloqueios.push({ campo: null, texto: 'As fontes definitivas (Sora e Inter) não estão instaladas na pasta fonts. A arte só é renderizada com as quatro fontes.' });
    return cena;
  }
  const estrutura = ficha.estruturaDe ? ficha.estruturaDe(dados.campos) : ficha.estrutura;
  cena.estrutura = estrutura;
  ESTRUTURA_FN[estrutura](ficha, contextoMedida(), dados, rec, F, cena);
  for (const v of ficha.validar?.(dados.campos) ?? []) cena.bloqueios.push(v);
  for (const v of ficha.avisar?.(dados.campos) ?? []) cena.avisos.push(v);
  return cena;
}

const curva = (p) => p * p * (3 - 2 * p); // transição suave (PT-14 pendente: calibrar com fotos reais)

export function desenhar(ctx, cena, rec) {
  const { largura: W, altura: H } = cena;
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  // Sobreposição de vídeo (VID-02): fundo transparente; nada além dos elementos gráficos.
  if (!cena.transparente) { ctx.fillStyle = COR.areia; ctx.fillRect(0, 0, W, H); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  for (const c of cena.comandos) {
    ctx.save();
    if (c.t === 'fundo') { ctx.fillStyle = c.cor; ctx.fillRect(0, 0, W, H); }
    else if (c.t === 'foto') {
      // Foto em retângulo (estrutura C, com cantos) ou sangrada no quadro inteiro (A e B).
      const im = c.slot ? rec.imagens?.[c.slot] : rec.imagem;
      const x = c.x ?? 0, y = c.y ?? 0, w = c.w ?? W, hh = c.h ?? H;
      if (c.raio) { ctx.beginPath(); ctx.roundRect(x, y, w, hh, c.raio); ctx.clip(); }
      const r = im.ratio;
      ctx.drawImage(im.bitmap, c.sx * r, c.sy * r, c.sw * r, c.sh * r, x, y, w, hh);
    } else if (c.t === 'gradiente') {
      const g = ctx.createLinearGradient(0, c.y0, 0, c.y1);
      for (let i = 0; i <= 10; i++) g.addColorStop(i / 10, `rgba(10,79,96,${(c.alpha * curva(i / 10)).toFixed(4)})`);
      ctx.fillStyle = g; ctx.fillRect(0, c.y0, W, c.y1 - c.y0);
    } else if (c.t === 'caixa') {
      ctx.globalAlpha = c.alpha ?? 1; ctx.fillStyle = c.cor;
      ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, c.raio); ctx.fill();
    } else if (c.t === 'vidro') {
      // Desfoca o que já foi desenhado dentro do painel e cobre com Espuma translúcido.
      ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, c.raio); ctx.clip();
      const m = c.desfoque * 2;
      ctx.filter = `blur(${c.desfoque}px)`;
      ctx.drawImage(ctx.canvas, c.x - m, c.y - m, c.w + 2 * m, c.h + 2 * m, c.x - m, c.y - m, c.w + 2 * m, c.h + 2 * m);
      ctx.filter = 'none';
      ctx.globalAlpha = c.opacidade; ctx.fillStyle = COR.espuma; ctx.fillRect(c.x, c.y, c.w, c.h);
    } else if (c.t === 'texto') {
      ctx.font = `${c.est.peso} ${c.tam}px ${c.est.familia}`;
      ctx.letterSpacing = `${((c.est.tracking ?? 0) * c.tam).toFixed(3)}px`;
      ctx.textBaseline = 'middle'; ctx.fillStyle = c.cor;
      ctx.textAlign = c.alinh === 'centro' ? 'center' : 'left';
      c.linhas.forEach((l, i) => ctx.fillText(c.est.caixaAlta ? l.toUpperCase() : l, c.x, c.y + i * c.lh + c.lh / 2));
    } else if (c.t === 'logo') {
      ctx.drawImage(rec.logo, c.x, c.y, c.w, c.h);
    } else if (c.t === 'anel') {
      ctx.strokeStyle = c.cor; ctx.lineWidth = c.esp;
      ctx.beginPath(); ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2); ctx.stroke();
    } else if (c.t === 'icone') desenharIcone(ctx, c.id, c.cx, c.cy, c.tam, c.cor, c.preenchido);
    ctx.restore();
  }
  ctx.restore();
}
