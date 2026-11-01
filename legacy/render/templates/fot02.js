// FOT-02 · Foto + legenda (carrossel). Composições da Galeria 4.1 (estrutura C).
// Feed traz o indicador n/total do carrossel; Stories não tem indicador.
import { COR } from '../tokens.js';

const textos = (cor, faixaLegenda, faixaDetalhe) => [
  { campo: 'legenda', rotulo: 'Legenda', estilo: 'legenda', faixa: faixaLegenda, maxLinhas: 2, obrigatorio: true, gap: 16, cor },
  { campo: 'detalhe', rotulo: 'Detalhe', estilo: 'detalhe', faixa: faixaDetalhe, maxLinhas: 3, cor },
];
const L_FEED = [36, 44], D_FEED = [28, 32], L_STORIES = [44, 52], D_STORIES = [32, 32];

const inteiro = (v) => (v === '' || v == null ? null : Number(v));
// "n/total" só no Feed e só quando o carrossel tem mais de uma peça.
const indicador = (c, F) => {
  const n = inteiro(c.posicao), t = inteiro(c.total);
  return F.id === 'feed' && t > 1 && n >= 1 && n <= t ? `${n}/${t}` : null;
};

const COMPOSICOES = {
  A: {
    nome: 'A · Foto + faixa Oceano',
    feed: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1010 },
      { t: 'bloco', x: 0, y: 1010, w: 1080, h: 340, cor: COR.oceano },
      { t: 'pilula', valor: indicador, direita: 72, y: 72, fundo: COR.oceano, cor: COR.espuma },
      { t: 'texto', x: 72, largura: 936, base: 1278, limite: { topo: 1058 }, itens: textos(COR.espuma, L_FEED, D_FEED) },
    ] },
    stories: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1260 },
      { t: 'bloco', x: 0, y: 1260, w: 1080, h: 660, cor: COR.oceano },
      { t: 'texto', x: 72, largura: 936, base: 1580, limite: { topo: 1308 }, itens: textos(COR.espuma, L_STORIES, D_STORIES) },
    ] },
  },
  B: {
    nome: 'B · Coluna Areia + foto vertical (Feed) · Faixa superior Oceano (Stories)',
    feed: { elementos: [
      { t: 'foto', slot: 1, x: 396, y: 0, w: 684, h: 1350 },
      { t: 'bloco', x: 0, y: 0, w: 396, h: 1350, cor: COR.areia },
      { t: 'pilula', valor: indicador, direita: 72, y: 72, fundo: COR.oceano, cor: COR.espuma },
      { t: 'texto', x: 72, largura: 276, base: 1278, limite: { topo: 192 }, itens: textos(COR.oceano, [36, 40], [28, 30]) },
    ] },
    stories: { elementos: [
      { t: 'bloco', x: 0, y: 0, w: 1080, h: 580, cor: COR.oceano },
      { t: 'foto', slot: 1, x: 0, y: 580, w: 1080, h: 1340 },
      { t: 'texto', x: 72, largura: 936, topo: 268, limite: { base: 532 }, itens: textos(COR.espuma, L_STORIES, D_STORIES) },
    ] },
  },
  C: {
    nome: 'C · Faixa superior + módulo Oceano (Feed) · Painel de vidro (Stories)',
    feed: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 340, w: 1080, h: 1010 },
      { t: 'bloco', x: 0, y: 0, w: 816, h: 340, cor: COR.espuma },
      { t: 'foto', slot: 2, x: 816, y: 0, w: 264, h: 340, opcional: {} },
      { t: 'pilula', valor: indicador, direita: 72, y: 72, cor: COR.espuma, maxLargura: 192, rotulo: 'Indicador', campo: 'total' },
      { t: 'texto', x: 72, largura: 700, topo: 72, limite: { base: 316 }, itens: textos(COR.oceano, L_FEED, D_FEED) },
    ] },
    stories: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1920 },
      { t: 'gradiente', y0: 1056, y1: 1920, alpha: 0.30 },
      { t: 'texto', x: 72, largura: 820, base: 1580, padding: 48, fundo: 'vidro', raio: 24, filete: { x: 0, w: 24, cor: COR.turquesa },
        limite: { topo: 250 }, itens: textos(COR.oceano, [44, 48], D_STORIES) },
    ] },
  },
};

export const FOT02 = {
  id: 'FOT-02', nome: 'Foto + legenda', estrutura: 'C',
  descricao: 'Fotografia com legenda curta integrada a faixas e colunas de cor. Feed com indicador de carrossel.',
  formatos: ['feed', 'stories'], foto: true,
  composicoes: COMPOSICOES,
  campos: [
    { id: 'composicao', tipo: 'selecao', rotulo: 'Composição', opcoes: [['A', COMPOSICOES.A.nome], ['B', COMPOSICOES.B.nome], ['C', COMPOSICOES.C.nome]] },
    { id: 'foto', tipo: 'foto', slot: 1, rotulo: 'Fotografia' },
    { id: 'foto2', tipo: 'foto', slot: 2, rotulo: 'Fotografia secundária (opcional, só no Feed)', visivelSe: (c) => c.composicao === 'C' },
    { id: 'legenda', tipo: 'texto', rotulo: 'Legenda', ref: 32, placeholder: 'Cozinha com varanda e rede' },
    { id: 'detalhe', tipo: 'textoLongo', rotulo: 'Detalhe (opcional)', ref: 60 },
    { id: 'posicao', tipo: 'numero', rotulo: 'Posição no carrossel (só no Feed)', min: 1, max: 20 },
    { id: 'total', tipo: 'numero', rotulo: 'Total de peças do carrossel (só no Feed; vazio ou 1 = sem indicador)', min: 1, max: 20 },
  ],
  validar(c) {
    const n = inteiro(c.posicao), t = inteiro(c.total);
    if (t == null || t <= 1) return [];
    if (!Number.isInteger(t) || t > 20) return [{ campo: 'total', texto: 'Total do carrossel: use um número inteiro de 2 a 20.' }];
    if (!Number.isInteger(n) || n < 1 || n > t) return [{ campo: 'posicao', texto: `Posição no carrossel: use um número de 1 a ${t}.` }];
    return [];
  },
  padroes: () => ({ composicao: 'A', legenda: '', detalhe: '', posicao: 1, total: null }),
};
