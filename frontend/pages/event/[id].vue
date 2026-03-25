<template>
  <div class="event-page">
    <header class="event-header">
      <NuxtLink to="/" class="back-link">← Tornar a la llista</NuxtLink>
      <div v-if="event" class="event-title-box">
        <h1>{{ event.nom }}</h1>
        <p>{{ event.data }} | {{ event.lloc }}</p>
      </div>
    </header>

    <div class="seat-map-container">
      <div class="map-header">
        <h2>Mapa de Seients</h2>
        <div class="legend">
          <div class="legend-item"><span class="dot available"></span> Lliure</div>
          <div class="legend-item"><span class="dot reserved"></span> Reservat</div>
          <div class="legend-item"><span class="dot sold"></span> Venut</div>
        </div>
      </div>

      <div class="seats-grid">
        <Seient 
          v-for="seat in seats" 
          :key="seat.id"
          v-bind="seat"
          @select="handleSelectSeat"
        />
      </div>
    </div>

    <!-- Feedback Overlay -->
    <Transition name="fade">
      <div v-if="notification" class="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </Transition>

    <!-- Modal de Confirmació -->
    <Transition name="modal">
      <div v-if="selectedSeat" class="modal-overlay" @click.self="selectedSeat = null">
        <div class="modal-content">
          <h3>Confirmar Reserva: {{ selectedSeat.id }}</h3>
          <p>Tens 3 minuts per confirmar la compra després de reservar.</p>
          <div class="modal-actions">
            <button class="btn secondary" @click="selectedSeat = null">Cancel·lar</button>
            <button class="btn primary" @click="processReservation">Reservar Ara</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const route = useRoute()
const { $socket } = useNuxtApp()

const event = ref(null)
const seats = ref([])
const selectedSeat = ref(null)
const notification = ref(null)
const userId = ref(`user_${Math.floor(Math.random() * 1000)}`)

// 1. Fetch event data
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/seats')
    const data = await res.json()
    seats.value = data.seats
    
    // Fetch event metadata (simulated since we don't have a specific getEvent by ID endpoint yet)
    const eventsRes = await fetch('http://localhost:3000/api/events')
    const eventsData = await eventsRes.json()
    event.value = eventsData.events.find(e => e.id === route.params.id)

    // 2. Setup Sockets
    $socket.connect()
    
    $socket.on('seat_updated', (updatedSeat) => {
      const index = seats.value.findIndex(s => s.id === updatedSeat.id)
      if (index !== -1) seats.value[index] = updatedSeat
    })

    $socket.on('reserve_seat_response', (res) => {
      if (res.success) {
        showNotification(`Seient ${res.seat.id} reservat! Tens 3 minuts per confirmar.`, 'success')
        // Auto-confirm for demo purposes after 5 seconds
        setTimeout(() => confirmPurchase(res.seat.id), 5000)
      } else {
        showNotification(res.error, 'error')
      }
    })

    $socket.on('confirm_purchase_response', (res) => {
      if (res.success) {
        showNotification(`Compra confirmada per al seient ${res.seat.id}!`, 'success')
      } else {
        showNotification(res.error, 'error')
      }
    })

  } catch (err) {
    showNotification('Error connectant amb el servidor', 'error')
  }
})

onUnmounted(() => {
  $socket.disconnect()
})

const handleSelectSeat = (id) => {
  const seat = seats.value.find(s => s.id === id)
  if (seat.status === 'AVAILABLE') {
    selectedSeat.value = seat
  }
}

const processReservation = () => {
  $socket.emit('reserve_seat', { seatId: selectedSeat.value.id, userId: userId.value })
  selectedSeat.value = null
}

const confirmPurchase = (seatId) => {
  $socket.emit('confirm_purchase', { seatId, userId: userId.value })
}

const showNotification = (message, type) => {
  notification.value = { message, type }
  setTimeout(() => notification.value = null, 4000)
}
</script>

<style scoped>
.event-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 20px;
}

.event-header {
  margin-bottom: 40px;
}

.event-title-box h1 {
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.event-title-box p {
  color: #6b7280;
  font-size: 1.25rem;
  margin-top: 10px;
}

.seat-map-container {
  background: white;
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.available { background: #10b981; }
.dot.reserved { background: #f59e0b; }
.dot.sold { background: #ef4444; }

.seats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 20px;
  justify-items: center;
}

/* Notifications */
.notification {
  position: fixed;
  bottom: 40px;
  right: 40px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.notification.success { background: #10b981; }
.notification.error { background: #ef4444; }

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.primary { background: #6366f1; color: white; }
.btn.primary:hover { background: #4f46e5; }
.btn.secondary { background: #f3f4f6; color: #4b5563; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: all 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
