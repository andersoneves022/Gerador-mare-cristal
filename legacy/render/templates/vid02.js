// VID-02 · Texto sobre vídeo (Ficha §15). Estrutura V: sobreposições em PNG transparente + tempos.
// Sem logotipo. Fotografia só como referência na prévia (nunca exportada).
import { VID02 as R, tabelaTempos, csvTempos, jsonTempos } from '../sobreposicao.js';

const dois = (n) => String(n).padStart(2, '0');

export const VID02 = {
  id: 'VID-02', nome: 'Texto sobre vídeo', estrutura: 'V',
  descricao: 'Sobreposições de título, legenda e tag para o vídeo: PNG transparente por entrada e arquivos de tempo (CSV/JSON).',
  formatos: ['reels', 'stories'], foto: true, logo: false,
  escurecimento: { padrao: 'suave', niveis: ['nenhum', 'suave', 'intenso'] },
  campos: [
    { id: 'previa', tipo: 'selecao', rotulo: 'Prévia', opcoes: [['foto', 'Sobre a fotografia de referência'], ['sobreposicao', 'Só a sobreposição (como no PNG exportado)']] },
    { id: 'foto', tipo: 'foto', rotulo: 'Fotografia de referência (frame do vídeo; não é exportada)' },
    { id: 'entradas', tipo: 'lista', rotulo: 'Entradas de texto (cada uma vira um PNG)', min: 1, max: 12, textoAdicionar: 'Adicionar entrada',
      subcampos: [
        { id: 'titulo', rotulo: 'Título', ref: 48 },
        { id: 'legenda', rotulo: 'Legenda', ref: R.legenda.max },
        { id: 'tag', rotulo: 'Tag de local', ref: R.tag.max },
        { id: 'inicio', rotulo: 'Entrada (s)', tipo: 'numero', passo: 0.1 },
        { id: 'fim', rotulo: 'Saída (s)', tipo: 'numero', passo: 0.1 },
      ],
      novo: () => ({ titulo: '', legenda: '', tag: '', inicio: '', fim: '' }) },
    { id: 'entradaAtiva', tipo: 'numero', rotulo: 'Entrada mostrada na prévia', min: 1, max: 12 },
    { id: 'duracao', tipo: 'numero', rotulo: `Duração total do Reel (s, de ${R.duracao.min} a ${R.duracao.max}; os últimos ${String(R.telaFinal).replace('.', ',')} s são a tela final)`, min: R.duracao.min, max: R.duracao.max, passo: 0.1 },
    { id: 'escurecimento', tipo: 'escurecimento', rotulo: 'Escurecimento (entra no PNG)' },
  ],
  padroes: () => ({
    previa: 'foto', entradaAtiva: 1, duracao: 15, escurecimento: 'suave',
    entradas: [{ titulo: 'No mesmo quarteirão', legenda: '', tag: 'Praia do Rosa · SC', inicio: 1, fim: 3.5 }],
  }),
  // Exportação: um PNG transparente por entrada + tempos em CSV e JSON (ESP §8.5, §8.6).
  partesExportacao(dados, base) {
    const entradas = Array.isArray(dados.campos.entradas) ? dados.campos.entradas : [];
    const png = (n) => `${base}-sobreposicao-${dois(n)}.png`;
    const linhas = () => tabelaTempos(dados.campos, png);
    return [
      ...entradas.map((_, i) => ({ nome: png(i + 1), imagem: true, campos: { entradaAtiva: i + 1 }, sobreposicao: true, tipo: 'png' })),
      { nome: `${base}-tempos.csv`, mime: 'text/csv;charset=utf-8', texto: () => csvTempos(linhas()) },
      { nome: `${base}-tempos.json`, mime: 'application/json', texto: () => jsonTempos(linhas(), { template: 'VID-02', formato: dados.formato, largura: 1080, altura: 1920, duracaoTotal: Number(dados.campos.duracao), telaFinal: R.telaFinal }) },
    ];
  },
};
