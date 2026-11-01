// Biblioteca de fotografias: importação, grade, filtros, ficha individual e exclusão segura.
import { h, svg } from '../../core/dom.js';
import { formatarBytes, plural } from '../../core/formatar.js';
import { CATEGORIAS } from '../../config.js';
import { estadoArmazenamento, atualizarSituacao } from '../../storage/estado.js';
import { importarArquivos, estadoImportacao, limparResultadoImportacao } from '../../import/importador.js';
import {
  listarFotos, atualizarFoto, obterDerivado, projetosQueUsam, excluirFoto,
  regenerarDerivados, bibliotecaMudou, ExclusaoBloqueada, rotuloCategoria,
} from '../../biblioteca/fotos.js';
import { filtrarFotos } from '../../biblioteca/filtros.js';

const ROTULO_FORMATO = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP' };
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
const mensagemDe = (e) => e?.mensagemUsuario ?? e?.message ?? 'Falha inesperada.';

function iconeEstrela() {
  return svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    svg('path', { d: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z' }));
}

function textoCategorias(f) {
  if (!f.categorias.length) return 'Sem categoria';
  const extra = f.categorias.length > 1 ? ` +${f.categorias.length - 1}` : '';
  return `${rotuloCategoria(f.categorias[0])}${extra}`;
}

export function renderFotografias() {
  const estado = { fotos: [], carregou: false, filtros: { categoria: '', favoritas: '', tratamento: '' } };
  const urls = new Map();        // id da foto -> URL de miniatura (revogada ao redesenhar)
  const cartoes = new Map();     // id da foto -> { atualizar(foto) }
  const limpezas = [];           // funções de limpeza (assinaturas)
  let observador = null;
  let pendentes = new Map();     // <img> -> { foto, quadro } aguardando entrar na tela
  let fila = 0;                  // leituras de miniatura em andamento
  const espera = [];
  let visiveis = [];
  let idAberto = null;
  let focoAoFechar = null;

  const raiz = h('div', { classe: 'principal__corpo biblioteca' });
  const avisoPagina = h('div', { role: 'status' });
  const painelImportacao = h('div', { role: 'status' });
  const filtrosEl = h('div', { classe: 'filtros' });
  const contagemEl = h('p', { classe: 'contagem', role: 'status' });
  const corpoGrade = h('div', {});
  const dialogo = h('dialog', { classe: 'ficha', 'aria-labelledby': 'ficha-titulo' });

  // ---------- miniaturas sob demanda (no máximo 4 leituras simultâneas) ----------
  function proximaLeitura() {
    while (fila < 4 && espera.length) { fila++; espera.shift()().finally(() => { fila--; proximaLeitura(); }); }
  }
  function carregarMiniatura(foto, img, quadro) {
    espera.push(async () => {
      if (!img.isConnected) return;
      try {
        const blob = await obterDerivado(foto.id, 'miniatura');
        if (!blob) throw new Error('sem miniatura');
        if (!img.isConnected) return;
        const url = URL.createObjectURL(blob);
        urls.set(foto.id, url);
        img.src = url;
      } catch {
        quadro.append(h('span', { classe: 'foto__sem' }, 'Miniatura indisponível. Abra a ficha para regenerar.'));
      }
    });
    proximaLeitura();
  }
  function soltarUrls() { for (const u of urls.values()) URL.revokeObjectURL(u); urls.clear(); espera.length = 0; }

  // ---------- grade ----------
  function criarCartao(foto) {
    const img = h('img', { alt: foto.nomeOriginal, decoding: 'async' });
    const quadro = h('div', { classe: 'foto__quadro' }, img);
    const selo = h('span', { classe: 'foto__selo' }, 'Tratada');
    const nome = h('span', { classe: 'foto__nome' });
    const cat = h('span', { classe: 'foto__cat' });
    const abrir = h('button', { type: 'button', classe: 'foto__abrir' }, quadro, h('span', { classe: 'foto__legenda' }, nome, cat));
    const fav = h('button', { type: 'button', classe: 'foto__fav' }, iconeEstrela());
    const li = h('li', { classe: 'foto' }, abrir, fav);
    function atualizar(f) {
      nome.textContent = f.nomeOriginal;
      nome.title = f.nomeOriginal;
      cat.textContent = textoCategorias(f);
      cat.title = f.categorias.map(rotuloCategoria).join(', ') || 'Sem categoria';
      abrir.setAttribute('aria-label', `Abrir detalhes de ${f.nomeOriginal}. ${textoCategorias(f)}.${f.tratada ? ' Tratada.' : ''}${f.favorita ? ' Favorita.' : ''}`);
      fav.setAttribute('aria-pressed', String(f.favorita));
      fav.setAttribute('aria-label', f.favorita ? `Desmarcar favorita: ${f.nomeOriginal}` : `Marcar como favorita: ${f.nomeOriginal}`);
      fav.title = f.favorita ? 'Favorita (clique para desmarcar)' : 'Marcar como favorita';
      if (f.tratada) quadro.append(selo); else selo.remove();
    }
    abrir.addEventListener('click', () => abrirFicha(f(), abrir));
    fav.addEventListener('click', () => alternar(f(), { favorita: !f().favorita }));
    const f = () => estado.fotos.find((x) => x.id === foto.id);
    atualizar(foto);
    cartoes.set(foto.id, { atualizar });
    pendentes.set(img, { foto, quadro });
    observador.observe(img);
    return li;
  }

  function desenharGrade() {
    soltarUrls();
    cartoes.clear();
    observador?.disconnect();
    pendentes = new Map();
    observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        observador.unobserve(e.target);
        const item = pendentes.get(e.target);
        if (item) carregarMiniatura(item.foto, e.target, item.quadro);
      }
    }, { rootMargin: '300px' });

    visiveis = filtrarFotos(estado.fotos, estado.filtros);
    const total = estado.fotos.length;
    contagemEl.textContent = !total ? ''
      : visiveis.length === total ? `${plural(total, 'fotografia cadastrada', 'fotografias cadastradas')}`
      : `Exibindo ${visiveis.length} de ${plural(total, 'fotografia cadastrada', 'fotografias cadastradas')}`;

    if (!estado.carregou) { corpoGrade.replaceChildren(h('p', {}, 'Carregando a biblioteca…')); return; }
    if (!total) {
      corpoGrade.replaceChildren(h('div', { classe: 'vazio' },
        h('h2', {}, 'Sua biblioteca está vazia'),
        h('p', {}, 'Use o botão Importar fotografias para escolher imagens JPG, PNG ou WebP do computador. Elas ficam guardadas somente neste navegador.')));
      return;
    }
    if (!visiveis.length) {
      corpoGrade.replaceChildren(h('div', { classe: 'vazio' },
        h('h2', {}, 'Nenhuma fotografia com estes filtros'),
        h('div', {}, h('button', { type: 'button', classe: 'botao botao--secundario', onclick: limparFiltros }, 'Limpar filtros'))));
      return;
    }
    corpoGrade.replaceChildren(h('ul', { classe: 'grade', 'aria-label': 'Fotografias' }, visiveis.map(criarCartao)));
  }

  // ---------- filtros ----------
  const selects = {};
  function campoFiltro(chave, rotulo, opcoes) {
    const sel = h('select', { id: `filtro-${chave}` }, opcoes.map(([v, t]) => h('option', { value: v }, t)));
    sel.addEventListener('change', () => { estado.filtros[chave] = sel.value; desenharGrade(); });
    selects[chave] = sel;
    return h('label', { classe: 'campo', for: `filtro-${chave}` }, rotulo, sel);
  }
  function limparFiltros() {
    estado.filtros = { categoria: '', favoritas: '', tratamento: '' };
    Object.values(selects).forEach((s) => { s.value = ''; });
    desenharGrade();
  }
  filtrosEl.append(
    campoFiltro('categoria', 'Categoria', [['', 'Todas as categorias'], ['sem', 'Sem categoria'], ...CATEGORIAS.map((c) => [c.id, c.rotulo])]),
    campoFiltro('favoritas', 'Favoritas', [['', 'Todas'], ['sim', 'Somente favoritas']]),
    campoFiltro('tratamento', 'Tratamento', [['', 'Todas'], ['tratadas', 'Tratadas'], ['nao-tratadas', 'Não tratadas']]),
    h('button', { type: 'button', classe: 'botao botao--secundario', onclick: limparFiltros }, 'Limpar filtros'));

  // ---------- alterações de metadados ----------
  async function alternar(foto, mudancas) {
    try {
      const nova = await atualizarFoto(foto.id, mudancas);
      substituirNaLista(nova);
      return nova;
    } catch (e) {
      avisoPagina.replaceChildren(aviso('Problema', `Não foi possível salvar a alteração. ${mensagemDe(e)}`));
      return null;
    }
  }
  function substituirNaLista(nova) {
    const i = estado.fotos.findIndex((x) => x.id === nova.id);
    if (i >= 0) estado.fotos[i] = nova;
    const ainda = filtrarFotos([nova], estado.filtros).length > 0;
    if (ainda && cartoes.has(nova.id)) cartoes.get(nova.id).atualizar(nova);
    else if (!ainda && !dialogo.open) desenharGrade();
  }

  function aviso(selo, texto, ok = false) {
    return h('div', { classe: ok ? 'aviso aviso--ok' : 'aviso' }, h('span', { classe: 'aviso__selo' }, selo), h('p', {}, texto));
  }

  // ---------- ficha individual ----------
  async function abrirFicha(foto, origem) {
    if (!foto) return;
    if (origem) focoAoFechar = origem;
    idAberto = foto.id;
    desenharFicha(foto);
    if (!dialogo.open) dialogo.showModal();
  }

  function fecharFicha() { if (dialogo.open) dialogo.close(); }
  dialogo.addEventListener('close', () => {
    soltarImagemFicha();
    idAberto = null;
    // Se uma edição tirou a foto do filtro atual, a grade é atualizada ao fechar a ficha.
    if (filtrarFotos(estado.fotos, estado.filtros).length !== visiveis.length) desenharGrade();
    if (focoAoFechar?.isConnected) focoAoFechar.focus();
    focoAoFechar = null;
  });
  let urlFicha = null;
  function soltarImagemFicha() { if (urlFicha) { URL.revokeObjectURL(urlFicha); urlFicha = null; } }

  function desenharFicha(foto, mensagem = '') {
    soltarImagemFicha();
    const img = h('img', { alt: foto.nomeOriginal });
    const imagem = h('figure', { classe: 'ficha__imagem' }, h('span', { classe: 'nota' }, 'Carregando imagem…'));
    (async () => {
      try {
        const blob = (await obterDerivado(foto.id, 'trabalho')) ?? (await obterDerivado(foto.id, 'miniatura'));
        if (!blob) throw new Error('sem imagem');
        if (idAberto !== foto.id) return;
        urlFicha = URL.createObjectURL(blob);
        img.src = urlFicha;
        imagem.replaceChildren(img);
      } catch {
        imagem.replaceChildren(h('span', { classe: 'nota' }, 'A cópia de visualização não está disponível. Use "Regenerar cópias" para recriá-la a partir do original.'));
      }
    })();

    const status = h('p', { classe: 'nota', role: 'status' }, mensagem);
    const salvo = () => { status.textContent = 'Alteração salva.'; };
    const painelExclusao = h('div', { role: 'region', 'aria-label': 'Exclusão da fotografia' });

    const caixas = CATEGORIAS.map((c) => {
      const cx = h('input', { type: 'checkbox', value: c.id });
      cx.checked = foto.categorias.includes(c.id);
      cx.addEventListener('change', async () => {
        const marcadas = caixas.filter((x) => x.checked).map((x) => x.value);
        const nova = await alternar(foto, { categorias: marcadas });
        if (nova) { foto = nova; salvo(); } else { cx.checked = !cx.checked; status.textContent = 'A alteração não foi salva.'; }
      });
      return cx;
    });
    const opcaoBool = (chave, rotulo) => {
      const cx = h('input', { type: 'checkbox' });
      cx.checked = !!foto[chave];
      cx.addEventListener('change', async () => {
        const nova = await alternar(foto, { [chave]: cx.checked });
        if (nova) { foto = nova; salvo(); } else { cx.checked = !cx.checked; status.textContent = 'A alteração não foi salva.'; }
      });
      return h('label', { classe: 'opcao' }, cx, rotulo);
    };

    const pos = visiveis.findIndex((x) => x.id === foto.id);
    const anterior = pos > 0 ? visiveis[pos - 1] : null;
    const proxima = pos >= 0 && pos < visiveis.length - 1 ? visiveis[pos + 1] : null;

    const regenerar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno' }, 'Regenerar cópias');
    regenerar.addEventListener('click', async () => {
      regenerar.disabled = true;
      status.textContent = 'Regenerando miniatura e cópia de trabalho a partir do original…';
      try {
        await regenerarDerivados(foto.id);
        desenharFicha(estado.fotos.find((x) => x.id === foto.id) ?? foto, 'Cópias regeneradas. O arquivo original não foi alterado.');
        desenharGrade();
      } catch (e) { status.textContent = `Não foi possível regenerar. ${mensagemDe(e)}`; regenerar.disabled = false; }
    });

    const excluir = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno' }, 'Excluir fotografia');
    excluir.addEventListener('click', () => iniciarExclusao(foto, painelExclusao, excluir));

    dialogo.replaceChildren(
      h('div', { classe: 'ficha__grade' },
        imagem,
        h('div', { classe: 'ficha__info' },
          h('h2', { id: 'ficha-titulo' }, foto.nomeOriginal),
          h('dl', { classe: 'dados' },
            h('dt', {}, 'Nome original'), h('dd', {}, foto.nomeOriginal),
            h('dt', {}, 'Dimensões'), h('dd', {}, `${foto.largura} × ${foto.altura} px`),
            h('dt', {}, 'Formato'), h('dd', {}, ROTULO_FORMATO[foto.formato] ?? foto.formato),
            h('dt', {}, 'Tamanho do arquivo'), h('dd', {}, formatarBytes(foto.tamanhoBytes)),
            h('dt', {}, 'Importada em'), h('dd', {}, dataHora.format(new Date(foto.dataImportacao)))),
          h('fieldset', { classe: 'grupo' },
            h('legend', {}, 'Categorias'),
            CATEGORIAS.map((c, i) => h('label', { classe: 'opcao' }, caixas[i], c.rotulo)),
            h('p', { classe: 'nota' }, 'Uma fotografia pode estar em mais de uma categoria.')),
          h('fieldset', { classe: 'grupo' },
            h('legend', {}, 'Situação'),
            opcaoBool('favorita', 'Favorita'),
            opcaoBool('tratada', 'Foto tratada')),
          status,
          h('div', { classe: 'ficha__botoes' }, regenerar, excluir),
          painelExclusao)),
      h('div', { classe: 'ficha__navegacao' },
        h('button', { type: 'button', classe: 'botao botao--secundario', disabled: !anterior, onclick: () => anterior && abrirFicha(anterior) }, 'Anterior'),
        h('button', { type: 'button', classe: 'botao', onclick: fecharFicha }, 'Fechar'),
        h('button', { type: 'button', classe: 'botao botao--secundario', disabled: !proxima, onclick: () => proxima && abrirFicha(proxima) }, 'Próxima')));
  }

  // ---------- exclusão segura ----------
  function textoBloqueio(projetos) {
    const nomes = projetos.map((p) => (p.situacao && p.situacao !== 'ativo' ? `${p.nome} (${p.situacao})` : p.nome));
    return h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Bloqueada'),
      h('div', {},
        h('p', {}, `Esta fotografia não pode ser excluída porque é usada em ${plural(projetos.length, 'projeto', 'projetos')}. Projetos arquivados e na lixeira também contam.`),
        h('ul', { classe: 'lista-simples' }, nomes.map((n) => h('li', {}, n))),
        h('p', {}, 'Remova a fotografia desses projetos ou substitua-a antes de excluir.')));
  }

  async function iniciarExclusao(foto, painel, botao) {
    botao.disabled = true;
    painel.replaceChildren(h('p', { classe: 'nota' }, 'Verificando se a fotografia está em uso…'));
    try {
      const usos = await projetosQueUsam(foto.id);
      if (usos.length) { painel.replaceChildren(textoBloqueio(usos)); botao.disabled = false; return; }
    } catch (e) {
      painel.replaceChildren(aviso('Problema', `Não foi possível verificar o uso da fotografia, por isso nada foi excluído. ${mensagemDe(e)}`));
      botao.disabled = false; return;
    }
    const confirmar = h('button', { type: 'button', classe: 'botao botao--escuro botao--pequeno' }, 'Excluir definitivamente');
    const cancelar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno' }, 'Cancelar');
    cancelar.addEventListener('click', () => { painel.replaceChildren(); botao.disabled = false; botao.focus(); });
    confirmar.addEventListener('click', async () => {
      confirmar.disabled = cancelar.disabled = true;
      try {
        await excluirFoto(foto.id);
        estado.fotos = estado.fotos.filter((x) => x.id !== foto.id);
        focoAoFechar = null;
        fecharFicha();
        desenharGrade();
        atualizarSituacao();
        avisoPagina.replaceChildren(aviso('Excluída', `A fotografia "${foto.nomeOriginal}" foi excluída, com o original e as cópias.`, true));
      } catch (e) {
        if (e instanceof ExclusaoBloqueada) painel.replaceChildren(textoBloqueio(e.projetos));
        else painel.replaceChildren(aviso('Problema', `A fotografia não foi excluída. ${mensagemDe(e)}`));
        botao.disabled = false;
      }
    });
    painel.replaceChildren(h('div', { classe: 'aviso' }, h('span', { classe: 'aviso__selo' }, 'Atenção'),
      h('div', {},
        h('p', {}, `Excluir "${foto.nomeOriginal}"? O arquivo original e as cópias serão apagados deste navegador e não será possível desfazer. Esta versão ainda não tem backup: se precisar da fotografia, mantenha o arquivo no computador.`),
        h('div', { classe: 'ficha__botoes' }, cancelar, confirmar))));
    cancelar.focus();
  }

  // ---------- importação ----------
  const entrada = h('input', { type: 'file', multiple: true, hidden: true, tabindex: '-1', accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', 'aria-label': 'Selecionar fotografias' });
  const botaoImportar = h('button', { type: 'button', classe: 'botao' }, 'Importar fotografias');
  botaoImportar.addEventListener('click', () => entrada.click());
  entrada.addEventListener('change', () => { const arquivos = [...entrada.files]; entrada.value = ''; importarArquivos(arquivos); });
  const zona = h('div', { classe: 'acoes' },
    h('div', { classe: 'acoes__texto' },
      h('strong', {}, 'Adicionar ao acervo'),
      h('span', { classe: 'nota' }, 'JPG, PNG ou WebP. Selecione várias de uma vez ou arraste os arquivos para esta área. Os originais não são alterados.')),
    botaoImportar, entrada);
  zona.addEventListener('dragover', (e) => { e.preventDefault(); zona.classList.add('acoes--arrastando'); });
  zona.addEventListener('dragleave', () => zona.classList.remove('acoes--arrastando'));
  zona.addEventListener('drop', (e) => {
    e.preventDefault(); zona.classList.remove('acoes--arrastando');
    if (e.dataTransfer?.files?.length) importarArquivos([...e.dataTransfer.files]);
  });

  function pintarImportacao(s) {
    botaoImportar.disabled = s.ativa;
    painelImportacao.replaceChildren();
    if (s.ativa) {
      painelImportacao.append(h('div', { classe: 'cartao' },
        h('p', {}, `Importando ${s.indice} de ${s.total}: ${s.atual}`),
        h('div', { classe: 'barra' }, h('progress', { max: String(s.total), value: String(Math.max(0, s.indice - 1)), 'aria-label': 'Progresso da importação' })),
        h('p', { classe: 'nota' }, 'Não feche esta página até terminar.')));
      return;
    }
    if (!s.concluida) return;
    const partes = [
      plural(s.importadas, 'fotografia importada', 'fotografias importadas'),
      plural(s.duplicadas.length, 'duplicada ignorada', 'duplicadas ignoradas'),
      plural(s.recusadas.length, 'arquivo recusado', 'arquivos recusados'),
    ];
    const itens = [...s.recusadas.map((r) => `${r.nome}: ${r.motivo}`), ...s.duplicadas.map((d) => `${d.nome}: ${d.motivo}`)];
    const limite = 12;
    const fechar = h('button', { type: 'button', classe: 'botao botao--secundario botao--pequeno', onclick: limparResultadoImportacao }, 'Dispensar aviso');
    const problemas = s.interrompida || s.recusadas.length;
    painelImportacao.append(h('div', { classe: problemas ? 'aviso' : 'aviso aviso--ok' },
      h('span', { classe: 'aviso__selo' }, s.interrompida ? 'Interrompida' : problemas ? 'Atenção' : 'Concluída'),
      h('div', {},
        h('p', {}, `${partes.join(', ')}.`),
        s.interrompida && h('p', {}, `${s.interrompida} ${plural(s.naoProcessadas, 'arquivo não foi processado', 'arquivos não foram processados')}.`),
        itens.length > 0 && h('ul', { classe: 'lista-simples' }, itens.slice(0, limite).map((t) => h('li', {}, t)),
          itens.length > limite && h('li', {}, `e mais ${itens.length - limite}.`)),
        h('div', {}, fechar))));
  }

  // ---------- montagem e ciclo de vida ----------
  async function carregar() {
    try {
      estado.fotos = await listarFotos();
      estado.carregou = true;
      avisoPagina.replaceChildren();
    } catch (e) {
      estado.carregou = true;
      avisoPagina.replaceChildren(aviso('Problema', `Não foi possível ler a biblioteca. ${mensagemDe(e)}`));
    }
    desenharGrade();
    if (dialogo.open && idAberto && !estado.fotos.some((f) => f.id === idAberto)) fecharFicha();
  }

  let ultimaFase = null;
  const aoMudarArmazenamento = (e) => {
    if (e.fase === ultimaFase) return;
    ultimaFase = e.fase;
    if (e.fase === 'pronto') carregar();
    else if (e.fase === 'erro') { estado.carregou = true; avisoPagina.replaceChildren(aviso('Problema', `${e.mensagemErro} (código ${e.codigoErro})`)); desenharGrade(); }
  };
  limpezas.push(estadoArmazenamento.assinar(aoMudarArmazenamento));
  limpezas.push(bibliotecaMudou.assinar(() => { if (ultimaFase === 'pronto') carregar(); }));
  limpezas.push(estadoImportacao.assinar(pintarImportacao));

  raiz.append(avisoPagina, zona, painelImportacao, filtrosEl, contagemEl, corpoGrade, dialogo);
  pintarImportacao(estadoImportacao.obter());
  desenharGrade();
  aoMudarArmazenamento(estadoArmazenamento.obter());

  raiz.limpar = () => {
    limpezas.forEach((fn) => fn());
    observador?.disconnect();
    soltarUrls();
    soltarImagemFicha();
    if (dialogo.open) dialogo.close();
  };
  return raiz;
}
