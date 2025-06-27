import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { env } from 'process';

const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0]
        : 'https://localhost:7147';

export default defineConfig({
    base: '/', // 🛡️ Render SPA yönlendirmesi için gerekli
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '^/weatherforecast': {
                target,
                secure: false,
            },
        },
        host: true,
        port: 5173,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html',
        },
    },
    esbuild: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    }
});
