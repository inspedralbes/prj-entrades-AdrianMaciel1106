import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock global de useNuxtApp ABANS d'importar l'store
vi.stubGlobal('useNuxtApp', () => ({
  $socket: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    emit: vi.fn()
  }
}))

// Ara ja podem importar l'store
import { useEventStore } from '../../stores/useEventStores'

describe('Event Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('inicialitza amb valors per defecte', () => {
    const store = useEventStore()
    expect(store.seats).toEqual([])
    expect(store.isConnected).toBe(false)
  })

  it('calcula correctament el preu total', () => {
    const store = useEventStore()
    store.seats = [
      { id: '1', row: 'A', number: 1, status: 'selected', price: 10 },
      { id: '2', row: 'A', number: 2, status: 'selected', price: 15 }
    ]
    expect(store.totalAmount).toBe(25)
  })

  it('actualitza l\'estat d\'un seient', () => {
    const store = useEventStore()
    store.seats = [{ id: '1', row: 'A', number: 1, status: 'available', price: 10 }]
    store.updateSeatStatus('1', 'reserved')
    expect(store.seats[0].status).toBe('reserved')
  })
})
