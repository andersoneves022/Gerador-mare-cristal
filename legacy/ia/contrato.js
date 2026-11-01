// Contrato comum ao editor e ao servidor; derivado das fichas reais, sem acesso ao DOM.
import { obterFicha } from '../render/templates/index.js';
import { LISTA_ICONES } from '../render/icones.js';

export class ErroCopy extends Error {
  constructor(codigo, mensagem, status = 422) { super(mensagem); this.codigo = codigo; this.status = status; }
}
const vazio = (x) => x == null || !String(x).trim();
const objeto = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
export function camposGeraveis(ficha, campos) {
  if (ficha.id === 'INS-02') return [];
  return ficha.campos.filter((d) => ['texto', 'textoLongo', 'lista', 'itens'].includes(d.tipo)
    && (!d.visivelSe || d.visivelSe(campos)));
}
export function verificarPedido(p) {
  if (!objeto(p)) throw new ErroCopy('validacao', 'Solicitação incompleta.');
  const ficha = obterFicha(p.templateId);
  if (!ficha || !ficha.formatos.includes(p.formato)) throw new ErroCopy('validacao', 'Escolha um modelo e formato válidos.');
  if (typeof p.objetivo !== 'string' || vazio(p.objetivo) || p.objetivo.length > 1500)
    throw new ErroCopy('validacao', 'Informe o objetivo da publicação (até 1500 caracteres).');
  if (typeof p.inspiracao !== 'string' || p.inspiracao.length > 1500) throw new ErroCopy('validacao', 'A inspiração deve ter até 1500 caracteres.');
  // Observação sobre as imagens: texto digitado pelo usuário, opcional; nenhuma fotografia é enviada.
  if (p.observacaoImagens != null && (typeof p.observacaoImagens !== 'string' || p.observacaoImagens.length > 500))
    throw new ErroCopy('validacao', 'A observação sobre as imagens deve ter até 500 caracteres.');
  if (p.fotos != null) throw new ErroCopy('validacao', 'Fotografias não fazem parte da geração de textos.');
  if (!objeto(p.campos) || JSON.stringify(p.campos).length > 40000) throw new ErroCopy('validacao', 'Os campos do projeto são inválidos.');
  // Somente IDs da ficha. Não aceitar instruções extras nem credenciais nos campos.
  if (Object.keys(p.campos).some((k) => !ficha.campos.some((d) => d.id === k))) throw new ErroCopy('validacao', 'O projeto contém campos desconhecidos.');
  if (ficha.id === 'INS-02') throw new ErroCopy('avaliacao', 'Este modelo usa somente avaliações reais cadastradas e autorizadas. A IA não cria nem reescreve depoimentos.');
  if (ficha.id === 'COM-01' && (!p.campos.confirmacaoComercial || vazio(p.campos.periodo)))
    throw new ErroCopy('validacao', 'Preencha o período e confirme os dados comerciais antes de gerar.');
  return ficha;
}
export function descreverCampos(ficha, campos) {
  return camposGeraveis(ficha, campos).map((d) => ({
    id: d.id, rotulo: d.rotulo, tipo: d.tipo,
    maxCaracteresGeracao: d.ref ?? 100, minItens: d.min, maxItens: d.max,
    // Referências editoriais viram teto somente para novas sugestões, nunca para edição manual.
    subcampos: d.tipo === 'itens' ? [{ id: 'icone', opcoes: LISTA_ICONES.map((i) => i.id) }, { id: 'texto', maxCaracteresGeracao: d.ref ?? 28 }]
      : d.subcampos?.map((s) => ({ id: s.id, tipo: s.tipo ?? 'texto', maxCaracteresGeracao: s.ref ?? 100 })),
  }));
}
const textoSchema = (max) => ({ type: 'string', maxLength: max });
export function schemaResposta(ficha, campos) {
  const properties = {};
  for (const d of descreverCampos(ficha, campos)) {
    if (!['lista', 'itens'].includes(d.tipo)) { properties[d.id] = textoSchema(d.maxCaracteresGeracao); continue; }
    const sub = {};
    for (const s of d.subcampos) sub[s.id] = s.opcoes ? { type: 'string', enum: s.opcoes }
      : s.tipo === 'numero' ? { type: 'number', minimum: 0 } : textoSchema(s.maxCaracteresGeracao);
    properties[d.id] = { type: 'array', minItems: d.minItens, maxItems: d.maxItens,
      items: { type: 'object', properties: sub, required: Object.keys(sub), additionalProperties: false } };
  }
  return { type: 'object', properties: { campos: { type: 'object', properties, required: Object.keys(properties), additionalProperties: false } }, required: ['campos'], additionalProperties: false };
}
export function validarResposta(resposta, ficha, atuais) {
  if (!objeto(resposta) || Object.keys(resposta).join() !== 'campos' || !objeto(resposta.campos)) throw new ErroCopy('resposta_invalida', 'A IA não devolveu os campos esperados. Os seus textos foram preservados.');
  const defs = camposGeraveis(ficha, atuais), c = resposta.campos;
  if (Object.keys(c).length !== defs.length || Object.keys(c).some((id) => !defs.some((d) => d.id === id))) throw new ErroCopy('resposta_invalida', 'A resposta não corresponde aos campos deste modelo.');
  const checarTexto = (v, max) => {
    if (typeof v !== 'string' || v.length > max || /barulho\s+do\s+mar|p[eé]\s+na\s+areia|whats\s*app|wa\.me/i.test(v))
      throw new ErroCopy('resposta_invalida', 'Um texto ultrapassa os limites ou não respeita as regras da marca. Nada foi substituído.');
  };
  for (const d of defs) {
    const x = c[d.id];
    if (!['lista', 'itens'].includes(d.tipo)) { checarTexto(x, d.ref ?? 100); continue; }
    if (!Array.isArray(x) || x.length < d.min || x.length > d.max) throw new ErroCopy('resposta_invalida', `${d.rotulo}: quantidade de itens inválida.`);
    const sub = d.tipo === 'itens' ? [{ id: 'icone' }, { id: 'texto', ref: d.ref ?? 28 }] : d.subcampos;
    for (let i = 0; i < x.length; i++) {
      const it = x[i];
      if (!objeto(it) || Object.keys(it).length !== sub.length || sub.some((s) => !(s.id in it))) throw new ErroCopy('resposta_invalida', `${d.rotulo}: estrutura inválida.`);
      for (const s of sub) {
        if (s.id === 'icone') { if (!LISTA_ICONES.some((ic) => ic.id === it[s.id])) throw new ErroCopy('resposta_invalida', 'Ícone inválido.'); }
        else if (s.tipo === 'numero') { if (!Number.isFinite(it[s.id]) || it[s.id] !== atuais[d.id]?.[i]?.[s.id]) throw new ErroCopy('resposta_invalida', 'A IA não pode alterar os tempos do vídeo.'); }
        else checarTexto(it[s.id], s.ref ?? 100);
      }
    }
  }
  if (ficha.id === 'COM-01') for (const id of ['periodo', 'acomodacao', 'condicao']) if (c[id] !== (atuais[id] ?? '')) throw new ErroCopy('resposta_invalida', 'A IA alterou dados comerciais. Os dados originais foram preservados.');
  return structuredClone(c);
}