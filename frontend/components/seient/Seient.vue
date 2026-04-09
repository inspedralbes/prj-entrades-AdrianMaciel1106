<template>
  <div 
    class="seat-wrapper"
    :class="[status.toLowerCase(), category.toLowerCase()]"
    @click="handleClick"
  >
    <div class="seat-body">
      <div class="seat-base"></div>
      <div class="seat-cushion">
        <span class="seat-id">{{ id }}</span>
      </div>
      <div class="seat-armrest left"></div>
      <div class="seat-armrest right"></div>
    </div>
    
    <!-- Hover Info Tooltip -->
    <div class="seat-tooltip" v-if="status === 'AVAILABLE' || status === 'available'">
      <span class="cat">{{ category }}</span>
      <span class="price">{{ price }}€</span>
    </div>

    <!-- Status Icons -->
    <div class="status-icon" v-if="status.toUpperCase() !== 'AVAILABLE'">
      <span v-if="status.toUpperCase() === 'RESERVED'">🔒</span>
      <span v-if="status.toUpperCase() === 'SELECTED'">🤩</span>
      <span v-if="status.toUpperCase() === 'SOLD'">👤</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
  category: { type: String, default: 'STANDARD' },
  price: { type: Number, default: 15 },
  status: { type: String, default: 'available' },
  reservedBy: String,
  expiresAt: String
})

const emit = defineEmits(['select'])

const handleClick = () => {
  if (props.status.toLowerCase() === 'available') {
    emit('select', props.id)
  }
}
</script>

<style scoped>
.seat-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.seat-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.seat-cushion {
  width: 30px;
  height: 32px;
  background: #334155;
  border-radius: 8px 8px 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 4px 0 rgba(0,0,0,0.3);
  position: relative;
  z-index: 2;
  transition: all 0.2s;
}

.seat-base {
  position: absolute;
  bottom: 0px;
  width: 36px;
  height: 10px;
  background: #1e293b;
  border-radius: 4px;
  z-index: 1;
}

.seat-armrest {
  width: 6px;
  height: 20px;
  background: #475569;
  border-radius: 10px;
  position: absolute;
  top: 10px;
}

.seat-armrest.left { left: 0; }
.seat-armrest.right { right: 0; }

.seat-id {
  font-size: 0.6rem;
  font-weight: 800;
  color: rgba(255,255,255,0.5);
  transition: color 0.2s;
}

/* Category Colors */
.standard .seat-cushion { background: #334155; }
.standard:hover .seat-cushion { background: #475569; border-color: #10b981; }

.premium .seat-cushion { background: #1e1b4b; border-color: rgba(99, 102, 241, 0.3); }
.premium:hover .seat-cushion { border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.3); }

.vip .seat-cushion { 
  background: linear-gradient(to bottom, #2e1065, #1e1b4b); 
  border-color: rgba(168, 85, 247, 0.4); 
}
.vip:hover .seat-cushion { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }

/* Status Styles */
.selected .seat-cushion { 
  background: #6366f1 !important; 
  border-color: #fff !important;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6) !important;
}

.reserved .seat-cushion { 
  background: #1e293b !important; 
  opacity: 0.6;
  cursor: not-allowed;
}

.sold .seat-cushion { 
  background: rgba(15, 23, 42, 0.5) !important;
  border-color: rgba(255,255,255,0.05) !important;
  opacity: 0.3;
  cursor: not-allowed;
}
.sold .seat-id { display: none; }

/* Tooltip */
.seat-tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #fff;
  color: #000;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.4);
  z-index: 100;
}

.seat-tooltip .cat { font-weight: 800; text-transform: uppercase; font-size: 0.6rem; color: #64748b; }
.seat-tooltip .price { font-weight: 800; color: #10b981; }

.seat-wrapper:hover:not(.sold):not(.reserved) {
  transform: scale(1.15) translateY(-5px);
}

.seat-wrapper:hover .seat-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.status-icon {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.9rem;
  z-index: 10;
}
</style>
