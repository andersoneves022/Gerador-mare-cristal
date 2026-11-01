// Conexão com o IndexedDB: abertura, migrações, eventos e transações.
// Não conhece as stores do aplicativo; quem conhece é repositorio.js.
import { ErroArmazenamento, traduzir } from './erros.js';

export function criarBanco({ nome, versao, migracoes }) {
  const lista = [...migracoes].sort((a, b) => a.versao - b.versao);
  if (!lista.length || lista.at(-1).versao !== versao) {
    throw new ErroArmazenamento('CONFIG', { detalhe: `a última migração deve ser a versão ${versao}` });
  }

  let conexao = null;
  let abrindo = null;
  let invalidada = false; // outra aba atualizou o banco: esta página deve ser recarregada
  const ouvintes = new Set();
  const emitir = (evento) => ouvintes.forEach((fn) => fn(evento));

  function abrir() {
    if (invalidada) return Promise.reject(new ErroArmazenamento('VERSAO_ALTERADA'));
    if (conexao) return Promise.resolve(conexao);
    if (abrindo) return abrindo;
    if (typeof indexedDB === 'undefined' || !indexedDB) {
      return Promise.reject(new ErroArmazenamento('INDISPONIVEL'));
    }
    abrindo = new Promise((resolve, reject) => {
      let pedido;
      let falhaMigracao = null;
      try { pedido = indexedDB.open(nome, versao); } catch (e) { reject(traduzir(e)); return; }

      pedido.onupgradeneeded = (ev) => {
        const tx = pedido.transaction;
        try {
          for (const m of lista) {
            if (m.versao > ev.oldVersion && m.versao <= (ev.newVersion ?? versao)) {
              m.migrar({ db: pedido.result, tx, versaoAnterior: ev.oldVersion });
            }
          }
        } catch (e) {
          falhaMigracao = e;
          try { tx.abort(); } catch { /* já abortada */ }
        }
      };
      pedido.onblocked = () => emitir({ tipo: 'bloqueado' });
      pedido.onerror = () => reject(falhaMigracao
        ? new ErroArmazenamento('MIGRACAO_FALHOU', { detalhe: falhaMigracao.message, causa: falhaMigracao })
        : traduzir(pedido.error));
      pedido.onsuccess = () => {
        const c = pedido.result;
        c.onversionchange = () => { c.close(); conexao = null; invalidada = true; emitir({ tipo: 'versao-alterada' }); };
        c.onclose = () => { conexao = null; emitir({ tipo: 'fechado' }); };
        conexao = c;
        resolve(c);
      };
    }).finally(() => { abrindo = null; });
    return abrindo;
  }

  function fechar() { conexao?.close(); conexao = null; }

  // Executa fn(tx) numa transação e só resolve quando o navegador confirma a gravação
  // (evento complete). Qualquer erro cancela a transação inteira: tudo ou nada.
  // Dentro de fn, aguarde apenas pedidos do IndexedDB (nunca fetch, timers ou outras promessas),
  // senão a transação se encerra sozinha.
  async function transacao(stores, modo, fn) {
    const c = await abrir();
    return new Promise((resolve, reject) => {
      let tx;
      try { tx = c.transaction(stores, modo); } catch (e) { reject(traduzir(e)); return; }
      let resultado;
      let encerrada = false;
      const falhar = (e) => { if (!encerrada) { encerrada = true; reject(traduzir(e)); } };
      tx.oncomplete = () => { if (!encerrada) { encerrada = true; resolve(resultado); } };
      tx.onabort = () => falhar(tx.error ?? new DOMException('Transação cancelada', 'AbortError'));
      let execucao;
      try { execucao = Promise.resolve(fn(tx)); } catch (e) { execucao = Promise.reject(e); }
      execucao.then((r) => { resultado = r; }, (e) => { falhar(e); try { tx.abort(); } catch { /* já encerrada */ } });
    });
  }

  return {
    nome,
    versao,
    abrir,
    fechar,
    transacao,
    assinar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); },
  };
}
