<template>
  <div class="page-wrapper">
    <header class="main-header">
      <div class="logo">FlowPass 🎟️</div>
    </header>

    <main>
      <section class="hero">
        <h1>Viu la millor experiència en temps real</h1>
        <p>Reserva les teves entrades de forma ràpida i segura.</p>
      </section>

      <EventList />
    </main>

    <footer class="main-footer">
      <p>&copy; 2026 Plataforma de Venda d'Entrades. Desenvolupat amb ♥ per Adrian Maciel.</p>
    </footer>
  </div>
</template>

<script setup>
// Nuxt 3 autoinjects components in the 'components' directory
</script>

<style>
/* Global styles for a premium look */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #fcfcfd;
  color: #1f2937;
  -webkit-font-smoothing: antialiased;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero {
  text-align: center;
  padding: 80px 20px;
  background: radial-gradient(circle at top right, #f5f3ff 0%, transparent 40%),
              radial-gradient(circle at bottom left, #ecfeff 0%, transparent 40%);
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

.hero p {
  font-size: 1.25rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.main-footer {
  margin-top: auto;
  padding: 40px;
  text-align: center;
  border-top: 1px solid #f3f4f6;
  color: #9ca3af;
  font-size: 0.875rem;
}
</style>
