// INS-01 · Foto em moldura + texto. Mosaicos da Galeria 4.1 (estrutura C).
// Fotografias em molduras de cantos 32 px, blocos de cor e pílula de local; texto na base.
import { COR } from '../tokens.js';

const R = 32;
const textos = [
  { campo: 'rotulo', rotulo: 'Rótulo', estilo: 'rotulo', tam: { feed: 28, stories: 32 }, maxLinhas: 1, gap: 24, cor: COR.oceano },
  // PROVISÓRIO: a galeria usa 68 px; a fitagem desce no máximo até 60 px.
  { campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa: [60, 68], maxLinhas: 3, obrigatorio: true, gap: 24, cor: COR.oceano },
  { campo: 'detalhe', rotulo: 'Texto', estilo: 'detalhe', faixa: { feed: [28, 32], stories: [32, 32] }, maxLinhas: 3, cor: COR.oceano },
];
const texto = (F) => (F === 'feed'
  ? { t: 'texto', x: 72, largura: 936, base: 1278, limite: { topo: 922 }, itens: textos }
  : { t: 'texto', x: 72, largura: 936, base: 1580, limite: { topo: 1178 }, itens: textos });
const tag = (x, y, fundo, cor, maxLargura) => ({ t: 'pilula', campo: 'tag', rotulo: 'Tag de local', x, y, fundo, cor, maxLargura });

const COMPOSICOES = {
  A: {
    nome: 'A · Mosaico: principal + secundária + módulo',
    feed: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 72, w: 600, h: 802, raio: R },
      { t: 'foto', slot: 2, x: 696, y: 72, w: 312, h: 470, raio: R },
      { t: 'foto', slot: 3, x: 696, y: 566, w: 312, h: 308, raio: R, opcional: {} },
      tag(96, 788, COR.turquesa, COR.oceano, 552), texto('feed'),
    ] },
    stories: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 250, w: 576, h: 880, raio: R },
      { t: 'foto', slot: 2, x: 672, y: 250, w: 336, h: 440, raio: R },
      { t: 'foto', slot: 3, x: 672, y: 714, w: 336, h: 416, raio: R, opcional: {} },
      tag(96, 1034, COR.turquesa, COR.oceano, 528), texto('stories'),
    ] },
  },
  B: {
    nome: 'B · Encaixe assimétrico (Feed) · Panorâmica + par foto/bloco (Stories)',
    feed: { fundo: COR.areia, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 72, w: 480, h: 802, raio: R },
      { t: 'foto', slot: 3, x: 576, y: 72, w: 432, h: 300, raio: R, opcional: { placa: COR.espuma } },
      { t: 'foto', slot: 2, x: 576, y: 396, w: 432, h: 478, raio: R },
      tag(624, 296, COR.turquesa, COR.oceano, 360), texto('feed'),
    ] },
    stories: { fundo: COR.areia, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 250, w: 936, h: 500, raio: R },
      { t: 'foto', slot: 2, x: 72, y: 774, w: 456, h: 356, raio: R },
      { t: 'foto', slot: 3, x: 552, y: 774, w: 456, h: 356, raio: R, opcional: { placa: COR.espuma } },
      tag(600, 1034, COR.turquesa, COR.oceano, 384), texto('stories'),
    ] },
  },
  C: {
    nome: 'C · Panorâmica + fileira de módulos (Feed) · Foto larga + coluna (Stories)',
    feed: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 72, w: 936, h: 440, raio: R },
      { t: 'foto', slot: 2, x: 72, y: 536, w: 300, h: 338, raio: R },
      { t: 'foto', slot: 4, x: 396, y: 536, w: 300, h: 338, raio: R, opcional: {} },
      { t: 'foto', slot: 3, x: 720, y: 536, w: 288, h: 338, raio: R },
      tag(96, 436, COR.oceano, COR.espuma, 888), texto('feed'),
    ] },
    stories: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 72, y: 250, w: 672, h: 880, raio: R },
      { t: 'foto', slot: 2, x: 768, y: 250, w: 240, h: 420, raio: R },
      { t: 'foto', slot: 3, x: 768, y: 694, w: 240, h: 436, raio: R, opcional: {} },
      tag(96, 1034, COR.turquesa, COR.oceano, 624), texto('stories'),
    ] },
  },
};

export const INS01 = {
  id: 'INS-01', nome: 'Foto em moldura + texto', estrutura: 'C',
  descricao: 'Mosaico editorial com duas ou três fotografias, blocos de cor e texto de inspiração.',
  formatos: ['feed', 'stories'], foto: true,
  composicoes: COMPOSICOES,
  campos: [
    { id: 'composicao', tipo: 'selecao', rotulo: 'Composição', opcoes: [['A', COMPOSICOES.A.nome], ['B', COMPOSICOES.B.nome], ['C', COMPOSICOES.C.nome]] },
    { id: 'foto', tipo: 'foto', slot: 1, rotulo: 'Fotografia principal' },
    { id: 'foto2', tipo: 'foto', slot: 2, rotulo: 'Fotografia secundária' },
    { id: 'foto3', tipo: 'foto', slot: 3, rotulo: 'Terceira fotografia (opcional em A, B e Stories C)' },
    { id: 'foto4', tipo: 'foto', slot: 4, rotulo: 'Quarta fotografia (opcional, só no Feed C)', visivelSe: (c) => c.composicao === 'C' },
    { id: 'rotulo', tipo: 'texto', rotulo: 'Rótulo (opcional)', ref: 24, placeholder: 'Praia do Rosa' },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 40, placeholder: 'Madeira, verde e o mar por perto' },
    { id: 'detalhe', tipo: 'textoLongo', rotulo: 'Texto (opcional)', ref: 80 },
    { id: 'tag', tipo: 'texto', rotulo: 'Tag de local (pílula sobre a foto)', ref: 24 },
  ],
  padroes: () => ({ composicao: 'A', rotulo: '', titulo: '', detalhe: '', tag: 'Praia do Rosa · SC' }),
};
