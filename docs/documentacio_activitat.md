# Memòria del Projecte: FlowPass 🎟️

**Estudiant:** Adrian Maciel  
**Assignatura:** Projecte Final de Curs  
**Data:** 14 d'abril de 2026

---

## 1. Explicació de les funcionalitats de l’aplicació

**FlowPass** és una solució integral per a la venda d'entrades en esdeveniments d'alta concurrència (concerts, estrenes de cinema, teatre). El problema principal que resol és la competició per un mateix recurs (el seient) entre centenars d'usuaris simultanis.

### Principals característiques:
- **Cartellera Dinàmica**: Llistat d'esdeveniments obtinguts en temps real (integració opcional amb TMDb per a cinema).
- **Mapa de Seients Inmersiu**: Interfície interactiva que mostra l'ocupació en viu.
- **Sincronització Real-Time**: Mitjançant WebSockets (Socket.IO), qualsevol canvi d'estat (reserva, compra o alliberament) es reflecteix a tots els navegadors connectats en mil·lisegons.
- **Bloqueig Temporal (Reservat)**: Quan un usuari inicia el procés de compra, el seient queda bloquejat per a la resta durant 5 minuts (TTL), evitant el "double booking".
- **Flux de Pagament Segur**: Validació al backend per assegurar que només el posseïdor de la reserva temporal pot finalitzar la compra.
- **Disseny Premium**: Estètica "Glassmorphism" amb animacions suaus i *feedback* visual mitjançant notificacions (Toasts).

---

## 2. Captures de l’aplicació

A continuació, es mostren les pantalles principals del producte final:

### A. Pantalla d'Inici (Cartellera)
L'usuari pot seleccionar l'esdeveniment al qual vol assistir. El disseny utilitza targetes amb gradients i efectes de *hover*.

![Pantalla d'inici](./images/flowpass_home_page.png)

### B. Mapa de Seients i Reserva en Temps Real
Vista del mapa on es pot observar la llegenda (Disponible, Reservat, Venut). Les reserves d'altres usuaris apareixen amb una icona de pany (🔒).

![Selecció de seients](./images/flowpass_seat_selection.png)

---

## 3. Procés d’especificació (Spec-Driven Development)

El desenvolupament s'ha guiat per la metodologia **Spec-Driven Development (SDD)**, utilitzant el marc de treball **GitHub Spec Kit**. Aquest procés ens ha permès definir el comportament abans d'escriure el codi.

### a. Foundations
En aquesta fase hem establert el context: una aplicació on la **integritat de les dades** i la **velocitat de resposta** són crítiques. S'ha decidit utilitzar una arquitectura basada en esdeveniments per minimitzar la càrrega del servidor i maximitzar la reactivitat.

### b. Specify
Hem definit els contractes de dades (ubicats a `/specs`). Per exemple, el contracte de l'esdeveniment `reserve_seat`:
- **Input**: `eventId`, `seatId`, `userId`.
- **Output**: Estat del seient actualitzat i marca de temps d'expiració (`expiresAt`).
- **Comportament**: El servidor és l'única font de veritat (Single Source of Truth).

### c. Planning
L'organització del treball s'ha reflectit en el pla tècnic (`docs/planning_realtime.md`), dividint el projecte en:
1. **Infraestructura de Sockets**: Configuració del servidor i de les sales (Rooms) per esdeveniment.
2. **Estat Global (Pinia)**: Gestió del costat client per mapejar els estats del servidor a estils de CSS.
3. **Control de Concurrència**: Implementació de semàfors lògics al model de dades per gestionar les peticions concurrents.

---

## 4. Annex amb fitxers rellevants

### Lògica de Concurrència (`specs/rules/concurrencia.md`)
```javascript
// Validació crítica al backend (Atomic check)
if (seat.status !== SEAT_STATUS.AVAILABLE) {
  return { success: false, error: `Seat ${id} is already ${seat.status}` };
}
```

### Log de Prompts (`docs/prompts-log.md`)
Per garantir la traçabilitat del procés de desenvolupament amb IA, s'inclou el fitxer `prompts-log.md` que recull totes les iteracions i preses de decisions realitzades durant la creació del projecte. Aquest document és una peça clau de l'entrega segons els requisits acadèmics.

### Tests de Validació
S'han utilitzat scripts com `tests/test_concurrency.js` per simular situacions d'estrès on dos usuaris cliquen el mateix seient al mateix mil·lisegon, demostrant la robustesa del backend.

---
**Enllaç al Repositori:** [https://github.com/inspedralbes/prj-entrades-AdrianMaciel1106](https://github.com/inspedralbes/prj-entrades-AdrianMaciel1106)
