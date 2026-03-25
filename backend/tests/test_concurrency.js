/**
 * test_concurrency.js
 * ───────────────────
 * Simulates two clients racing to reserve the same seat.
 *
 * Scenario:
 *   1. Client A and Client B both try to reserve seat "A1" simultaneously.
 *   2. Only one succeeds (the other gets an error).
 *   3. The winner confirms the purchase after 2 seconds.
 *   4. Both clients watch seat_updated broadcasts throughout.
 *   5. A third observer socket shows what an innocent bystander sees.
 *
 * Run AFTER starting the server:
 *   node src/server.js          (in one terminal)
 *   node tests/test_concurrency.js  (in another)
 *
 * Install client dep if needed:
 *   npm install socket.io-client
 */

const { io: ioc } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
const SEAT_ID    = 'A1';
const TTL_MS     = 3 * 60 * 1000; // must match server TTL

// ── Utilities ─────────────────────────────────────────────────────────────────

const ts  = () => new Date().toISOString().slice(11, 23);  // HH:MM:SS.mmm
const log = (label, ...args) =>
  console.log(`[${ts()}] [${label}]`, ...args);

function createClient(name) {
  const socket = ioc(SERVER_URL, { transports: ['websocket'] });

  socket.on('connect', () =>
    log(name, `✅ Connected  (id: ${socket.id})`)
  );
  socket.on('disconnect', () =>
    log(name, `❌ Disconnected`)
  );
  socket.on('connect_error', (err) =>
    log(name, `Connection error: ${err.message}`)
  );

  // Every client listens to seat_updated broadcasts
  socket.on('seat_updated', (seat) =>
    log(name, `📡 seat_updated → id=${seat.id} status=${seat.status} reservedBy=${seat.reservedBy} expiresAt=${seat.expiresAt}`)
  );

  return socket;
}

// ── Main scenario ─────────────────────────────────────────────────────────────

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  log('test', '=== Concurrency test starting ===');
  log('test', `Target seat: ${SEAT_ID}  |  TTL: ${TTL_MS / 1000}s`);
  log('test', '');

  const clientA   = createClient('ClientA');
  const clientB   = createClient('ClientB');
  const observer  = createClient('Observer');

  // Wait for connections
  await wait(800);

  // ── Step 1: Both clients try to reserve the same seat simultaneously ─────
  log('test', '─── Step 1: ClientA and ClientB race to reserve A1 ───');

  let winnerName   = null;
  let winnerSocket = null;

  const reservePromise = (name, socket) =>
    new Promise((resolve) => {
      socket.emit('reserve_seat', { seatId: SEAT_ID, userId: name });
      socket.once('reserve_seat_response', (res) => {
        if (res.success) {
          log(name, `🏆 reserve_seat SUCCESS — expiresAt: ${res.seat.expiresAt}`);
        } else {
          log(name, `🚫 reserve_seat FAILED  — ${res.error}`);
        }
        resolve({ name, socket, res });
      });
    });

  // Fire both at the same time
  const [resA, resB] = await Promise.all([
    reservePromise('ClientA', clientA),
    reservePromise('ClientB', clientB),
  ]);

  for (const { name, socket, res } of [resA, resB]) {
    if (res.success) { winnerName = name; winnerSocket = socket; }
  }

  if (!winnerName) {
    log('test', '⚠️  Neither client could reserve the seat. Is the server seeded?');
    process.exit(1);
  }

  log('test', '');

  // ── Step 2: Winner confirms purchase after 2 seconds ─────────────────────
  log('test', `─── Step 2: ${winnerName} confirms purchase in 2 s ───`);
  await wait(2000);

  winnerSocket.emit('confirm_purchase', { seatId: SEAT_ID, userId: winnerName });

  await new Promise((resolve) => {
    winnerSocket.once('confirm_purchase_response', (res) => {
      if (res.success) {
        log(winnerName, `✅ confirm_purchase SUCCESS — status: ${res.seat.status}`);
      } else {
        log(winnerName, `❌ confirm_purchase FAILED  — ${res.error}`);
      }
      resolve();
    });
  });

  await wait(500);
  log('test', '');

  // ── Step 3: Ask for current state of all seats ────────────────────────────
  log('test', '─── Step 3: Observer requests all seats ───');
  observer.emit('get_all_seats');
  await new Promise((resolve) => {
    observer.once('all_seats', ({ seats }) => {
      const target = seats.find((s) => s.id === SEAT_ID);
      log('Observer', `Seat ${SEAT_ID} → status: ${target?.status} reservedBy: ${target?.reservedBy}`);
      log('Observer', `Total seats reported: ${seats.length}`);
      resolve();
    });
  });

  log('test', '');

  // ── Step 4: Watch for auto-release (if a different seat was not purchased) ─
  log('test', `─── Step 4: Watching for auto-release broadcast (waits up to TTL=${TTL_MS/1000}s) ───`);
  log('test', '    (Ctrl+C to exit early — the seat was already sold in this run)');

  // The current seat is SOLD so won't auto-release, but we leave sockets open
  // so the user can observe any other seat_updated events in real time.
  // Auto-exit after TTL + 5 s buffer.
  await wait(Math.min(TTL_MS + 5000, 20_000)); // cap at 20 s for demo purposes

  log('test', '=== Test complete — closing clients ===');
  clientA.disconnect();
  clientB.disconnect();
  observer.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[test] Unhandled error:', err);
  process.exit(1);
});
