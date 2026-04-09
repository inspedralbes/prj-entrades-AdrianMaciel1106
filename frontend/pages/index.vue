<template>
  <div class="page-wrapper">
    <header class="main-header">
      <div class="header-container">
        <div class="logo">FlowPass <span><svg style="width:28px;height:28px;vertical-align:bottom;color:var(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg></span></div>
        <nav class="main-nav">
          <NuxtLink to="/" class="nav-link active">Cartellera</NuxtLink>
          <NuxtLink to="/admin" class="nav-link admin-link">Admin</NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-content">
          <h1 class="animate-text">Viu la millor experiència en <span>temps real</span></h1>
          <p>Reserva les teves entrades de forma ràpida, segura i sense cues. Tota l'emoció del cinema a un clic.</p>
          
          <div class="search-container">
            <div class="search-box">
              <span class="search-icon"><svg style="width:20px;height:20px;color:#94a3b8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></span>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Cerca pel·lícules, sales o esdeveniments..." 
                @input="handleSearch"
              />
            </div>
            <div class="filter-pills">
              <button 
                v-for="cat in categories" 
                :key="cat" 
                :class="['filter-pill', { active: activeCategory === cat }]"
                @click="activeCategory = cat"
              >
                {{ cat }}
              </button>
            </div>
          </div>
        </div>
        <div class="hero-bg-accent"></div>
      </section>

      <EventList :search="searchQuery" :category="activeCategory" />
    </main>

    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-logo">FlowPass</div>
        <p>&copy; 2026 Plataforma de Venda d'Entrades. Desenvolupat amb ♥ per Adrian Maciel.</p>
        <div class="social-links">
          <!-- X icon -->
          <a href="#" class="social-icon"><svg style="width:20px;height:20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
          <!-- Instagram icon -->
          <a href="#" class="social-icon"><svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" stroke-width="2"></rect><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path></svg></a>
          <!-- Web icon -->
          <a href="#" class="social-icon"><svg style="width:20px;height:20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg></a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const activeCategory = ref('Tots')
const categories = ['Tots', 'Estrenes', 'Acció', 'Drama', 'Animació']

const handleSearch = () => {
  // Logic handled by props in EventList
}
</script>

<style>
/* Modern & Premium Global Styles */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #a855f7;
  --bg: #0f172a;
  --card-bg: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 0 40px;
  height: 80px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
}

.header-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo span {
  -webkit-text-fill-color: initial;
}

.main-nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
  position: relative;
  padding: 5px 0;
}

.nav-link:hover, .nav-link.active {
  color: #fff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
}

.admin-link {
  background: rgba(99, 102, 241, 0.1);
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.admin-link:hover {
  background: rgba(99, 102, 241, 0.2);
}

.hero {
  position: relative;
  padding: 120px 20px 80px;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.04em;
}

@media (max-width: 768px) {
  .hero h1 { font-size: 3rem; }
}

.hero h1 span {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 650px;
  margin: 0 auto 50px;
  line-height: 1.6;
}

.search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.search-box {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 20px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.15);
}

.search-box input {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  padding: 12px 0;
  width: 100%;
  outline: none;
  font-family: inherit;
}

.search-box input::placeholder {
  color: #4b5563;
}

.filter-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  padding: 8px 18px;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.filter-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.filter-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.hero-bg-accent {
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  z-index: 1;
  pointer-events: none;
}

.main-footer {
  margin-top: 100px;
  padding: 80px 40px 40px;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  opacity: 0.5;
}

.footer-content p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;
}

.social-icon:hover {
  background: var(--primary);
  transform: translateY(-3px);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-text {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
