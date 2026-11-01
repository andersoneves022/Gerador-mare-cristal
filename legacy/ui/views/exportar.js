// Exportação: escolher peças, tipo de arquivo e modo (peças avulsas ou carrossel), gerar e baixar.
import { h } from '../../core/dom.js';
import { iniciarArmazenamento } from '../../storage/estado.js';
import { listarProjetos } from '../../projetos/projetos.js';
import { obterFicha } from '../../render/templates/index.js';
import { FORMATOS } from '../../render/tokens.js';
import { TIPOS, planejar, exportar, baixar, ampliacoesElevadas } from '../../exportar/exportador.js';
import { MENSAGENS_AMPLIACAO } from '../../render/enquadramento.js';

const tamanho = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function segmentos(rotulo, opcoes, atual, aoMudar, attr) {
  const botoes = opcoes.map(([id, txt]) => {
    const b = h('button', { type: 'button', classe: 'segmento', [attr]: id, 'aria-pressed': String(id === atual) }, txt);
    b.addEventListener('click', () => { botoes.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); aoMudar(id); });
    return b;
  });
  return h('div', { classe: 'segmentos', role: 'group', 'aria-label': rotulo }, botoes);
}

export function renderExportar(preId) {
  const corpo = h('div', { classe: 'principal__corpo exportar' }, h('p', { role: 'status' }, 'Carregando projetos…'));
  const est = { lista: [], sel: [], tipo: 'png', modo: 'pecas', destino: 'zip', nomeCarrossel: '', ocupado: false, morto: false, confirmadas: new Set() };
  const ui = {};

  function selecionados() { return est.sel.map((id) => est.lista.find((p) => p.id === id)).filter(Boolean); }

  function pintarResumo() {
    const ps = selecionados();
    const formatos = [...new Set(ps.map((p) => p.formato))].map((f) => `${FORMATOS[f]?.rotulo ?? f} ${FORMATOS[f]?.largura}×${FORMATOS[f]?.altura} px`);
    ui.resumo.textContent = !ps.length ? 'Nenhuma peça selecionada.'
      : `${ps.length} ${ps.length === 1 ? 'peça será gerada' : 'peças serão geradas'} em ${TIPOS[est.tipo].rotulo}` + (formatos.length ? ` · ${formatos.join(' e ')}` : '');
    ui.resumo.dataset.quantidade = ps.length;
    const plano = planejar(ps, { tipo: est.tipo, modo: est.modo, nomeCarrossel: est.nomeCarrossel || 'sem-nome' });
    // VID-02: cada projeto gera sobreposições PNG transparentes (sempre PNG) e os tempos em CSV e JSON.
    const partes = plano.filter((x) => x.parte);
    if (partes.length) {
      const pngs = partes.filter((x) => x.parte.imagem).length;
      ui.resumo.textContent += ` · VID-02: ${pngs} ${pngs === 1 ? 'sobreposição' : 'sobreposições'} em PNG transparente 1080×1920 + tempos em CSV e JSON`;
    }
    ui.resumo.dataset.arquivos = plano.length;
    ui.plano.replaceChildren(...plano.slice(0, 12).map((x) => h('li', {}, est.destino === 'zip' ? x.caminho : x.caminho.split('/').pop())),
      ...(plano.length > 12 ? [h('li', {}, `… e mais ${plano.length - 12}`)] : []));
    ui.botao.disabled = !ps.length || est.ocupado;
    ui.nomeCampo.hidden = est.modo !== 'carrossel';
    for (const li of ui.itens) {
      const i = est.sel.indexOf(li.dataset.exportarProjeto);
      li.querySelector('input').checked = i >= 0;
      const ordem = li.querySelector('.exportar__ordem');
      ordem.textContent = est.modo === 'carrossel' && i >= 0 ? String(i + 1).padStart(2, '0') : '';
      ordem.hidden = !ordem.textContent;
    }
  }

  function estado(tipo, ...conteudo) {
    ui.estado.replaceChildren(conteudo.length ? h('div', { classe: `aviso${tipo === 'ok' ? ' aviso--ok' : ''}`, role: tipo === 'erro' ? 'alert' : 'status', 'data-exportar-estado': tipo },
      h('span', { classe: 'aviso__selo' }, tipo === 'ok' ? 'Concluído' : tipo === 'erro' ? 'Problema' : 'Exportando'), h('div', { classe: 'exportar__estado' }, ...conteudo)) : '');
  }

  // D-01: peça com ampliação acima de 150% só é exportada depois da confirmação visual, peça por peça.
  function pedirConfirmacao(pendentes) {
    const marcadas = new Set();
    const botao = h('button', { type: 'button', classe: 'botao', 'data-confirmar-ampliacao': '', disabled: true }, 'Confirmar e exportar');
    const itens = pendentes.map(({ p, pct }) => {
      const cb = h('input', { type: 'checkbox', 'data-confirmar-peca': p.id });
      cb.addEventListener('change', () => { if (cb.checked) marcadas.add(p.id); else marcadas.delete(p.id); botao.disabled = !marcadas.size; });
      return h('li', {}, h('label', { classe: 'exportar__confirmar' }, cb,
        h('span', {}, `${p.nome || 'Projeto sem nome'}: ampliação de ${pct}%. Conferi a nitidez na prévia.`)),
        h('a', { classe: 'nota', href: `#/criar/${p.id}` }, 'Abrir no editor'));
    });
    botao.addEventListener('click', () => { marcadas.forEach((id) => est.confirmadas.add(id)); executar(true); });
    ui.estado.replaceChildren(h('div', { classe: 'aviso', role: 'alert', 'data-exportar-estado': 'confirmar' },
      h('span', { classe: 'aviso__selo' }, 'Confirmar'),
      h('div', { classe: 'exportar__estado' }, h('p', {}, MENSAGENS_AMPLIACAO.elevada),
        h('ul', { classe: 'exportar__confirmacoes' }, itens),
        h('p', { classe: 'nota' }, 'Peças não confirmadas não são exportadas.'), botao)));
  }

  async function executar(confirmado = false) {
    if (est.ocupado) return;
    const ids = [...est.sel];
    est.ocupado = true; pintarResumo();
    if (!confirmado) {
      const pendentes = [];
      for (const p of selecionados()) {
        if (est.confirmadas.has(p.id)) continue;
        const elevadas = await ampliacoesElevadas(p).catch(() => []);
        if (elevadas.length) pendentes.push({ p, pct: Math.max(...elevadas.map((x) => x.percentual)) });
      }
      if (est.morto) return;
      if (pendentes.length) { est.ocupado = false; pintarResumo(); pedirConfirmacao(pendentes); return; }
    }
    const barra = h('progress', { max: String(ids.length), value: '0', 'data-exportar-progresso': '' });
    const txt = h('p', {}, 'Preparando…');
    estado('andamento', h('div', { classe: 'barra' }, barra, txt));
    const blobs = [];
    try {
      const r = await exportar(ids, {
        tipo: est.tipo, modo: est.modo, destino: est.destino, nomeCarrossel: est.nomeCarrossel || 'sem-nome',
        cancelado: () => est.morto, ampliacaoConfirmada: [...est.confirmadas],
        aoProgresso: ({ feitos, total, atual }) => { barra.max = total; barra.value = feitos; txt.textContent = atual ? `Gerando ${feitos + 1} de ${total}: ${atual}` : `${total} de ${total} processadas`; },
        aoArquivo: (blob, nome) => { blobs.push({ blob, nome }); },
      });
      if (est.morto) return;
      const nArq = planejar(selecionados(), { tipo: est.tipo, modo: est.modo, nomeCarrossel: est.nomeCarrossel || 'sem-nome' }).length;
      const erros = r.erros.length ? h('ul', { classe: 'exportar__erros' }, r.erros.map((e) => h('li', {}, `${e.projeto}: ${e.texto}`))) : null;
      if (!r.arquivos.length) { estado('erro', h('p', {}, 'Nenhuma peça foi gerada.'), erros); return; }
      let acoes;
      if (r.zip) {
        const b = h('button', { type: 'button', classe: 'botao botao--escuro', 'data-baixar-zip': '' }, `Baixar ZIP (${tamanho(r.zip.size)})`);
        b.addEventListener('click', () => baixar(r.zip, r.nomeZip));
        acoes = h('div', { classe: 'exportar__acoes' }, b, h('span', { classe: 'nota' }, r.nomeZip));
        ui.ultimoZip = r.zip; corpo.dataset.zipNome = r.nomeZip;
      } else {
        const todos = h('button', { type: 'button', classe: 'botao botao--escuro', 'data-baixar-todos': '' }, `Baixar ${blobs.length === 1 ? 'arquivo' : `os ${blobs.length} arquivos`}`);
        todos.addEventListener('click', () => blobs.forEach((x, i) => setTimeout(() => baixar(x.blob, x.nome), i * 400)));
        acoes = h('div', { classe: 'exportar__acoes' }, todos,
          h('ul', { classe: 'exportar__arquivos' }, blobs.map((x) => {
            const b = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-baixar-arquivo': x.nome }, x.nome);
            b.addEventListener('click', () => baixar(x.blob, x.nome));
            return h('li', {}, b, h('span', { classe: 'nota' }, tamanho(x.blob.size)));
          })));
      }
      estado(r.erros.length ? 'erro' : 'ok',
        h('p', {}, (nArq === ids.length ? `${r.arquivos.length} de ${ids.length} ${ids.length === 1 ? 'peça gerada' : 'peças geradas'}` : `${r.arquivos.length} de ${nArq} arquivos gerados (${ids.length} ${ids.length === 1 ? 'peça' : 'peças'})`) + '. Os projetos e as fotografias não foram alterados.'),
        erros, acoes);
    } catch (e) {
      console.error('Exportação:', e);
      estado('erro', h('p', {}, e?.mensagemUsuario ?? 'A exportação falhou. Tente novamente.'));
    } finally {
      est.ocupado = false; if (!est.morto) pintarResumo();
    }
  }

  (async () => {
    try {
      await iniciarArmazenamento();
      est.lista = await listarProjetos();
      if (est.morto) return;
      if (!est.lista.length) {
        corpo.replaceChildren(h('div', { classe: 'vazio' }, h('h2', {}, 'Nada para exportar ainda'),
          h('p', {}, 'Crie uma publicação no editor; ela aparece aqui para exportar.'),
          h('div', {}, h('a', { classe: 'botao', href: '#/criar' }, 'Criar publicação'))));
        return;
      }
      if (preId && est.lista.some((p) => p.id === preId)) est.sel = [preId];

      ui.resumo = h('p', { classe: 'exportar__resumo', role: 'status', 'data-exportar-resumo': '' });
      ui.plano = h('ul', { classe: 'exportar__plano', 'data-exportar-plano': '' });
      ui.estado = h('div', { 'aria-live': 'polite' });
      ui.botao = h('button', { type: 'button', classe: 'botao', 'data-exportar': '' }, 'Exportar');
      ui.botao.addEventListener('click', () => executar());
      const nome = h('input', { type: 'text', classe: 'campo__entrada', 'data-nome-carrossel': '', placeholder: 'Ex.: Fim de semana na praia' });
      nome.addEventListener('input', () => { est.nomeCarrossel = nome.value; pintarResumo(); });
      ui.nomeCampo = h('label', { classe: 'campo' }, 'Nome do carrossel (pasta e ZIP)', nome);

      ui.itens = est.lista.map((p) => {
        const cb = h('input', { type: 'checkbox', 'aria-label': `Selecionar ${p.nome}` });
        cb.addEventListener('change', () => {
          est.sel = cb.checked ? [...est.sel.filter((x) => x !== p.id), p.id] : est.sel.filter((x) => x !== p.id);
          pintarResumo();
        });
        const F = FORMATOS[p.formato];
        return h('li', { classe: 'exportar__item', 'data-exportar-projeto': p.id },
          h('label', { classe: 'exportar__rotulo' }, cb,
            h('span', { classe: 'exportar__ordem', 'data-ordem': '', hidden: true }),
            h('span', { classe: 'projeto__info' },
              h('strong', {}, p.nome || 'Projeto sem nome'),
              h('span', { classe: 'nota' }, `${obterFicha(p.templateId)?.id ?? p.templateId} · ${F?.rotulo ?? p.formato} · ${F?.largura}×${F?.altura} px`))));
      });
      const todos = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', 'data-selecionar-todos': '' }, 'Selecionar todos');
      todos.addEventListener('click', () => { est.sel = est.sel.length === est.lista.length ? [] : est.lista.map((p) => p.id); pintarResumo(); });

      corpo.replaceChildren(
        h('div', { classe: 'exportar__grade' },
          h('section', { classe: 'painel' },
            h('div', { classe: 'exportar__cabeca' }, h('h3', {}, 'Peças'), todos),
            h('p', { classe: 'nota' }, 'No modo carrossel, a ordem dos arquivos segue a ordem em que você marca as peças.'),
            h('ul', { classe: 'exportar__lista' }, ui.itens)),
          h('section', { classe: 'painel exportar__opcoes' },
            h('div', { classe: 'painel__bloco' }, h('h3', {}, 'Modo'),
              segmentos('Modo', [['pecas', 'Peças avulsas'], ['carrossel', 'Carrossel']], est.modo, (v) => { est.modo = v; pintarResumo(); }, 'data-modo'),
              ui.nomeCampo),
            h('div', { classe: 'painel__bloco' }, h('h3', {}, 'Arquivo'),
              segmentos('Tipo de arquivo', [['png', 'PNG'], ['jpeg', 'JPEG']], est.tipo, (v) => { est.tipo = v; pintarResumo(); }, 'data-tipo')),
            h('div', { classe: 'painel__bloco' }, h('h3', {}, 'Entrega'),
              segmentos('Entrega', [['zip', 'ZIP'], ['arquivos', 'Arquivos separados']], est.destino, (v) => { est.destino = v; pintarResumo(); }, 'data-destino')),
            h('div', { classe: 'painel__bloco' }, ui.resumo, ui.plano, ui.botao, ui.estado))));
      pintarResumo();
    } catch (e) {
      corpo.replaceChildren(h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Problema'), h('p', {}, e?.mensagemUsuario ?? 'Não foi possível listar os projetos.')));
    }
  })();
  corpo.limpar = () => { est.morto = true; };
  return corpo;
}
