/**
 * seat.socket.js
 * ──────────────
 * Registers Socket.IO event handlers for each connected client.
 *
 * Events received from clients:
 *   reserve_seat     { seatId, userId }
 *   confirm_purchase { seatId, userId }
 *   get_all_seats    (no payload)
 *
 * Events emitted to clients:
 *   reserve_seat_response     { success, seat?, error? }   → only to sender
 *   confirm_purchase_response { success, seat?, error? }   → only to sender
 *   all_seats                 { seats[] }                  → only to sender
 *   seat_updated              { seat }                     → ALL clients (broadcast)
 */

const {
  reserveSeat,
  confirmPurchase,
  getAllSeats,
  serializeSeat,
} = require('./seient.model');

const TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Register all seat events for one socket connection.
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
function registerSeatEvents(socket, io) {

  // ── reserve_seat ──────────────────────────────────────────────────────────
  socket.on('reserve_seat', ({ seatId, userId } = {}) => {
    if (!seatId || !userId) {
      return socket.emit('reserve_seat_response', {
        success: false,
        error: 'seatId and userId are required',
      });
    }

    // Pass io so the model can broadcast when the reservation auto-expires
    const result = reserveSeat(seatId, userId, TTL_MS, io);

    // Respond to the requesting client
    socket.emit('reserve_seat_response', {
      success: result.success,
      seat:    result.seat  ? serializeSeat(result.seat) : undefined,
      error:   result.error,
    });

    // Broadcast new state to ALL clients immediately
    if (result.success) {
      io.emit('seat_updated', serializeSeat(result.seat));
      console.log(`[socket] reserve_seat   → ${seatId} by ${userId} (expires ${result.seat.expiresAt.toISOString()})`);
    } else {
      console.log(`[socket] reserve_seat   ✗ ${seatId}: ${result.error}`);
    }
  });

  // ── confirm_purchase ──────────────────────────────────────────────────────
  socket.on('confirm_purchase', ({ seatId, userId } = {}) => {
    if (!seatId || !userId) {
      return socket.emit('confirm_purchase_response', {
        success: false,
        error: 'seatId and userId are required',
      });
    }

    const result = confirmPurchase(seatId, userId);

    // Respond to the requesting client
    socket.emit('confirm_purchase_response', {
      success: result.success,
      seat:    result.seat  ? serializeSeat(result.seat) : undefined,
      error:   result.error,
    });

    // Broadcast new state to ALL clients
    if (result.success) {
      io.emit('seat_updated', serializeSeat(result.seat));
      console.log(`[socket] confirm_purchase → ${seatId} SOLD to ${userId}`);
    } else {
      console.log(`[socket] confirm_purchase ✗ ${seatId}: ${result.error}`);
    }
  });

  // ── get_all_seats ─────────────────────────────────────────────────────────
  socket.on('get_all_seats', () => {
    const allSeats = getAllSeats().map(serializeSeat);
    socket.emit('all_seats', { seats: allSeats });
    console.log(`[socket] get_all_seats → sent ${allSeats.length} seats to ${socket.id}`);
  });
}

module.exports = { registerSeatEvents };
