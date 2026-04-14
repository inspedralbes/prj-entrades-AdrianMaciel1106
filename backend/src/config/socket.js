/**
 * Socket.IO server factory.
 * Call initSocket(httpServer) once to attach Socket.IO,
 * then use getIO() anywhere to access the instance.
 */

const { Server } = require('socket.io');
const { registerSeatEvents } = require('../modules/seients/seient.socket');
const { releaseExpiredReservations } = require('../modules/seients/seient.model');

let io;

/**
 * Attach Socket.IO to an existing HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',        // adjust in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);

    // Register all seat-related events for this socket
    registerSeatEvents(socket, io);

    socket.on('disconnect', () => {
      console.log(`[socket] Client disconnected: ${socket.id}`);
    });
  });

  // Release expired reservations every 60 seconds and notify all clients
  setInterval(() => {
    const released = releaseExpiredReservations();
    released.forEach((seat) => {
      io.emit('seat_updated', { seat });
      console.log(`[socket] Seat ${seat.id} reservation expired — broadcast seat_updated`);
    });
  }, 60_000);

  return io;
}

/**
 * Get the existing Socket.IO instance (must call initSocket first).
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!io) throw new Error('Socket.IO has not been initialized. Call initSocket(httpServer) first.');
  return io;
}

module.exports = { initSocket, getIO };
