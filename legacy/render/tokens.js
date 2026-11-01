// Valores do Manual Maré Cristal e das Fichas Técnicas (RC-01 a RC-10).
// Valores marcados "PROVISÓRIO" cobrem pendências (PT-07, PT-18...) e ficam aqui, num só lugar.
export const COR = {
  espuma: '#F4FAF9', turquesa: '#14B8CE', oceano: '#0A4F60',
  lima: '#C6F000', sol: '#FFC94D', areia: '#EFE5CF', branco: '#FFFFFF',
};

// RC-01: canvas e zona útil. A zona de texto termina em y2 (fim do bloco sobre foto).
export const FORMATOS = {
  feed:    { id: 'feed',    rotulo: 'Feed (4:5)',     largura: 1080, altura: 1350, zona: { x1: 72, y1: 72,  x2: 1008, y2: 1278 }, minFonte: 28 },
  stories: { id: 'stories', rotulo: 'Stories (9:16)', largura: 1080, altura: 1920, zona: { x1: 72, y1: 250, x2: 1008, y2: 1580 }, minFonte: 32 },
  // DES-01: quadrado de 1080; tudo dentro do círculo de segurança de raio 440 (zona = quadrado envolvente).
  destaque: { id: 'destaque', rotulo: 'Destaque (1:1)', largura: 1080, altura: 1080, zona: { x1: 100, y1: 100, x2: 980, y2: 980 }, minFonte: 28 },
  reels:   { id: 'reels',   rotulo: 'Reels (9:16)',   largura: 1080, altura: 1920, zona: { x1: 72, y1: 250, x2: 1008, y2: 1580 }, minFonte: 32, faixa34: { y1: 240, y2: 1680 } },
};

// RC-05: opacidade máxima na base; zona de 45% inferiores; cor sempre Oceano.
export const ESCURECIMENTO = { nenhum: 0, suave: 0.30, intenso: 0.60 };
export const ESCURECIMENTO_ROTULO = { nenhum: 'Nenhum', suave: 'Suave', intenso: 'Intenso' };
export const ESCURECIMENTO_ZONA = 0.45;

// RC-03 / PT-05: início no máximo da faixa; passo de 2 px; entrelinha 1,10; espaçamento −1,5%.
export const PASSO_FITAGEM = 2;
export const TITULO = { familia: 'Sora', peso: 700, entrelinha: 1.10, tracking: -0.015 };

// RC-06: logotipo (arquivo aparado 388 × 436; sem ampliação). Respiro = 25% da largura.
export const LOGO = { arquivo: '/assets/logo-aparado.png', largura: 388, altura: 436, respiro: 0.25 };

// PROVISÓRIO (PT-07): medidas dos componentes sem valor nas fichas.
export const COMPONENTES = {
  pilula:  { altura: 88, padX: 48, fonte: 36 },
  tagTipo: { altura: 64, padX: 32, fonte: 32 },
  placaLogo: { opacidade: 0.95, raio: 24 },                // padding = respiro de 25%
  vidro: { opacidade: 0.78, desfoque: 24, raio: 24, padding: 48 },
};

// Espaçamentos permitidos (RC-01): 24, 48 ou 72.
export const ESP = { u: 24, m: 48, g: 72 };
