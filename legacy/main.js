import { montarShell } from './ui/shell.js';
import { aoNavegar } from './ui/router.js';
import { carregarFontes } from './core/fonts.js';
import { iniciarArmazenamento } from './storage/estado.js';

// Monta o aplicativo dentro do elemento raiz. Só roda uma vez por página.
let iniciado = false;
export function iniciarApp(raiz) {
  if (iniciado) return;
  iniciado = true;
  const mostrar = montarShell(raiz);
  let primeira = true;
  aoNavegar((id) => { mostrar(id, { foco: !primeira }); primeira = false; });
  carregarFontes();
  iniciarArmazenamento();
}
