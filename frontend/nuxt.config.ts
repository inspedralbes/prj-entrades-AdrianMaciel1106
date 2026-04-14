// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  devServer: {
    port: 3002
  },
  modules: ['@pinia/nuxt'],
  routeRules: {
    // Portada amb SSR
    '/': { ssr: true },
    // Esdeveniments amb renderització estàtica (prerender)
    '/event/**': { prerender: true },
    // Admin com a SPA (Single Page Application)
    '/admin/**': { ssr: false }
  },
  runtimeConfig: {
    public: {
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    }
  }
})
