import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SeatStatus = 'available' | 'reserved' | 'selected' | 'sold'

export interface Seat {
  id: string
  row: string
  number: number
  status: SeatStatus | string
  price: number
  reservedBy?: string
  expiresAt?: string | number | null
  category?: string
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
  const availableSeats = computed(() => seats.value.filter(s => s.status.toLowerCase() === 'available'))
  const selectedSeats = computed(() => seats.value.filter(s => s.status === 'selected'))
  const totalAmount = computed(() => {
    return selectedSeats.value.reduce((total, seat) => total + (seat.price || 0), 0)
  })

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
      console.log('[store] Rebuts seients:', newSeats.length)
      const mappedSeats = newSeats.map(s => {
        const isMe = s.reservedBy === userId.value
        // Suport per uppercase del servidor (RESERVED)
        const status = (s.status.toUpperCase() === 'RESERVED' && isMe) ? 'selected' : s.status
        return { ...s, status }
      })
      setSeats(mappedSeats as Seat[])
      
      const mySeat = mappedSeats.find(s => s.status === 'selected')
      if (mySeat && mySeat.expiresAt) {
        const expTime = typeof mySeat.expiresAt === 'string' ? new Date(mySeat.expiresAt).getTime() : mySeat.expiresAt
        const remaining = Math.floor((expTime - Date.now()) / 1000)
        if (remaining > 0) startTimer(remaining)
      }
    })

    $socket.on('seat_updated', (updatedSeat: Seat) => {
      console.log('[store] Seat actualitzat:', updatedSeat.id, updatedSeat.status)
      const isMe = updatedSeat.reservedBy === userId.value
      const status = (updatedSeat.status.toUpperCase() === 'RESERVED' && isMe) 
        ? 'selected' 
        : updatedSeat.status
      
      const oldSeat = seats.value.find(s => s.id === updatedSeat.id)
      
      updateSeatStatus(updatedSeat.id, status as SeatStatus, updatedSeat.reservedBy, updatedSeat.expiresAt as string)
      
      if (!isMe && oldSeat && oldSeat.status !== updatedSeat.status) {
        if (updatedSeat.status.toUpperCase() === 'RESERVED') {
          showNotification(`El seient ${updatedSeat.id} s'acaba de reservar!`, 'info')
        } else if (updatedSeat.status.toUpperCase() === 'SOLD') {
          showNotification(`Seient ${updatedSeat.id} venut.`, 'info')
        } else if (updatedSeat.status.toUpperCase() === 'AVAILABLE' && oldSeat.status !== 'AVAILABLE') {
          showNotification(`El seient ${updatedSeat.id} torna a estar disponible.`, 'success')
        }
      }

      if (status === 'selected' && updatedSeat.expiresAt) {
        const expTime = typeof updatedSeat.expiresAt === 'string' ? new Date(updatedSeat.expiresAt).getTime() : updatedSeat.expiresAt
        const remaining = Math.floor((expTime - Date.now()) / 1000)
        startTimer(remaining)
      } else if ((status.toUpperCase() === 'AVAILABLE' || status === 'available') && isMe) {
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

  function unreserveSeat(seatId: string) {
    if (!$socket || !eventInfo.value) return
    $socket.emit('release_seat', { 
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
    unreserveSeat,
    confirmPurchase,
    startTimer,
    stopTimer,
    resetStore
  }
})
