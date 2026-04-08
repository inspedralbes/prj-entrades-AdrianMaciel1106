import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SeatStatus = 'available' | 'reserved' | 'selected' | 'sold'

export interface Seat {
  id: string
  row: string
  number: number
  status: SeatStatus
  price: number
  reservedBy?: string
  expiresAt?: number
}

export interface EventInfo {
  id: string
  name: string
  date: string
  location: string
  description: string
}

export const useEventStore = defineStore('event', () => {
  const { $socket } = useNuxtApp()

  // Estat
  const userId = ref<string>(`user_${Math.random().toString(36).substr(2, 9)}`) // Mock userId
  const eventInfo = ref<EventInfo | null>(null)
  const seats = ref<Seat[]>([])
  const isConnected = ref(false)
  const reservationTimeout = ref<number>(300)
  const timer = ref<number>(0)
  const timerInterval = ref<NodeJS.Timeout | null>(null)
  const lastNotification = ref<{ message: string, type: 'info' | 'success' | 'error' } | null>(null)

  // Getters
  const availableSeats = computed(() => seats.value.filter(s => s.status === 'available'))
  const selectedSeats = computed(() => seats.value.filter(s => s.status === 'selected'))
  const totalAmount = computed(() => selectedSeats.value.reduce((total, seat) => total + seat.price, 0))

  // Accions
  function setEventInfo(info: EventInfo) {
    eventInfo.value = info
  }

  function setSeats(newSeats: Seat[]) {
    seats.value = newSeats
  }

  function updateSeatStatus(seatId: string, status: SeatStatus, reservedBy?: string, expiresAt?: number) {
    const seat = seats.value.find(s => s.id === seatId)
    if (seat) {
      seat.status = status
      seat.reservedBy = reservedBy
      seat.expiresAt = expiresAt
    }
  }

  function setConnectionStatus(status: boolean) {
    isConnected.value = status
  }

  // Socket Actions
  function initSocket(eventId: string) {
    if (!$socket) return

    $socket.connect()

    $socket.on('connect', () => {
      setConnectionStatus(true)
      $socket.emit('join_event', { eventId })
    })

    $socket.on('disconnect', () => {
      setConnectionStatus(false)
    })

    $socket.on('all_seats', ({ seats: newSeats }: { seats: Seat[] }) => {
      // Mapegem seients del servidor al nostre format 'selected' si és el nostre
      const mappedSeats = newSeats.map(s => ({
        ...s,
        status: (s.status === 'reserved' && s.reservedBy === userId.value) ? 'selected' : s.status
      }))
      setSeats(mappedSeats as Seat[])
      
      // Si el client ja té seients reservats, iniciem el temporitzador
      const mySeat = mappedSeats.find(s => s.status === 'selected')
      if (mySeat && mySeat.expiresAt) {
        const remaining = Math.floor((mySeat.expiresAt - Date.now()) / 1000)
        if (remaining > 0) startTimer(remaining)
      }
    })

    $socket.on('seat_updated', (updatedSeat: Seat) => {
      const isMe = updatedSeat.reservedBy === userId.value
      const status = (updatedSeat.status === 'reserved' && isMe) 
        ? 'selected' 
        : updatedSeat.status
      
      const oldSeat = seats.value.find(s => s.id === updatedSeat.id)
      
      updateSeatStatus(updatedSeat.id, status as SeatStatus, updatedSeat.reservedBy, updatedSeat.expiresAt)
      
      // Notificació per activitat externa
      if (!isMe && oldSeat && oldSeat.status !== updatedSeat.status) {
        if (updatedSeat.status === 'reserved') {
          showNotification(`El seient ${updatedSeat.id} s'acaba de reservar!`, 'info')
        } else if (updatedSeat.status === 'sold') {
          showNotification(`Seient ${updatedSeat.id} venut.`, 'info')
        } else if (updatedSeat.status === 'available' && oldSeat.status !== 'available') {
          showNotification(`El seient ${updatedSeat.id} torna a estar disponible.`, 'success')
        }
      }

      if (status === 'selected' && updatedSeat.expiresAt) {
        const remaining = Math.floor((updatedSeat.expiresAt - Date.now()) / 1000)
        startTimer(remaining)
      } else if (status === 'available' && isMe) {
        stopTimer()
      }
    })

    $socket.on('reserve_seat_response', ({ success, error }: any) => {
      if (!success) {
        alert(error || 'Error en reservar el seient')
      }
    })
  }

  function showNotification(message: string, type: 'info' | 'success' | 'error') {
    lastNotification.value = { message, type }
    setTimeout(() => {
      if (lastNotification.value?.message === message) {
        lastNotification.value = null
      }
    }, 4000)
  }

  function reserveSeat(seatId: string) {
    if (!$socket || !eventInfo.value) return
    $socket.emit('reserve_seat', { 
      eventId: eventInfo.value.id, 
      seatId, 
      userId: userId.value 
    })
  }

  function confirmPurchase(seatId: string) {
    if (!$socket || !eventInfo.value) return
    $socket.emit('confirm_purchase', { 
      eventId: eventInfo.value.id, 
      seatId, 
      userId: userId.value 
    })
  }

  // Gestió del temporitzador
  function startTimer(durationSeconds: number) {
    stopTimer()
    timer.value = durationSeconds
    timerInterval.value = setInterval(() => {
      if (timer.value > 0) {
        timer.value--
      } else {
        stopTimer()
        clearSelection()
      }
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    timer.value = 0
  }

  function clearSelection() {
    seats.value.forEach(seat => {
      if (seat.status === 'selected') {
        seat.status = 'available'
      }
    })
  }

  function resetStore() {
    eventInfo.value = null
    seats.value = []
    stopTimer()
    if ($socket) $socket.disconnect()
  }

  return {
    userId,
    eventInfo,
    seats,
    isConnected,
    timer,
    lastNotification,
    availableSeats,
    selectedSeats,
    totalAmount,
    setEventInfo,
    setSeats,
    updateSeatStatus,
    setConnectionStatus,
    initSocket,
    showNotification,
    reserveSeat,
    confirmPurchase,
    startTimer,
    stopTimer,
    resetStore
  }
})
