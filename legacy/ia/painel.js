// Painel "Gerar textos com IA" do editor. Nenhuma fotografia é enviada: a IA escreve a partir do
// objetivo, da inspiração, dos campos do modelo e da base de conhecimento da hospedagem.
// O resultado validado só substitui textos após confirmação.
import { h } from '../core/dom.js';
import { camposGeraveis, validarResposta } from './contrato.js';

export const ENDPOINT = '/api/copywriting';

const vazio = (v) => v == null || (Array.isArray(v) ? v.every((it) => !it || Object.values(it).every((x) => typeof x !== 'string' || !x.trim())) : !String(v).trim());
export const temTextos = (ficha, campos) => camposGeraveis(ficha, campos).some((d) => !vazio(campos[d.id]));

function confirmar(titulo, texto, ok) {
  return new Promise((resolve) => {
    const sim = h('button', { type: 'button', classe: 'botao botao--pequeno', 'data-confirmar-sim': '' }, ok);
    const nao = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-confirmar-nao': '' }, 'Cancelar');
    const dlg = h('dialog', { classe: 'seletor ia-confirmar', 'aria-label': titulo, 'data-confirmar': '' },
      h('h2', {}, titulo), h('p', {}, texto), h('div', { classe: 'ia__acoes' }, sim, nao));
    let res = false;
    sim.addEventListener('click', () => { res = true; dlg.close(); });
    nao.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { dlg.remove(); resolve(res); });
    document.body.append(dlg); dlg.showModal();
  });
}

// ctx: { projeto(): p, ficha(): ficha, aplicar(campos), registrarUrl(url) }
export function painelIA(ctx) {
  const sec = h('section', { classe: 'painel__bloco ia', 'data-ia': '' }, h('h3', {}, 'Gerar textos com IA'));
  const ficha = ctx.ficha();
  if (ficha.id === 'INS-02') {
    sec.append(h('p', { classe: 'nota' }, 'Este modelo usa somente avaliações reais cadastradas e autorizadas. A IA não cria nem reescreve depoimentos.'));
    return { secao: sec, atualizar() {} };
  }
  const objetivo = h('textarea', { rows: '2', maxlength: '1500', 'data-ia-objetivo': '', placeholder: 'Ex.: divulgar a cabana com vista para o verde na baixa temporada' });
  const inspiracao = h('textarea', { rows: '2', maxlength: '1500', 'data-ia-inspiracao': '', placeholder: 'Opcional: tom, ideia ou referência' });
  const observacao = h('textarea', { rows: '2', maxlength: '500', 'data-ia-observacao': '', placeholder: 'Opcional: o que as fotografias escolhidas mostram (ex.: varanda do loft ao entardecer)' });
  const gerar = h('button', { type: 'button', classe: 'botao botao--pequeno', 'data-ia-gerar': '' }, 'Gerar textos');
  const cancelar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-ia-cancelar': '', hidden: '' }, 'Cancelar');
  const msg = h('p', { classe: 'nota ia__msg', role: 'status', 'data-ia-status': '' });
  sec.append(
    h('p', { classe: 'nota' }, 'A IA não vê nem recebe fotografias: escreve a partir do objetivo, da inspiração e das informações oficiais da hospedagem.'),
    h('label', { classe: 'campo' }, h('span', { classe: 'campo__rotulo' }, 'Objetivo da publicação (obrigatório)'), objetivo),
    h('label', { classe: 'campo' }, h('span', { classe: 'campo__rotulo' }, 'Inspiração'), inspiracao),
    h('label', { classe: 'campo' }, h('span', { classe: 'campo__rotulo' }, 'Observação sobre as imagens'), observacao),
    h('div', { classe: 'ia__acoes' }, gerar, cancelar), msg);

  let controlador = null;
  const aviso = (t, erro = false) => { msg.textContent = t; msg.dataset.estado = erro ? 'erro' : ''; };

  async function executar() {
    const p = ctx.projeto();
    if (!objetivo.value.trim()) { aviso('Informe o objetivo da publicação.', true); objetivo.focus(); return; }
    gerar.disabled = true; cancelar.hidden = false; aviso('Enviando ao serviço de IA…');
    controlador = new AbortController();
    try {
      const camposAtuais = Object.fromEntries(Object.entries(p.campos).filter(([k]) => ficha.campos.some((d) => d.id === k)));
      const pedido = { templateId: ficha.id, formato: p.formato, objetivo: objetivo.value.trim(), inspiracao: inspiracao.value.trim(), observacaoImagens: observacao.value.trim(), campos: camposAtuais };
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido), signal: controlador.signal });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error('http'), { mensagem: j.mensagem ?? 'O serviço de textos não respondeu. Os seus dados foram preservados.' }); }
      const resultado = await lerEventos(r, (e) => {
        if (e.tipo === 'provedor') aviso(e.anterior ? `${e.anterior} indisponível. Tentando ${e.provedor}…` : `Tentando ${e.provedor}…`);
      });
      // Revalida no navegador com as mesmas regras do servidor antes de tocar nos campos.
      const campos = validarResposta({ campos: resultado.campos }, ficha, ctx.projeto().campos);
      if (temTextos(ficha, ctx.projeto().campos)
        && !(await confirmar('Substituir textos?', 'Este projeto já tem textos preenchidos. Deseja substituí-los pelos textos gerados? Fotografias, enquadramento e cores não mudam.', 'Substituir'))) {
        aviso('Textos gerados descartados. Os seus textos foram mantidos.'); return;
      }
      ctx.aplicar(campos);
      aviso(`Textos gerados com sucesso por ${resultado.provedor}${resultado.fallback ? ' (serviço alternativo)' : ''}. Revise antes de exportar.`);
    } catch (e) {
      if (controlador?.signal.aborted) aviso('Geração cancelada. Nada foi alterado.');
      else aviso(e?.mensagem ?? e?.message ?? 'Não foi possível gerar os textos. Os seus dados foram preservados.', true);
      if (!e?.mensagem && !(e?.codigo)) console.error('IA:', e);
    } finally { gerar.disabled = false; cancelar.hidden = true; controlador = null; }
  }

  gerar.addEventListener('click', executar);
  cancelar.addEventListener('click', () => controlador?.abort());
  return { secao: sec, atualizar() {}, cancelar: () => controlador?.abort() };
}

async function lerEventos(r, aoEvento) {
  const reader = r.body.getReader(), dec = new TextDecoder();
  let buf = '', final = null;
  const linha = (l) => {
    if (!l.trim()) return;
    const e = JSON.parse(l); aoEvento(e);
    if (e.tipo === 'erro') throw Object.assign(new Error(e.codigo), { mensagem: e.mensagem, codigo: e.codigo });
    if (e.tipo === 'resultado') final = e;
  };
  while (true) {
    const { value, done } = await reader.read();
    buf += dec.decode(value, { stream: !done });
    let i; while ((i = buf.indexOf('\n')) >= 0) { linha(buf.slice(0, i)); buf = buf.slice(i + 1); }
    if (done) break;
  }
  linha(buf);
  if (!final) throw Object.assign(new Error('vazio'), { mensagem: 'A geração terminou sem textos. Nada foi substituído.' });
  return final;
}
