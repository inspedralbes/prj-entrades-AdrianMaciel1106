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


## 3. Desviacions i Eliminació de Mòduls Identificats
- **Data:** 10/04/2026
- **Prompt:** "el apartado de admin lo vamos a quitar porque no sirve para nada. vamos a quitar sus conexiones"
- **Acció:** Creació d'un pla d'implementació i eliminació total del directori `frontend/pages/admin/` i els endpoints de manipulació manual d'esdeveniments del servidor de Node. Es retiren les llibreries i dependències associades que només pertocaven a aquesta característica.

## 4. Evolució Final basant-se en l'Especificació (SDD)
- **Data:** 10/04/2026
- **Prompt:** "analiza la arquitectura una vez más. quiero que me digas si podriamos implementar algo más a la pagina web que sea util y que se coordine con el enunciado... quiero que le hagas todos los tests posibles para comprobar si el programa es robusto"
- **Acció:** S'extreuen de l'enunciat diverses condicions opcionals (278 i 7.2) i es genera un nou pla de desenvolupament:
  1. *Reconnect Handling*: Es posa un Overlay a la UI per advertir quan el web socket del Node es desconnecta.
  2. *Simulació d'Email*: S'agreguen avisos a la UI post-compra simulant un enviament per correu de les dades.
- **Prompt:** "vamos a proseguir entonces con los cambios. vamos a hacerlo paso a paso para poder comprobar que el programa no falle con los cambios."
- **Acció:** Es modifiquen els tests automatitzats per evitar dependències de bases de dades hardcodejades (substitució de l'EVENT_ID manual '101' per fetch dinàmic de la base actual) i s'executen massivament testejant concurrència, multi-esdeveniment i broadcast global amb zero errors d'execució.

## 5. Reflexió sobre la Metodologia

## 4. Reflexió sobre la Metodologia
*(A omplir al final del projecte)*
