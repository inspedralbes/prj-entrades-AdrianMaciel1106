# Events: Reserva de Seients (`reserve_seat`)

Aquest esdeveniment serveix com a primer mecanisme d'assegurament o lock temporal associat a un "Timer".

## `reserve_seat`

**Client a NodeJS (`emit`):**
```json
{
  "seatId": "A1",
  "eventId": "evt_001",
  "userId": "client_session_abc"
}
```

**Resposta del Back a Aquest Client (`reserve_seat_response`):**
**A l'èxit** (Status és actualitzat, usuari establert i el TTL es dispara):
```json
{
  "success": true,
  "seat": {
    "id": "A1",
    "status": "RESERVED",
    "reservedBy": "client_session_abc",
    "expiresAt": "2026-04-09T08:52:10.000Z"
  }
}
```

**Si falla per estar bloquejat o venut per un altre**
```json
{
  "success": false,
  "error": "Seat A1 is already RESERVED"
}
```

Addicionalment, Node.js enviarà, un cop hagi passat en verd això d'amunt per al client, una confirmació de bloqueig a l'exterior:
`io.to(eventId).emit('seat_updated', ...)` per tornar el seient taronja a la resta de telèfons/ordinadors.