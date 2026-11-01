// COM-01 · Aviso comercial (Ficha §12). Estrutura A com um painel de vidro. Sem campo de preço e sem logotipo.
import { COR, ESCURECIMENTO } from '../tokens.js';
import { campoComposicao } from './comum.js';

export const TIPOS_COM01 = {
  disponibilidade: { rotulo: 'Disponibilidade', cor: COR.turquesa },
  'reservas-abertas': { rotulo: 'Reservas abertas', cor: COR.turquesa },
  'datas-especiais': { rotulo: 'Datas especiais', cor: COR.sol },
  'ultimas-vagas': { rotulo: 'Últimas vagas', cor: COR.sol },
};
const linha = (campo, rotulo) => ({ campo, rotulo, componente: 'linha', cor: COR.oceano, maxLinhas: 2, faixa: { feed: [34, 34], stories: [34, 34] } });

// Etapa 6: composições A, B e C (estrutura C com fluxo em painel de vidro). "Clássica" = versão anterior.
const classica = (c) => !c.composicao || c.composicao === 'classica';
const alphaDe = (c) => ESCURECIMENTO[c.escurecimento ?? 'intenso'] ?? 0;
const L = (campo, rotulo, obrigatorio = false) => ({ b: 'texto', campo, rotulo, estilo: 'linhaCom', tam: 34, maxLinhas: 2, obrigatorio, gap: 24 });
const painel = (tituloFaixa) => [
  { b: 'pilula', campo: 'tipo', rotulo: 'Tipo', tipo: 'tag', obrigatorio: true, gap: 24,
    valor: (c) => TIPOS_COM01[c.tipo]?.rotulo ?? c.tipo, fundo: (c) => TIPOS_COM01[c.tipo]?.cor ?? COR.turquesa },
  { b: 'texto', campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa: tituloFaixa, maxLinhas: 3, obrigatorio: true, gap: 24 },
  L('periodo', 'Período', true), L('acomodacao', 'Acomodação'), { ...L('condicao', 'Condição'), gap: 48 },
  { b: 'pilula', campo: 'chamada', rotulo: 'Chamada', tipo: 'cta', obrigatorio: true },
];
const vidro = (x, largura, topo, base, faixa) => ({ t: 'fluxo', x, largura, topo, base, alinhar: 'base', painel: true, blocos: painel(faixa),
  mensagemNaoCabe: 'O painel não comporta o conteúdo. Encurte os textos ou escolha outra composição.' });
const FT = { feed: [64, 80], stories: [72, 88] };
const COMPOSICOES = {
  A: {
    nome: 'A · Foto cheia + painel de vidro estreito',
    feed: { elementos: [{ t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1350 }, { t: 'gradiente', y0: 742, y1: 1350, alpha: alphaDe }, vidro(72, 744, 72, 1278, FT)] },
    stories: { elementos: [{ t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1920 }, { t: 'gradiente', y0: 1056, y1: 1920, alpha: alphaDe }, vidro(72, 776, 250, 1580, FT)] },
  },
  B: {
    nome: 'B · Foto no topo, painel sobre a divisa Areia',
    feed: { fundo: COR.areia, elementos: [{ t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 900 }, { t: 'gradiente', y0: 500, y1: 900, alpha: alphaDe },
      { t: 'bloco', x: 0, y: 900, w: 1080, h: 450, cor: COR.areia }, vidro(72, 936, 72, 1278, FT)] },
    stories: { fundo: COR.areia, elementos: [{ t: 'foto', slot: 1, x: 0, y: 0, w: 1080, h: 1240 }, { t: 'gradiente', y0: 760, y1: 1240, alpha: alphaDe },
      { t: 'bloco', x: 0, y: 1240, w: 1080, h: 680, cor: COR.areia }, vidro(72, 936, 250, 1580, FT)] },
  },
  C: {
    nome: 'C · Foto em moldura sobre Oceano',
    feed: { fundo: COR.oceano, elementos: [{ t: 'foto', slot: 1, x: 48, y: 48, w: 984, h: 1254, raio: 32 }, { t: 'gradiente', y0: 742, y1: 1302, alpha: alphaDe },
      { t: 'bloco', x: 0, y: 1302, w: 1080, h: 48, cor: COR.oceano }, vidro(96, 888, 96, 1254, FT)] },
    stories: { fundo: COR.oceano, elementos: [{ t: 'foto', slot: 1, x: 48, y: 48, w: 984, h: 1824, raio: 32 }, { t: 'gradiente', y0: 1056, y1: 1872, alpha: alphaDe },
      { t: 'bloco', x: 0, y: 1872, w: 1080, h: 48, cor: COR.oceano }, vidro(96, 888, 250, 1580, FT)] },
  },
};

export const COM01 = {
  id: 'COM-01', nome: 'Aviso comercial', estrutura: 'A',
  estruturaDe: (c) => (classica(c) ? 'A' : 'C'),
  composicoes: COMPOSICOES,
  legado: { composicao: 'classica' },
  descricao: 'Disponibilidade, reservas abertas, datas especiais ou últimas vagas, em painel de vidro.',
  formatos: ['feed', 'stories'], foto: true, logo: false,
  escurecimento: { padrao: 'intenso', niveis: ['nenhum', 'suave', 'intenso'] },
  layout: { painel: true },
  itens: [
    { campo: 'tipo', rotulo: 'Tipo', componente: 'tagTipo', obrigatorio: true, gapApos: 24,
      formatar: (v) => TIPOS_COM01[v]?.rotulo ?? v, fundoDe: (d) => TIPOS_COM01[d.campos.tipo]?.cor ?? COR.turquesa },
    { campo: 'titulo', rotulo: 'Título', componente: 'titulo', obrigatorio: true, cor: COR.oceano, maxLinhas: 3,
      faixa: { feed: [72, 80], stories: [80, 88] } },
    { ...linha('periodo', 'Período'), obrigatorio: true },
    linha('acomodacao', 'Acomodação'),
    linha('condicao', 'Condição'),
    { campo: 'chamada', rotulo: 'Chamada', componente: 'pilula', obrigatorio: true, gapAntes: 48 },
  ],
  campos: [
    campoComposicao(COMPOSICOES, true),
    { id: 'foto', tipo: 'foto', slot: 1, rotulo: 'Fotografia' },
    { id: 'tipo', tipo: 'selecao', rotulo: 'Tipo de aviso', comercial: true, opcoes: Object.entries(TIPOS_COM01).map(([k, v]) => [k, v.rotulo]) },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 40, comercial: true },
    { id: 'periodo', tipo: 'texto', rotulo: 'Período', ref: 32, comercial: true, placeholder: '[datas]' },
    { id: 'acomodacao', tipo: 'texto', rotulo: 'Acomodação (opcional)', comercial: true },
    { id: 'condicao', tipo: 'texto', rotulo: 'Condição (opcional)', ref: 50, comercial: true },
    { id: 'chamada', tipo: 'texto', rotulo: 'Chamada', ref: 18 },
    { id: 'escurecimento', tipo: 'escurecimento', rotulo: 'Escurecimento' },
    { id: 'confirmacaoComercial', tipo: 'booleano', rotulo: 'Confirmo que datas, valores e condições estão corretos hoje' },
  ],
  padroes: () => ({ composicao: 'A', tipo: 'disponibilidade', titulo: '', periodo: '', acomodacao: '', condicao: '', chamada: 'Ver cotação', escurecimento: 'intenso', confirmacaoComercial: false }),
  validar: (c) => (c.confirmacaoComercial ? [] : [{ campo: 'confirmacaoComercial', texto: 'Falta a confirmação comercial: confira datas, valores e condições antes de exportar.' }]),
};
