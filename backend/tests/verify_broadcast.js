import { io as ioc } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';
const EVENT_ID = '101';
const SEAT_ID = 'B1';

async function verifyBroadcast() {
  console.log('--- Iniciant verificació de Broadcast (T4) ---');
  
  const client1 = ioc(SERVER_URL, { forceNew: true });
  const client2 = ioc(SERVER_URL, { forceNew: true });

  let broadcastReceived = false;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client1.disconnect();
      client2.disconnect();
      reject(new Error('Timeout: El Client 2 no ha rebut el broadcast de reserva.'));
    }, 10000);

    client1.on('connect', () => {
      console.log('Client 1 connectat.');
      client1.emit('join_event', { eventId: EVENT_ID });
    });

    client2.on('connect', () => {
      console.log('Client 2 connectat.');
      client2.emit('join_event', { eventId: EVENT_ID });
    });

    client2.on('seat_updated', (seat) => {
      console.log(`[Observer] Rebut seat_updated: id=${seat.id}, status=${seat.status}`);
      if (seat.id === SEAT_ID && seat.status === 'RESERVED' && seat.reservedBy === 'User1') {
        console.log(`✅ TEST EXITÓS: Client 2 ha rebut l'actualització del seient ${seat.id} per part de User1.`);
        broadcastReceived = true;
        clearTimeout(timeout);
        client1.disconnect();
        client2.disconnect();
        resolve(true);
      }
    });

    // Donem un temps perquè ambdós s'uneixin a la sala
    setTimeout(() => {
      console.log(`Client 1 intentant reservar ${SEAT_ID}...`);
      client1.emit('reserve_seat', { eventId: EVENT_ID, seatId: SEAT_ID, userId: 'User1' });
    }, 2000);
  });
}

verifyBroadcast().then(() => {
  console.log('Verificació completada amb èxit.');
  process.exit(0);
}).catch(err => {
  console.error('❌ ERROR en la verificació:', err.message);
  process.exit(1);
});
