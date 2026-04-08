# Log de Prompts - FlowPass

Aquest fitxer conté la traçabilitat de les interaccions amb la IA per al desenvolupament del projecte FlowPass, seguint la metodologia Spec-Driven Development (SDD).

## 1. Especificació Inicial (Fase 1: Foundations & Specify)

### Prompts de generació de l'especificació
- **Data:** 08/04/2026
- **Prompt:** "analiza el archivo enunciat_projecte.md y comparalo con lo que llevamos del proyecto actual"
- **Objectiu:** Validar que l'estructura del projecte i els arxius de la carpeta `/specs` compleixen amb els requeriments del professor.
- **Resposta de la IA:** S'ha detectat la falta del fitxer `prompts-log.md` com a punt crític i s'ha identificat la necessitat d'implementar Pinia i tests de concurrència.

### Correccions / Refinaments
- **Data:** 08/04/2026
- **Prompt:** "Vamos a solucionar los puntos criticos primero para poder continuar con el proyecto."
- **Acció:** Creació d'aquest fitxer de log i preparació per a la implementació de stores de Pinia buits.
- **Prompt:** "continuamos por definir el store de pinia"
- **Acció:** Implementació del store `useEventStore` a `frontend/stores/useEventStores.ts` gestionant l'estat dels seients, informació de l'esdeveniment i temporitzador de reserva.
- **Prompt:** "completa la integracion de socket.io"
- **Acció:** Integració completa de Socket.IO dins del store de Pinia. S'han afegit listeners per a `seat_updated`, `all_seats` i la lògica d'unió a sales (`join_event`). El store ara és el cervell que sincronitza el backend amb la UI.

## 2. Implementació de la Logica de Negoci (Fase 2: Apply)

*(A omplir a mesura que avancem amb les User Stories)*

### User Story: Com a visitant, vull veure la llista d'esdeveniments
- **Data:** 08/04/2026
- **Prompt:** "Genera un proyecto Node.js completo para un sistema de venta de asientos en tiempo real"
- **Acció:** Implementació del backend amb Express i Socket.IO. Creació dels models `seient.model.js` (amb auto-expiració) i `event.model.js`.
- **Prompt:** "Frontend – Mostrar llista d’esdeveniments"
- **Acció:** Creació del component `EventList.vue` i la pàgina `index.vue` amb estil premium (glassmorphism).

### User Story: Com a client, vull seleccionar un seient en temps real
- **Data:** 08/04/2026
- **Prompt:** "Continue" / "ejecuta el codigo"
- **Acció:** Desenvolupament del mapa de seients interactiu a `pages/event/[id].vue` i el component `Seient.vue`. Integració total amb Socket.IO per a la reserva i compra de seients amb feedback visual immediat.
- **Prompt:** "vamos a hacer un testing de esa nueva funcionalidad"
- **Acció:** Execució del test de concurrència `tests/test_concurrency.js`. S'ha verificat que el backend gestiona correctament la competició per un seient: ClientA ha reservat primer, ClientB ha rebut un error de "already RESERVED", i ClientA ha pogut confirmar la compra. El sistema de broadcast ha actualitzat a tots els observadors instantàniament.


## 3. Errors i Desviacions Detectades
- **Desviació 1:** Falta de traçabilitat inicial de prompts.
- **Correcció:** Inici immediat d'aquest log per complir amb el criteri de l'enunciat.

## 4. Reflexió sobre la Metodologia
*(A omplir al final del projecte)*
