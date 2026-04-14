---
trigger: always_on
---

# Misión y Arquitectura del Proyecto FlowPass

Este archivo contiene el contexto global, la arquitectura y las reglas del proyecto FlowPass (Venta de entradas en tiempo real). Úsalo como base para cualquier desarrollo futuro, refactorización o corrección de errores.

## 🛠️ Stack Tecnológico y Librerías Clave

- **Frontend**:
  - **Framework**: [Nuxt 3](https://nuxt.com/) (basado en Vue 3).
  - **Gestor de Estado**: [Pinia](https://pinia.vuejs.org/) (`@pinia/nuxt`).
  - **Tiempo Real**: `socket.io-client` para conexión con websockets.
  - **Estilos**: Vanilla CSS (Variables de CSS, glassmorphism, flexbox/grid, animaciones, tipografía `Outfit` de Google Fonts). *Nota: No se utiliza Tailwind CSS por defecto.*
  - **Lenguaje**: JavaScript (con uso puntual de TypeScript para configuraciones de Nuxt y Stores de Pinia).

- **Backend**:
  - **Entorno**: Node.js (con soporte de **ES Modules** - `import`/`export` mediante `"type": "module"`).
  - **Servidor Web**: `express` para endpoints REST y servidor HTTP.
  - **Tiempo Real**: `socket.io` (Servidor WebSockets).
  - **Base de Datos**: `mysql2` (Configurada para uso futuro) + fallback actual en un sistema de persistencia JSON en disco (`utils/storage.js`).
  - **Peticiones HTTP**: `node-fetch` para integraciones con APIs externas (ej. TMDB).

## 📂 Estructura y Arquitectura

El proyecto está dividido en dos aplicaciones principales y una carpeta para especificaciones (basada en Spec-Driven Development):

### 1. `/frontend` (Aplicación Nuxt)
- **`pages/`**: Agrupa el sistema de enrutamiento principal. 
  - `index.vue`: Cartelera principal.
  - `event/[id].vue`: Mapa inmersivo de selección de asientos.
  - `event/checkout.vue` y `event/entrades.vue`: Flujo de pago y ticket final.
  - `admin/index.vue`: Panel de administración.
- **`components/`**: Componentes visuales organizados (ej. `EventList.vue`, y subcarpetas para dominios como `seient/Seient.vue`).
- **`stores/`**: Gestión central del estado con Pinia (ej. `useEventStores.ts`), que maneja tanto variables de sesión como los callbacks de Socket.IO.
- **`plugins/`**: Inicializadores que corren en cliente/servidor (ej. `socket.client.ts`).

### 2. `/backend` (Servidor Node/Express/Sockets)
Sigue una **arquitectura basada en módulos** (Features):
- **`src/server.js`**: Punto de entrada, levantamiento local, orquestación de Express y WebSockets.
- **`src/modules/`**: Agrupa la lógica principal. Ejemplo:
  - `events/event.model.js` (Entidades y memoria).
  - `seients/seient.socket.js` (Controladores de socket para reservas y compra).
  - `movies/movie.service.js` (Servicios externos como la API de TMDb).
- **`src/config/`**: Controladores de configuración (`db.js`, `socket.js`).
- **`src/utils/`**: Utilitarios genéricos (ej. `storage.js`).

### 3. `/specs` 
Documentación viva y contratos de datos utilizados en los flujos de websockets y APIs. Cualquier nueva entidad o modificación debe concordar con el Spec-Driven Development previo.

## ✍️ Convenciones de Código

- **Frontend**:
  - Preferencia absoluta por **Vue 3 Composition API** utilizando `<script setup>`.
  - Estilos embebidos confinados usando `<style scoped>`.
  - Diseño enfocado en UI Premium: Colores oscuros, transparencias, gradientes, y sombras suaves.
- **Backend / General**:
  - Patrón de retorno temprano (Early Returns) para evitar anidamientos (ej. `if (!valid) return;`).
  - Uso estricto de ES Modules (`import`/`export`) en lugar de CommonJS (`require`).
  - Nombres claros y predecibles en los eventos webhooks/sockets (ej. snake_case como `reserve_seat`, `seat_updated`).
  - Lógica asíncrona mediante `async/await` estructurada (uso escaso de `.then`).

---

## 🤖 Reglas de Comportamiento de IA
- Ve directo al grano: no expliques el código a menos que se te pida. Entrega solo la solución.
- Antes de ejecutar comandos destructivos en el terminal o instalar nuevas dependencias, pide confirmación.
- Si un test o comando falla más de 2 veces en el terminal, detente y pide revisión humana. No entres en bucles.
