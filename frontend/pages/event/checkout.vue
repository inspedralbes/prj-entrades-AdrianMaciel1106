<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <header class="checkout-header">
        <NuxtLink :to="`/event/${eventId}`" class="back-link">← Cancel·lar</NuxtLink>
        <h1>Finalitzar Compra</h1>
      </header>

      <div class="checkout-content">
        <!-- Feedback Overlay -->
        <Transition name="fade">
          <div v-if="eventStore.lastNotification" class="notification-toast" :class="eventStore.lastNotification.type">
            {{ eventStore.lastNotification.message }}
          </div>
        </Transition>

        <!-- Resum de la reserva -->
        <section class="summary-section">
          <div class="card">
            <div class="movie-mini-info" v-if="eventStore.eventInfo">
              <img :src="eventStore.eventInfo.imatge" :alt="eventStore.eventInfo.nom" class="mini-poster">
              <div class="text">
                <h3>{{ eventStore.eventInfo.nom }}</h3>
                <p>{{ eventStore.eventInfo.lloc }}</p>
                <p class="date">{{ eventStore.eventInfo.data }}</p>
              </div>
            </div>
            
            <div class="seat-details" v-if="eventStore.selectedSeats.length > 0">
              <div class="detail-row" v-for="s in eventStore.selectedSeats" :key="s.id">
                <span>Traca {{ s.id }} <span class="badge">{{ s.category }}</span></span>
                <strong>{{ s.price.toFixed(2) }}€</strong>
              </div>
              <div class="divider"></div>
              <div class="detail-row total">
                <span>Total a pagar</span>
                <span class="price">{{ eventStore.totalAmount.toFixed(2) }}€</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Formulari de pagament fictici -->
        <section class="form-section">
          <form @submit.prevent="handlePayment" class="checkout-form">
            <div class="form-group">
              <label>Nom Complet</label>
              <input type="text" v-model="form.name" placeholder="Pau Garcia" required>
            </div>
            <div class="form-group">
              <label>Correu Electrònic</label>
              <input type="email" v-model="form.email" placeholder="pau@exemple.com" required>
            </div>
            
            <div class="payment-mock">
              <label>Dades de la Targeta</label>
              <div class="card-input">
                <input type="text" placeholder="0000 0000 0000 0000" disabled>
                <div class="sub-inputs">
                  <input type="text" placeholder="MM/YY" disabled>
                  <input type="text" placeholder="CVC" disabled>
                </div>
              </div>
              <p class="hint">
                <svg style="width:14px;height:14px;vertical-align:middle;display:inline;margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Mode de prova actiu: No es farà cap càrrec real.
              </p>
            </div>

            <button type="submit" class="btn-pay" :disabled="isProcessing">
              <span v-if="!isProcessing">Pagar i obtenir entrades</span>
              <span v-else class="loader">Processant...</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEventStore } from '@/stores/useEventStores'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const config = useRuntimeConfig()

// Utilitzem info de l'store i no de URL per donar suport a múltiples entrades
const eventId = route.query.eventId || eventStore.eventInfo?.id

const isProcessing = ref(false)
const form = ref({
  name: '',
  email: ''
})

onMounted(async () => {
  if (!eventId || eventStore.selectedSeats.length === 0) {
    router.push('/')
    return
  }

  // Si el store no té la info de l'esdeveniment, la busquem
  if (!eventStore.eventInfo) {
    try {
      const res = await fetch(`${config.public.apiUrl}/events`)
      const data = await res.json()
      const eventData = data.events.find(e => e.id === eventId)
      if (eventData) eventStore.setEventInfo(eventData)
    } catch (err) {
      console.error('Error carregant esdeveniment', err)
    }
  }
  
  // Ens assegurem que el socket estigui connectat
  if (!eventStore.isConnected) {
    eventStore.initSocket(eventId)
  }
})

const handlePayment = async () => {
  if (!form.value.name || !form.value.email) return
  
  isProcessing.value = true
  
  // Escoltarem la resposta del socket una sola vegada
  const { $socket } = useNuxtApp()
  
  const mySeatsToProcess = [...eventStore.selectedSeats]
  let successCount = 0
  let errorCount = 0
  
  const handleResponse = (res) => {
    if (res.success) {
      successCount++
    } else {
      errorCount++
    }
    
    // Si hem rebut resposta per tots
    if (successCount + errorCount >= mySeatsToProcess.length) {
      isProcessing.value = false
      $socket.off('confirm_purchase_response', handleResponse)
      
      if (successCount === mySeatsToProcess.length) {
        // Tot venut!
        router.push({
          path: '/event/entrades',
          query: {
            eventId,
            seatsIds: mySeatsToProcess.map(s => s.id).join(','),
            name: form.value.name,
            movieNom: eventStore.eventInfo.nom,
            imatge: eventStore.eventInfo.imatge
          }
        })
      } else {
        eventStore.showNotification(`La compra ha fallat parcialment o totalment. Respostes d'error: ${errorCount}`, 'error')
      }
    }
  }

  $socket.on('confirm_purchase_response', handleResponse)

  // Cridem tantes vegades com seients tenim
  mySeatsToProcess.forEach(s => {
    eventStore.confirmPurchase(s.id)
  })
  
  // Timeout de seguretat per si el socket no respon
  setTimeout(() => {
    if (isProcessing.value) {
      isProcessing.value = false
      $socket.off('confirm_purchase_response', handleResponse)
      eventStore.showNotification('El servidor triga massa a respondre.', 'error')
    }
  }, 10000)
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.checkout-container {
  max-width: 900px;
  width: 100%;
}

.checkout-header {
  margin-bottom: 30px;
}

.checkout-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-top: 15px;
  color: #1e293b;
}

.back-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #334155;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.movie-mini-info {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.mini-poster {
  width: 70px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.movie-mini-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.movie-mini-info p {
  font-size: 0.85rem;
  color: #64748b;
}

.movie-mini-info .date {
  color: #6366f1;
  font-weight: 600;
  margin-top: 5px;
}

.seat-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #475569;
}

.badge {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6366f1;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 10px 0;
}

.total {
  font-weight: 800;
  color: #1e293b;
  font-size: 1.1rem;
}

.price {
  color: #10b981;
}

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.form-group input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 1rem;
}

.payment-mock {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 15px;
  border: 1px dashed #cbd5e1;
}

.payment-mock label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: block;
}

.card-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-input input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
}

.sub-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
}

.btn-pay {
  background: #6366f1;
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
}

.btn-pay:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn-pay:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.notification-toast {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.notification-toast.success { background: #10b981; }
.notification-toast.error { background: #ef4444; }
.notification-toast.info { background: #3b82f6; }

.fade-enter-active, .fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
