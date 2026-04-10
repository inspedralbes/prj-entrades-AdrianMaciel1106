<template>
  <div class="event-page">
    <!-- Indicador de connexió -->
    <Transition name="fade">
      <div v-if="!eventStore.isConnected" class="offline-overlay">
        <div class="offline-content">
          <svg style="width:32px;height:32px;margin-bottom:10px;animation:pulse 1.5s infinite" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <br>
          Connexió perduda amb el servidor.<br><span style="font-size:0.9rem;font-weight:600;color:#94a3b8">Esperant per reconnectar per evitar conflictes...</span>
        </div>
      </div>
    </Transition>

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
          <span class="rating" v-if="event.rating">
            <svg style="width:16px;height:16px;color:#fbbf24;display:inline;vertical-align:text-bottom;" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            {{ event.rating.toFixed(1) }}
          </span>
          <span class="year">{{ new Date(event.data).getFullYear() }}</span>
          <span class="location">
            <svg style="width:16px;height:16px;display:inline;vertical-align:text-bottom;margin-right:2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {{ event.lloc }}
          </span>
        </div>
        <h1>{{ event.nom }}</h1>
        <p class="synopsis" v-if="event.sinopsi">{{ shorten(event.sinopsi, 180) }}</p>
      </div>
    </header>

    <!-- Panel lateral flotant de compra -->
    <Transition name="panel-slide">
      <div v-if="eventStore.selectedSeats.length > 0" class="purchase-panel">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            La teva selecció
          </div>
          <div class="panel-timer" :class="{ urgent: eventStore.timer < 60 }">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/></svg>
            {{ formattedTimer }}
          </div>
        </div>

        <div class="panel-seats">
          <div v-for="seat in eventStore.selectedSeats" :key="seat.id" class="panel-seat-row">
            <div class="seat-badge" :class="seat.category?.toLowerCase() || 'standard'">
              {{ seat.row }}{{ seat.number }}
            </div>
            <div class="seat-info">
              <span class="seat-label">Seient {{ seat.row }}-{{ seat.number }}</span>
              <span class="seat-cat">{{ seat.category || 'Estàndard' }}</span>
            </div>
            <span class="seat-price">{{ seat.price }}€</span>
            <button class="remove-seat-btn" @click="eventStore.unreserveSeat(seat.id)" title="Eliminar seient">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <div class="panel-divider"></div>

        <div class="panel-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ eventStore.totalAmount.toFixed(2) }}€</span>
          </div>
          <div class="summary-row charges">
            <span>Càrrecs de gestió</span>
            <span>{{ (eventStore.selectedSeats.length * 0.50).toFixed(2) }}€</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span class="total-price">{{ (eventStore.totalAmount + eventStore.selectedSeats.length * 0.50).toFixed(2) }}€</span>
          </div>
        </div>

        <button class="panel-checkout-btn" @click="goToCheckout">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          Confirmar i pagar
        </button>

        <p class="panel-expiry-note">
          La reserva expira en <strong>{{ formattedTimer }}</strong>. Completa el pagament a temps.
        </p>
      </div>
    </Transition>

    <div class="booking-section">
      <div class="map-container">
        <div class="map-header">
          <div class="title-area">
            <h2>Selecciona els teus seients</h2>
            <p>Fes clic a un seient disponible per començar la reserva.</p>
          </div>
          <div v-if="eventStore.selectedSeats.length > 0" class="seats-count-badge">
            <span class="count-num">{{ eventStore.selectedSeats.length }}</span>
            <span class="count-text">seient{{ eventStore.selectedSeats.length > 1 ? 's' : '' }} seleccionat{{ eventStore.selectedSeats.length > 1 ? 's' : '' }}</span>
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
  </div>
</template>

<script setup>
import { useEventStore } from '~/stores/useEventStores'

const router = useRouter()
const route = useRoute()
const eventStore = useEventStore()
const config = useRuntimeConfig()

const event = computed(() => eventStore.eventInfo)
const seats = computed(() => eventStore.seats)

onMounted(async () => {
  const eventId = route.params.id
  eventStore.initSocket(eventId)

  try {
    const res = await fetch(`${config.public.apiUrl}/events/${eventId}/seats`)
    const data = await res.json()
    
    // Assegurar dades d'esdeveniment si no hi són
    if (!eventStore.eventInfo) {
      const eRes = await fetch(`${config.public.apiUrl}/events`)
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
  console.log('Seient clicat:', id, 'Estat actual:', seat?.status)
  if (seat && (seat.status === 'AVAILABLE' || seat.status === 'available')) {
    console.log('Enviant reserva de seient al servidor...')
    eventStore.reserveSeat(seat.id)
  } else if (seat && seat.status === 'selected') {
    console.log('Desfent la selecció del seient...')
    eventStore.unreserveSeat(seat.id)
  }
}

const goToCheckout = () => {
  if (eventStore.selectedSeats.length === 0) return
  router.push({
    path: '/event/checkout',
    query: {
      eventId: route.params.id
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
  if (type === 'success') return '✓'
  if (type === 'error') return '!'
  return 'i'
}
</script>

<style scoped>
.event-page {
  background: #0f172a;
  min-height: 100vh;
  color: #f1f5f9;
}

.offline-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  text-align: center;
  font-weight: 800;
  font-size: 1.5rem;
  line-height: 1.4;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }


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

/* Badge seients seleccionats al header del mapa */
.seats-count-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.4);
  padding: 8px 18px;
  border-radius: 100px;
  animation: pulse-border 2s ease-in-out infinite;
}
.count-num {
  font-size: 1.4rem;
  font-weight: 900;
  color: #6366f1;
  line-height: 1;
}
.count-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.3); }
  50% { box-shadow: 0 0 0 6px rgba(99,102,241,0); }
}

/* ═══════════════════════════════════
   PANEL LATERAL FLOTANT DE COMPRA
═══════════════════════════════════ */
.purchase-panel {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%) translateX(0);
  width: 320px;
  background: #0f172a;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-right: none;
  border-radius: 28px 0 0 28px;
  padding: 28px;
  z-index: 9999;
  box-shadow: -20px 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 800;
  color: #e2e8f0;
}

.panel-timer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 10px;
  border-radius: 8px;
  transition: all 0.4s;
}

.panel-timer.urgent {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.panel-seats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-seat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 10px 14px;
  border-radius: 14px;
  transition: background 0.2s;
}

.panel-seat-row:hover {
  background: rgba(255,255,255,0.06);
}

.seat-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}
.seat-badge.standard { background: linear-gradient(135deg, #10b981, #059669); }
.seat-badge.premium  { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.seat-badge.vip      { background: linear-gradient(135deg, #a855f7, #7c3aed); }

.seat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}
.seat-label { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; }
.seat-cat   { font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }

.seat-price {
  font-size: 0.95rem;
  font-weight: 800;
  color: #6366f1;
}

.remove-seat-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid transparent;
  color: #ef4444;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 5px;
}

.remove-seat-btn:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  transform: scale(1.05);
}

.panel-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
}

.panel-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}
.summary-row.charges { color: #64748b; font-size: 0.8rem; }
.summary-row.total {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed rgba(255,255,255,0.08);
  font-size: 1rem;
  font-weight: 800;
  color: #e2e8f0;
}
.total-price {
  font-size: 1.4rem;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(99,102,241,0.4);
  letter-spacing: 0.01em;
}

.panel-checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(99,102,241,0.6);
}

.panel-checkout-btn:active {
  transform: translateY(0);
}

.panel-expiry-note {
  text-align: center;
  font-size: 0.72rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}
.panel-expiry-note strong { color: #94a3b8; }

/* Animació d'entrada/sortida */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateY(-50%) translateX(100%);
  opacity: 0;
}

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
