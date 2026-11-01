// Persistência e espaço. Os valores vêm do navegador e são ESTIMATIVAS:
// nada aqui é garantia de preservação nem medida exata.
const GIB = 1024 ** 3;

const gerenciador = () => (typeof navigator !== 'undefined' ? navigator.storage : undefined);

export async function lerPersistencia() {
  const s = gerenciador();
  if (typeof s?.persist !== 'function') return { suportado: false, persistente: false };
  try {
    return { suportado: true, persistente: typeof s.persisted === 'function' ? !!(await s.persisted()) : false };
  } catch { return { suportado: true, persistente: false, erro: true }; }
}

// Pede ao navegador que não apague os dados sem aviso. O navegador pode negar.
export async function solicitarPersistencia() {
  const s = gerenciador();
  if (typeof s?.persist !== 'function') return { suportado: false, persistente: false, solicitada: false };
  try {
    if (typeof s.persisted === 'function' && (await s.persisted())) {
      return { suportado: true, persistente: true, solicitada: false };
    }
    return { suportado: true, persistente: !!(await s.persist()), solicitada: true };
  } catch { return { suportado: true, persistente: false, solicitada: true, erro: true }; }
}

export async function lerEstimativa() {
  const s = gerenciador();
  if (typeof s?.estimate !== 'function') return { suportado: false };
  try {
    const { usage, quota } = await s.estimate();
    const usoBytes = Number(usage) || 0;
    const cotaBytes = Number(quota) || 0;
    return {
      suportado: cotaBytes > 0,
      usoBytes,
      cotaBytes,
      livreBytes: Math.max(0, cotaBytes - usoBytes),
      percentual: cotaBytes > 0 ? (usoBytes / cotaBytes) * 100 : null,
    };
  } catch { return { suportado: false, erro: true }; }
}

// Limiares da Especificação §12.4: >80% aviso; <1 GB livre aviso; >95% bloquear novas importações.
export function avaliarEspaco(e) {
  if (!e?.suportado || e.percentual == null) return { nivel: 'desconhecido', mensagens: [], bloqueiaImportacao: false };
  const mensagens = [];
  let nivel = 'ok';
  if (e.percentual > 95) {
    nivel = 'critico';
    mensagens.push('O espaço do navegador está quase esgotado. Novas importações podem ser bloqueadas.');
  } else if (e.percentual > 80) {
    nivel = 'aviso';
    mensagens.push('Mais de 80% do espaço estimado está em uso.');
  }
  if (e.livreBytes < GIB) {
    if (nivel === 'ok') nivel = 'aviso';
    mensagens.push('Há menos de 1 GB estimado disponível.');
  }
  return { nivel, mensagens, bloqueiaImportacao: e.percentual > 95 };
}
