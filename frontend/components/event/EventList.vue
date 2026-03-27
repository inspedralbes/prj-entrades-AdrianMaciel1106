<template>
  <div class="event-list-container">
    <h2 class="title">Esdeveniments Disponibles</h2>
    
    <div v-if="pending" class="loading">
      Carregant esdeveniments...
    </div>
    
    <div v-else-if="error" class="error">
      Error al carregar els esdeveniments: {{ error.message }}
    </div>
    
    <div v-else class="event-grid">
      <div v-for="event in data.events" :key="event.id" class="event-card movie-card">
        <div class="event-image movie-poster">
          <img :src="event.imatge" :alt="event.nom">
          <div class="rating-badge" v-if="event.rating">
            <span class="star">★</span> {{ event.rating.toFixed(1) }}
          </div>
          <div class="event-date-badge release-badge">
            <span class="label">ESTRENA</span>
            <span class="day">{{ new Date(event.data).getDate() }}</span>
            <span class="month">{{ new Date(event.data).toLocaleString('ca-ES', { month: 'short' }) }}</span>
          </div>
        </div>
        <div class="event-info movie-info">
          <h3 class="event-name">{{ event.nom }}</h3>
          <p class="event-detail">🎬 {{ event.lloc }}</p>
          <div class="event-actions">
            <NuxtLink :to="`/event/${event.id}`" class="view-button">
              Comprar Entrades
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data, pending, error } = await useFetch('http://localhost:3001/api/events')

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ca-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.event-list-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 50px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loading, .error {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 50px;
  color: #6b7280;
}

.error {
  color: #ef4444;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 35px;
}

.event-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  border: 1px solid #f3f4f6;
  position: relative;
}

.event-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.event-image {
  height: 380px;
  position: relative;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.1);
}

.rating-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #fbbf24;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.event-date-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 20px 15px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.event-date-badge .label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #9ca3af;
  margin-right: auto;
}

.event-date-badge .day { font-size: 1.1rem; font-weight: 800; line-height: 1; }
.event-date-badge .month { font-size: 0.8rem; font-weight: 700; color: #6366f1; text-transform: uppercase; }

.event-info {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.event-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 12px;
  line-height: 1.2;
}

.event-detail {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 24px;
}

.event-actions {
  margin-top: auto;
}

.view-button {
  display: block;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  text-decoration: none;
  font-weight: 700;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3);
}

.view-button:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
}
</style>
