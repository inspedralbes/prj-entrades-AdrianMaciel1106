# Events: Connexió (`join_event` / `all_seats`)

Per reduir trànsit global de l'aplicació, el disseny obliga als clients d'un usuari web connectar directament a "Rooms" limitats i esporàdics basats en la ID de l'esdeveniment on naveguen.

## `join_event`

**Canal (Client -> Server):** `join_event`

```json
{
  "eventId": "evt_909tmd"
}
```

El servidor respondrà inserint via `socket.join(eventId)` el flux global i farà automàticament un enviament massiu a aquest client sol amb tota la composició global del seating mapa (`all_seats`).

## `all_seats`

**Canal (Server -> Client):** `all_seats`

Retorna els arrays inicials:

```json
{
  "seats": [
    { "id": "A1", "status": "AVAILABLE", "price": 10.5 },
    { "id": "A2", "status": "RESERVED", "price": 10.5 },
    { "id": "B1", "status": "SOLD", "price": 12.0 }
  ]
}
```
