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

      // So the install prompt can be checked with `npm run dev`, not only after a build
      devOptions: { enabled: true, type: 'module' },

      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Client-side routes have no file of their own: serve the shell and let the
        // router take over. API calls must never be answered from the cache.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // The fonts the app is drawn with, so an installed copy opens looking right
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },

      manifest: {
        id: '/',
        name: 'Attendance In Hand',
        short_name: 'Attendance',
        description: 'Track class attendance, plan tasks, keep a calendar and a weekly timetable, and focus with a Pomodoro timer.',
        lang: 'en',

        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait-primary',
        categories: ['education', 'productivity'],

        // Matches the dark colour set, which is what the app opens in
        background_color: '#020617',
        theme_color: '#020617',

        icons: [
          { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],

        // Long-press the installed icon to jump straight to one of these
        shortcuts: [
          { name: 'Record attendance', short_name: 'Record', url: '/', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Tasks', short_name: 'Tasks', url: '/tasks', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Timetable', short_name: 'Timetable', url: '/timetable', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] },
          { name: 'Pomodoro', short_name: 'Pomodoro', url: '/pomodoro', icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }] }
        ]
      }
    })
  ]
})
