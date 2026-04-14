# Foundations: Fase Final FlowPass

## Context
Aquest document cobreix la fase de consolidació del projecte FlowPass (Venda d'entrades en temps real). Ens trobem en la fase on l'aplicació ja és funcional, però necessita millores de rendiment, SEO, fiabilitat i eines administratives.

## Objectius
1. **Optimització de Rendiment i SEO**: Implementar SSR i generació estàtica segons la naturalesa de cada pàgina.
2. **Fiabilitat (Testing)**: Garantir que la lògica de negoci i l'estat global funcionen sense errors mitjançant tests automatitzats.
3. **Intel·ligència de Negoci**: Oferir als administradors una visió visual de les vendes en temps real.

## Restriccions
- **Framework**: Nuxt 3 (Composition API).
- **Estat**: Pinia (Store modular).
- **Estils**: Vanilla CSS mantenint l'estètica Premium (Glassmorphism).
- **Llibreries**: Vitest per a tests i Chart.js per a gràfics.
