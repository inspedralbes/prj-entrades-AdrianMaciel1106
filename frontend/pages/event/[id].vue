<template>
  <div class="event-page">
    <header class="event-header" :style="event?.backdrop ? `background-image: linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 1)), url(${event.backdrop})` : ''">
      <div class="header-overlay"></div>
      <div class="header-top">
        <NuxtLink to="/" class="back-btn">
          <span class="icon">←</span> Tornar
        </NuxtLink>
        <div class="header-actions">
           <div class="live-indicator">
             <span class="dot"></span> LIVE
           </div>
        </div>
      </div>

      <div v-if="event" class="movie-hero-content">
        <div class="movie-meta">
          <span class="rating" v-if="event.rating">★ {{ event.rating.toFixed(1) }}</span>
          <span class="year">{{ new Date(event.data).getFullYear() }}</span>
          <span class="location">📍 {{ event.lloc }}</span>
        </div>
        <h1>{{ event.nom }}</h1>
        <p class="synopsis" v-if="event.sinopsi">{{ shorten(event.sinopsi, 180) }}</p>
      </div>
    </header>

    <div class="booking-section">
      <div class="map-container">
        <div class="map-header">
          <div class="title-area">
            <h2>Selecciona els teus seients</h2>
            <p>Fes clic a un seient disponible per començar la reserva.</p>
          </div>
          
          <div class="timer-card" v-if="reservedSeat">
            <div class="timer-content">
              <span class="timer-label">Reserva expira en:</span>
              <span class="timer-value">{{ formattedTimer }}</span>
            </div>
            <button class="checkout-btn" @click="goToCheckout">
              Pagar {{ reservedSeat.price }}€
            </button>
          </div>
        </div>

        <div class="cinema-room">
          <div class="screen-container">
            <div class="screen-surface"></div>
            <div class="screen-glow"></div>
            <span class="screen-label">PANTALLA</span>
          </div>
          
          <div class="seats-layout">
            <div class="seats-grid">
              <Seient 
                v-for="seat in seats" 
                :key="seat.id"
                v-bind="seat"
                @select="handleSelectSeat"
              />
            </div>
          </div>
        </div>

        <div class="map-footer">
          <div class="legend-group">
            <div class="legend-item"><span class="sw-dot available"></span> Lliure</div>
            <div class="legend-item"><span class="sw-dot reserved"></span> Reservat</div>
            <div class="legend-item"><span class="sw-dot sold"></span> Venut</div>
          </div>
          <div class="category-pills">
            <div class="cat-pill standard"><span></span> Estàndard</div>
            <div class="cat-pill premium"><span></span> Premium</div>
            <div class="cat-pill vip"><span></span> VIP</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <TransitionGroup name="list" tag="div" class="notifications-container">
      <div v-if="eventStore.lastNotification" :key="eventStore.lastNotification.message" class="notification-toast" :class="eventStore.lastNotification.type">
        <span class="notif-icon">{{ getNotifIcon(eventStore.lastNotification.type) }}</span>
        <span class="notif-msg">{{ eventStore.lastNotification.message }}</span>
      </div>
    </TransitionGroup>

    <!-- Modal Reserva -->
    <Transition name="scale">
      <div v-if="selectedSeatInternal" class="modal-overlay" @click.self="selectedSeatInternal = null">
        <div class="modal-content">
          <div class="modal-header">
            <div class="seat-preview" :class="selectedSeatInternal.category.toLowerCase()">
              {{ selectedSeatInternal.id }}
            </div>
            <div>
              <h3>Reserva seient {{ selectedSeatInternal.id }}</h3>
              <p>{{ selectedSeatInternal.category }} - {{ selectedSeatInternal.price }}€</p>
            </div>
          </div>
          <div class="modal-body">
            <p>Aquest seient quedarà bloquejat durant 5 minuts perquè puguis completar el pagament tranquil·lament.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="selectedSeatInternal = null">M'ho he pensat millor</button>
            <button class="btn-confirm" @click="processReservation">Confirmar Reserva</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useEventStore } from '~/stores/useEventStores'

const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()

const event = computed(() => eventStore.eventInfo)
const seats = computed(() => eventStore.seats)
const reservedSeat = computed(() => eventStore.selectedSeats[0])

const selectedSeatInternal = ref(null)

onMounted(async () => {
  const eventId = route.params.id
  eventStore.initSocket(eventId)

  try {
    const res = await fetch(`http://localhost:3001/api/events/${eventId}/seats`)
    const data = await res.json()
    
    // Assegurar dades d'esdeveniment si no hi són
    if (!eventStore.eventInfo) {
      const eRes = await fetch('http://localhost:3001/api/events')
      const eData = await eRes.json()
      const current = eData.events.find(e => e.id === eventId)
      if (current) eventStore.setEventInfo(current)
    }
  } catch (err) {
    eventStore.showNotification('Error connectant amb el servidor', 'error')
  }
})

onUnmounted(() => {
  eventStore.resetStore()
})

const handleSelectSeat = (id) => {
  const seat = seats.value.find(s => s.id === id)
  if (seat && (seat.status === 'AVAILABLE' || seat.status === 'available')) {
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

const formattedTimer = computed(() => {
  const m = Math.floor(eventStore.timer / 60)
  const s = eventStore.timer % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const shorten = (text, len) => {
  if (text.length <= len) return text
  return text.substring(0, len) + '...'
}

const getNotifIcon = (type) => {
  if (type === 'success') return '✅'
  if (type === 'error') return '❌'
  return '🔔'
}
</script>

<style scoped>
.event-page {
  background: #0f172a;
  min-height: 100vh;
  color: #f1f5f9;
}

.event-header {
  height: 60vh;
  background-size: cover;
  background-position: center 20%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px 60px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, #0f172a 0%, transparent 60%);
}

.header-top {
  position: absolute;
  top: 40px;
  left: 40px;
  right: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 100px;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.live-indicator {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-indicator .dot {
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 8px #ef4444;
}

.movie-hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.movie-hero-content h1 {
  font-size: 4rem;
  font-weight: 800;
  margin: 10px 0;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.movie-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.rating { color: #fbbf24; }
.year, .location { color: #94a3b8; }

.synopsis {
  color: #94a3b8;
  line-height: 1.6;
  font-size: 1.1rem;
}

.booking-section {
  padding: 60px 40px;
  margin-top: -60px;
  position: relative;
  z-index: 5;
}

.map-container {
  max-width: 1000px;
  margin: 0 auto;
  background: #1e293b;
  border-radius: 40px;
  padding: 40px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.05);
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.title-area h2 { margin: 0; font-size: 1.8rem; font-weight: 800; }
.title-area p { margin: 5px 0 0 0; color: #64748b; font-weight: 600; }

.timer-card {
  display: flex;
  background: #0f172a;
  padding: 8px 10px 8px 20px;
  border-radius: 18px;
  align-items: center;
  gap: 20px;
  border: 1px solid var(--primary);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.timer-label { font-size: 0.8rem; font-weight: 700; color: #94a3b8; }
.timer-value { font-family: monospace; font-size: 1.4rem; font-weight: 800; color: #fff; }

.checkout-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-btn:hover { background: var(--primary-dark); transform: scale(1.05); }

.cinema-room {
  margin: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen-container {
  width: 80%;
  margin-bottom: 100px;
  text-align: center;
  position: relative;
}

.screen-surface {
  height: 8px;
  background: linear-gradient(to right, transparent 0%, #fff 50%, transparent 100%);
  border-radius: 100px;
  box-shadow: 0 10px 40px rgba(255,255,255,0.3);
}

.screen-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%);
  clip-path: polygon(0 0, 100% 0, 85% 100%, 15% 100%);
  pointer-events: none;
}

.screen-label {
  display: block;
  margin-top: 20px;
  font-size: 0.75rem;
  letter-spacing: 0.8em;
  color: #4b5563;
  font-weight: 800;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 15px;
}

.map-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 40px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.legend-group { display: flex; gap: 30px; }
.legend-item { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.85rem; color: #94a3b8; }
.sw-dot { width: 12px; height: 12px; border-radius: 50%; }
.sw-dot.available { background: #10b981; }
.sw-dot.reserved { background: #f59e0b; }
.sw-dot.sold { background: #ef4444; }

.category-pills { display: flex; gap: 15px; }
.cat-pill { display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.2); padding: 6px 14px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; color: #d1d5db; }
.cat-pill span { width: 8px; height: 8px; border-radius: 2px; }
.standard span { background: #10b981; }
.premium span { background: #6366f1; }
.vip span { background: #a855f7; }

/* Notifications */
.notifications-container { position: fixed; bottom: 40px; right: 40px; z-index: 1000; display: flex; flex-direction: column; gap: 10px; }
.notification-toast { 
  background: #1e293b; 
  padding: 16px 24px; 
  border-radius: 16px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  border: 1px solid rgba(255,255,255,0.05);
  min-width: 300px;
}
.notification-toast.success { border-left: 4px solid #10b981; }
.notification-toast.error { border-left: 4px solid #ef4444; }
.notif-msg { font-weight: 600; font-size: 0.95rem; }

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  width: 90%;
  max-width: 450px;
  padding: 40px;
  border-radius: 32px;
  border: 1px solid rgba(255,255,255,0.05);
}

.modal-header { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; }
.seat-preview { width: 60px; height: 60px; background: #334155; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; }
.seat-preview.standard { background: #10b981; }
.seat-preview.premium { background: #6366f1; }
.seat-preview.vip { background: #a855f7; }

.modal-header h3 { margin: 0; font-size: 1.5rem; }
.modal-header p { margin: 5px 0 0 0; color: #94a3b8; font-weight: 700; }

.modal-body p { line-height: 1.6; color: #94a3b8; }

.modal-footer { display: flex; gap: 15px; margin-top: 40px; }
.btn-cancel { flex: 1; background: none; border: 1px solid #334155; color: #94a3b8; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }
.btn-confirm { flex: 1; background: var(--primary); border: none; color: #fff; padding: 14px; border-radius: 14px; font-weight: 800; cursor: pointer; }

/* Transitions */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }

.scale-enter-active, .scale-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9); }
</style>
