// Build estático para o Netlify (frontend). As funções ficam em netlify/functions.
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: `${raiz}netlify/web`,
  publicDir: `${raiz}public`,
  build: { outDir: `${raiz}dist-netlify`, emptyOutDir: true, target: 'es2022' },
});
