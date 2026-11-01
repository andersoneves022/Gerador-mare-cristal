// INF-02 · Linhas rótulo/valor (Ficha §7). Estrutura B (cartão).
// Cartão de raio 24 px (Areia; Espuma sobre fundo Areia, PT-11) com 3 a 6 linhas separadas por filete Turquesa de 2 px.
// Cabeçalho só com o título (Ficha §7.3, IT). Rótulo em Inter SemiBold, valor em Inter Regular.
import { COR } from '../tokens.js';
import { fundoCor, contraste, logoRodape, FAIXA_TITULO, campoComposicao, comp, fluxo } from './comum.js';

const titulo = (gap, largura, faixa = FAIXA_TITULO) => ({ b: 'texto', campo: 'titulo', rotulo: 'Título', estilo: 'titulo', faixa, maxLinhas: 3, obrigatorio: true, gap, largura });
const nota = { b: 'texto', campo: 'nota', rotulo: 'Nota de rodapé', estilo: 'regular', tam: { feed: 28, stories: 32 }, maxLinhas: 2 };
const linhas = (extra) => ({ b: 'linhas', campo: 'linhas', cartao: contraste, fonteRotulo: { feed: [28, 32], stories: [32, 36] }, fonteValor: { feed: [28, 32], stories: [32, 36] }, gap: 24, ...extra });

const COMPOSICOES = {
  A: {
    nome: 'A · Ficha em cartão, rótulo e valor lado a lado',
    feed: comp(fundoCor, [{ t: 'bloco', x: 888, y: 0, w: 192, h: 192, raio: [0, 0, 0, 192], cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('feed', [titulo(48, 780), { b: 'flex' }, linhas({ modo: 'lado', colRotulo: 300 }), nota, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 840, y: 0, w: 240, h: 240, raio: [0, 0, 0, 240], cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('stories', [titulo(72, 780), { b: 'flex' }, linhas({ modo: 'empilhado' }), nota, { b: 'flex' }, logoRodape]),
    ]),
  },
  B: {
    nome: 'B · Cartão sangrado à direita, linhas empilhadas',
    feed: comp(fundoCor, [], [
      fluxo('feed', [titulo(72), linhas({ modo: 'empilhado', sangrar: true, fonteValor: { feed: [28, 30] } }), nota, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [], [
      fluxo('stories', [titulo(72), { b: 'flex' }, linhas({ modo: 'empilhado', sangrar: true }), nota, { b: 'flex' }, logoRodape]),
    ]),
  },
  C: {
    nome: 'C · Título em faixa Turquesa + ficha abaixo',
    feed: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 400, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('feed', [titulo(0, undefined, { feed: [72, 88] })], { topo: 72, base: 352, alinhar: 'base' }),
      fluxo('feed', [linhas({ modo: 'lado', colRotulo: 280, fonteValor: { feed: [28, 30] } }), nota, { b: 'flex' }, logoRodape], { topo: 448 }),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 0, y: 0, w: 1080, h: 680, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('stories', [titulo(0)], { topo: 250, base: 608, alinhar: 'base' }),
      fluxo('stories', [linhas({ modo: 'lado', colRotulo: 300 }), nota, { b: 'flex' }, logoRodape], { topo: 752 }),
    ]),
  },
};

export const INF02 = {
  id: 'INF-02', nome: 'Linhas rótulo/valor', estrutura: 'C',
  descricao: 'Localização e distâncias, regras da hospedagem ou ficha da acomodação: de 3 a 6 linhas.',
  formatos: ['feed', 'stories'], foto: false, logo: true,
  composicoes: COMPOSICOES,
  campos: [
    campoComposicao(COMPOSICOES),
    { id: 'fundo', tipo: 'fundo', rotulo: 'Fundo' },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 48, placeholder: 'Tudo a poucos passos' },
    { id: 'linhas', tipo: 'lista', rotulo: 'Linhas (3 a 6)', min: 3, max: 6, textoAdicionar: 'Adicionar linha', novo: () => ({ rotulo: '', valor: '' }),
      subcampos: [{ id: 'rotulo', rotulo: 'Rótulo', ref: 24 }, { id: 'valor', rotulo: 'Valor', ref: 40 }] },
    { id: 'nota', tipo: 'textoLongo', rotulo: 'Nota de rodapé (opcional)' },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo no rodapé' },
  ],
  // Exemplos da Biblioteca §6.2; textos entre colchetes são preenchidos pela casa.
  padroes: () => ({
    composicao: 'A', fundo: 'espuma', titulo: '', nota: '', logotipo: true,
    linhas: [
      { rotulo: 'No mesmo quarteirão', valor: 'Quintal Butiá · Pico da Tribo · Mar del Rosa' },
      { rotulo: 'Check-in', valor: '[horário]' },
      { rotulo: 'Capacidade', valor: '[número] hóspedes' },
    ],
  }),
  validar: (c) => {
    const n = (c.linhas ?? []).length;
    return n < 3 || n > 6 ? [{ campo: 'linhas', texto: 'Use de 3 a 6 linhas.' }] : [];
  },
  avisar: (c) => ((c.linhas ?? []).some((l) => /\[[^\]]*\]/.test(`${l.rotulo} ${l.valor}`)) || /\[[^\]]*\]/.test(c.titulo ?? '')
    ? [{ campo: 'linhas', texto: 'Ainda há textos entre colchetes para a casa preencher.' }] : []),
};
