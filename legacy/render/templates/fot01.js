// FOT-01 · Foto + título (Ficha §4).
// "Clássica" é a versão 0.0.4 (estrutura A, mantida para os projetos já salvos).
// A, B e C são as composições aprovadas na Galeria 4.1 (estrutura C), com desenho próprio em Feed e Stories.
import { COR } from '../tokens.js';

const FAIXA = { feed: [72, 96], stories: [80, 104], reels: [80, 104] };
const chamada = (c) => c.versao === 'chamada';
const classica = (c) => !c.composicao || c.composicao === 'classica';

// Textos das composições A/B/C: tag de local (opcional) + título. Tamanho máximo = o da galeria;
// a fitagem só reduz até o mínimo da faixa (Feed 72, Stories 80) e nunca trunca.
const textos = (corTag, corTitulo, faixaTitulo) => [
  { campo: 'tag', rotulo: 'Tag de local', estilo: 'tag', tam: { feed: 28, stories: 32 }, maxLinhas: 1, gap: 24, cor: corTag },
  { campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa: faixaTitulo, maxLinhas: 3, obrigatorio: true, cor: corTitulo },
];
const T_FEED = [72, 88], T_STORIES = [80, 96];

const COMPOSICOES = {
  A: {
    nome: 'A · Foto dominante + bloco Oceano',
    feed: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1350 },
      { t: 'texto', x: 0, largura: 760, base: 1350, padding: 72, fundo: COR.oceano,
        limite: { topo: 72 }, itens: textos(COR.lima, COR.espuma, T_FEED) },
    ] },
    stories: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1920 },
      { t: 'texto', x: 0, largura: 820, base: 1652, padding: 72, fundo: COR.oceano,
        limite: { topo: 250 }, itens: textos(COR.lima, COR.espuma, T_STORIES) },
    ] },
  },
  B: {
    nome: 'B · Divisão foto + bloco Areia',
    feed: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 800 },
      { t: 'bloco', x: 0, y: 800, w: 1080, h: 550, cor: COR.areia },
      { t: 'texto', x: 72, largura: 650, base: 1278, limite: { topo: 848 }, itens: textos(COR.oceano, COR.oceano, T_FEED) },
    ] },
    stories: { elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1180 },
      { t: 'bloco', x: 0, y: 1180, w: 1080, h: 740, cor: COR.areia },
      { t: 'texto', x: 72, largura: 650, base: 1580, limite: { topo: 1196 }, itens: textos(COR.oceano, COR.oceano, T_STORIES) },
    ] },
  },
  C: {
    nome: 'C · Editorial assimétrica com foto secundária',
    feed: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 700, h: 880, raio: [0, 0, 32, 0] },
      { t: 'foto', slot: 3, x: 748, y: 0, w: 332, h: 512, raio: [0, 0, 0, 32], opcional: {} },
      { t: 'foto', slot: 2, x: 748, y: 560, w: 332, h: 320, raio: [32, 0, 0, 32] },
      { t: 'texto', x: 72, largura: 650, base: 1278, limite: { topo: 928 }, itens: textos(COR.oceano, COR.oceano, T_FEED) },
    ] },
    stories: { fundo: COR.espuma, elementos: [
      { t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1100 },
      { t: 'bloco', x: 524, y: 804, w: 500, h: 392, cor: COR.espuma, raio: 48 },
      { t: 'foto', slot: 2, x: 540, y: 820, w: 468, h: 360, raio: 32 },
      { t: 'bloco', x: 0, y: 1100, w: 24, h: 480, cor: COR.turquesa },
      { t: 'texto', x: 72, largura: 650, base: 1580, limite: { topo: 1244 }, itens: textos(COR.oceano, COR.oceano, [80, 88]) },
    ] },
  },
};

export const FOT01 = {
  id: 'FOT-01', nome: 'Foto + título', estrutura: 'A',
  estruturaDe: (c) => (classica(c) ? 'A' : 'C'),
  descricao: 'Fotografia dominante com título integrado a blocos de cor, ou a versão clássica com chamada.',
  formatos: ['feed', 'stories'], foto: true, logo: true,
  escurecimento: { padrao: 'suave', niveis: ['nenhum', 'suave', 'intenso'] },
  layout: { larguraBloco: 650, logo: { feed: 180, stories: 200 } },
  composicoes: COMPOSICOES,
  // Projetos gravados antes da 4.1 não têm "composicao": abrem na versão clássica, sem mudar nada.
  legado: { composicao: 'classica' },
  itens: [
    { campo: 'tag', rotulo: 'Tag de local', componente: 'tagLocal', ativoSe: chamada, gapApos: 24,
      cor: (d, cena) => (cena.nivel !== 'nenhum' && !cena.temPilula ? COR.lima : COR.espuma) },
    { campo: 'titulo', rotulo: 'Título', componente: 'titulo', obrigatorio: true, gapApos: 24, cor: COR.espuma,
      maxLinhas: (d) => (d.campos.versao === 'discreta' ? 2 : 4),
      faixaDe: (d, F) => (d.campos.versao === 'discreta' ? [72, 72] : FAIXA[F.id]) },
    { campo: 'apoio', rotulo: 'Apoio', componente: 'apoio', ativoSe: chamada, cor: COR.espuma, maxLinhas: 3,
      faixa: { feed: [30, 34], stories: [32, 34] } },
    { campo: 'chamada', rotulo: 'Chamada', componente: 'pilula', ativoSe: chamada, gapAntes: 48 },
  ],
  campos: [
    { id: 'composicao', tipo: 'selecao', rotulo: 'Composição', opcoes: [
      ['A', COMPOSICOES.A.nome], ['B', COMPOSICOES.B.nome], ['C', COMPOSICOES.C.nome], ['classica', 'Clássica (versão 0.0.4)']] },
    { id: 'foto', tipo: 'foto', slot: 1, rotulo: 'Fotografia principal' },
    { id: 'foto2', tipo: 'foto', slot: 2, rotulo: 'Fotografia secundária', visivelSe: (c) => c.composicao === 'C' },
    { id: 'foto3', tipo: 'foto', slot: 3, rotulo: 'Terceira fotografia (opcional, só no Feed)', visivelSe: (c) => c.composicao === 'C' },
    { id: 'versao', tipo: 'selecao', rotulo: 'Versão', visivelSe: classica, opcoes: [['discreta', 'Discreta (só o título)'], ['chamada', 'Com chamada']] },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 48, placeholder: 'Acordar na Praia do Rosa' },
    { id: 'tag', tipo: 'texto', rotulo: 'Tag de local', ref: 28, visivelSe: (c) => !classica(c) || chamada(c) },
    { id: 'apoio', tipo: 'textoLongo', rotulo: 'Apoio (opcional)', ref: 90, visivelSe: (c) => classica(c) && chamada(c) },
    { id: 'chamada', tipo: 'texto', rotulo: 'Chamada', ref: 18, visivelSe: (c) => classica(c) && chamada(c) },
    { id: 'escurecimento', tipo: 'escurecimento', rotulo: 'Escurecimento', visivelSe: classica },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo na placa Espuma', visivelSe: (c) => classica(c) && chamada(c) },
  ],
  padroes: () => ({ composicao: 'A', versao: 'discreta', titulo: '', tag: 'Praia do Rosa · SC', apoio: '', chamada: 'Ver cotação', escurecimento: 'suave', logotipo: false }),
};
