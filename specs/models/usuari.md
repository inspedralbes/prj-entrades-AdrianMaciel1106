# Model: Usuari

## Descripció
L'entitat `Usuari` representa un client temporal que accedeix a l'aplicació interactuant per reservar seients. En un sistema avançat representaria comptes registrats, però en format MVP actua mitjançant un identiticador de sessió o de token.

## Propietats

| Camp | Tipus | Obligatori | Descripció |
|------|-------|------------|------------|
| `userId` | `String` | Sí | Identificador únic de l'usuari (generat per client o sessió). |
| `name` | `String` | No | Nom de l'usuari (obligatori a l'hora del pagament final). |
| `email` | `String` | No | Correu electrònic on rebre la confirmació (l'enviament de l'entrada). |

## Regles associades
- Un usuari pot reservar un màxim definit de seients per sessió (ex: no pot acaparar tots els seients).
- Les reserves bloquejades temporalment perden referència de l'usuari quan `expiresAt` de cadascuna s'esgota.
