/**
 * seat.model.js
 * ─────────────
 * In-memory seat store.
 * Status lifecycle:  AVAILABLE → RESERVED → SOLD
 *                           └──(timeout)──→ AVAILABLE
 */

// ── Constants ────────────────────────────────────────────────────────────────

const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED:  'RESERVED',
  SOLD:      'SOLD',
};

// In-memory store  Map<eventId, Map<seatId, Seat>>
const seatsByEvent = new Map();

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Seat
 * @property {string}      id          - Unique seat identifier (e.g. "A1")
 * @property {string}      eventId     - ID of the event this seat belongs to
 * @property {string}      category    - STANDARD | PREMIUM | VIP
 * @property {number}      price       - Price of the seat
 * @property {string}      status      - AVAILABLE | RESERVED | SOLD
 * @property {string|null} reservedBy  - userId who holds the reservation
 * @property {Date|null}   expiresAt   - When the reservation expires (null when AVAILABLE/SOLD)
 */

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Serialize a Seat for JSON transmission (Date → ISO string).
 * @param {Seat} seat
 * @returns {Object}
 */
function serializeSeat(seat) {
  return {
    ...seat,
    expiresAt: seat.expiresAt ? seat.expiresAt.toISOString() : null,
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────

/**
 * Create (or reset) a seat to AVAILABLE for a specific event.
 * @param {string} eventId
 * @param {string} id
 * @param {string} category
 * @param {number} price
 * @returns {Seat}
 */
function createSeat(eventId, id, category = 'STANDARD', price = 15) {
  if (!seatsByEvent.has(eventId)) {
    seatsByEvent.set(eventId, new Map());
  }
  const eventSeats = seatsByEvent.get(eventId);
  const seat = { 
    id, 
    eventId, 
    category, 
    price, 
    status: SEAT_STATUS.AVAILABLE, 
    reservedBy: null, 
    expiresAt: null 
  };
  eventSeats.set(id, seat);
  return seat;
}

/**
 * Get a single seat by eventId and seatId.
 * @param {string} eventId
 * @param {string} id
 * @returns {Seat|undefined}
 */
function getSeat(eventId, id) {
  const eventSeats = seatsByEvent.get(eventId);
  return eventSeats ? eventSeats.get(id) : undefined;
}

/**
 * Get all seats for a specific event.
 * @param {string} eventId
 * @returns {Seat[]}
 */
function getAllSeats(eventId) {
  const eventSeats = seatsByEvent.get(eventId);
  return eventSeats ? Array.from(eventSeats.values()) : [];
}

// ── Business logic ────────────────────────────────────────────────────────

/**
 * Reserve a seat for a user.
 * - Only succeeds when seat is AVAILABLE.
 * - Sets status → RESERVED, records reservedBy and expiresAt.
 * - Schedules a setTimeout that auto-releases the seat when ttlMs elapses
 *   and notifies all connected clients via `io` if provided.
 *
 * @param {string} eventId
 * @param {string} id
 * @param {string} userId
 * @param {number} [ttlMs=180000]  - Reservation TTL (default 3 min)
 * @param {import('socket.io').Server|null} [io=null]
 * @returns {{ success: boolean, seat?: Seat, error?: string }}
 */
function reserveSeat(eventId, id, userId, ttlMs = 3 * 60 * 1000, io = null) {
  const eventSeats = seatsByEvent.get(eventId);
  if (!eventSeats) return { success: false, error: `Event ${eventId} not found` };

  const seat = eventSeats.get(id);
  if (!seat) return { success: false, error: `Seat ${id} not found in event ${eventId}` };
  
  if (seat.status !== SEAT_STATUS.AVAILABLE) {
    return { success: false, error: `Seat ${id} is already ${seat.status}` };
  }

  seat.status     = SEAT_STATUS.RESERVED;
  seat.reservedBy = userId;
  seat.expiresAt  = new Date(Date.now() + ttlMs);

  // Auto-release after TTL
  setTimeout(() => {
    // Only release if still reserved (not yet purchased) and actually expired
    if (seat.status === SEAT_STATUS.RESERVED && seat.expiresAt && seat.expiresAt <= new Date()) {
      seat.status     = SEAT_STATUS.AVAILABLE;
      seat.reservedBy = null;
      seat.expiresAt  = null;

      console.log(`[model] Seat ${eventId}:${id} reservation expired — released to AVAILABLE`);

      if (io) {
        // Broadcast to the event-specific room
        io.to(eventId).emit('seat_updated', serializeSeat(seat));
      }
    }
  }, ttlMs);

  return { success: true, seat };
}

/**
 * Confirm (sell) a seat that is currently RESERVED by the same user.
 * - Validates: seat exists, status is RESERVED, reservedBy matches, not expired.
 * - On success: status → SOLD, clears expiresAt.
 *
 * @param {string} eventId
 * @param {string} id
 * @param {string} userId
 * @returns {{ success: boolean, seat?: Seat, error?: string }}
 */
function confirmPurchase(eventId, id, userId) {
  const eventSeats = seatsByEvent.get(eventId);
  if (!eventSeats) return { success: false, error: `Event ${eventId} not found` };

  const seat = eventSeats.get(id);
  if (!seat) return { success: false, error: `Seat ${id} not found in event ${eventId}` };

  if (seat.status !== SEAT_STATUS.RESERVED) {
    return { success: false, error: `Seat ${id} is not reserved` };
  }
  if (seat.reservedBy !== userId) {
    return { success: false, error: `Seat ${id} is reserved by a different user` };
  }
  if (seat.expiresAt && seat.expiresAt < new Date()) {
    // Expired — clean up and refuse
    seat.status     = SEAT_STATUS.AVAILABLE;
    seat.reservedBy = null;
    seat.expiresAt  = null;
    return { success: false, error: `Reservation for seat ${id} has already expired` };
  }

  seat.status    = SEAT_STATUS.SOLD;
  seat.expiresAt = null; // no expiry once sold
  return { success: true, seat };
}

/**
 * Scan all seats across all events and release any with an expired reservation.
 * Use this as a safety-net sweep (e.g. called every 60 s from the server).
 * @returns {Seat[]} seats that were released
 */
function releaseExpiredReservations() {
  const now      = new Date();
  const released = [];
  for (const eventSeats of seatsByEvent.values()) {
    for (const seat of eventSeats.values()) {
      if (seat.status === SEAT_STATUS.RESERVED && seat.expiresAt && seat.expiresAt < now) {
        seat.status     = SEAT_STATUS.AVAILABLE;
        seat.reservedBy = null;
        seat.expiresAt  = null;
        released.push(seat);
      }
    }
  }
  return released;
}

function deleteSeats(eventId) {
  return seatsByEvent.delete(eventId);
}

// ── Exports ───────────────────────────────────────────────────────────────

export {
  SEAT_STATUS,
  serializeSeat,
  createSeat,
  getSeat,
  getAllSeats,
  reserveSeat,
  confirmPurchase,
  releaseExpiredReservations,
  deleteSeats
};
