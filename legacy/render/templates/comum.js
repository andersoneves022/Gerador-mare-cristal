// Peças comuns aos cartões da Etapa 6 (estrutura B desenhada como composição livre).
import { COR } from '../tokens.js';
import { LISTA_ICONES } from '../icones.js';

// Fundo Espuma ou Areia (um por carrossel); cartões internos usam o outro tom (PT-11, PR).
export const fundoCor = (c) => (c.fundo === 'areia' ? COR.areia : COR.espuma);
export const contraste = (c) => (c.fundo === 'areia' ? COR.espuma : COR.areia);

// Zona útil (RC-01).
export const Z = {
  feed: { x: 72, largura: 936, topo: 72, base: 1278 },
  stories: { x: 72, largura: 936, topo: 250, base: 1580 },
};
export const LOGO_RODAPE = { feed: 180, stories: 200 }; // RC-06: 180–240 (Feed) e 200–260 (Stories)
export const logoRodape = { b: 'logo', w: LOGO_RODAPE, se: (c) => !!c.logotipo };
export const FAIXA_TITULO = { feed: [72, 96], stories: [80, 104] };

export const campoComposicao = (composicoes, classica = false) => ({
  id: 'composicao', tipo: 'selecao', rotulo: 'Composição',
  opcoes: [...Object.entries(composicoes).map(([k, v]) => [k, v.nome]), ...(classica ? [['classica', 'Clássica (versão anterior)']] : [])],
});
export const OPCOES_ICONE = (vazio) => [...(vazio ? [['', vazio]] : []), ...LISTA_ICONES.map((i) => [i.id, i.rotulo])];

// Composição por formato com um fluxo e elementos decorativos.
export const comp = (fundo, decor, fluxos) => ({ fundo, elementos: [...decor, ...fluxos] });
export const fluxo = (F, blocos, extra = {}) => ({ t: 'fluxo', ...Z[F], ...extra, blocos });
