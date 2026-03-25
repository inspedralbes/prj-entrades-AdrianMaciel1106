<template>
  <div 
    class="seat" 
    :class="status.toLowerCase()"
    @click="$emit('select', id)"
  >
    <div class="seat-icon">💺</div>
    <div class="seat-id">{{ id }}</div>
    
    <div v-if="status === 'RESERVED'" class="status-badge">Reservat</div>
    <div v-if="status === 'SOLD'" class="status-badge">Venut</div>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  status: String, // AVAILABLE, RESERVED, SOLD
  reservedBy: String,
  expiresAt: String
})

defineEmits(['select'])
</script>

<style scoped>
.seat {
  width: 80px;
  height: 100px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.seat:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #6366f1;
}

.seat.available {
  border-bottom: 4px solid #10b981;
}

.seat.reserved {
  background: #fef3c7;
  border-bottom: 4px solid #f59e0b;
  cursor: not-allowed;
}

.seat.sold {
  background: #fee2e2;
  border-bottom: 4px solid #ef4444;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat-icon {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.seat-id {
  font-weight: 700;
  font-size: 0.875rem;
  color: #374151;
}

.status-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #1f2937;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.seat.reserved .status-badge { background: #d97706; }
.seat.sold .status-badge { background: #dc2626; }
</style>
