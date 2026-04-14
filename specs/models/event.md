# Model: Esdeveniment (Event)

## Descripció
L'esdeveniment és el punt central per agrupar vendes de tiquets. Un model genèric s'adapta tant com a una pel·lícula com a un concert o una obra teatral.

## Propietats

| Camp | Tipus | Obligatori | Descripció |
|------|-------|------------|------------|
| `id` | `String` | Sí | ID Únic per a la instància d'Esdeveniment. |
| `nom` | `String` | Sí | Nom o títol (e.g., "The Batman 2", "Iron Maiden Tour"). |
| `data` | `String (Date)` | Sí | Data prevista per l'esdeveniment. |
| `lloc` | `String` | Sí | Lloc exacte / Sala dintre del recinte. Ex: "Sala VIP 1". |
| `imatge` | `String (URL)` | Sí | Pòster clau associat al contingut. |
| `backdrop` | `String (URL)` | No | Imatge gran per la capçalera (UI Premium). |
| `sinopsi` | `String` | No | Text llarg que explica la trama o l'esdeveniment. |
| `rating` | `Number` | No | Valoració d'usuari de 0.0 a 10.0 (API TMDb, etc). |

## Estructura i Relacions
- **1 a Molts**: Un esdeveniment conté molts models `Seient`. (Específicament, es pre-generen en la creació a 32 per defecte en aquest domini particular).
- **Extracció**: Els esdeveniments solen carregar des de TMDb o de JSON per defecte per establir un ambient de dades de demostració en inicialitzar `/backend/src/utils/storage.js`.
