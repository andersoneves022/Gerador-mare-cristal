import { h } from '../../core/dom.js';
import { plural } from '../../core/formatar.js';
import { estadoFontes, aoMudarFontes } from '../../core/fonts.js';
import { estadoArmazenamento } from '../../storage/estado.js';

function avisoFontes() {
  const caixa = h('div', { role: 'status' });
  const pintar = (e) => {
    caixa.replaceChildren();
    if (!e.pronto) return;
    if (e.ausentes.length === 0) {
      caixa.append(h('div', { classe: 'aviso aviso--ok' },
        h('span', { classe: 'aviso__selo' }, 'Pronto'),
        h('p', {}, 'As quatro fontes definitivas estão carregadas.')));
    } else {
      caixa.append(h('div', { classe: 'aviso' },
        h('span', { classe: 'aviso__selo' }, 'Atenção'),
        h('p', {}, `Faltam fontes definitivas na pasta fonts: ${e.ausentes.join(', ')}. A tipografia das artes só será liberada quando todas estiverem instaladas.`)));
    }
  };
  pintar(estadoFontes());
  const parar = aoMudarFontes((e) => {
    if (!caixa.isConnected) parar(); // a área foi trocada: encerra a assinatura
    else pintar(e);
  });
  return caixa;
}

// Só aparece quando o armazenamento falha; no funcionamento normal não ocupa espaço.
function avisoArmazenamento() {
  const caixa = h('div', { role: 'alert' });
  const pintar = (e) => {
    caixa.replaceChildren();
    if (e.fase !== 'erro') return;
    caixa.append(h('div', { classe: 'aviso' },
      h('span', { classe: 'aviso__selo' }, 'Problema'),
      h('p', {}, `${e.mensagemErro} (código ${e.codigoErro})`)));
  };
  pintar(estadoArmazenamento.obter());
  const parar = estadoArmazenamento.assinar((e) => {
    if (!caixa.isConnected) parar(); else pintar(e);
  });
  return caixa;
}

// Resumo da biblioteca; muda quando as contagens do armazenamento são atualizadas.
function cartaoBiblioteca() {
  const caixa = h('div', { classe: 'vazio' });
  const pintar = (e) => {
    const n = e.contagens?.fotos ?? 0;
    caixa.replaceChildren(
      h('h2', {}, n ? 'Biblioteca de fotografias' : 'Nenhuma publicação ainda'),
      h('p', {}, n
        ? `${plural(n, 'fotografia cadastrada', 'fotografias cadastradas')}. Os projetos recentes aparecerão aqui quando o editor estiver disponível.`
        : 'Comece importando fotografias na área Fotografias. Os projetos recentes aparecerão aqui.'),
      h('div', {}, h('a', { classe: 'botao', href: '#/fotografias' }, n ? 'Abrir a biblioteca' : 'Ir para Fotografias')));
  };
  pintar(estadoArmazenamento.obter());
  const parar = estadoArmazenamento.assinar((e) => { if (!caixa.isConnected) parar(); else pintar(e); });
  return caixa;
}

export function renderInicio() {
  return h('div', { classe: 'principal__corpo' },
    avisoArmazenamento(),
    avisoFontes(),
    cartaoBiblioteca());
}
