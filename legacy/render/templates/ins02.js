// INS-02 · Avaliação (Ficha §11). Estrutura B (cartão), fundo Areia fixo.
// Cinco estrelas Sol no topo; citação em Inter Medium (44–52 px), transcrita como publicada (nunca cortada pelo
// sistema; só quem edita pode encurtar com "…"); nome, ano e origem em Inter SemiBold, sempre visíveis;
// selo de reputação opcional em Sol. Sem aspas decorativas. Nada sugere que a avaliação é recente.
import { COR } from '../tokens.js';
import { logoRodape, campoComposicao, comp, fluxo } from './comum.js';

export const assinatura = (c) => [c.nome, c.ano, c.origem].map((x) => (x == null ? '' : String(x).trim())).filter(Boolean).join(' · ');
const estrelas = (tam, gap) => ({ b: 'estrelas', campo: 'nota', tam, gap });
const citacao = (gap, largura) => ({ b: 'texto', campo: 'citacao', rotulo: 'Citação', estilo: 'subtitulo', faixa: [44, 52], maxLinhas: 10, obrigatorio: true, gap, largura });
const nome = (gap = 48) => ({ b: 'texto', valor: assinatura, campo: 'nome', rotulo: 'Nome, ano e origem', estilo: 'semi', tam: { feed: 28, stories: 32 }, maxLinhas: 2, gap });
const selo = { b: 'pilula', campo: 'selo', rotulo: 'Selo de reputação', tipo: 'selo', fundo: COR.sol, cor: COR.oceano, gap: 48 };

const COMPOSICOES = {
  A: {
    nome: 'A · Citação em destaque',
    feed: comp(COR.areia, [], [
      fluxo('feed', [estrelas(56, 48), { b: 'flex' }, citacao(48), nome(), selo, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(COR.areia, [], [
      fluxo('stories', [estrelas(64, 72), { b: 'flex' }, citacao(72), nome(), selo, { b: 'flex' }, logoRodape]),
    ]),
  },
  B: {
    nome: 'B · Avaliação em cartão Espuma',
    feed: comp(COR.areia, [], [
      fluxo('feed', [{ b: 'flex' }, { b: 'cartao', fundo: COR.espuma, gap: 48, blocos: [estrelas(48, 48), citacao(48), { ...nome(), gap: 0 }] },
        selo, { b: 'flex' }, logoRodape]),
    ]),
    stories: comp(COR.areia, [], [
      fluxo('stories', [{ b: 'flex' }, { b: 'cartao', fundo: COR.espuma, gap: 48, blocos: [estrelas(56, 48), citacao(48), { ...nome(), gap: 0 }] },
        selo, { b: 'flex' }, logoRodape]),
    ]),
  },
  C: {
    nome: 'C · Coluna Espuma e assinatura com filete',
    feed: comp(COR.areia, [{ t: 'bloco', x: 912, y: 0, w: 168, h: 1350, cor: COR.espuma }], [
      fluxo('feed', [estrelas(48, 72), citacao(48, 792), { b: 'filete', w: 96, h: 4, gap: 24 }, nome(), selo, { b: 'flex' }, logoRodape], { largura: 792 }),
    ]),
    stories: comp(COR.areia, [{ t: 'bloco', x: 912, y: 0, w: 168, h: 1920, cor: COR.espuma }], [
      fluxo('stories', [estrelas(56, 72), { b: 'flex' }, citacao(48, 792), { b: 'filete', w: 96, h: 4, gap: 24 }, nome(), selo, { b: 'flex' }, logoRodape], { largura: 792 }),
    ]),
  },
};

export const INS02 = {
  id: 'INS-02', nome: 'Avaliação', estrutura: 'C',
  descricao: 'Avaliação de hóspede do site, com nome, ano e origem sempre visíveis.',
  formatos: ['feed', 'stories'], foto: false, logo: true,
  composicoes: COMPOSICOES,
  campos: [
    campoComposicao(COMPOSICOES),
    { id: 'citacao', tipo: 'textoLongo', rotulo: 'Citação (transcrita como publicada)', ref: 160 },
    { id: 'nome', tipo: 'texto', rotulo: 'Nome (como no site)' },
    { id: 'ano', tipo: 'numero', rotulo: 'Ano da avaliação', min: 2000, max: 2100 },
    { id: 'origem', tipo: 'texto', rotulo: 'Origem', placeholder: 'Ex.: site das Cabanas' },
    { id: 'nota', tipo: 'selecao', rotulo: 'Nota em estrelas', opcoes: [['5', '5 estrelas'], ['4', '4 estrelas'], ['3', '3 estrelas'], ['2', '2 estrelas'], ['1', '1 estrela']] },
    { id: 'selo', tipo: 'texto', rotulo: 'Selo de reputação (opcional: origem e número de avaliações)', ref: 40 },
    { id: 'logotipo', tipo: 'booleano', rotulo: 'Logotipo no rodapé' },
  ],
  // Sem depoimento de exemplo: a citação vem sempre de uma avaliação real do site.
  padroes: () => ({ composicao: 'A', citacao: '', nome: '', ano: null, origem: '', nota: '5', selo: '', logotipo: true }),
  validar: (c, agora = new Date()) => {
    const v = [];
    const vz = (x) => x == null || !String(x).trim();
    if (vz(c.nome)) v.push({ campo: 'nome', texto: 'O nome é obrigatório (como aparece no site).' });
    if (vz(c.origem)) v.push({ campo: 'origem', texto: 'A origem da avaliação é obrigatória.' });
    if (c.ano == null || c.ano === '') v.push({ campo: 'ano', texto: 'O ano da avaliação é obrigatório.' });
    else if (!Number.isInteger(Number(c.ano)) || Number(c.ano) < 2000 || Number(c.ano) > agora.getFullYear()) v.push({ campo: 'ano', texto: 'Informe um ano válido, que não esteja no futuro.' });
    return v;
  },
  avisar: (c, agora = new Date()) => {
    const v = [];
    if (String(c.citacao ?? '').length > 160) v.push({ campo: 'citacao', texto: 'Avaliação longa (mais de 160 caracteres). Ela não é cortada; se quiser, encurte com "…".' });
    const ano = Number(c.ano);
    if (c.ano != null && c.ano !== '' && Number.isInteger(ano) && agora.getFullYear() - ano > 2)
      v.push({ campo: 'ano', texto: `Avaliação de ${ano}, com mais de dois anos. O ano fica visível na peça: não a apresente como recente.` });
    return v;
  },
};
