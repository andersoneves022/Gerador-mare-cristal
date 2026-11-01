// Registro área → função de renderização. Cada área é um módulo independente.
import { renderInicio } from './inicio.js';
import { renderFotografias } from './fotografias.js';
import { renderCriar } from './criar.js';
import { renderProjetos } from './projetos.js';
import { renderExportar } from './exportar.js';
import { renderDados } from './dados.js';

export const VIEWS = {
  inicio: renderInicio,
  fotografias: renderFotografias,
  criar: renderCriar,
  projetos: renderProjetos,
  exportar: renderExportar,
  dados: renderDados,
};
