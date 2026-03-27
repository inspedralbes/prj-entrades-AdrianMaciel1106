/**
 * test_multi_event.js
 * ───────────────────
 * Verifies that events are independent.
 * Reserving a seat in Event 1 should NOT notify or affect Event 2.
 */

const { io: ioc } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== Multi-Event Isolation Test ===');

  const socketEv1 = ioc(SERVER_URL, { transports: ['websocket'] });
  const socketEv2 = ioc(SERVER_URL, { transports: ['websocket'] });

  let ev2ReceivedUpdate = false;

  socketEv1.on('connect', () => {
    console.log('[Ev1] Connected');
    socketEv1.emit('join_event', { eventId: '1' });
  });

  socketEv2.on('connect', () => {
    console.log('[Ev2] Connected');
    socketEv2.emit('join_event', { eventId: '2' });
  });

  socketEv2.on('seat_updated', (seat) => {
    console.log('[Ev2] 🚨 ERROR: Received update for seat!', seat);
    ev2ReceivedUpdate = true;
  });

  await wait(1000);

  console.log('[Ev1] Reserving A1...');
  socketEv1.emit('reserve_seat', { eventId: '1', seatId: 'A1', userId: 'User1' });

  await new Promise((resolve) => {
    socketEv1.once('reserve_seat_response', (res) => {
      console.log('[Ev1] Reserve response:', res.success ? 'SUCCESS' : 'FAILED');
      resolve();
    });
  });

  await wait(1000);

  if (ev2ReceivedUpdate) {
    console.error('❌ FAILED: Event 2 received an update from Event 1');
  } else {
    console.log('✅ SUCCESS: Event 2 remained isolated');
  }

  console.log('[Ev2] Checking if A1 is available in Event 2...');
  socketEv2.emit('get_all_seats', { eventId: '2' });
  await new Promise((resolve) => {
    socketEv2.once('all_seats', ({ seats }) => {
      const a1 = seats.find(s => s.id === 'A1');
      if (a1 && a1.status === 'AVAILABLE') {
        console.log('✅ SUCCESS: A1 is AVAILABLE in Event 2');
      } else {
        console.error('❌ FAILED: A1 is NOT AVAILABLE in Event 2', a1);
      }
      resolve();
    });
  });

  socketEv1.disconnect();
  socketEv2.disconnect();
  process.exit(ev2ReceivedUpdate ? 1 : 0);
}

run().catch(console.error);
