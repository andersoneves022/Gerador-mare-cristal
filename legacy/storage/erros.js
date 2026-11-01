// Erros da camada de armazenamento, com código estável e mensagem clara para a interface.
export const MENSAGENS = {
  INDISPONIVEL: 'Este navegador não permite guardar dados locais (janelas privativas costumam bloquear). Abra o aplicativo em uma janela normal do Chrome ou do Edge.',
  VERSAO_NOVA: 'Os dados deste navegador foram criados por uma versão mais nova do aplicativo. Recarregue a página com Ctrl+F5. Se o aviso continuar, não apague os dados do navegador.',
  VERSAO_ALTERADA: 'O aplicativo foi atualizado em outra aba. Recarregue esta página para continuar.',
  BLOQUEADO: 'Há outra aba antiga do aplicativo aberta. Feche as outras abas e recarregue esta página.',
  COTA_EXCEDIDA: 'O navegador não tem espaço para guardar estes dados. Libere espaço no computador e tente de novo.',
  MIGRACAO_FALHOU: 'Não foi possível atualizar a estrutura dos dados locais. Os dados anteriores foram mantidos. Recarregue a página.',
  DUPLICADO: 'Já existe um registro com este identificador ou com este valor único.',
  NAO_ENCONTRADO: 'Registro não encontrado.',
  EXCLUSAO_BLOQUEADA: 'Esta fotografia é usada em projetos e não pode ser excluída.',
  BLOB_INVALIDO: 'Imagens precisam ser guardadas como arquivo (Blob), nunca como texto.',
  BASE64_PROIBIDO: 'Imagens não podem ser guardadas como texto Base64.',
  DADO_INVALIDO: 'Os dados a gravar não são válidos.',
  STORE_INVALIDO: 'Área de armazenamento desconhecida.',
  INDICE_INVALIDO: 'Índice de consulta desconhecido.',
  ESTRUTURA: 'A estrutura do banco local está incompleta. Recarregue a página.',
  CONFIG: 'Configuração do banco local inconsistente.',
  ABORTADA: 'A gravação foi cancelada e nada foi alterado.',
  GENERICO: 'Falha inesperada ao acessar os dados locais.',
};

export class ErroArmazenamento extends Error {
  constructor(codigo, { detalhe, causa } = {}) {
    super(detalhe ? `${codigo}: ${detalhe}` : codigo);
    this.name = 'ErroArmazenamento';
    this.codigo = codigo;
    this.detalhe = detalhe;
    this.causa = causa;
  }
  get mensagemUsuario() { return MENSAGENS[this.codigo] ?? MENSAGENS.GENERICO; }
}

const POR_NOME = {
  QuotaExceededError: 'COTA_EXCEDIDA',
  ConstraintError: 'DUPLICADO',
  VersionError: 'VERSAO_NOVA',
  SecurityError: 'INDISPONIVEL',
  InvalidStateError: 'INDISPONIVEL',
  AbortError: 'ABORTADA',
  DataCloneError: 'DADO_INVALIDO',
  DataError: 'DADO_INVALIDO',
  NotFoundError: 'ESTRUTURA',
};

// Converte qualquer exceção (DOMException ou outra) em ErroArmazenamento.
export function traduzir(erro) {
  if (erro instanceof ErroArmazenamento) return erro;
  const codigo = POR_NOME[erro?.name] ?? 'GENERICO';
  return new ErroArmazenamento(codigo, { detalhe: erro?.message, causa: erro });
}
