// Carregamento explícito das fontes locais. Sem Google Fonts.
// Se um arquivo faltar, o estado informa; a interface avisa e usa fonte do sistema.
import { FONTES } from '../config.js';

const estado = { carregadas: [], ausentes: [], pronto: false };
const ouvintes = new Set();

export const estadoFontes = () => ({ ...estado, carregadas: [...estado.carregadas], ausentes: [...estado.ausentes] });

export function aoMudarFontes(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export async function carregarFontes() {
  estado.carregadas = [];
  estado.ausentes = [];
  estado.pronto = false;
  await Promise.all(FONTES.map(async ({ familia, peso, arquivo }) => {
    try {
      const fonte = new FontFace(familia, `url(/fonts/${arquivo})`, { weight: peso, style: 'normal' });
      await fonte.load();
      document.fonts.add(fonte);
      estado.carregadas.push(arquivo);
    } catch {
      estado.ausentes.push(arquivo);
    }
  }));
  estado.pronto = true;
  ouvintes.forEach((fn) => fn(estadoFontes()));
  return estadoFontes();
}

// A renderização das artes só pode começar com as 4 fontes carregadas.
export const fontesCompletas = () => estado.pronto && estado.ausentes.length === 0;
