<template>
  <div 
    class="seat-wrapper"
    :class="[status.toLowerCase(), category.toLowerCase()]"
    @click="handleClick"
  >
    <div class="seat-body">
      <div class="seat-handle left"></div>
      <div class="seat-cushion">
        <span class="seat-id">{{ id }}</span>
      </div>
      <div class="seat-handle right"></div>
    </div>
    
    <!-- Hover Info -->
    <div class="seat-tooltip" v-if="status === 'AVAILABLE'">
      <span class="cat">{{ category }}</span>
      <span class="price">{{ price }}€</span>
    </div>

    <!-- Status Badge -->
    <div v-if="status !== 'AVAILABLE'" class="status-indicator">
      <div class="icon" v-if="status === 'RESERVED'">⏳</div>
      <div class="icon" v-if="status === 'SOLD'">👤</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
  category: { type: String, default: 'STANDARD' }, // STANDARD, PREMIUM, VIP
  price: { type: Number, default: 15 },
  status: { type: String, default: 'AVAILABLE' }, // AVAILABLE, RESERVED, SOLD
  reservedBy: String,
  expiresAt: String
})

const emit = defineEmits(['select'])

const handleClick = () => {
  if (props.status === 'AVAILABLE') {
    emit('select', props.id)
  }
}
</script>

<style scoped>
.seat-wrapper {
  position: relative;
  width: 50px;
  height: 50px;
  cursor: pointer;
  perspective: 1000px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.seat-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}

.seat-cushion {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 8px 8px 4px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 rgba(0,0,0,0.1);
  border: 2px solid transparent;
  transition: all 0.2s;
  z-index: 2;
}

.seat-handle {
  width: 8px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 2px;
}

.seat-handle.left { margin-right: -4px; }
.seat-handle.right { margin-left: -4px; }

.seat-id {
  font-size: 0.65rem;
  font-weight: 800;
  color: #6b7280;
  opacity: 0.8;
}

/* Categories Colors */
.standard .seat-cushion { background: #10b981; border-color: #059669; }
.standard .seat-handle { background: #059669; }
.standard .seat-id { color: white; }

.premium .seat-cushion { background: #6366f1; border-color: #4f46e5; }
.premium .seat-handle { background: #4f46e5; }
.premium .seat-id { color: white; }

.vip .seat-cushion { 
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); 
  border-color: #6d28d9;
  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.4);
}
.vip .seat-handle { background: #6d28d9; }
.vip .seat-id { color: white; }

/* Status Styles */
.reserved .seat-cushion { 
  background: #f59e0b !important; 
  border-color: #d97706 !important;
  opacity: 0.8;
}
.reserved .seat-handle { background: #d97706 !important; }

.sold .seat-cushion { 
  background: #ef4444 !important; 
  border-color: #dc2626 !important;
  opacity: 0.4;
  cursor: not-allowed;
}
.sold .seat-handle { background: #dc2626 !important; }

/* Tooltip & Hover */
.seat-tooltip {
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #1f2937;
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.seat-tooltip .cat { font-weight: 800; text-transform: uppercase; font-size: 0.6rem; margin-bottom: 2px; }
.seat-tooltip .price { color: #34d399; font-weight: 700; }

.seat-wrapper:hover:not(.sold):not(.reserved) {
  transform: translateY(-5px) scale(1.1);
}

.seat-wrapper:hover .seat-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  z-index: 5;
  font-size: 0.8rem;
}
</style>
