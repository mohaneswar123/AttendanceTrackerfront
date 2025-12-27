import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

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
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
