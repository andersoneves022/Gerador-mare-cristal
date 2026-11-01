// INF-03 · Passos numerados (Ficha §8). Estrutura B (cartão).
// 3 a 4 passos com número em Sora Bold num círculo Turquesa (texto Oceano), título e apoio opcional;
// uma pílula lima de chamada fecha a peça (o único lima). No Feed, pílula e logotipo dividem o rodapé (IT, PEND §8.5).
import { fundoCor, contraste, logoRodape, FAIXA_TITULO, campoComposicao, comp, fluxo } from './comum.js';
import { COR } from '../tokens.js';

const titulo = (gap, faixa = FAIXA_TITULO) => ({ b: 'texto', campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa, maxLinhas: 2, obrigatorio: true, gap });
const chamada = { b: 'pilula', campo: 'chamada', rotulo: 'Chamada', tipo: 'cta', obrigatorio: true, gap: 48 };
const rodapeFeed = { b: 'linha', blocos: [logoRodape, { ...chamada, gap: 0 }] };
const passos = (extra) => ({ b: 'passos', campo: 'passos', fonteTitulo: { feed: [28, 36], stories: [32, 40] }, fonteApoio: { feed: [28, 28], stories: [32, 32] }, ...extra });

const COMPOSICOES = {
  A: {
    nome: 'A · Lista com linha de percurso',
    feed: comp(fundoCor, [], [
      fluxo('feed', [titulo(48), { b: 'flex' }, passos({ modo: 'lista', diam: 88, gap: 32, conector: true }), { b: 'flex' }, rodapeFeed]),
    ]),
    stories: comp(fundoCor, [], [
      fluxo('stories', [titulo(72), { b: 'flex' }, passos({ modo: 'lista', diam: 112, gap: 48, conector: true }), { b: 'espaco', h: 0, gap: 72 }, chamada, { b: 'flex' }, logoRodape]),
    ]),
  },
  B: {
    nome: 'B · Passos em cartões',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 24, cor: COR.turquesa }], [
      fluxo('feed', [titulo(48, { feed: [72, 88] }), { b: 'flex' }, passos({ modo: 'lista', diam: 80, gap: 24, cartao: contraste, fonteApoio: { feed: [28, 28] } }), { b: 'flex' }, rodapeFeed]),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 24, cor: COR.turquesa }], [
      fluxo('stories', [titulo(72), { b: 'flex' }, passos({ modo: 'lista', diam: 96, gap: 24, cartao: contraste }), { b: 'espaco', h: 0, gap: 48 }, chamada, { b: 'flex' }, logoRodape]),
    ]),
  },
  C: {
    nome: 'C · Grade 2 × 2 com bloco de cor',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 400, cor: contraste }], [
      fluxo('feed', [titulo(0, { feed: [72, 88] })], { topo: 72, base: 352, alinhar: 'base' }),
      fluxo('feed', [passos({ modo: 'grade', diam: 88, gap: 48 }), { b: 'flex' }, rodapeFeed], { topo: 448 }),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 680, cor: contraste }], [
      fluxo('stories', [titulo(0)], { topo: 250, base: 608, alinhar: 'base' }),
      fluxo('stories', [passos({ modo: 'grade', diam: 104, gap: 56 }), { b: 'flex' }, chamada, logoRodape], { topo: 752 }),
    ]),
  },
};

export const INF03 = {
  id: 'INF-03', nome: 'Passos numerados', estrutura: 'C',
  descricao: 'Informações sobre reservas: de 3 a 4 passos e uma chamada.',
  formatos: ['feed', 'stories'], foto: false, logo: true,
  composicoes: COMPOSICOES,
  campos: [
    campoComposicao(COMPOSICOES),
    { id: 'fundo', tipo: 'fundo', rotulo: 'Fundo' },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 48, placeholder: 'Como reservar' },
    { id: 'passos', tipo: 'lista', rotulo: 'Passos (3 a 4)', min: 3, max: 4, textoAdicionar: 'Adicionar passo', novo: () => ({ titulo: '', apoio: '' }),
      subcampos: [{ id: 'titulo', rotulo: 'Título do passo', ref: 32 }, { id: 'apoio', rotulo: 'Apoio (opcional)', ref: 60 }] },
    { id: 'chamada', tipo: 'texto', rotulo: 'Chamada', ref: 18 },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo no rodapé' },
  ],
  // Fluxo do site (Biblioteca §6.2).
  padroes: () => ({
    composicao: 'A', fundo: 'espuma', titulo: '', chamada: 'Ver cotação', logotipo: true,
    passos: [
      { titulo: 'Escolha a acomodação', apoio: '' }, { titulo: 'Informe datas e hóspedes', apoio: '' },
      { titulo: 'Veja a cotação', apoio: '' }, { titulo: 'Confirme pelo WhatsApp', apoio: '' },
    ],
  }),
  validar: (c) => {
    const n = (c.passos ?? []).length;
    return n < 3 || n > 4 ? [{ campo: 'passos', texto: 'Use de 3 a 4 passos.' }] : [];
  },
};
