// Exportação das peças: usa o mesmo motor da prévia (compor + desenhar) num canvas fora da tela,
// nas dimensões exatas do formato. Nunca grava nada no projeto, nas fotos nem no IndexedDB.
import { estadoFontes, aoMudarFontes, fontesCompletas } from '../core/fonts.js';
import { obterProjeto } from '../projetos/projetos.js';
import { obterFicha } from '../render/templates/index.js';
import { FORMATOS } from '../render/tokens.js';
import { compor, desenhar } from '../render/motor.js';
import { prepararRecursos, carregarLogo } from '../render/imagens.js';
import { criarZip } from './zip.js';

export const TIPOS = {
  png: { id: 'png', rotulo: 'PNG', mime: 'image/png', ext: 'png' },
  jpeg: { id: 'jpeg', rotulo: 'JPEG (alta qualidade)', mime: 'image/jpeg', ext: 'jpg', qualidade: 0.95 },
};

export class ErroExportacao extends Error {
  constructor(mensagemUsuario, causa) { super(mensagemUsuario); this.mensagemUsuario = mensagemUsuario; this.causa = causa; }
}

function esperarFontes() {
  return new Promise((resolve) => {
    if (estadoFontes().pronto) return resolve();
    const parar = aoMudarFontes((e) => { if (e.pronto) { parar(); resolve(); } });
  });
}

// Nome de arquivo previsível: sem acentos, minúsculas, hífens.
export function slug(texto) {
  const s = String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return s || 'peca';
}
const dois = (n) => String(n).padStart(2, '0');
export function carimbo(d = new Date()) {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}-${dois(d.getHours())}${dois(d.getMinutes())}`;
}

// Mesma normalização do editor: projetos antigos (0.0.4) ganham os campos novos com valores de legado.
export function dadosDoProjeto(p) {
  const ficha = obterFicha(p.templateId);
  const campos = ficha ? { ...ficha.padroes(), ...(ficha.legado ?? {}), ...p.campos } : p.campos;
  return { templateId: p.templateId, formato: p.formato, campos, fotoId: p.fotoId, fotosExtras: p.fotosExtras ?? [], enquadramentos: p.enquadramentos ?? {} };
}

const paraBlob = (cv, tipo) => new Promise((resolve, reject) => {
  try { cv.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob vazio'))), tipo.mime, tipo.qualidade); }
  catch (e) { reject(e); }
});

function erroDeEspaco(e) {
  const n = e?.name ?? '';
  return n === 'QuotaExceededError' || n === 'NotReadableError' || /memory|memória|quota/i.test(String(e?.message ?? e));
}

// Partes de um projeto com vários arquivos (VID-02: um PNG transparente por entrada + tempos CSV/JSON).
// Projetos dos demais templates não têm partes: continuam gerando um único arquivo.
export function partesDoProjeto(p) {
  const ficha = obterFicha(p.templateId);
  if (!ficha?.partesExportacao) return null;
  return ficha.partesExportacao(dadosDoProjeto(structuredClone(p)), `${slug(p.nome)}-${p.formato}`);
}

// Renderiza um projeto e devolve { blob, largura, altura }. Lança ErroExportacao com texto para o usuário.
// parte (opcional): uma das partesDoProjeto(); sem parte, um projeto com partes gera a primeira imagem.
export async function renderizarProjeto(p, tipoId = 'png', parte = null) {
  let tipo = TIPOS[tipoId] ?? TIPOS.png;
  await esperarFontes();
  await document.fonts?.ready;
  if (!fontesCompletas()) throw new ErroExportacao('As fontes Sora e Inter não carregaram. Recarregue a página antes de exportar.');
  const dados = dadosDoProjeto(structuredClone(p)); // cópia: a exportação não toca o projeto
  if (!obterFicha(dados.templateId)) throw new ErroExportacao(`Template ${dados.templateId} indisponível nesta versão.`);
  parte ??= partesDoProjeto(p)?.find((x) => x.imagem) ?? null;
  if (parte) {
    if (parte.texto) {
      // Arquivos de tempo: só saem se todas as entradas estiverem sem pendências.
      const rec0 = { imagem: null, imagens: {}, logo: await carregarLogo() };
      const cena0 = compor({ ...dados, sobreposicao: true }, rec0);
      if (cena0.bloqueios.length) throw new ErroExportacao(`Peça com pendências: ${cena0.bloqueios.map((b) => b.texto).join(' ')}`);
      return { blob: new Blob([parte.texto()], { type: parte.mime }), largura: null, altura: null };
    }
    dados.campos = { ...dados.campos, ...parte.campos };
    dados.sobreposicao = !!parte.sobreposicao;
    if (parte.tipo) tipo = TIPOS[parte.tipo]; // sobreposições: sempre PNG (transparência)
  }
  let rec;
  try { rec = dados.sobreposicao ? { imagem: null, imagens: {}, logo: await carregarLogo() } : await prepararRecursos([dados.fotoId, ...dados.fotosExtras]); }
  catch (e) { console.error('Exportação, imagem:', e); rec = { imagem: null, imagens: {}, logo: await carregarLogo() }; }
  const cena = compor(dados, rec);
  if (cena.bloqueios.length) throw new ErroExportacao(`Peça com pendências: ${cena.bloqueios.map((b) => b.texto).join(' ')}`);
  const F = FORMATOS[dados.formato];
  const cv = document.createElement('canvas');
  cv.width = F.largura; cv.height = F.altura;
  try {
    desenhar(cv.getContext('2d'), cena, rec);
    const blob = await paraBlob(cv, tipo);
    return { blob, largura: cv.width, altura: cv.height, mime: tipo.mime, ampliacoesElevadas: cena.ampliacoesElevadas };
  } catch (e) {
    if (erroDeEspaco(e)) throw new ErroExportacao('Não há memória ou espaço suficiente para gerar a imagem. Feche outras abas e tente exportar menos peças por vez.', e);
    throw new ErroExportacao('Não foi possível gerar a imagem desta peça.', e);
  } finally {
    cv.width = 0; cv.height = 0; // solta o buffer do canvas imediatamente
  }
}

// D-01: ampliações acima de 150% da peça (sem desenhar). A tela Exportar pede confirmação por peça antes de gerar.
export async function ampliacoesElevadas(p) {
  await esperarFontes();
  await document.fonts?.ready;
  const dados = dadosDoProjeto(structuredClone(p));
  if (!obterFicha(dados.templateId) || partesDoProjeto(p)) return [];
  let rec;
  try { rec = await prepararRecursos([dados.fotoId, ...dados.fotosExtras]); } catch { return []; }
  return compor(dados, rec).ampliacoesElevadas ?? [];
}

// Nome do arquivo de uma peça. ordem (1..n) numera carrosséis.
export function nomeArquivo(p, tipoId, ordem = null) {
  const base = `${slug(p.nome)}-${p.formato}.${(TIPOS[tipoId] ?? TIPOS.png).ext}`;
  return ordem == null ? base : `${dois(ordem)}-${base}`;
}

// Planeja os arquivos sem renderizar: mostra ao usuário o que será gerado.
// modo: 'pecas' (cada projeto em sua pasta) ou 'carrossel' (todos numerados, na ordem dada, numa pasta).
// Projetos com partes (VID-02) geram vários arquivos na mesma pasta: sobreposições PNG e tempos.
export function planejar(projetos, { tipo = 'png', modo = 'pecas', nomeCarrossel = 'carrossel' } = {}) {
  const expandir = (p, pasta, prefixo = '') => {
    const partes = partesDoProjeto(p);
    if (!partes) return null;
    return partes.map((parte) => ({ projeto: p, parte, caminho: `${pasta}/${prefixo}${parte.nome}` }));
  };
  if (modo === 'carrossel') {
    const pasta = `carrossel-${slug(nomeCarrossel)}`;
    return projetos.flatMap((p, i) => expandir(p, pasta, `${dois(i + 1)}-`) ?? [{ projeto: p, caminho: `${pasta}/${nomeArquivo(p, tipo, i + 1)}` }]);
  }
  return projetos.flatMap((p) => expandir(p, slug(p.nome)) ?? [{ projeto: p, caminho: `${slug(p.nome)}/${nomeArquivo(p, tipo)}` }]);
}

// Exporta uma lista de ids, um por vez (no máximo uma imagem decodificada por vez).
// destino 'zip' devolve { zip: Blob, nome }; destino 'arquivos' chama aoArquivo(blob, nome) a cada peça.
// ampliacaoConfirmada: ids das peças cuja ampliação elevada (> 150%) o usuário confirmou; as demais não saem.
export async function exportar(ids, { tipo = 'png', modo = 'pecas', destino = 'zip', nomeCarrossel, aoProgresso = () => {}, aoArquivo, cancelado = () => false, ampliacaoConfirmada = [] } = {}) {
  const confirmadas = new Set(ampliacaoConfirmada);
  const projetos = [];
  for (const id of ids) {
    const p = await obterProjeto(id);
    if (!p || p.situacao !== 'ativo') throw new ErroExportacao('Um dos projetos selecionados não foi encontrado.');
    projetos.push(p);
  }
  const plano = planejar(projetos, { tipo, modo, nomeCarrossel });
  const zip = destino === 'zip' ? criarZip() : null;
  const usados = new Set();
  const arquivos = [], erros = [];
  for (let i = 0; i < plano.length; i++) {
    if (cancelado()) break;
    const { projeto, caminho, parte } = plano[i];
    aoProgresso({ feitos: i, total: plano.length, atual: projeto.nome });
    try {
      const { blob, largura, altura, ampliacoesElevadas: elevadas } = await renderizarProjeto(projeto, tipo, parte ?? null);
      if (elevadas?.length && !confirmadas.has(projeto.id)) throw new ErroExportacao('A ampliação da fotografia é elevada (acima de 150%). Confirme visualmente a peça antes de exportar.');
      if (zip) {
        const nome = await zip.adicionar(caminho, blob);
        arquivos.push({ nome, largura, altura, tamanho: blob.size, projetoId: projeto.id });
      } else {
        let nome = caminho.split('/').pop();
        for (let n = 2; usados.has(nome); n++) nome = nome.replace(/(-\d+)?(\.\w+)$/, `-${n}$2`);
        usados.add(nome);
        await aoArquivo?.(blob, nome);
        arquivos.push({ nome, largura, altura, tamanho: blob.size, projetoId: projeto.id });
      }
    } catch (e) {
      console.error('Exportação:', e?.causa ?? e);
      erros.push({ projeto: projeto.nome, texto: e?.mensagemUsuario ?? 'Falha inesperada ao gerar a peça.' });
    }
  }
  aoProgresso({ feitos: plano.length, total: plano.length, atual: null });
  let blobZip = null;
  if (zip && arquivos.length) {
    try { blobZip = zip.finalizar(); }
    catch (e) { erros.push({ projeto: 'ZIP', texto: 'Não há espaço suficiente para montar o ZIP. Exporte menos peças por vez.' }); }
  }
  const prefixo = modo === 'carrossel' ? `carrossel-${slug(nomeCarrossel)}` : 'cabanas-lobo-do-mar';
  return { arquivos, erros, zip: blobZip, nomeZip: `${prefixo}-${carimbo()}.zip` };
}

// Download de um Blob gerado no navegador.
export function baixar(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
