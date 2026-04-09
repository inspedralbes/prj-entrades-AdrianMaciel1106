# Events: Compres & Checkout (`confirm_purchase`)

Aquest fitxer documenta com els Sockets (i opcionalment controladors web) tracten l'esdeveniment definitiu de finalitzar pagament.

## `confirm_purchase`

**Canal (Socket de Client):** `confirm_purchase`
**Canal (Socket de Servidor Resposta):** `confirm_purchase_response`

```json
// Enviat des del Client:
{
  "eventId": "evt_12345",
  "seatId": "A1",
  "userId": "user_hash53f2"
}

// Resposta Server - Cas d'èxit:
{
  "success": true,
  "seat": {
    "id": "A1",
    "status": "SOLD",
    "reservedBy": "user_hash53f2",
    "expiresAt": null
  }
}

// Resposta Server - Cas d'error / Expirat:
{
  "success": false,
  "error": "Reservation for seat A1 has already expired"
}
```

## `seat_updated` 
Una validació de pagament desencadena immediatament un Global Broadcast a l'exterior cap l'habitació sencera d'aquell esdeveniment per fer veure al mapa a temps real dels altres que això ara és VENUT:
```javascript
io.to(eventId).emit('seat_updated', serializeSeat(result.seat));
```
