# Model: Seient

## Descripció
Representa una plaça física associada a un determinat esdeveniment per on passa l'activitat principal de negoci (les compres/reserves). 

## Propietats

| Camp | Tipus | Obligatori | Descripció |
|------|-------|------------|------------|
| `id` | `String` | Sí | Identificador únic relatiu per a la UI. Ex: "A1", "A2", "D8". |
| `eventId` | `String` | Sí | ID de l'esdeveniment / sala al qual pertany. |
| `category` | `String` | Sí | Classificació del seient (`STANDARD`, `PREMIUM`, `VIP`). |
| `price` | `Number` | Sí | Preu de final corresponent al seient. |
| `status` | `String` | Sí | Estat actual: `AVAILABLE`, `RESERVED`, `SOLD`. |
| `reservedBy` | `String` | No | Identificador de l'usuari que bloqueja temporalment o definitiva. |
| `expiresAt` | `String (ISO)` | No | Data i hora exactes on expira el bloqueig d'un seient en `RESERVED`. |

## Estats i Transicions (Màquina d'Estat)
- `AVAILABLE` -> L'usuari sol·licita bloqueig -> `RESERVED`
- `RESERVED` -> Temps de TTL expirat (sweep) -> `AVAILABLE`
- `RESERVED` -> Formulari de pagament reeixit -> `SOLD`
- `AVAILABLE` -> Compra directa (poc comú sense bloqueig previ) -> `SOLD`
