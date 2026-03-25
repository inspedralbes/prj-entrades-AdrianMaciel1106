/**
 * server.js
 * ─────────
 * Entry point: Express + Socket.IO on port 3000.
 *
 * REST endpoints:
 *   GET  /                    → health check
 *   GET  /api/seats           → list all seats (serialized)
 *   POST /api/seats/seed      → seed N seats, body: { count?: number }
 *   GET  /api/events          → list all events
 *
 * Socket.IO events: see seat.socket.js
 */

require('dotenv').config();

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const { Server } = require('socket.io');

const { registerSeatEvents }               = require('./modules/seients/seient.socket');
const { createSeat, getAllSeats,
        releaseExpiredReservations,
        serializeSeat }                     = require('./modules/seients/seient.model');
const { createEvent, getAllEvents }         = require('./modules/events/event.model');

const PORT          = Number(process.env.PORT) || 3000;
const DEFAULT_SEATS = 20;

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) =>
  res.json({ message: 'Ticket server running 🎟️', port: PORT })
);

app.get('/api/seats', (_req, res) => {
  res.json({ seats: getAllSeats().map(serializeSeat) });
});

app.get('/api/events', (_req, res) => {
  res.json({ events: getAllEvents() });
});

/**
 * POST /api/seats/seed
 * Body: { count?: number }
 * Re-creates N seats starting from A1 (overwrites existing ones).
 */
app.post('/api/seats/seed', (req, res) => {
  const count = Number(req.body?.count) || DEFAULT_SEATS;
  const seeded = [];
  for (let i = 1; i <= count; i++) {
    seeded.push(serializeSeat(createSeat(`A${i}`)));
  }
  res.status(201).json({ seeded: seeded.length, seats: seeded });
});

// ── HTTP server ───────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[socket] Connected    ${socket.id}`);

  // Register all seat events, passing io for auto-release broadcasts
  registerSeatEvents(socket, io);

  socket.on('disconnect', () =>
    console.log(`[socket] Disconnected ${socket.id}`)
  );
});

// ── Safety-net sweep: release any missed expired reservations every 60 s ─────
setInterval(() => {
  const released = releaseExpiredReservations();
  released.forEach((seat) => {
    io.emit('seat_updated', serializeSeat(seat));
    console.log(`[sweep]  Seat ${seat.id} released by safety-net sweep`);
  });
}, 60_000);

// ── Seed default data on startup ──────────────────────────────────────────────
(() => {
  // Seats
  for (let i = 1; i <= DEFAULT_SEATS; i++) createSeat(`A${i}`);
  console.log(`[server] Seeded ${DEFAULT_SEATS} seats`);

  // Events
  createEvent('1', 'Concert Rock', '2026-06-15', 'Palau Sant Jordi');
  createEvent('2', 'Teatre: Els Miserables', '2026-07-20', 'Teatre Nacional');
  createEvent('3', 'Festival de Jazz', '2026-08-05', 'Parc de la Ciutadella');
  console.log(`[server] Seeded 3 default events`);
})();

// ── Start ─────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[socket] Socket.IO ready`);
});

// Export for testing
module.exports = { app, httpServer, io };
