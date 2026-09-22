import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Generates the favicon, PWA and Apple icons in public/ from public/favicon.svg.
// Run `npm run generate-pwa-assets` after changing the SVG.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#020617' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#020617' } },
  },
  images: ['public/favicon.svg'],
});
