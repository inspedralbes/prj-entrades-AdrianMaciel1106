<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <header class="checkout-header">
        <NuxtLink :to="`/event/${eventId}`" class="back-link">← Cancel·lar</NuxtLink>
        <h1>Finalitzar Compra</h1>
      </header>

      <div class="checkout-content">
        <!-- Resum de la reserva -->
        <section class="summary-section">
          <div class="card">
            <div class="movie-mini-info" v-if="event">
              <img :src="event.imatge" :alt="event.nom" class="mini-poster">
              <div class="text">
                <h3>{{ event.nom }}</h3>
                <p>{{ event.lloc }}</p>
                <p class="date">{{ event.data }}</p>
              </div>
            </div>
            
            <div class="seat-details">
              <div class="detail-row">
                <span>Seient seleccionat</span>
                <strong>{{ seatId }}</strong>
              </div>
              <div class="detail-row">
                <span>Categoria</span>
                <span class="badge">{{ category }}</span>
              </div>
              <div class="divider"></div>
              <div class="detail-row total">
                <span>Total a pagar</span>
                <span class="price">{{ price }}€</span>
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
              <p class="hint">🚀 Mode de prova actiu: No es farà cap càrrec real.</p>
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
const route = useRoute()
const router = useRouter()
const { $socket } = useNuxtApp()

// Query params
const eventId = route.query.eventId
const seatId = route.query.seatId
const price = route.query.price
const category = route.query.category || 'STANDARD'

const event = ref(null)
const isProcessing = ref(false)
const form = ref({
  name: '',
  email: ''
})

onMounted(async () => {
  if (!eventId || !seatId) {
    router.push('/')
    return
  }

  // Fetch event details
  try {
    const res = await fetch('http://localhost:3001/api/events')
    const data = await res.json()
    event.value = data.events.find(e => e.id === eventId)
  } catch (err) {
    console.error('Error carregant esdeveniment', err)
  }
})

const handlePayment = async () => {
  isProcessing.value = true
  
  // Simulem un retard de xarxa
  setTimeout(() => {
    // Emetem la confirmació real al backend via Socket o REST
    // En aquest projecte es fa per Socket segons hem vist a [id].vue
    $socket.emit('confirm_purchase', { 
      eventId, 
      seatId, 
      userId: `user_${form.value.name.replace(/\s+/g, '_').toLowerCase()}`
    })

    // Naveguem a la pàgina final amb les dades
    router.push({
      path: '/event/entrades',
      query: {
        eventId,
        seatId,
        name: form.value.name,
        movieNom: event.value.nom,
        imatge: event.value.imatge
      }
    })
  }, 1500)
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

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
</style>
