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
      <div v-for="event in data.events" :key="event.id" class="event-card">
        <div class="event-info">
          <h3 class="event-name">{{ event.nom }}</h3>
          <p class="event-detail"><strong>Data:</strong> {{ formatDate(event.data) }}</p>
          <p class="event-detail"><strong>Lloc:</strong> {{ event.lloc }}</p>
        </div>
        <NuxtLink :to="`/event/${event.id}`" class="view-button">
          Veure Seients
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data, pending, error } = await useFetch('http://localhost:3000/api/events')

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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.event-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #f3f4f6;
}

.event-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.event-info {
  padding: 30px;
  flex-grow: 1;
}

.event-name {
  font-size : 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20px;
}

.event-detail {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 10px;
}

.event-detail strong {
  font-weight: 600;
  color: #111827;
}

.view-button {
  display: block;
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease;
  border-top: 1px solid #f3f4f6;
}

.view-button:hover {
  background: #6366f1;
  color: white;
}
</style>
