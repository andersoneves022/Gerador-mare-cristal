// Única porta de acesso aos dados. Leitura e gravação passam por aqui.
// Valida os registros, aplica UUID, padrões e carimbos de data.
import { STORES, SCHEMA_REGISTRO } from './esquema.js';
import { ErroArmazenamento, traduzir } from './erros.js';
import { novoId } from './uuid.js';

const pedir = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(traduzir(req.error));
});

function definicao(store) {
  const d = Object.hasOwn(STORES, store) ? STORES[store] : null;
  if (!d) throw new ErroArmazenamento('STORE_INVALIDO', { detalhe: String(store) });
  return d;
}

function preparar(d, reg) {
  if (!reg || typeof reg !== 'object' || Array.isArray(reg)) {
    throw new ErroArmazenamento('DADO_INVALIDO', { detalhe: 'o registro precisa ser um objeto' });
  }
  const agora = Date.now();
  const r = { ...reg };
  for (const [campo, padrao] of Object.entries(d.padroes ?? {})) {
    if (r[campo] === undefined) r[campo] = typeof padrao === 'function' ? padrao() : padrao;
  }
  if (d.chave === 'id' && r.id === undefined) r.id = novoId();
  r.schemaVersion ??= SCHEMA_REGISTRO;
  r.criadoEm ??= agora;
  r.atualizadoEm ??= r.criadoEm;
  return r;
}

const ehTextoDeImagem = (s) =>
  /^data:[^;,]+[;,]/i.test(s) || (s.length > 100_000 && /^[A-Za-z0-9+/=\s]+$/.test(s));

function validar(d, r) {
  const falha = (codigo, detalhe) => { throw new ErroArmazenamento(codigo, { detalhe }); };
  if (typeof r[d.chave] !== 'string' || !r[d.chave]) falha('DADO_INVALIDO', `campo "${d.chave}" ausente`);
  for (const [campo, valor] of Object.entries(r)) {
    if (typeof valor === 'string' && ehTextoDeImagem(valor)) falha('BASE64_PROIBIDO', campo);
  }
  for (const campo of d.obrigatorios ?? []) {
    if (typeof r[campo] !== 'string' || !r[campo]) falha('DADO_INVALIDO', `campo "${campo}" ausente`);
  }
  for (const [campo, permitidos] of Object.entries(d.enums ?? {})) {
    if (!permitidos.includes(r[campo])) falha('DADO_INVALIDO', `"${campo}" deve ser um de: ${permitidos.join(', ')}`);
  }
  if (d.blob && (!(r.blob instanceof Blob) || r.blob.size === 0)) falha('BLOB_INVALIDO', 'campo "blob"');
}

function consulta({ valor, min, max } = {}) {
  if (valor !== undefined) return IDBKeyRange.only(valor);
  if (min !== undefined && max !== undefined) return IDBKeyRange.bound(min, max);
  if (min !== undefined) return IDBKeyRange.lowerBound(min);
  if (max !== undefined) return IDBKeyRange.upperBound(max);
  return undefined;
}

// Operações ligadas a UMA transação. Permitem compor várias gravações atômicas.
function operacoes(tx) {
  const abrirStore = (store) => tx.objectStore(store);
  const fonte = (store, d, indice) => {
    const os = abrirStore(store);
    if (indice === undefined) return os;
    if (!Object.hasOwn(d.indices, indice)) throw new ErroArmazenamento('INDICE_INVALIDO', { detalhe: `${store}.${indice}` });
    return os.index(indice);
  };

  return {
    // Insere (falha com DUPLICADO se o id já existir). Devolve o registro gravado.
    async inserir(store, reg) {
      const d = definicao(store);
      const r = preparar(d, reg);
      validar(d, r);
      await pedir(abrirStore(store).add(r));
      return r;
    },
    // Grava exatamente o que recebeu (sem carimbos novos). Uso previsto: restauração de backup.
    async substituir(store, reg) {
      const d = definicao(store);
      if (!reg || typeof reg !== 'object') throw new ErroArmazenamento('DADO_INVALIDO');
      validar(d, reg);
      await pedir(abrirStore(store).put(reg));
      return reg;
    },
    async obter(store, id) {
      definicao(store);
      return (await pedir(abrirStore(store).get(id))) ?? null;
    },
    // mudancas: objeto (mescla) ou função síncrona (registro) => novoRegistro.
    async atualizar(store, id, mudancas) {
      const d = definicao(store);
      const os = abrirStore(store);
      const atual = await pedir(os.get(id));
      if (!atual) throw new ErroArmazenamento('NAO_ENCONTRADO', { detalhe: `${store}/${id}` });
      let novo = mudancas;
      if (typeof mudancas === 'function') {
        novo = mudancas({ ...atual });
        if (novo instanceof Promise) throw new ErroArmazenamento('DADO_INVALIDO', { detalhe: 'a função de atualização deve ser síncrona' });
      } else {
        novo = { ...atual, ...mudancas };
      }
      if (!novo || typeof novo !== 'object' || novo[d.chave] !== atual[d.chave]) {
        throw new ErroArmazenamento('DADO_INVALIDO', { detalhe: 'a chave do registro não pode mudar' });
      }
      novo = { ...novo, criadoEm: atual.criadoEm, schemaVersion: atual.schemaVersion, atualizadoEm: Date.now() };
      validar(d, novo);
      await pedir(os.put(novo));
      return novo;
    },
    // Devolve true se o registro existia.
    async excluir(store, id) {
      definicao(store);
      const os = abrirStore(store);
      const existia = (await pedir(os.count(id))) > 0;
      if (existia) await pedir(os.delete(id));
      return existia;
    },
    // opcoes: { indice, valor | min/max, direcao: 'asc'|'desc', limite }
    listar(store, opcoes = {}) {
      const d = definicao(store);
      const { indice, direcao = 'asc', limite } = opcoes;
      const origem = fonte(store, d, indice);
      return new Promise((resolve, reject) => {
        const saida = [];
        const req = origem.openCursor(consulta(opcoes), direcao === 'desc' ? 'prev' : 'next');
        req.onerror = () => reject(traduzir(req.error));
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) { resolve(saida); return; }
          saida.push(cursor.value);
          if (limite !== undefined && saida.length >= limite) { resolve(saida); return; }
          cursor.continue();
        };
      });
    },
    async contar(store, opcoes = {}) {
      const d = definicao(store);
      return pedir(fonte(store, d, opcoes.indice).count(consulta(opcoes)));
    },
  };
}

export function criarRepositorio(banco) {
  // Transação composta: fn recebe as operações; tudo é gravado junto ou nada é gravado.
  async function transacao(stores, modo, fn) {
    const lista = [].concat(stores);
    lista.forEach(definicao);
    return banco.transacao(lista, modo, (tx) => fn(operacoes(tx)));
  }
  const unica = (modo, metodo) => (store, ...args) => transacao(store, modo, (op) => op[metodo](store, ...args));
  return {
    transacao,
    inserir: unica('readwrite', 'inserir'),
    substituir: unica('readwrite', 'substituir'),
    atualizar: unica('readwrite', 'atualizar'),
    excluir: unica('readwrite', 'excluir'),
    obter: unica('readonly', 'obter'),
    listar: unica('readonly', 'listar'),
    contar: unica('readonly', 'contar'),
  };
}
