<template>
  <div class="ticket-page">
    <div class="ticket-container">
      <div v-if="loading" class="loader-box">
        <div class="spinner"></div>
        <p>Generant la teva entrada...</p>
      </div>
      
      <div v-else class="ticket">
        <div class="ticket-header">
          <div class="success-badge">
            <svg style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            Compra Confirmada
          </div>
          <h2>Aquesta és la teva entrada</h2>
        </div>
        
        <div class="ticket-body">
          <div class="movie-poster">
            <img :src="query.imatge" :alt="query.movieNom" />
          </div>
          
          <div class="ticket-details">
            <h1 class="movie-title">{{ query.movieNom }}</h1>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Titular</span>
                <span class="value">{{ query.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Seients</span>
                <span class="value spotlight">{{ query.seatsIds || query.seatId }}</span>
              </div>
              <div class="info-item">
                <span class="label">Data de compra</span>
                <span class="value">{{ currentDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">ID de Reserva</span>
                <span class="value mono">#{{ reservationId }}</span>
              </div>
            </div>
          </div>
          
          <div class="ticket-qr">
            <!-- Simulated QR Code using CSS/SVG for aesthetics -->
            <div class="qr-mock">
               <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <!-- Un mock simple de QR -->
                  <rect x="10" y="10" width="30" height="30" fill="none" stroke="#1e293b" stroke-width="4"/>
                  <rect x="15" y="15" width="20" height="20" fill="#1e293b"/>
                  
                  <rect x="60" y="10" width="30" height="30" fill="none" stroke="#1e293b" stroke-width="4"/>
                  <rect x="65" y="15" width="20" height="20" fill="#1e293b"/>
                  
                  <rect x="10" y="60" width="30" height="30" fill="none" stroke="#1e293b" stroke-width="4"/>
                  <rect x="15" y="65" width="20" height="20" fill="#1e293b"/>
                  
                  <rect x="55" y="55" width="10" height="10" fill="#1e293b"/>
                  <rect x="75" y="50" width="15" height="15" fill="#1e293b"/>
                  <rect x="50" y="75" width="20" height="15" fill="#1e293b"/>
                  <rect x="80" y="80" width="10" height="10" fill="#1e293b"/>
               </svg>
            </div>
            <p>Mostra aquest codi a l'entrada</p>
          </div>
        </div>
        
        <div class="ticket-footer">
          <!-- Email Simulation -->
          <div class="email-simulation">
            <svg style="width:20px;height:20px;margin-right:8px;vertical-align:bottom;color:#10b981" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Hem enviat una còpia PDF i facturació al correu de <strong>{{ query.name }}</strong>.
          </div>
          <NuxtLink to="/" class="btn-home">Tornar a l'inici</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const query = route.query
const currentDate = new Date().toLocaleDateString('ca-ES')
const reservationId = Math.random().toString(36).substr(2, 9).toUpperCase()

onMounted(() => {
  if (!query.eventId || (!query.seatId && !query.seatsIds)) {
    router.push('/')
    return
  }
  
  // Simulem un petit retard per donar "feel" de generació de ticket
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.ticket-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loader-box {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ticket {
  background: white;
  max-width: 800px;
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.ticket::before, .ticket::after {
  content: '';
  position: absolute;
  top: 60%;
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 50%;
  z-index: 10;
}

.ticket::before {
  left: -20px;
  box-shadow: inset -5px 0 10px rgba(0,0,0,0.02);
}

.ticket::after {
  right: -20px;
  box-shadow: inset 5px 0 10px rgba(0,0,0,0.02);
}

.ticket-header {
  background: #1e293b;
  color: white;
  padding: 30px;
  text-align: center;
}

.success-badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.ticket-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.ticket-body {
  display: flex;
  padding: 40px;
  gap: 30px;
  border-bottom: 2px dashed #e2e8f0;
  position: relative;
}

@media (max-width: 768px) {
  .ticket-body {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.movie-poster {
  flex-shrink: 0;
}

.movie-poster img {
  width: 140px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.ticket-details {
  flex-grow: 1;
}

.movie-title {
  font-size: 2rem;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 20px;
  line-height: 1.2;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 480px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.info-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.info-item .spotlight {
  font-size: 1.5rem;
  font-weight: 900;
  color: #6366f1;
}

.info-item .mono {
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.ticket-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 2px dashed #e2e8f0;
  padding-left: 30px;
  margin-left: auto;
}

@media (max-width: 768px) {
  .ticket-qr {
    border-left: none;
    border-top: 2px dashed #e2e8f0;
    padding-left: 0;
    padding-top: 30px;
    margin-left: 0;
    width: 100%;
  }
}

.qr-mock {
  padding: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 15px;
}

.ticket-qr p {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  text-align: center;
}

.ticket-footer {
  padding: 30px;
  text-align: center;
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.email-simulation {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #064e3b;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  max-width: 400px;
}

.btn-home {
  display: inline-block;
  background: #6366f1;
  color: white;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 100px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
}

.btn-home:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
}
</style>
