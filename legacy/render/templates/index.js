// Registro das fichas. Para incluir um novo template: criar a ficha e registrá-la aqui.
// Estruturas suportadas pelo motor: A (foto cheia, com painel opcional), B (cartão, com corpos)
// e C (composição livre da Galeria 4.1: várias fotos, blocos, módulos e grupos de texto)
// e V (sobreposição de vídeo do VID-02: PNG transparente por entrada + tempos).
import { FOT01 } from './fot01.js';
import { FOT02 } from './fot02.js';
import { INS01 } from './ins01.js';
import { INS02 } from './ins02.js';
import { INF01 } from './inf01.js';
import { INF02 } from './inf02.js';
import { INF03 } from './inf03.js';
import { INF04 } from './inf04.js';
import { COM01 } from './com01.js';
import { COM02 } from './com02.js';
import { VID01 } from './vid01.js';
import { VID02 } from './vid02.js';
import { DES01 } from './des01.js';

// Ordem da Biblioteca v0.2.1 (Fotos, Inspiração, Informação, Comercial, Vídeo, Destaques).
export const FICHAS = [FOT01, FOT02, INS01, INS02, INF01, INF02, INF03, INF04, COM01, COM02, VID01, VID02, DES01];
const mapa = new Map(FICHAS.map((f) => [f.id, f]));
export const obterFicha = (id) => mapa.get(id) ?? null;
// Os restantes da Biblioteca v0.2.1, ainda sem ficha implementada (Etapa 7: nenhum; os 13 estão registrados).
export const TEMPLATES_PENDENTES = [];
