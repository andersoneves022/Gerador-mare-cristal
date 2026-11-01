// COM-02 · Encerramento com chamada (Ficha §13). Único template com texto centrado.
// "Clássica" é a versão anterior (corpo "encerramento"). A, B e C (Etapa 6) são composições livres.
// Logotipo fixo, sem ampliação (388 px, abaixo do limite de 40% = 432 px, PT-09).
import { COR } from '../tokens.js';
import { fundoCor, contraste, campoComposicao, comp, fluxo } from './comum.js';

const classica = (c) => !c.composicao || c.composicao === 'classica';
const logo = (extra) => ({ b: 'logo', w: 388, gap: 72, ...extra });
const mensagem = { b: 'texto', campo: 'mensagem', rotulo: 'Mensagem', estilo: 'titulo', faixa: { feed: [72, 88], stories: [80, 96] }, maxLinhas: 3, gap: 72 };
const chamada = { b: 'pilula', campo: 'chamada', rotulo: 'Chamada', tipo: 'cta', obrigatorio: true, gap: 48 };
const apoio = { b: 'texto', campo: 'apoio', rotulo: 'Linha de apoio', estilo: 'semi', tam: 32, maxLinhas: 1 };
const centro = { alinhar: 'centro', alinh: 'centro' };

const COMPOSICOES = {
  A: {
    nome: 'A · Logotipo sobre disco Turquesa',
    feed: comp(fundoCor, [], [fluxo('feed', [logo({ disco: { cor: COR.turquesa, alpha: 0.15, r: 300 }, gap: 120 }), mensagem, chamada, apoio], centro)]),
    stories: comp(fundoCor, [], [fluxo('stories', [logo({ disco: { cor: COR.turquesa, alpha: 0.15, r: 320 }, gap: 144 }), mensagem, chamada, apoio], centro)]),
  },
  B: {
    nome: 'B · Bloco de cor com o logotipo, chamada abaixo',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 640, cor: contraste }, { t: 'bloco', x: 492, y: 616, w: 96, h: 48, raio: 24, cor: COR.turquesa }], [
      fluxo('feed', [logo({ gap: 0 })], { ...centro, topo: 72, base: 592 }),
      fluxo('feed', [mensagem, chamada, apoio], { ...centro, topo: 712 }),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 900, cor: contraste }, { t: 'bloco', x: 492, y: 876, w: 96, h: 48, raio: 24, cor: COR.turquesa }], [
      fluxo('stories', [logo({ gap: 0 })], { ...centro, topo: 250, base: 852 }),
      fluxo('stories', [mensagem, chamada, apoio], { ...centro, topo: 972 }),
    ]),
  },
  C: {
    nome: 'C · Cartão centrado com faixa Turquesa',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 1326, w: 1080, h: 24, cor: COR.turquesa }], [
      fluxo('feed', [{ b: 'cartao', fundo: contraste, pad: 72, alinh: 'centro', blocos: [logo({ w: 320, gap: 48 }), { ...mensagem, gap: 48 }, chamada, apoio] }], centro),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 1896, w: 1080, h: 24, cor: COR.turquesa }], [
      fluxo('stories', [{ b: 'cartao', fundo: contraste, pad: 72, alinh: 'centro', blocos: [logo({ w: 360, gap: 72 }), mensagem, chamada, apoio] }], centro),
    ]),
  },
};

export const COM02 = {
  id: 'COM-02', nome: 'Encerramento com chamada', estrutura: 'B', corpo: 'encerramento', cabecalho: false,
  estruturaDe: (c) => (classica(c) ? 'B' : 'C'),
  descricao: 'Último slide, Stories ou tela final de Reel: logotipo, chamada e link na bio.',
  formatos: ['feed', 'stories'], foto: false, logo: false,
  composicoes: COMPOSICOES,
  legado: { composicao: 'classica' },
  layout: { logo: { feed: 388, stories: 388 } }, // largura nativa do arquivo (36% do canvas): sem ampliação (PT-09)
  itens: [
    { campo: 'mensagem', rotulo: 'Mensagem', componente: 'titulo', cor: COR.oceano, maxLinhas: 3, gapApos: 72, faixa: { feed: [72, 96], stories: [80, 104] } },
    { campo: 'chamada', rotulo: 'Chamada', componente: 'pilula', obrigatorio: true, gapApos: 48 },
    { campo: 'apoio', rotulo: 'Linha de apoio', componente: 'legenda', cor: COR.oceano },
  ],
  campos: [
    campoComposicao(COMPOSICOES, true),
    { id: 'fundo', tipo: 'fundo', rotulo: 'Fundo' },
    { id: 'mensagem', tipo: 'textoLongo', rotulo: 'Mensagem (opcional)', ref: 48,
      sugestoes: [['Reserve direto com quem cuida da casa.', 'Usar a mensagem de reservas diretas (uso pontual)']] },
    { id: 'chamada', tipo: 'texto', rotulo: 'Chamada', ref: 18 },
    { id: 'apoio', tipo: 'texto', rotulo: 'Linha de apoio', ref: 28 },
  ],
  padroes: () => ({ composicao: 'A', fundo: 'espuma', mensagem: '', chamada: 'Reservar', apoio: 'link na bio' }),
};
