/**
 * server.js
 * ─────────
 * Entry point: Express + Socket.IO on port 3001.
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

const PORT          = Number(process.env.PORT) || 3001;
const DEFAULT_SEATS = 20;

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) =>
  res.json({ message: 'Ticket server running 🎟️', port: PORT })
);

app.get('/api/events/:eventId/seats', (req, res) => {
  const { eventId } = req.params;
  const seats = getAllSeats(eventId);
  res.json({ eventId, seats: seats.map(serializeSeat) });
});

app.get('/api/events', (_req, res) => {
  res.json({ events: getAllEvents() });
});

/**
 * POST /api/events/:eventId/compres
 * Confirms the purchase of a RESERVED seat.
 */
app.post('/api/events/:eventId/compres', (req, res) => {
  const { eventId } = req.params;
  const { seatId, userId } = req.body;

  if (!seatId || !userId) {
    return res.status(400).json({ error: 'seatId and userId are required' });
  }

  const result = confirmPurchase(eventId, seatId, userId);

  if (result.success) {
    // Broadcast the SOLD status to all clients in the event room
    io.to(eventId).emit('seat_updated', serializeSeat(result.seat));
    console.log(`[server] Purchase confirmed: ${eventId}:${seatId} sold to ${userId}`);
    return res.json({ success: true, seat: serializeSeat(result.seat) });
  } else {
    return res.status(400).json({ success: false, error: result.error });
  }
});

// ── HTTP server ───────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[socket] Connected    ${socket.id}`);
  registerSeatEvents(socket, io);
  socket.on('disconnect', () => console.log(`[socket] Disconnected ${socket.id}`));
});

// ── Safety-net sweep ─────────────────────────────────────────────────────────
setInterval(() => {
  const released = releaseExpiredReservations();
  released.forEach((seat) => {
    io.to(seat.eventId).emit('seat_updated', serializeSeat(seat));
    console.log(`[sweep]  Seat ${seat.eventId}:${seat.id} released by safety-net sweep`);
  });
}, 30000);

const { getNowPlayingMovies }               = require('./modules/movies/movie.service');



// ── Seed default data on startup ──────────────────────────────────────────────
(async () => {
  // Movies from TMDB
  const movies = await getNowPlayingMovies();
  
  movies.forEach(movie => {
    createEvent(
      movie.id, 
      movie.nom, 
      movie.data, 
      movie.lloc, 
      movie.imatge, 
      movie.backdrop, 
      movie.sinopsi, 
      movie.rating
    );
  });

  console.log(`[server] Seeded ${movies.length} movies from TMDB (or mock)`);

  const rows = [
    { name: 'A', category: 'STANDARD', price: 9.50 },
    { name: 'B', category: 'STANDARD', price: 9.50 },
    { name: 'C', category: 'PREMIUM',  price: 12.00 },
    { name: 'D', category: 'VIP',      price: 18.00 }
  ];

  movies.forEach(movie => {
    rows.forEach(row => {
      for (let i = 1; i <= 8; i++) {
        createSeat(movie.id, `${row.name}${i}`, row.category, row.price);
      }
    });
  });
  console.log(`[server] Seeded 32 seats per movie room`);
})();

httpServer.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});

module.exports = { app, httpServer, io };
