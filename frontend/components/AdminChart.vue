<template>
  <div class="chart-container">
    <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
    <div v-else class="loader-container">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const loaded = ref(false)
const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#6366f1',
      bodyColor: '#fff',
      padding: 12,
      cornerRadius: 12,
      displayColors: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#94a3b8'
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#94a3b8'
      }
    }
  }
}

onMounted(() => {
  // Simulem dades basades en els events
  const labels = props.events.map(e => e.nom.length > 15 ? e.nom.substring(0, 15) + '...' : e.nom)
  const data = props.events.map(() => Math.floor(Math.random() * 32))

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Entrades Venudes',
        backgroundColor: '#6366f1',
        borderRadius: 8,
        data: data
      }
    ]
  }
  
  loaded.value = true
})
</script>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
  position: relative;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loader {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
