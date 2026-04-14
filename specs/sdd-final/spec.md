# Specification: SSR, Tests i Visualització

## 1. Comportament d'Enrutament i Rendering
- **Portada (`/`)**: Renderització al servidor (SSR) per garantir que els motors de cerca llegeixin la graella de pel·lícules.
- **Detall d'Esdeveniment (`/event/[id]`)**: Generació estàtica (Prerender) per a una càrrega instantània en fer clic des de la portada.
- **Panell d'Admin (`/admin`)**: Single Page Application (SPA) per a una gestió administrativa àgil i privada.

## 2. Visualització de Dades (Dashboard)
- S'ha d'integrar un gràfic de barres que mostri la relació d'ocupació (seients venuts vs totals) de cada esdeveniment actiu.
- El gràfic ha de ser reactiu i visualment integrat amb el disseny fosc del projecte.

## 3. Qualitat del Codi (Testing)
- **Capa de Lògica**: Proves de càlcul de preus, IVA i gestió de descomptes.
- **Capa d'Estat (Pinia)**: Verificació que les accions de l'Store (com `updateSeatStatus`) modifiquen l'estat exactament com s'espera.
- **Capa de Navegació**: Verificació que les rutes principals responen i que el middleware de seguretat (si n'hi ha) actua.
