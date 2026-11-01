// Instância única usada pelo aplicativo. Tudo o que persiste passa por `repo`.
import { criarBanco } from './banco.js';
import { criarRepositorio } from './repositorio.js';
import { DB_NOME, DB_VERSAO } from './esquema.js';
import { MIGRACOES } from './migracoes.js';

export const banco = criarBanco({ nome: DB_NOME, versao: DB_VERSAO, migracoes: MIGRACOES });
export const repo = criarRepositorio(banco);
