// Constantes fixas do produto. Nada aqui é editável pelo usuário.
export const APP_VERSAO = '0.0.4 (editor)';

// Seis áreas de navegação (Especificação §4.3)
export const AREAS = [
  { id: 'inicio',      rotulo: 'Início',          titulo: 'Início' },
  { id: 'fotografias', rotulo: 'Fotografias',     titulo: 'Fotografias' },
  { id: 'criar',       rotulo: 'Criar',           titulo: 'Criar publicação' },
  { id: 'projetos',    rotulo: 'Projetos',        titulo: 'Projetos' },
  { id: 'exportar',    rotulo: 'Exportar',        titulo: 'Exportar' },
  { id: 'dados',       rotulo: 'Dados e backup',  titulo: 'Dados e backup' },
];
export const AREA_INICIAL = 'inicio';

// Quatro fontes definitivas, locais, em WOFF2 (Especificação §7.6)
export const FONTES = [
  { familia: 'Sora',  peso: '700', arquivo: 'Sora-Bold.woff2' },
  { familia: 'Inter', peso: '400', arquivo: 'Inter-Regular.woff2' },
  { familia: 'Inter', peso: '500', arquivo: 'Inter-Medium.woff2' },
  { familia: 'Inter', peso: '600', arquivo: 'Inter-SemiBold.woff2' },
];

// Nove categorias fixas (Especificação §5.1; Biblioteca §11.4). Sem categorias personalizadas no MVP.
// O id é o que fica gravado no banco; o rótulo é só para exibição.
export const CATEGORIAS = [
  { id: 'casa',                  rotulo: 'Casa' },
  { id: 'loft-1',                rotulo: 'Loft 1' },
  { id: 'loft-2',                rotulo: 'Loft 2' },
  { id: 'areas-externas',        rotulo: 'Áreas externas' },
  { id: 'churrasqueira-gourmet', rotulo: 'Churrasqueira e área gourmet' },
  { id: 'praia-do-rosa',         rotulo: 'Praia do Rosa' },
  { id: 'regiao-atracoes',       rotulo: 'Região e atrações próximas' },
  { id: 'pessoas-anfitrioes',    rotulo: 'Pessoas e anfitriões' },
  { id: 'detalhes-experiencias', rotulo: 'Detalhes e experiências' },
];

// Importação e derivados (Especificação §5.3, §13.3)
export const IMPORTACAO = {
  maxArquivoBytes: 100 * 1024 * 1024, // arquivos maiores são recusados (proteção de memória)
  parteHashBytes: 4 * 1024 * 1024,    // leitura incremental para o SHA-256
  miniaturaLado: 480,                 // lado maior da miniatura (px)
  miniaturaQualidade: 0.85,
  trabalhoLado: 2048,                 // lado maior da cópia de trabalho (px); nunca amplia
  trabalhoQualidade: 0.92,
};
