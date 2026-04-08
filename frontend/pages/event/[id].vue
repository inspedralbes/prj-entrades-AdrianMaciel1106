<template>
  <div class="event-page">
    <header class="event-header" :style="event?.backdrop ? `background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(${event.backdrop})` : ''">
      <NuxtLink to="/" class="back-link">← Tornar a la llista</NuxtLink>
      <div v-if="event" class="event-title-box movie-title-box">
        <div class="movie-meta" v-if="event.rating">
          <span class="rating">★ {{ event.rating.toFixed(1) }}</span>
          <span class="divider">|</span>
          <span class="date">{{ event.data }}</span>
        </div>
        <h1>{{ event.nom }}</h1>
        <p class="synopsis" v-if="event.sinopsi">{{ event.sinopsi }}</p>
        <p class="location">🎬 {{ event.lloc }}</p>
      </div>
    </header>

    <div class="seat-map-container">
      <div class="map-header">
        <h2>Mapa de Seients</h2>
        <div class="purchase-info-bar" v-if="reservedSeat">
          <div class="info">
            <span class="pulse"></span>
            Tenim reservat el seient <strong>{{ reservedSeat.id }}</strong> ({{ reservedSeat.price }}€)
            <span class="timer-badge" v-if="eventStore.timer > 0">{{ formattedTimer }}</span>
          </div>
          <button class="btn-purchase" @click="goToCheckout">Finalitzar Compra</button>
        </div>
        <div v-else class="legend">
          <div class="legend-item"><span class="dot available"></span> Lliure</div>
          <div class="legend-item"><span class="dot reserved"></span> Reservat</div>
          <div class="legend-item"><span class="dot sold"></span> Venut</div>
        </div>
      </div>

      <div class="map-container-inner">
        <div class="screen">PANTALLA</div>
        
        <div class="seats-grid">
          <Seient 
            v-for="seat in seats" 
            :key="seat.id"
            v-bind="seat"
            @select="handleSelectSeat"
          />
        </div>
      </div>

      <div class="map-footer">
        <div class="legend">
          <div class="legend-group">
            <span class="label">Disponibilitat:</span>
            <div class="legend-item"><span class="dot available"></span> Lliure</div>
            <div class="legend-item"><span class="dot reserved"></span> Reservat</div>
            <div class="legend-item"><span class="dot sold"></span> Venut</div>
          </div>
          <div class="legend-group">
            <span class="label">Categories:</span>
            <div class="legend-item"><span class="sq standard"></span> Estàndard (15€)</div>
            <div class="legend-item"><span class="sq premium"></span> Premium (30€)</div>
            <div class="legend-item"><span class="sq vip"></span> VIP (60€)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Overlay -->
    <Transition name="fade">
      <div v-if="eventStore.lastNotification" class="notification" :class="eventStore.lastNotification.type">
        {{ eventStore.lastNotification.message }}
      </div>
    </Transition>

    <!-- Modal de Confirmació -->
    <Transition name="modal">
      <div v-if="selectedSeat" class="modal-overlay" @click.self="selectedSeat = null">
        <div class="modal-content">
          <div class="modal-header">
            <span class="category-badge" :class="selectedSeat.category.toLowerCase()">{{ selectedSeat.category }}</span>
            <h3>Confirmar Reserva: {{ selectedSeat.id }}</h3>
          </div>
          <div class="price-row">
            <span class="label">Preu:</span>
            <span class="value">{{ selectedSeat.price }}€</span>
          </div>
          <p class="timer-info">Tens {{ eventStore.timer }} segons per confirmar la compra després de reservar.</p>
          <div class="modal-actions">
            <button class="btn secondary" @click="selectedSeat = null">Cancel·lar</button>
            <button class="btn primary" @click="processReservation">Reservar Ara</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal d'Èxit -->
    <Transition name="modal">
      <div v-if="purchasedSeat" class="modal-overlay success-overlay" @click.self="purchasedSeat = null">
        <div class="modal-content success-content">
          <div class="success-icon">✓</div>
          <h3>Compra d'Èxit!</h3>
          <p>Has adquirit l'entrada per a <strong>{{ event?.nom }}</strong>.</p>
          <div class="ticket-summary">
            <div class="row"><span>Seient:</span> <strong>{{ purchasedSeat.id }}</strong></div>
            <div class="row"><span>Preu:</span> <strong>{{ purchasedSeat.price }}€</strong></div>
          </div>
          <button class="btn primary" @click="purchasedSeat = null">Tancar</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()

// Computed per facilitar l'accés
const event = computed(() => eventStore.eventInfo)
const seats = computed(() => eventStore.seats)
const reservedSeat = computed(() => eventStore.selectedSeats[0]) // Agafem el primer com a exemple d'UI

const selectedSeatInternal = ref(null) // Seient clicat però no reservat encara (modal)

onMounted(async () => {
  const eventId = route.params.id
  
  try {
    // 1. Carregar dades inicials
    const res = await fetch(`http://localhost:3001/api/events/${eventId}/seats`)
    const data = await res.json()
    
    // 2. Carregar metadata de l'esdeveniment
    const eventsRes = await fetch('http://localhost:3001/api/events')
    const eventsData = await eventsRes.json()
    const currentEvent = eventsData.events.find((e) => e.id === eventId)
    
    if (currentEvent) {
      eventStore.setEventInfo(currentEvent)
    }
    
    // 3. Inicialitzar Sockets a través del Store
    eventStore.initSocket(eventId)

  } catch (err) {
    eventStore.showNotification('Error connectant amb el servidor', 'error')
  }
})

onUnmounted(() => {
  eventStore.resetStore()
})

const handleSelectSeat = (id) => {
  const seat = seats.value.find(s => s.id === id)
  if (seat && seat.status === 'available') {
    selectedSeatInternal.value = seat
  }
}

const processReservation = () => {
  if (selectedSeatInternal.value) {
    eventStore.reserveSeat(selectedSeatInternal.value.id)
    selectedSeatInternal.value = null
  }
}

const goToCheckout = () => {
  if (!reservedSeat.value) return
  
  router.push({
    path: '/event/checkout',
    query: {
      eventId: route.params.id,
      seatId: reservedSeat.value.id,
      price: reservedSeat.value.price,
      category: reservedSeat.value.category
    }
  })
}

// Formatejar el temps del temporitzador (mm:ss)
const formattedTimer = computed(() => {
  const minutes = Math.floor(eventStore.timer / 60)
  const seconds = eventStore.timer % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.event-page {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.event-header {
  margin-bottom: -40px;
  padding: 60px 40px 100px;
  background-size: cover;
  background-position: center;
  border-radius: 0 0 40px 40px;
  position: relative;
  overflow: hidden;
}

.movie-title-box h1 {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 10px 0;
  color: white;
  text-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fbbf24;
  font-weight: 800;
  font-size: 1rem;
}

.movie-meta .divider { color: rgba(255,255,255,0.3); }
.movie-meta .date { color: #d1d5db; }

.synopsis {
  max-width: 800px;
  color: #d1d5db;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 20px 0;
}

.location {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 600;
}

.back-link {
  color: white;
  text-decoration: none;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 30px;
  background: rgba(255,255,255,0.1);
  padding: 8px 16px;
  border-radius: 100px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.2s;
}

.back-link:hover {
  background: rgba(255,255,255,0.2);
  transform: translateX(-5px);
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
  flex-direction: column;
  gap: 20px;
}

.legend-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.legend-group .label {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #9ca3af;
  margin-right: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
}

.dot, .sq {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.sq { border-radius: 3px; }

.dot.available { background: #10b981; }
.dot.reserved { background: #f59e0b; }
.dot.sold { background: #ef4444; }

.sq.standard { background: #10b981; }
.sq.premium { background: #6366f1; }
.sq.vip { background: #a855f7; }

.map-container-inner {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen {
  width: 90%;
  height: 8px;
  background: linear-gradient(to bottom, #fff, #9ca3af);
  border-radius: 100px;
  margin-bottom: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1em;
  box-shadow: 0 15px 40px rgba(255,255,255,0.2);
  position: relative;
}

.screen::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 5%;
  right: 5%;
  height: 200px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1), transparent);
  clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
  pointer-events: none;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(5, 50px);
  gap: 15px;
  justify-items: center;
}

.map-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f3f4f6;
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
.notification.info { background: #3b82f6; }

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
  border-radius: 32px;
  max-width: 400px;
  width: 90%;
  text-align: left;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 10px 0 0 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.category-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  color: white;
}

.category-badge.standard { background: #10b981; }
.category-badge.premium { background: #6366f1; }
.category-badge.vip { background: #a855f7; }

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 12px;
}

.price-row .label { font-weight: 600; color: #6b7280; }
.price-row .value { font-size: 1.25rem; font-weight: 800; color: #10b981; }

.timer-info {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 30px;
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

/* Purchase Bar */
.purchase-info-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fef3c7;
  padding: 8px 20px;
  border-radius: 12px;
  border: 1px solid #fcd34d;
  animation: slideIn 0.3s ease-out;
}

.purchase-info-bar .info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: #92400e;
}

.timer-badge {
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pulse {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.btn-purchase {
  background: #f59e0b;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-purchase:hover {
  background: #d97706;
  transform: scale(1.05);
}

/* Success Modal */
.success-overlay { background: rgba(16, 185, 129, 0.2); }
.success-content { text-align: center; }
.success-icon {
  width: 60px;
  height: 60px;
  background: #10b981;
  color: white;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 20px;
}

.ticket-summary {
  margin: 20px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px dashed #d1d5db;
}

.ticket-summary .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
