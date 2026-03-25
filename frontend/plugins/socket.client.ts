import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const socket = io('http://localhost:3000', {
    autoConnect: false
  })

  return {
    provide: {
      socket
    }
  }
})
