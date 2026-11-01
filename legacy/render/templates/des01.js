// DES-01 · Capa de destaque (Ficha §16). Estrutura D (capa circular), 1080 × 1080, sem logotipo.
// Anel Turquesa de 24 px; tudo dentro do círculo de segurança de raio 440. Modo foto (foto circular)
// ou modo ícone (ícone de linha Oceano de 380 a 440 px sobre Espuma). Fundo fora do círculo: Espuma (IT).
// O rótulo interno não é desenhado na arte (PEND §16.10): serve para nomear a capa; acima de 15 caracteres, aviso.
import { COR } from '../tokens.js';
import { OPCOES_ICONE } from './comum.js';

const foto = (c) => c.modo !== 'icone';
const icone = (c) => c.modo === 'icone';
const anel = { t: 'anel', cx: 540, cy: 540, r: 428, esp: 24, cor: COR.turquesa }; // borda externa em r = 440
const fotoCirc = (r) => ({ t: 'foto', slot: 1, x: 540 - r, y: 540 - r, w: 2 * r, h: 2 * r, raio: r, se: foto });
const ic = (tam) => ({ t: 'icone', campo: 'icone', rotulo: 'Ícone', obrigatorio: true, cx: 540, cy: 540, tam, cor: COR.oceano, se: icone });

const COMPOSICOES = {
  A: { nome: 'A · Anel simples', destaque: { fundo: COR.espuma, elementos: [fotoCirc(416), ic(420), anel] } },
  B: { nome: 'B · Anel com respiro Espuma', destaque: { fundo: COR.espuma, elementos: [fotoCirc(372), ic(380), anel] } },
  C: { nome: 'C · Disco Turquesa (ícone) · foto até o anel', destaque: { fundo: COR.espuma, elementos: [
    { t: 'bloco', x: 540 - 404, y: 540 - 404, w: 808, h: 808, raio: 404, cor: COR.turquesa, alpha: 0.15, se: icone },
    fotoCirc(440), ic(400), anel,
    { t: 'anel', cx: 540, cy: 540, r: 410, esp: 12, cor: COR.espuma, se: foto },
  ] } },
};

export const DES01 = {
  id: 'DES-01', nome: 'Capa de destaque', estrutura: 'C',
  descricao: 'Capas dos destaques do perfil: foto circular ou ícone, com anel Turquesa.',
  formatos: ['destaque'], foto: true, logo: false,
  composicoes: COMPOSICOES,
  campos: [
    { id: 'composicao', tipo: 'selecao', rotulo: 'Composição', opcoes: Object.entries(COMPOSICOES).map(([k, v]) => [k, v.nome]) },
    { id: 'modo', tipo: 'selecao', rotulo: 'Modo', opcoes: [['foto', 'Foto circular'], ['icone', 'Ícone']] },
    { id: 'foto', tipo: 'foto', slot: 1, rotulo: 'Fotografia', visivelSe: foto },
    { id: 'icone', tipo: 'selecao', rotulo: 'Ícone', opcoes: OPCOES_ICONE(), visivelSe: icone },
    { id: 'rotulo', tipo: 'texto', rotulo: 'Nome do destaque (não aparece na arte)', ref: 15, placeholder: 'Acomodações' },
  ],
  padroes: () => ({ composicao: 'A', modo: 'foto', icone: 'estrela', rotulo: '' }),
  avisar: (c) => (String(c.rotulo ?? '').length > 15 ? [{ campo: 'rotulo', texto: 'Nome com mais de 15 caracteres: o Instagram pode cortá-lo.' }] : []),
};
