// Filtros da biblioteca (função pura, combináveis). Favorita e tratada não têm índice no IndexedDB
// (booleanos não são chaves válidas), então filtram em memória sobre os metadados.
// categoria: '' (todas) | 'sem' (sem categoria) | id de categoria
// favoritas: '' (todas) | 'sim'
// tratamento: '' (todas) | 'tratadas' | 'nao-tratadas'
export function filtrarFotos(fotos, { categoria = '', favoritas = '', tratamento = '' } = {}) {
  return fotos.filter((f) => {
    if (categoria === 'sem' && f.categorias.length > 0) return false;
    if (categoria && categoria !== 'sem' && !f.categorias.includes(categoria)) return false;
    if (favoritas === 'sim' && !f.favorita) return false;
    if (tratamento === 'tratadas' && !f.tratada) return false;
    if (tratamento === 'nao-tratadas' && f.tratada) return false;
    return true;
  });
}
