import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// IMPORTANTE: 'base' debe coincidir EXACTAMENTE con el nombre del repositorio
// en GitHub, entre barras. Si el repo se llama "podologia-atoche", queda '/podologia-atoche/'.
// Si esto no coincide, la app se publica en blanco.
export default defineConfig(() => {
  return {
    base: '/podologia-atoche/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
