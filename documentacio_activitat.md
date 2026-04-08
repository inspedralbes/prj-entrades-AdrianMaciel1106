# Entrega de l'Activitat: FlowPass

## 1. Repositori GitHub
L'enllaç al repositori públic de GitHub amb tot el codi font organitzat és:
**[https://github.com/inspedralbes/prj-entrades-AdrianMaciel1106](https://github.com/inspedralbes/prj-entrades-AdrianMaciel1106)**

---

## 2. Documentació del Projecte

### 1. Explicació de les funcionalitats de l’aplicació
**FlowPass** és una plataforma web per a la venda d'entrades per a esdeveniments d'alta demanda que requereixen sincronització en temps real. 
- **Principals característiques**:
  - **Sincronització en temps real (Socket.IO)**: El mapa de seients s'actualitza instantàniament per a tots els usuaris connectats.
  - **Bloqueig temporal de seients**: Quan un usuari selecciona un seient, aquest es bloqueja temporalment per evitar col·lisions mentre es completa el procés de pagament i registre.
  - **Panell d'administració**: Permet observar l'estat i dades de l'esdeveniment en temps real.
- **Casos d'ús**:
  - **Usuari comprador**: Pot visualitzar els esdeveniments, consultar la disponibilitat del mapa de seients en directe, i reservar la seva entrada de forma segura.
  - **Administrador**: Pot visualitzar l'ocupació en directe, rebre estadístiques i gestionar incidències.
- **Tecnologies utilitzades**: Nuxt 3 per al frontend, Node.js + Socket.IO + base de dades SQL al backend, disseny UI prèviament realitzat a Penpot.

> [!TIP]
> *Nota: Afegeix més detalls d'altres funcionalitats, integració amb recerca de cinema si feu servir TMDb o característiques del teu disseny d'interfície.*

### 2. Captures de l’aplicació
A continuació s'inclouen imatges representatives del disseny i funcionament de l'aplicació FlowPass:

![Pantalla d'inici - Llistat d'esdeveniments](file:///c:/Users/Andreia/prj-entrades-AdrianMaciel1106/artifacts/flowpass_home_page.png)
*Vista principal on els usuaris poden explorar els esdeveniments actius amb un disseny modern i intuïtiu.*

![Selecció de seients en temps real](file:///c:/Users/Andreia/prj-entrades-AdrianMaciel1106/artifacts/flowpass_seat_selection.png)
*Mapa interactiu de seients que mostra l'estat de disponibilitat, bloquejos temporals i vendes sincronitzat en temps real.*

### 3. Procés d’especificació (Spec-Driven Development)
Durant el procés de creació, s'ha emprat una metodologia basada en **OpenSpec / Speckit**, orientant la implementació a esdeveniments i fluxos organitzats al directori `specs/`.

#### a. Foundations
Es defineix el context del projecte de reserves d'alta demanda temporal. L'objectiu és oferir un flux clar on diferents clients web no puguin trepitjar-se durant el cas d'ús d'una compra. L'abast comprèn només el flux bàsic de la reserva i alliberament de recursos i la presentació visual mitjançant websockets.

#### b. Specify
Es descriu de forma analítica el comportament de l'aplicació per a cada esdeveniment clau al servidor (contractes de dades). El sistema reacciona als àmbits recollits al directori `/specs/events/` i als models `/specs/models/`:
- Peticions de reserva (`reserva-seients.md`)
- Entitats implicades: Usuaris, Esdevinements i Seients (`/models`).
- Successos de compra, bloqueig i connexió (`compres.md`, `connexio.md`).

*Per exemple, en sol·licitar un seient cal enviar les dades amb `seatId`, `eventId`, `userId`, i com a comportament esperat el backend ha de retornar una resposta d'èxit de bloqueig temporal, o bé l'error `SEAT_NOT_AVAILABLE` en cas que es capti aquest seient bloquejat.*

#### c. Planning
Amb l'estructura d'especificació clara, l'organització de tasques inclou la divisió principal de `frontend` (Nuxt) i `backend` (Node). S'utilitza l'eina Taiga per a la gestió d'aquestes tasques (comentat al document README). Les grans decisions tècniques per complir amb el comportament basat en el directori `specs` ha estat l'arquitectura d'emisors (emit) de websockets (Socket.io) validant abans els models al costat servidor per garantir una unicitat de reserves sense desajustaments.

### 4. Annex amb fitxers rellevants
Fragments i estructures dels fitxers claus d'especificació tècnica dissenyats durant el projecte:

**Fragment de `specs/events/reserva-seients.md` (Contracte de dades de l'esdeveniment)**
```json
// Peticions originades des del Front:
{
  "seatId": "string",
  "eventId": "string",
  "userId": "string"
}

// Resposta esperada en cas d'èxit ("OK" i estat de la reserva bloquejat per completació d'usuari)
{
  "status": "OK",
  "seat": {
    "id": "A1",
    "status": "RESERVED",
    "reservedBy": "userId",
    "expiresAt": "timestamp"
  }
}

// Resposta d'error (si ja es trobava reservat o bloquejat)
{
  "status": "ERROR",
  "code": "SEAT_NOT_AVAILABLE"
}
```

**Estructura del Repositori**
Codi estructurat principalment en:
```
/frontend    -> Interfície pròpia en Nuxt 3 (vue)
/backend     -> API Node.js i servidor web de temps real (Sockets)
/specs       -> Contractes del Spec-Driven Development (Events, Models)
/doc         -> Documentació general (README, manuals de l'API)
```
