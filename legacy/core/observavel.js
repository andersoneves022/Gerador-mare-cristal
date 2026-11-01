// Estado observável mínimo: obter, definir (mescla) e assinar.
export function criarObservavel(inicial) {
  let valor = inicial;
  const ouvintes = new Set();
  return {
    obter: () => valor,
    definir(parcial) { valor = { ...valor, ...parcial }; ouvintes.forEach((fn) => fn(valor)); },
    assinar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); },
  };
}
