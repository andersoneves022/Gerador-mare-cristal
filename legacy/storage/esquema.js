// Definição ATUAL do banco. É a fonte para validação e consulta.
// A criação física das estruturas fica em migracoes.js (cada versão congelada).
export const DB_NOME = 'cabanas-lobo-do-mar';
export const DB_VERSAO = 2;
export const SCHEMA_REGISTRO = 1; // versão do formato dos registros (campo schemaVersion)

// chave: campo da chave primária (UUID em "id"; "chave" só em config).
// indices: nome -> { campo, unique?, multiEntry? }.
// padroes: valores aplicados na inserção quando o campo não é informado.
// obrigatorios / enums / blob: validações aplicadas em toda gravação.
//
// Booleanos (favorita, tratada) NÃO são chaves válidas em IndexedDB; por isso não há
// índice para eles. Filtros por favorita/tratada rodam em memória sobre os metadados.
export const STORES = {
  // Metadados da fotografia. Sem arquivos: listagens nunca carregam imagens.
  // Contrato previsto (Especificação §5.4): nomeOriginal, largura, altura, orientacao,
  // dataImportacao, categorias[], pontoFocal{x,y} relativo, observacoes, tratada,
  // favorita, areasProtegidas[] relativas ao original.
  fotos: {
    chave: 'id',
    padroes: { categorias: () => [], favorita: false, tratada: false, dataImportacao: () => Date.now() },
    indices: {
      dataImportacao: { campo: 'dataImportacao' },
      nomeOriginal: { campo: 'nomeOriginal' },
      categorias: { campo: 'categorias', multiEntry: true },
      // SHA-256 do arquivo original (hex). Único: impede duplicatas mesmo em importações simultâneas.
      hash: { campo: 'hash', unique: true },
    },
  },
  // Arquivo original, imutável. Um por fotografia.
  originais: {
    chave: 'id',
    blob: true,
    obrigatorios: ['fotoId'],
    indices: { fotoId: { campo: 'fotoId', unique: true } },
  },
  // Miniatura e cópia de trabalho: regeneráveis a partir do original.
  derivados: {
    chave: 'id',
    blob: true,
    obrigatorios: ['fotoId', 'tipo'],
    enums: { tipo: ['miniatura', 'trabalho'] },
    indices: {
      fotoId: { campo: 'fotoId' },
      fotoId_tipo: { campo: ['fotoId', 'tipo'], unique: true },
    },
  },
  // Projetos. fotoIds lista as fotografias usadas (proteção contra exclusão, §5.10).
  projetos: {
    chave: 'id',
    padroes: { estado: 'rascunho', situacao: 'ativo', fotoIds: () => [] },
    indices: {
      estado: { campo: 'estado' },
      tipo: { campo: 'tipo' },
      situacao: { campo: 'situacao' }, // ativo | arquivado | lixeira
      criadoEm: { campo: 'criadoEm' },
      atualizadoEm: { campo: 'atualizadoEm' },
      fotoIds: { campo: 'fotoIds', multiEntry: true },
    },
  },
  // Registro de exportações (§9.6).
  exportacoes: {
    chave: 'id',
    padroes: { data: () => Date.now() },
    indices: { projetoId: { campo: 'projetoId' }, data: { campo: 'data' } },
  },
  // Pares chave/valor do aplicativo (ex.: registro "instalacao").
  config: { chave: 'chave', indices: {} },
};
