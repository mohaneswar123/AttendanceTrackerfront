import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Icons are generated from public/favicon.svg by `npm run generate-pwa-assets`
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],

      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },

      manifest: {
        name: 'Attendance Tracker',
        short_name: 'Attendance',

        start_url: '/',
        scope: '/',
        display: 'standalone',

        background_color: '#000000',
        theme_color: '#000000',

        icons: [
          {
            src: '/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})
