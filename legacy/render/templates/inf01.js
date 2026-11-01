// INF-01 · Grade de ícones (Ficha §6). Estrutura B (cartão).
// "Clássica" é a versão anterior (corpo "grade-icones", mantida para os projetos já salvos).
// A, B e C (Etapa 6) são composições livres com fluxo vertical, desenhadas para Feed e Stories.
import { COR } from '../tokens.js';
import { fundoCor, contraste, logoRodape, FAIXA_TITULO, campoComposicao, comp, fluxo } from './comum.js';

const classica = (c) => !c.composicao || c.composicao === 'classica';
const cabecalho = (gapTitulo, faixa = FAIXA_TITULO, largura) => [
  { b: 'texto', campo: 'rotulo', rotulo: 'Rótulo', estilo: 'rotulo', tam: { feed: 28, stories: 32 }, maxLinhas: 1, gap: 24 },
  { b: 'texto', campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa, maxLinhas: 3, obrigatorio: true, gap: gapTitulo, largura },
];
const grade = (extra) => ({ b: 'grade', campo: 'itens', colunas: 2, fonte: { feed: 28, stories: 32 }, ...extra });

const COMPOSICOES = {
  A: {
    nome: 'A · Grade de azulejos com disco Turquesa',
    feed: comp(fundoCor, [{ t: 'bloco', x: 760, y: -220, w: 560, h: 560, raio: 280, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('feed', [...cabecalho(72, FAIXA_TITULO, 720), { b: 'flex' },
        grade({ modo: 'lado', azulejo: 112, icone: 64, gapColuna: 48, gapLinha: 48 }), { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 720, y: 40, w: 600, h: 600, raio: 300, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('stories', [...cabecalho(72, FAIXA_TITULO, 720), { b: 'flex' },
        grade({ modo: 'lado', azulejo: 128, icone: 72, gapColuna: 48, gapLinha: 56 }), { b: 'flex' }, logoRodape]),
    ]),
  },
  B: {
    nome: 'B · Itens em cartões com filete lateral',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 24, h: 1350, cor: COR.turquesa }], [
      fluxo('feed', [...cabecalho(48), { b: 'flex' },
        grade({ modo: 'lado', azulejo: 96, icone: 56, gapColuna: 24, gapLinha: 24, cartao: contraste, pad: 24 }), { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 24, h: 1920, cor: COR.turquesa }], [
      fluxo('stories', [...cabecalho(72), { b: 'flex' },
        grade({ modo: 'pilha', azulejo: 104, icone: 60, gapColuna: 24, gapLinha: 24, cartao: contraste, pad: 32 }), { b: 'flex' }, logoRodape]),
    ]),
  },
  C: {
    nome: 'C · Cabeçalho em bloco de cor + grade aberta',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 440, cor: contraste }], [
      fluxo('feed', cabecalho(0, { feed: [72, 88] }), { topo: 72, base: 392, alinhar: 'base' }),
      fluxo('feed', [grade({ modo: 'pilha', azulejo: 88, icone: 52, gapColuna: 48, gapLinha: 32, fonte: { feed: 28 } }), { b: 'flex' }, logoRodape], { topo: 488 }),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 760, cor: contraste }], [
      fluxo('stories', cabecalho(0, { stories: [80, 96] }), { topo: 250, base: 688, alinhar: 'base' }),
      fluxo('stories', [grade({ modo: 'pilha', azulejo: 104, icone: 60, gapColuna: 48, gapLinha: 40 }), { b: 'flex' }, logoRodape], { topo: 832 }),
    ]),
  },
};

export const INF01 = {
  id: 'INF-01', nome: 'Grade de ícones', estrutura: 'B', corpo: 'grade-icones', cabecalho: true,
  estruturaDe: (c) => (classica(c) ? 'B' : 'C'),
  descricao: 'Estrutura e comodidades: de 2 a 8 itens com ícone de linha.',
  formatos: ['feed', 'stories'], foto: false, logo: true,
  composicoes: COMPOSICOES,
  legado: { composicao: 'classica' },
  layout: {
    logo: { feed: 180, stories: 200 },
    grade: { colunas: 2, gapColuna: 48, gapLinha: 48, azulejo: 112, icone: 64, raioAzulejo: 24, gapItem: 24,
      fonte: { feed: 32, stories: 32 }, maxLinhasRotulo: 2 },
  },
  itens: [
    { campo: 'rotulo', rotulo: 'Rótulo', componente: 'rotulo', cor: COR.oceano, gapApos: 24 },
    { campo: 'titulo', rotulo: 'Título', componente: 'titulo', obrigatorio: true, cor: COR.oceano, maxLinhas: 3,
      faixa: { feed: [72, 96], stories: [80, 104] } },
  ],
  campos: [
    campoComposicao(COMPOSICOES, true),
    { id: 'fundo', tipo: 'fundo', rotulo: 'Fundo' },
    { id: 'rotulo', tipo: 'texto', rotulo: 'Rótulo (opcional)', ref: 28, placeholder: 'Comodidades' },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 48, placeholder: 'O que a casa oferece' },
    { id: 'itens', tipo: 'itens', rotulo: 'Itens (2 a 8)', min: 2, max: 8, ref: 28 },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo no rodapé' },
  ],
  padroes: () => ({
    composicao: 'A', fundo: 'espuma', rotulo: '', titulo: '', logotipo: true,
    itens: [
      { icone: 'cozinha', texto: 'Cozinha completa' }, { icone: 'banheiro', texto: 'Banheiro privativo' },
      { icone: 'estacionamento', texto: 'Estacionamento gratuito' }, { icone: 'wifi', texto: 'Wi-Fi' },
    ],
  }),
  // A versão clássica já valida a quantidade no próprio corpo.
  validar: (c) => (!classica(c) && ((c.itens ?? []).length < 2 || (c.itens ?? []).length > 8) ? [{ campo: 'itens', texto: 'Use de 2 a 8 itens.' }] : []),
};
