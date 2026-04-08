/**
 * seat.socket.js
 */

import {
  reserveSeat,
  confirmPurchase,
  getAllSeats,
  serializeSeat,
} from './seient.model.js';

const TTL_MS = 3 * 60 * 1000;

function registerSeatEvents(socket, io) {
  // join_event
  socket.on('join_event', ({ eventId }) => {
    if (!eventId) return;
    socket.join(eventId);
    console.log(`[socket] Client ${socket.id} joined room for event ${eventId}`);
    
    const allSeats = getAllSeats(eventId);
    socket.emit('all_seats', { seats: allSeats.map(serializeSeat) });
  });

  // reserve_seat
  socket.on('reserve_seat', ({ eventId, seatId, userId } = {}) => {
    console.log(`[socket] Reserve attempt: ${eventId}:${seatId} by ${userId}`);
    if (!eventId || !seatId || !userId) return;

    const result = reserveSeat(eventId, seatId, userId, TTL_MS, io);
    console.log(`[socket] Reserve result for ${seatId}: success=${result.success}, error=${result.error}`);
    socket.emit('reserve_seat_response', {
      success: result.success,
      seat:    result.seat ? serializeSeat(result.seat) : undefined,
      error:   result.error,
    });

    if (result.success) {
      io.to(eventId).emit('seat_updated', serializeSeat(result.seat));
    }
  });

  // confirm_purchase
  socket.on('confirm_purchase', ({ eventId, seatId, userId } = {}) => {
    if (!eventId || !seatId || !userId) return;

    const result = confirmPurchase(eventId, seatId, userId);
    socket.emit('confirm_purchase_response', {
      success: result.success,
      seat:    result.seat ? serializeSeat(result.seat) : undefined,
      error:   result.error,
    });

    if (result.success) {
      io.to(eventId).emit('seat_updated', serializeSeat(result.seat));
    }
  });

  // get_all_seats
  socket.on('get_all_seats', ({ eventId } = {}) => {
    if (!eventId) return;
    const allSeats = getAllSeats(eventId).map(serializeSeat);
    socket.emit('all_seats', { seats: allSeats });
  });
}

export { registerSeatEvents };
