import { io as ioc } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';
const EVENT_ID = '101';
const SEAT_ID = 'C1';
const USER_ID = `test_user_${Math.random().toString(36).substr(2, 5)}`;

async function verifyFullFlow() {
  console.log(`--- Iniciant Prova de Flux Complet: ${SEAT_ID} ---`);
  
  const client = ioc(SERVER_URL);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client.disconnect();
      reject(new Error('Timeout en el flux de compra.'));
    }, 15000);

    client.on('connect', () => {
      console.log('1. Connectat al servidor.');
      client.emit('join_event', { eventId: EVENT_ID });
    });

    // Pas 2: Reserva
    setTimeout(() => {
      console.log(`2. Intentant reservar seient ${SEAT_ID}...`);
      client.emit('reserve_seat', { eventId: EVENT_ID, seatId: SEAT_ID, userId: USER_ID });
    }, 1000);

    client.on('reserve_seat_response', (res) => {
      if (res.success) {
        console.log(`3. RESERVA ÈXIT: El seient està bloquejat fins a ${res.seat.expiresAt}`);
        
        // Pas 4: Confirmació de compra
        console.log('4. Enviant confirmació de compra...');
        client.emit('confirm_purchase', { eventId: EVENT_ID, seatId: SEAT_ID, userId: USER_ID });
      } else {
        reject(new Error(`Error en reserva: ${res.error}`));
      }
    });

    client.on('confirm_purchase_response', (res) => {
      if (res.success) {
        console.log('5. COMPRA CONFIRMADA: Resposta positiva del servidor.');
      } else {
        reject(new Error(`Error en confirmació: ${res.error}`));
      }
    });

    client.on('seat_updated', (seat) => {
      if (seat.id === SEAT_ID && seat.status === 'SOLD') {
        console.log(`✅ TEST FINAL EXITÓS: El seient ${SEAT_ID} ha passat a estat SOLD globalment.`);
        clearTimeout(timeout);
        client.disconnect();
        resolve(true);
      }
    });
  });
}

verifyFullFlow().then(() => {
  console.log('--- Flux complet verificat correctament ---');
  process.exit(0);
}).catch(err => {
  console.error('❌ ERROR en la prova final:', err.message);
  process.exit(1);
});
