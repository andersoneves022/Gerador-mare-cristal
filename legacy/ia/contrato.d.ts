export type Campo = {
  id: string;
  rotulo: string;
  tipo: string;
  ref?: number;
  min?: number;
  max?: number;
  visivelSe?: (campos: Record<string, unknown>) => boolean;
  subcampos?: Campo[];
};
export type Ficha = {
  id: string;
  nome: string;
  formatos: string[];
  campos: Campo[];
  composicoes?: Record<string, Record<string, unknown>>;
  itens?: unknown;
};
export type DescricaoCampo = {
  id: string;
  rotulo: string;
  tipo: string;
  maxCaracteresGeracao: number;
  minItens?: number;
  maxItens?: number;
  subcampos?: { id: string; tipo?: string; opcoes?: string[]; maxCaracteresGeracao?: number }[];
};
export class ErroCopy extends Error {
  constructor(codigo: string, mensagem: string, status?: number);
  codigo: string;
  status: number;
}
export function camposGeraveis(ficha: Ficha, campos: Record<string, unknown>): Campo[];
export function verificarPedido(pedido: unknown): Ficha;
export function descreverCampos(ficha: Ficha, campos: Record<string, unknown>): DescricaoCampo[];
export function schemaResposta(ficha: Ficha, campos: Record<string, unknown>): Record<string, unknown>;
export function validarResposta(resposta: unknown, ficha: Ficha, atuais: Record<string, unknown>): Record<string, unknown>;