import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache all app assets for full offline support
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages' },
          },
        ],
      },
      manifest: {
        name: '煎牛排计时器',
        short_name: '煎牛排',
        description: '精准计时，每次完美',
        theme_color: '#1a1a1c',
        background_color: '#1a1a1c',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231a1a1c"/><text x="50" y="72" text-anchor="middle" font-size="60">🥩</text></svg>',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
