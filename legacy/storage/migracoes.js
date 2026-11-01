// Migrações versionadas. Regras:
//  - cada migração é CONGELADA: nunca edite uma versão já publicada, crie a seguinte;
//  - roda dentro da transação de upgrade; se lançar erro, tudo é desfeito;
//  - receber { db, tx, versaoAnterior }; use tx.objectStore(...) para alterar stores existentes.
function criarStore(db, nome, chave, indices = {}) {
  const os = db.createObjectStore(nome, { keyPath: chave });
  for (const [idx, { campo, ...opcoes }] of Object.entries(indices)) os.createIndex(idx, campo, opcoes);
  return os;
}

export const MIGRACOES = [
  {
    versao: 1,
    descricao: 'Estrutura inicial',
    migrar({ db }) {
      criarStore(db, 'fotos', 'id', {
        dataImportacao: { campo: 'dataImportacao' },
        nomeOriginal: { campo: 'nomeOriginal' },
        categorias: { campo: 'categorias', multiEntry: true },
      });
      criarStore(db, 'originais', 'id', { fotoId: { campo: 'fotoId', unique: true } });
      criarStore(db, 'derivados', 'id', {
        fotoId: { campo: 'fotoId' },
        fotoId_tipo: { campo: ['fotoId', 'tipo'], unique: true },
      });
      criarStore(db, 'projetos', 'id', {
        estado: { campo: 'estado' },
        tipo: { campo: 'tipo' },
        situacao: { campo: 'situacao' },
        criadoEm: { campo: 'criadoEm' },
        atualizadoEm: { campo: 'atualizadoEm' },
        fotoIds: { campo: 'fotoIds', multiEntry: true },
      });
      criarStore(db, 'exportacoes', 'id', { projetoId: { campo: 'projetoId' }, data: { campo: 'data' } });
      criarStore(db, 'config', 'chave');
    },
  },
  {
    versao: 2,
    descricao: 'Índice único de hash SHA-256 nas fotografias (detecção de duplicatas)',
    migrar({ tx }) {
      // Registros antigos sem "hash" simplesmente não entram no índice.
      tx.objectStore('fotos').createIndex('hash', 'hash', { unique: true });
    },
  },
];
