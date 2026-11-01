// VID-01 · Capa de Reel (Ficha §14). Estrutura A, vertical, sem logotipo e sem chamada.
import { COR } from '../tokens.js';

export const VID01 = {
  id: 'VID-01', nome: 'Capa de Reel', estrutura: 'A',
  descricao: 'Capa vertical de Reel: título e tag de local sobre o quadro.',
  formatos: ['reels'], foto: true, logo: false,
  escurecimento: { padrao: 'suave', niveis: ['nenhum', 'suave', 'intenso'] },
  layout: { larguraBloco: 650 },
  itens: [
    { campo: 'tag', rotulo: 'Tag de local', componente: 'tagLocal', gapApos: 24,
      cor: (d, cena) => (cena.nivel !== 'nenhum' ? COR.lima : COR.espuma) },
    { campo: 'titulo', rotulo: 'Título', componente: 'titulo', obrigatorio: true, cor: COR.espuma,
      maxLinhas: 4, faixa: { reels: [80, 104] } },
  ],
  campos: [
    { id: 'foto', tipo: 'foto', rotulo: 'Quadro (fotografia)' },
    { id: 'titulo', tipo: 'textoLongo', rotulo: 'Título', ref: 48, placeholder: 'Uma volta pelo Pico da Tribo' },
    { id: 'tag', tipo: 'texto', rotulo: 'Tag de local (opcional)', ref: 28 },
    { id: 'escurecimento', tipo: 'escurecimento', rotulo: 'Escurecimento' },
  ],
  padroes: () => ({ titulo: '', tag: 'Praia do Rosa · SC', escurecimento: 'suave' }),
};
