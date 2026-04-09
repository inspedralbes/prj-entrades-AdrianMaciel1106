<template>
  <div class="event-list-container">
    <div class="list-header">
      <h2 class="title">Esdeveniments <span>actuals</span></h2>
      <div class="status-badge" v-if="filteredEvents.length > 0">
        <span class="pulse"></span> {{ filteredEvents.length }} pel·lícules trobades
      </div>
    </div>
    
    <div v-if="pending" class="loading-state">
      <div class="skeleton-grid">
        <div v-for="i in 4" :key="i" class="skeleton-card"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <h3>No hem pogut carregar les dades</h3>
        <p>{{ error.message }}</p>
        <button @click="refresh" class="retry-btn">Tornar a intentar</button>
      </div>
    </div>
    
    <div v-else-if="filteredEvents.length === 0" class="empty-state">
      <h3>No s'han trobat esdeveniments</h3>
      <p>Prova amb altres termes de cerca o una altra categoria.</p>
    </div>
    
    <div v-else class="event-grid">
      <div v-for="event in filteredEvents" :key="event.id" class="event-card">
        <div class="card-media">
          <img :src="event.imatge" :alt="event.nom" loading="lazy">
          <div class="card-overlay">
            <div class="rating-chip" v-if="event.rating">
              <span>★</span> {{ event.rating.toFixed(1) }}
            </div>
            <div class="category-chip">{{ getRandomCategory(event.id) }}</div>
          </div>
        </div>
        
        <div class="card-content">
          <div class="card-header">
            <h3 class="event-name">{{ event.nom }}</h3>
            <span class="event-date">{{ formatDate(event.data) }}</span>
          </div>
          
          <p class="event-location">
            <span class="icon">📍</span> {{ event.lloc }}
          </p>
          
          <div class="card-footer">
            <div class="availability">
              <div class="avail-bar">
                <div class="avail-fill" :style="{ width: getAvailWidth(event.id) }"></div>
              </div>
              <span>Seients lliures</span>
            </div>
            
            <NuxtLink :to="`/event/${event.id}`" class="purchase-btn">
              Reservar
              <span class="arrow">→</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  search: { type: String, default: '' },
  category: { type: String, default: 'Tots' }
})

const { data, pending, error, refresh } = await useFetch('http://localhost:3001/api/events')

const filteredEvents = computed(() => {
  if (!data.value || !data.value.events) return []
  
  return data.value.events.filter(event => {
    const matchesSearch = event.nom.toLowerCase().includes(props.search.toLowerCase()) || 
                          event.lloc.toLowerCase().includes(props.search.toLowerCase())
    
    // Virtual category matching for demo
    const matchesCategory = props.category === 'Tots' || getRandomCategory(event.id) === props.category
    
    return matchesSearch && matchesCategory
  })
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short'
  })
}

const getRandomCategory = (id) => {
  const cats = ['Acció', 'Drama', 'Animació', 'Estrenes']
  const index = parseInt(id.toString().slice(-1)) || 0
  return cats[index % cats.length]
}

const getAvailWidth = (id) => {
  // Mock occupancy for UI feel
  const base = parseInt(id.toString().slice(-1)) || 5
  return `${(base * 10) % 100}%`
}
</script>

<style scoped>
.event-list-container {
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 40px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title span {
  color: var(--primary);
  -webkit-text-fill-color: initial;
}

.status-badge {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
  animation: pulse-kf 2s infinite;
}

@keyframes pulse-kf {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.event-card {
  background: #1e293b;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-10px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card-media {
  height: 420px;
  position: relative;
  overflow: hidden;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.event-card:hover .card-media img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 15px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
}

.rating-chip {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: #fbbf24;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.85rem;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.category-chip {
  background: rgba(99, 102, 241, 0.8);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 6px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.card-content {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.event-name {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  color: #fff;
  line-height: 1.2;
}

.event-date {
  font-size: 0.8rem;
  font-weight: 800;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.availability {
  flex-grow: 1;
}

.availability span {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.avail-bar {
  width: 100%;
  height: 4px;
  background: #334155;
  border-radius: 10px;
  margin-bottom: 6px;
  overflow: hidden;
}

.avail-fill {
  height: 100%;
  background: #10b981;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.purchase-btn {
  background: var(--primary);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 14px;
  font-size: 0.95rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.purchase-btn:hover {
  background: var(--primary-dark);
  padding-right: 25px;
}

.purchase-btn .arrow {
  transition: transform 0.3s;
}

.purchase-btn:hover .arrow {
  transform: translateX(5px);
}

/* States */
.loading-state, .error-state, .empty-state {
  padding: 100px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 40px;
  border: 1px dashed rgba(255, 255, 255, 0.05);
}

.empty-state h3 { font-size: 1.5rem; color: #fff; margin-bottom: 10px; }
.empty-state p { color: #94a3b8; }

.retry-btn {
  margin-top: 20px;
  background: #fff;
  color: #000;
  border: none;
  padding: 10px 24px;
  border-radius: 100px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 640px) {
  .event-list-container { padding: 0 20px; }
  .list-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .card-media { height: 350px; }
}
</style>
