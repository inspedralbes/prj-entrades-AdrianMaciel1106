# Regles de Negoci (Business Rules)

Aquest document defineix les regles estratègiques de com es tracten l'esquatters i gestió de seients al sistema FlowPass.

### RB_001: Bloqueig de Seients Obligatori
No és possible que dos clients s'emportin el mateix seient pagant. Cal que abans de procedir al checkout general d'un usuari, ell faci una sol·licitud a l'entorn de sockets perquè el seu usuari el bloquegi (`RESERVED`). 
- **Error:** Un altre usuari, quan la IU estigui endarrerida o falsege la petició cap el `confirm_purchase`, rebrà `Seat X is reserved by a different user`.

### RB_002: Límits temporals (Time-To-Live - TTL)
El temps màxim que la plataforma conserva un seient per al procés de validació (checkout) i inserció de dades és de **180 segons** (3 minuts). Passats aquest temps, hi haurà de rebre la disponibilitat al domini o se li notificarà l'expiració a pantalla.

### RB_003: Categoritzacions de seients
El sistema ha d'agrupar automàticament els preus generant les classes:
- `STANDARD`: Preu base (al voltant de 9.50€).
- `PREMIUM`: Preu mitjà amb zona superior i butaques VIP intermig (al voltant de 12.00€).
- `VIP`: Preu exclusiu, normalment files D per darrere. (al voltant de 18.00€).
*(L'escriptura per l'administrador crea 32 places estructurades en aquestes 3 bases normalitzades).*

### RB_004: Persistència a prova de servidors caiguts
FlowPass usa un model de `storage.js`. En cas que Node.js es desconnecti, reiniciï, qualsevol dada confirmada com a venuda (`SOLD`) ha de sobreviure per previndre pèrdues econòmiques del client i denegacions en la porta de l'esdeveniment.
