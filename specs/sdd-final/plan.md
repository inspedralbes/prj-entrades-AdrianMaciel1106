# Plan d'Implementació: Millores Tècniques Finals

## Fase 1: Configuració de l'Entorn
- Instalar dependències: `vitest`, `@nuxt/test-utils`, `chart.js`, `vue-chartjs`.
- Modificar `nuxt.config.ts` per activar `ssr: true` i definir les `routeRules` específiques.

## Fase 2: Implementació de Visualització
- Crear component `AdminChart.vue` encapsulant la llibreria Chart.js.
- Integrar el component a `pages/admin/index.vue` passant les dades dels esdeveniments com a `props`.

## Fase 3: Suite de Proves
- Configurar el fitxer `vitest.config.ts`.
- Programar tests unitaris per a l'Store de Pinia.
- Programar tests de funcionalitat per a la lògica de preus.
- Programar tests de navegació bàsics.

## Fase 4: Validació
- Executar `npm run test` per verificar la integritat.
- Realitzar build de producció per comprovar que el prerendering funciona correctament.
