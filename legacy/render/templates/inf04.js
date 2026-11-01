// INF-04 · Pergunta e resposta (Ficha §9). Estrutura B (cartão).
// Rótulo fixo "Pergunta frequente" e pergunta no cabeçalho; resposta em Inter Medium 36 px (fixo) dentro do cartão
// (Areia; Espuma sobre fundo Areia). Ícone opcional em azulejo Turquesa a 15%. Uma pergunta por peça.
import { COR } from '../tokens.js';
import { fundoCor, contraste, logoRodape, campoComposicao, comp, fluxo, OPCOES_ICONE } from './comum.js';

export const ROTULO_FIXO = 'Pergunta frequente';
const rotulo = { b: 'texto', fixo: ROTULO_FIXO, rotulo: 'Rótulo', estilo: 'rotulo', tam: { feed: 28, stories: 32 }, maxLinhas: 1, gap: 24 };
const pergunta = (gap, largura) => ({ b: 'texto', campo: 'pergunta', rotulo: 'Pergunta', estilo: 'titulo', faixa: [64, 72], maxLinhas: 4, obrigatorio: true, gap, largura });
const resposta = { b: 'texto', campo: 'resposta', rotulo: 'Resposta', estilo: 'subtitulo', tam: 36, maxLinhas: 8, obrigatorio: true };
const icone = (azulejo, tam, gap = 48) => ({ b: 'icone', campo: 'icone', azulejo, tam, gap });

const COMPOSICOES = {
  A: {
    nome: 'A · Pergunta no topo, resposta em cartão',
    feed: comp(fundoCor, [], [
      fluxo('feed', [icone(112, 64), rotulo, pergunta(48), { b: 'cartao', fundo: contraste, blocos: [resposta] }, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [], [
      fluxo('stories', [icone(128, 72), rotulo, pergunta(72), { b: 'cartao', fundo: contraste, blocos: [resposta] }, { b: 'flex' }, logoRodape]),
    ]),
  },
  B: {
    nome: 'B · Resposta em bloco sangrado na base',
    feed: comp(fundoCor, [], [
      fluxo('feed', [{ b: 'linha', blocos: [rotulo, icone(96, 56, 0)], gap: 24 }, pergunta(48, 864), { b: 'flex' },
        { b: 'cartao', fundo: contraste, sangrar: 'base', pad: 48, blocos: [{ ...resposta, gap: 72 }, logoRodape] }], { base: 1350 - 72 }),
    ]),
    stories: comp(fundoCor, [], [
      fluxo('stories', [{ b: 'linha', blocos: [rotulo, icone(112, 64, 0)], gap: 24 }, pergunta(72, 864), { b: 'flex' },
        { b: 'cartao', fundo: contraste, sangrar: 'base', pad: 48, blocos: [{ ...resposta, gap: 72 }, logoRodape] }]),
    ]),
  },
  C: {
    nome: 'C · Pergunta central com disco Turquesa',
    feed: comp(fundoCor, [{ t: 'bloco', x: 600, y: -160, w: 640, h: 640, raio: 320, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('feed', [rotulo, { b: 'flex' }, icone(112, 64), pergunta(48, 780), { b: 'cartao', fundo: contraste, blocos: [resposta] }, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(fundoCor, [{ t: 'bloco', x: 560, y: 60, w: 720, h: 720, raio: 360, cor: COR.turquesa, alpha: 0.15 }], [
      fluxo('stories', [rotulo, { b: 'flex' }, icone(128, 72), pergunta(72, 780), { b: 'cartao', fundo: contraste, blocos: [resposta] }, { b: 'flex' }, logoRodape]),
    ]),
  },
};

export const INF04 = {
  id: 'INF-04', nome: 'Pergunta e resposta', estrutura: 'C',
  descricao: 'Perguntas frequentes: uma pergunta e sua resposta por peça.',
  formatos: ['feed', 'stories'], foto: false, logo: true,
  composicoes: COMPOSICOES,
  campos: [
    campoComposicao(COMPOSICOES),
    { id: 'fundo', tipo: 'fundo', rotulo: 'Fundo' },
    { id: 'pergunta', tipo: 'textoLongo', rotulo: 'Pergunta', ref: 70, placeholder: 'Tem estacionamento?' },
    { id: 'resposta', tipo: 'textoLongo', rotulo: 'Resposta', ref: 220, placeholder: 'Sim, o estacionamento é gratuito.' },
    { id: 'icone', tipo: 'selecao', rotulo: 'Ícone (opcional)', opcoes: OPCOES_ICONE('Sem ícone') },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo no rodapé' },
  ],
  padroes: () => ({ composicao: 'A', fundo: 'espuma', pergunta: '', resposta: '', icone: '', logotipo: true }),
};
