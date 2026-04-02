import { DateTime } from 'luxon'
import { io } from 'socket.io-client'

let socket = null

function transformResponse(data) {
  try {
    data = typeof data === 'string' ? data : JSON.stringify(data)

    return JSON.parse(data, (_, value) => {
      if (typeof value === 'string') {
        // Attempt to parse ISO date strings into DateTime objects
        const dt = DateTime.fromISO(value)
        if (dt.isValid) {
          return dt
        }
      }

      return value
    })
  } catch {
    // If response is not JSON, return as-is (e.g. for file downloads)
    return data
  }
}

function connectSocket() {
  if (socket?.connected) return socket

  socket = io({
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling'],
  })

  // Wrap socket.on so all application event listeners receive transformed data
  const SYSTEM_EVENTS = new Set([
    'connect',
    'connect_error',
    'disconnect',
    'disconnecting',
    'error',
  ])
  const originalOn = socket.on.bind(socket)
  socket.on = function (event, listener) {
    if (SYSTEM_EVENTS.has(event)) {
      return originalOn(event, listener)
    }
    return originalOn(event, (...args) => listener(...args.map(transformResponse)))
  }

  socket.on('connect_error', (err) => {
    console.warn('[socket] Connection error:', err.message)
  })

  return socket
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

function getSocket() {
  return socket
}

export { connectSocket, disconnectSocket, getSocket }
