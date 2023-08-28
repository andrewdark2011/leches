import { resolve } from 'pathe';
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TresLeches 🍰",
  description: "Tasty GUI for Vue controls",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tresjs/leches' }
    ]
  },
  vite: {
    optimizeDeps: {
      exclude: ['vitepress'],
      include: ['three'],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
    resolve: {
      alias: {
        '@tresjs/leches': resolve(__dirname, '../../dist/tresleches.js'),
        '@leches/styles': resolve(__dirname, '../../dist/style.css'),
      },
      dedupe: ['@tresjs/cientos', 'three'],
    },
  },
})
