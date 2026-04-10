import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

import { registerSeatEvents } from './modules/seients/seient.socket.js';
import { 
  createSeat, 
  getAllSeats, 
  releaseExpiredReservations, 
  serializeSeat,
  confirmPurchase,
  deleteSeats
} from './modules/seients/seient.model.js';
import { createEvent, getAllEvents, deleteEvent } from './modules/events/event.model.js';
import { getNowPlayingMovies } from './modules/movies/movie.service.js';
import { saveToDisk, loadFromDisk } from './utils/storage.js';

const PORT = Number(process.env.PORT) || 3001;

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
const frontendUrl = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: frontendUrl }));

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization;
  const validToken = process.env.ADMIN_TOKEN || 'flowpass-admin';
  if (token !== `Bearer ${validToken}`) {
    return res.status(403).json({ error: 'Unauthorized Access' });
  }
  next();
};
app.use(express.json());

app.get('/', (_req, res) =>
  res.json({ message: 'Ticket server running 🎟️', status: 'ready', port: PORT })
);

app.get('/api/events', (_req, res) => {
  res.json({ events: getAllEvents() });
});

app.get('/api/events/:eventId/seats', (req, res) => {
  const { eventId } = req.params;
  const seats = getAllSeats(eventId);
  res.json({ eventId, seats: seats.map(serializeSeat) });
});

/**
 * POST /api/events
 * Crea un nuevo evento manual como administrador y genera sus 32 asientos por defecto.
 */
app.post('/api/events', adminAuth, async (req, res) => {
  const { nom, data, lloc, imatge, backdrop, sinopsi, rating } = req.body;
  if (!nom || !data) {
    return res.status(400).json({ error: 'Noms i data son requerits' });
  }

  const newId = `evt_${Date.now()}`;
  const newEvent = createEvent(newId, nom, data, lloc || 'Sala Principal', imatge || '/images/default.png', backdrop || '', sinopsi || '', rating || 0);

  const rows = [
    { name: 'A', category: 'STANDARD', price: 9.50 },
    { name: 'B', category: 'STANDARD', price: 9.50 },
    { name: 'C', category: 'PREMIUM',  price: 12.00 },
    { name: 'D', category: 'VIP',      price: 18.00 }
  ];

  rows.forEach(row => {
    for (let i = 1; i <= 8; i++) {
      createSeat(newId, `${row.name}${i}`, row.category, row.price);
    }
  });

  await persistData();
  return res.status(201).json({ success: true, event: newEvent });
});

/**
 * DELETE /api/events/:eventId
 * Elimina un evento existente.
 */
app.delete('/api/events/:eventId', adminAuth, async (req, res) => {
  const { eventId } = req.params;
  deleteEvent(eventId);
  deleteSeats(eventId);
  await persistData();
  
  // Avisar por web sockets de que se ha borrado el evento (opcional, todos los del home)
  io.emit('event_deleted', { eventId });
  
  return res.json({ success: true });
});
/**
 * POST /api/events/:eventId/compres (Legacy/REST fallback)
 */
app.post('/api/events/:eventId/compres', async (req, res) => {
  const { eventId } = req.params;
  const { seatId, userId } = req.body;

  if (!seatId || !userId) {
    return res.status(400).json({ error: 'seatId and userId are required' });
  }

  const result = confirmPurchase(eventId, seatId, userId);

  if (result.success) {
    io.to(eventId).emit('seat_updated', serializeSeat(result.seat));
    await persistData();
    return res.json({ success: true, seat: serializeSeat(result.seat) });
  } else {
    return res.status(400).json({ success: false, error: result.error });
  }
});

// ── Persistence Helpers ──────────────────────────────────────────────────────
async function persistData() {
  const data = {
    events: getAllEvents(),
    seats: {}
  };
  
  data.events.forEach(e => {
    data.seats[e.id] = getAllSeats(e.id);
  });
  
  await saveToDisk(data);
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: { origin: frontendUrl, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log(`[socket] Connected    ${socket.id}`);
  registerSeatEvents(socket, io);
  socket.on('disconnect', () => console.log(`[socket] Disconnected ${socket.id}`));
});

// Periodic sweep for expired reservations
setInterval(() => {
  const released = releaseExpiredReservations();
  if (released.length > 0) {
    released.forEach((seat) => {
      io.to(seat.eventId).emit('seat_updated', serializeSeat(seat));
      console.log(`[sweep] Seat ${seat.eventId}:${seat.id} released`);
    });
    persistData();
  }
}, 30000);

// ── Startup ──────────────────────────────────────────────────────────────────
(async () => {
  // Try to load from disk first
  const savedData = await loadFromDisk();
  
  if (savedData && savedData.events.length > 0) {
    console.log(`[server] Loading ${savedData.events.length} events from disk...`);
    savedData.events.forEach(e => {
      createEvent(e.id, e.nom, e.data, e.lloc, e.imatge, e.backdrop, e.sinopsi, e.rating);
      if (savedData.seats[e.id]) {
        savedData.seats[e.id].forEach(s => {
          const seat = createSeat(e.id, s.id, s.category, s.price);
          // Restore status if it was SOLD
          if (s.status === 'SOLD') seat.status = 'SOLD';
        });
      }
    });
  } else {
    // Seed from TMDB if empty
    console.log('[server] No saved data found, seeding from TMDB...');
    const movies = await getNowPlayingMovies();
    
    movies.forEach(movie => {
      createEvent(movie.id, movie.nom, movie.data, movie.lloc, movie.imatge, movie.backdrop, movie.sinopsi, movie.rating);
      
      const rows = [
        { name: 'A', category: 'STANDARD', price: 9.50 },
        { name: 'B', category: 'STANDARD', price: 9.50 },
        { name: 'C', category: 'PREMIUM',  price: 12.00 },
        { name: 'D', category: 'VIP',      price: 18.00 }
      ];

      rows.forEach(row => {
        for (let i = 1; i <= 8; i++) {
          createSeat(movie.id, `${row.name}${i}`, row.category, row.price);
        }
      });
    });
    
    await persistData();
    console.log(`[server] Seeded ${movies.length} movies and 32 seats per room`);
  }

  httpServer.listen(PORT, () => {
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
})();

export { app, httpServer, io };
