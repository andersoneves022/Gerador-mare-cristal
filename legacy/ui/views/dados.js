import { h } from '../../core/dom.js';
import { formatarBytes, plural } from '../../core/formatar.js';
import { estadoArmazenamento, atualizarSituacao } from '../../storage/estado.js';

function textoPersistencia(p) {
  if (!p) return 'Verificando…';
  if (!p.suportado) return 'Indisponível neste navegador';
  return p.persistente ? 'Ativo' : 'Não concedido pelo navegador';
}

function linhaEspaco(e) {
  if (!e) return h('dd', {}, 'Verificando…');
  if (!e.suportado) return h('dd', {}, 'O navegador não informou o espaço.');
  const pct = Math.min(100, Math.round(e.percentual ?? 0));
  return h('dd', {},
    `Em uso: cerca de ${formatarBytes(e.usoBytes)} de ${formatarBytes(e.cotaBytes)} estimados (cerca de ${formatarBytes(e.livreBytes)} livres).`,
    h('div', { classe: 'barra' },
      h('progress', { max: '100', value: String(pct), 'aria-label': `Espaço em uso: ${pct}%` })));
}

function desenhar(e, corpo, botao) {
  corpo.replaceChildren();
  if (e.fase === 'iniciando') {
    corpo.append(h('p', {}, e.bloqueado
      ? 'Aguardando outra aba do aplicativo liberar o banco. Feche as outras abas.'
      : 'Iniciando o armazenamento local…'));
    botao.disabled = true;
    return;
  }
  if (e.fase === 'erro') {
    corpo.append(h('div', { classe: 'aviso' },
      h('span', { classe: 'aviso__selo' }, 'Problema'),
      h('p', {}, `${e.mensagemErro} (código ${e.codigoErro})`)));
    botao.disabled = true;
    return;
  }
  botao.disabled = false;
  const c = e.contagens;
  corpo.append(
    h('dl', { classe: 'dados' },
      h('dt', {}, 'Banco de dados'),
      h('dd', {}, e.primeiraVez ? `Criado agora (estrutura versão ${e.versaoBanco})` : `Pronto (estrutura versão ${e.versaoBanco})`),
      h('dt', {}, 'Armazenamento persistente'),
      h('dd', {}, textoPersistencia(e.persistencia)),
      h('dt', {}, 'Espaço'),
      linhaEspaco(e.espaco),
      h('dt', {}, 'Registros'),
      h('dd', {}, c ? `${plural(c.fotos, 'fotografia', 'fotografias')}, ${plural(c.projetos, 'projeto', 'projetos')}` : 'Indisponível')),
    ...(e.avaliacaoEspaco?.mensagens ?? []).map((m) => h('div', { classe: 'aviso' },
      h('span', { classe: 'aviso__selo' }, 'Atenção'), h('p', {}, m))),
    h('p', { classe: 'nota' },
      'Os valores de espaço são estimativas do navegador. Seus dados ficam somente neste navegador e neste computador, e nenhum navegador garante preservá-los: limpar os dados do navegador pode apagá-los.'));
}

export function renderDados() {
  const corpo = h('div', { role: 'status', classe: 'cartao__corpo' });
  const botao = h('button', { type: 'button', classe: 'botao botao--secundario' }, 'Atualizar situação');
  botao.addEventListener('click', () => atualizarSituacao({ solicitar: true }));
  desenhar(estadoArmazenamento.obter(), corpo, botao);
  const parar = estadoArmazenamento.assinar((e) => {
    if (!corpo.isConnected) parar(); else desenhar(e, corpo, botao);
  });
  return h('section', { classe: 'cartao', 'aria-labelledby': 'tit-armazenamento' },
    h('h2', { id: 'tit-armazenamento' }, 'Armazenamento neste navegador'),
    corpo,
    h('div', {}, botao));
}
