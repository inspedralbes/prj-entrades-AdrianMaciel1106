# Planificació SCRUM: Visualització en Temps Real

**User Story:** "Com a usuari, vull veure en temps real les reserves que fan altres usuaris per evitar conflictes i triar un seient lliure."

## Backlog de Tasques

| ID | Tasca | Descripció | Estat |
| :--- | :--- | :--- | :--- |
| T1 | **Diferenciació Visual** | Configurar el component `Seient.vue` per mostrar estats diferents per a "Reservat per mi" (Seleccionat) vs "Reservat per altres". | ⏳ Pendent |
| T2 | **Lògica de Sincronització** | Verificar que el listener `seat_updated` al Pinia store actualitza correctament l'estat global sense interferir amb la selecció actual de l'usuari. | ✅ FET |
| T3 | **Feedback Actiu (Toasts)** | Implementar una notificació visual quan un seient lliure passa a estar ocupat mentre l'usuari està a la pàgina. | ⏳ Pendent |
| T4 | **Prova de Doble Client** | Simular dos navegadors per validar que el moviment d'un es reflecteix instantàniament en l'altre. | ⏳ Pendent |
| T5 | **Optimització de Càrrega** | Assegurar que en entrar a l'esdeveniment, l'estat inicial recollit via `all_seats` és 100% consistent. | ✅ FET |

## Detall Técnic
- **Event Socket:** `seat_updated`
- **Camp Clau:** `reservedBy` (comparator amb `userId` del client).
- **Estils:**
  - `selected`: Groc/Daurat (propi).
  - `reserved`: Taronja/Ambre (altres).
