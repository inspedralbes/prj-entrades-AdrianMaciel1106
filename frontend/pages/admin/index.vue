<template>
  <div class="admin-dashboard">
    <header class="admin-header">
      <div class="header-content">
        <h1>Dashboard Administrador</h1>
        <NuxtLink to="/" class="view-site-link">Veure la web</NuxtLink>
      </div>
    </header>

    <main class="admin-main">
      <section class="form-section">
        <div class="form-card">
          <h2>Crear Nou Esdeveniment</h2>
          <p class="subtitle">Afegeix manualment una pel·lícula o espectacle a la cartellera (Es generaran 32 seients automàticament).</p>

          <form @submit.prevent="createEvent" class="admin-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nom de l'esdeveniment</label>
                <input type="text" v-model="form.nom" placeholder="P. ex. The Batman 2" required />
              </div>
              <div class="form-group">
                <label>Data de l'esdeveniment</label>
                <input type="date" v-model="form.data" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Sala / Lloc</label>
                <input type="text" v-model="form.lloc" placeholder="Sala 1 - Principal" />
              </div>
              <div class="form-group">
                <label>Valoració (0 - 10)</label>
                <input type="number" step="0.1" max="10" min="0" v-model="form.rating" placeholder="8.5" />
              </div>
            </div>

            <div class="form-group">
              <label>URL del Pòster (Imatge principal)</label>
              <input type="url" v-model="form.imatge" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label>URL del Backdrop (Fons pantalla d'informació - Opcional)</label>
              <input type="url" v-model="form.backdrop" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label>Sinopsi</label>
              <textarea v-model="form.sinopsi" rows="4" placeholder="De què tracta...?"></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">Creant...</span>
              <span v-else>+ Afegir Esdeveniment i Generar Seients</span>
            </button>
          </form>
          
          <Transition name="fade">
            <div v-if="successMsg" class="alert success">{{ successMsg }}</div>
          </Transition>
          <Transition name="fade">
             <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>
          </Transition>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
const isSubmitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

// Initialize standard dates
const todayDate = new Date().toISOString().split('T')[0]

const form = ref({
  nom: '',
  data: todayDate,
  lloc: 'Sala Principal',
  imatge: '',
  backdrop: '',
  sinopsi: '',
  rating: null
})

const createEvent = async () => {
  isSubmitting.value = true
  successMsg.value = ''
  errorMsg.value = ''
  
  try {
    const res = await fetch('http://localhost:3001/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })
    
    const data = await res.json()
    
    if (!res.ok) throw new Error(data.error || 'Error desconegut guardant dades')
    
    successMsg.value = `L'esdeveniment "${data.event.nom}" ha estat creat correctament, incloent els seus 32 seients.`
    
    // Cleanup form
    form.value = {
      nom: '',
      data: todayDate,
      lloc: 'Sala Principal',
      imatge: '',
      backdrop: '',
      sinopsi: '',
      rating: null
    }
    
    setTimeout(() => { successMsg.value = '' }, 4000)

  } catch (err) {
    errorMsg.value = err.message
    setTimeout(() => { errorMsg.value = '' }, 4000)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.admin-header {
  background: #1e293b;
  padding: 20px 40px;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.view-site-link {
  color: #cdd6f4;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid #cdd6f4;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.view-site-link:hover {
  background: white;
  color: #1e293b;
}

.admin-main {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.form-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.form-card h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  margin-bottom: 30px;
  font-size: 0.95rem;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row > * {
  flex: 1;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.form-group input, .form-group textarea {
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.submit-btn {
  margin-top: 10px;
  background: #10b981;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  margin-top: 20px;
  padding: 16px;
  border-radius: 10px;
  font-weight: 600;
}

.alert.success { background: #d1fae5; color: #065f46; border: 1px solid #34d399; }
.alert.error { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
