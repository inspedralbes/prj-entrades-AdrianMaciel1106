# Flux de Compra / Pagament Final

El flux complet defineix les interaccions des de la pàgina "Checkout" endavant.

1. **Procés Inicia (UI)**
   L'usuari ja té des d'una pàgina anterior una variable d'estat a `Pinia` o un paràmetre query URL que demostra que conté el control físic d'un `seatId`. Completa una formulari Mock amb nom de client.
   
2. **Execució (Client -> Socket)**
   Desencadena en la clau de UI l'emissió del payload final `confirm_purchase`.
   
3. **Validació Backend (`/models/seient.model.js`)**
   - El sistema corrobora si l'usuari validat des del Socket és del `reservedBy` anterior d'aquell seient concret en RAM.
   - S'assegura que el seient estigui precisament en mode `RESERVED` i que encara no tingui un offset temporal invàlid en `expiresAt`.

4. **Persistència / Canvi d'Estat**
   Node executa transició a `SOLD`. Aquest ja no te TTL al temps real.

5. **Difusió Broadcast (`io.emit`)**
   Node demana als altres jugadors / sessions a través de `seat_updated` que repantin en vermell / ombregin eixe ticket i que no el seleccioniú mai més.

6. **Notificacions i Persistència (`storage.js`)**
   Al final de certs fluxes, el servidor guarda eixa operativitat del Map() global al sistema HDD `db.json` creant l'abstracció final perquè es conservi.
   L'usuari es redreça a Ticket generat exitosament `[/event/entrades]`.
