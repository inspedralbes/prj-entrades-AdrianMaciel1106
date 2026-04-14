# 🎟️ FlowPass - Plataforma de Venda d'Entrades en Temps Real

![Banner FlowPass](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop)

**FlowPass** és una plataforma de venda d'entrades d'alta disponibilitat dissenyada per gestionar esdeveniments massius mitjançant sincronització en temps real. El projecte se centra en la resolució de problemes de concurrència i la gestió eficient de reserves temporals.

## Característiques Principals

- **Sincronització Real-Time**: Implementació total amb **Socket.IO** per a l'actualització instantània de seients entre tots els clients.
- **Gestió de Concurrència**: Sistema robust al backend que evita que dos usuaris puguin reservar el mateix seient simultàniament ("Double Booking").
- **Bloqueig Temporal (TTL)**: Els seients es reserven durant 5 minuts mentre l'usuari finalitza la compra. Si el temps s'esgota, el seient s'allibera automàticament.
- **Disseny Premium**: UI/UX moderna construïda amb **Nuxt 3** i **Vanilla CSS**, seguint un sistema de disseny "Glassmorphism" i paletes de colors harmonioses.
- **Arquitectura Basada en Especificacions**: Desenvolupament dirigit per documentació tècnica (Spec-Driven Development) ubicada a `/specs`.

## Stack Tecnològic

- **Frontend**: Nuxt 3 (Vue.js), Pinia (Estat Global), Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, MySQL (vía `mysql2`) amb fallback de persistència JSON.
- **DevOps**: GitHub Actions (preparat), Docker (preparat).

## Estructura del Projecte

```bash
├── frontend/          # Aplicació Client (Nuxt 3)
├── backend/           # Servidor API i Sockets (Node.js)
├── specs/             # Contractes i especificacions (SDD)
├── design/            # Actius de disseny i prototips
├── docs/              # Documentació de l'activitat i memòria
└── tests/             # Scripts de validació de concurrència
```

## Com començar (Instal·lació)

### Requisits
- Node.js v18+
- npm o yarn

### Pas 1: Configurar el Backend
```bash
cd backend
npm install
npm run dev
```
El servidor estarà escoltant a `http://localhost:3001`.

### Pas 2: Configurar el Frontend
```bash
cd frontend
npm install
npm run dev
```
L'aplicació estarà disponible a `http://localhost:3000`.

## Validació de Concurrència
Pots comprovar la robustesa del sistema executant el test de cursa:
```bash
cd backend
node tests/test_concurrency.js
```

## Documentació
Consulta la memòria completa de l'activitat a: `[docs/documentacio_activitat.md](./docs/documentacio_activitat.md)`

---
**Desenvolupat per:** Adrian Maciel - 2026
**Institució:** INS Pedralbes
