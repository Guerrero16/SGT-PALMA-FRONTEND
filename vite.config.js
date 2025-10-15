import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 3001,
        proxy: {
            '/api': {
                target: 'http://localhost:4000', // Actualizado a puerto 4000
                changeOrigin: true,
                secure: false
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    publicDir: 'public'
});