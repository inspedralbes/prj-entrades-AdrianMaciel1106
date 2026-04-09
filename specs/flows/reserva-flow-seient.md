# Flux de Reserva de Seient

El flux general i gràfic (Sequence) per assegurar de forma transaccional una ubicació com a usuari simple a la web:

1. El Front End en ruta `/event/[id].vue` demana el mapa de situació inicial. Revisions de status base on UI posarà en verd o grissos els esmentats en referència.
2. Un esdevenidor `click/touch` intenta en Nuxt reservar des de "Available". (Frontend UI fa l'estimació immediata visual que la resposta vindrà de confirmació al servidor mitjançant un modal).
3. Client emet `reserve_seat` amb el target SeatID.
4. Express / Node model localitza la matriu `Map()` al procés. Transiciona SeatID a `RESERVED`. 
5. Associa `userId = request.userId` al SeatID. Assigna Timestamp + TTL de 3-5 minuts a `expiresAt`.
6. Tanca la petició indicant veritat / OK responent un callback `reserve_seat_response` únic a l'originari.
7. Dispara `seat_updated` amb estatus `RESERVED` globalitzat cap eixe eventRoom. Totes les "altres pantalles de tot Déu en directe" repinteixen eixe element en Taronja / Gris.
8. Front End propi processa sa resposta d'OK i posa Timer en UX superior i dóna pas lliure de botó d'Avançar al pagament Checkout amb seguretat que la transacció de compra només la te ell durant X segons.

**Fallback:** Si expira (Node ho descobreix i el client no paga), eixe Seat torna automàticament a blanc (Available) via Server Emit autònom generat al Server sense click humà.
