<template>
  <!-- Auth Gate -->
  <div v-if="!isAuthenticated" class="auth-gate">
    <div class="auth-card">
      <h1>
        <svg style="width:32px;height:32px;vertical-align:bottom;margin-right:8px;color:var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        Admin <span>FlowPass</span>
      </h1>
      <p>Introdueix la clau d'accés per continuar.</p>
      <form @submit.prevent="tryLogin" class="auth-form">
        <input type="password" v-model="loginInput" placeholder="Clau d'accés" autofocus />
        <button type="submit">Accedir</button>
      </form>
      <p v-if="loginError" class="auth-error">Clau incorrecta!</p>
      <NuxtLink to="/" class="auth-back">← Tornar a la cartellera</NuxtLink>
    </div>
  </div>

  <!-- Admin Dashboard -->
  <div class="admin-page" v-else>
    <header class="admin-header">
      <div class="header-container">
        <div class="header-info">
          <h1>Admin <span>Dashboard</span></h1>
          <p>Gestiona els teus esdeveniments i consulta l'estat de les vendes en temps real.</p>
        </div>
        <NuxtLink to="/" class="back-link">Tornar a la web</NuxtLink>
      </div>
    </header>

    <main class="admin-grid">
      <!-- Stats Row -->
      <section class="stats-container">
        <div class="stat-card">
          <span class="stat-label">Esdeveniments totals</span>
          <span class="stat-value">{{ events?.length || 0 }}</span>
          <div class="stat-trend">+2 avui</div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Seients venuts</span>
          <span class="stat-value">{{ globalStats.sold }}</span>
          <div class="stat-progress"><div :style="{ width: (globalStats.sold / globalStats.total * 100) + '%' }"></div></div>
        </div>
        <div class="stat-card highlight">
          <span class="stat-label">Ingressos estimats</span>
          <span class="stat-value">{{ globalStats.income }}€</span>
          <div class="stat-trend success">
            <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            +12%
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-label">Usuaris en línia</span>
          <span class="stat-value">24</span>
          <div class="stat-live"><span class="pulse"></span> LIVE</div>
        </div>
      </section>

      <div class="admin-content-layout">
        <!-- Event Creation Form -->
        <section class="form-section">
          <div class="glass-card">
            <h2>Crear Nou Esdeveniment</h2>
            <form @submit.prevent="createEvent" class="admin-form">
              <div class="form-group">
                <label>Nom de l'experiència</label>
                <input type="text" v-model="form.nom" placeholder="P. ex. The Joker: Folie à Deux" required />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Data</label>
                  <input type="date" v-model="form.data" required />
                </div>
                <div class="form-group">
                  <label>Sala / Cinema de BCN</label>
                  <select v-model="form.lloc" required>
                    <option value="Yelmo Cines Icaria (VOS)">Yelmo Cines Icaria (VOS)</option>
                    <option value="Phenomena Experience">Phenomena Experience</option>
                    <option value="Cinesa Diagonal Mar">Cinesa Diagonal Mar</option>
                    <option value="Cinemes Texas">Cinemes Texas</option>
                    <option value="Balmes Multicines">Balmes Multicines</option>
                    <option value="Cines Verdi">Cines Verdi</option>
                    <option value="Cinema Pedralbes">Cinema Pedralbes</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>URL del Pòster</label>
                <input type="url" v-model="form.imatge" placeholder="https://..." />
              </div>

              <div class="form-group">
                <label>Sinopsi curta</label>
                <textarea v-model="form.sinopsi" rows="3"></textarea>
              </div>

              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="loader"></span>
                <span v-else>+ Publicar Esdeveniment</span>
              </button>
            </form>
            
            <p v-if="successMsg" class="alert success">{{ successMsg }}</p>
            <p v-if="errorMsg" class="alert error">{{ errorMsg }}</p>
          </div>
        </section>

        <!-- Live Activity -->
        <section class="activity-section">
          <div class="glass-card">
            <h2>Activitat en <span>Directe</span></h2>
            <div class="activity-list">
              <div v-for="e in events" :key="e.id" class="activity-item">
                <img :src="e.imatge" alt="" class="mini-img">
                <div class="item-info">
                  <h4>{{ e.nom }}</h4>
                  <div class="occupancy-bar">
                    <div class="fill" :style="{ width: (Math.random() * 80 + 10) + '%' }"></div>
                  </div>
                </div>
                <div class="item-stat">
                  <span class="val">{{ Math.floor(Math.random() * 32) }}/32</span>
                  <span class="lbl">Seients</span>
                </div>
                <button @click="deleteEventItem(e.id)" class="btn-delete" title="Eliminar">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const router = useRouter()
const isAuthenticated = ref(false)
const loginInput = ref('')
const loginError = ref(false)

const { data: eventsData, refresh } = await useFetch(`${config.public.apiUrl}/events`)
const events = computed(() => eventsData.value?.events || [])

onMounted(() => {
  // Es força a demanar la clau sempre que s'accedeix a la pàgina
  isAuthenticated.value = false
})

const tryLogin = () => {
  const validToken = 'flowpass-admin'
  if (loginInput.value === validToken) {
    isAuthenticated.value = true
    sessionStorage.setItem('admin_token', loginInput.value)
    loginError.value = false
  } else {
    loginError.value = true
    loginInput.value = ''
  }
}


const isSubmitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const form = ref({
  nom: '',
  data: new Date().toISOString().split('T')[0],
  lloc: 'Cinema Pedralbes',
  imatge: '',
  sinopsi: '',
  rating: 8.0
})

const globalStats = computed(() => {
  // Mock stats based on event count
  const count = events.value.length
  return {
    sold: count * 12,
    total: count * 32,
    income: count * 340
  }
})

const createEvent = async () => {
  isSubmitting.value = true
  successMsg.value = ''
  errorMsg.value = ''
  
  try {
    const res = await fetch(`${config.public.apiUrl}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
      },
      body: JSON.stringify(form.value)
    })
    
    if (!res.ok) throw new Error('Error guardant dades')
    
    successMsg.value = "Esdeveniment creat correctament!"
    form.value = { nom: '', data: new Date().toISOString().split('T')[0], lloc: 'Cinema Pedralbes', imatge: '', sinopsi: '', rating: 8.0 }
    refresh()
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

const deleteEventItem = async (id) => {
  if (!confirm('Segur que vols eliminar aquest esdeveniment?')) return
  
  try {
    const res = await fetch(`${config.public.apiUrl}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
      }
    })
    if (!res.ok) throw new Error('Error eliminant dades')
    refresh()
  } catch (err) {
    alert(err.message)
  }
}
</script>

<style scoped>
/* Auth Gate Styles */
.auth-gate {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  padding: 20px;
}

.auth-card {
  background: #1e293b;
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.05);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.auth-card h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}
.auth-card h1 span { color: var(--primary); }

.auth-card p {
  color: #94a3b8;
  margin-bottom: 30px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.auth-form input {
  background: #0f172a;
  border: 1px solid #334155;
  color: #fff;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.auth-form input:focus {
  border-color: var(--primary);
  outline: none;
}

.auth-form button {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.auth-form button:hover {
  background: var(--primary-dark);
}

.auth-error {
  color: #ef4444 !important;
  margin-top: 15px !important;
  margin-bottom: 0 !important;
  font-weight: 600;
}

.auth-back {
  display: inline-block;
  margin-top: 25px;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.auth-back:hover {
  color: #fff;
}

/* Admin Dashboard Styles */
.admin-page {
  background: #0f172a;
  min-height: 100vh;
  color: #fff;
  font-family: 'Outfit', sans-serif;
}

.admin-header {
  background: #1e293b;
  padding: 40px 60px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.03em;
}

.header-info h1 span { color: var(--primary); }
.header-info p { color: #94a3b8; margin: 5px 0 0 0; }

.back-link {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  background: rgba(255,255,255,0.05);
  padding: 10px 24px;
  border-radius: 100px;
  transition: all 0.3s;
}

.back-link:hover { background: #fff; color: #000; }

.admin-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 60px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: #1e293b;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
}

.stat-card.highlight { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }

.stat-label { font-size: 0.85rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 2.5rem; font-weight: 800; margin: 10px 0; }
.stat-trend { font-size: 0.85rem; font-weight: 700; color: var(--primary); }
.stat-trend.success { color: #10b981; }

.stat-progress { height: 6px; background: #0f172a; border-radius: 10px; overflow: hidden; }
.stat-progress div { height: 100%; background: #10b981; }

.stat-live { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #ef4444; font-size: 0.8rem; }
.pulse { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; animation: pulse-kf 2s infinite; }

.admin-content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.glass-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 32px;
  padding: 40px;
}

.glass-card h2 { font-size: 1.5rem; margin-bottom: 30px; font-weight: 800; }
.glass-card h2 span { color: var(--primary); }

.admin-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
.form-group input, .form-group textarea, .form-group select {
  width: 100%;
  box-sizing: border-box;
  background: #0f172a;
  border: 1px solid #334155;
  color: #fff;
  padding: 14px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus, .form-group select:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

.submit-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) { transform: translateY(-2px); background: var(--primary-dark); }

.activity-list { display: flex; flex-direction: column; gap: 20px; }
.activity-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255,255,255,0.03);
  padding: 15px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.03);
}

.mini-img { width: 50px; height: 75px; object-fit: cover; border-radius: 8px; }
.item-info { flex-grow: 1; }
.item-info h4 { margin: 0 0 10px 0; font-size: 1.1rem; }
.occupancy-bar { height: 6px; background: #0f172a; border-radius: 10px; overflow: hidden; }
.occupancy-bar .fill { height: 100%; background: var(--primary); }
.item-stat { text-align: right; min-width: 80px; }
.item-stat .val { display: block; font-size: 1.2rem; font-weight: 800; }
.item-stat .lbl { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; }

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #ef4444;
  color: #fff;
}
.btn-delete svg { width: 20px; height: 20px; }

.alert { margin-top: 20px; padding: 12px; border-radius: 10px; font-weight: 700; text-align: center; }
.alert.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.alert.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

@media (max-width: 1100px) {
  .stats-container { grid-template-columns: 1fr 1fr; }
  .admin-content-layout { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .admin-header, .admin-grid { padding: 30px 20px; }
  .stats-container { grid-template-columns: 1fr; }
}
</style>
