import '@/extensions/datetime' // Extend Luxon's DateTime with custom formatting method

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { Quasar, Notify, Dialog, Loading } from 'quasar'

import App from './App.vue'
import router from './router'
import messages from './i18n'

// API layer — centralised Axios setup
import { registerNotifyHandler, setCompanyIdGetter, eventBus } from './api'
import { ApiError } from './api/errors.js'
import { currentCompany } from './utils/currentCompany.js'
import { isPublicRoute } from './constants/authRoutes.js'
import { connectSocket, disconnectSocket } from './api/socket.js'

// Import Quasar CSS
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'

// Import Quasar CSS
import 'quasar/src/css/index.sass'

// Import app CSS (TailwindCSS + custom theme)
import './css/base.css'
// Import app-specific styles
import './css/app.scss'

// Create i18n instance
const i18n = createI18n({
  locale: 'en-US',
  legacy: false,
  globalInjection: true,
  messages,
})

// Create Vue app
const app = createApp(App)

// Use Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading,
  },
  config: {},
})

// Use i18n
app.use(i18n)

// Use router
app.use(router)

// Mount app
app.mount('#app')

// ── API layer wiring ──────────────────────────────────────────────────────────

// 1. Notification adapter — bridge API layer events to Quasar toasts
registerNotifyHandler(({ type, message, fields }) => {
  // If there are validation field errors, format them nicely
  let displayMessage = message

  if (fields && Object.keys(fields).length > 0) {
    const fieldErrors = []
    for (const [field, errors] of Object.entries(fields)) {
      const errorList = Array.isArray(errors) ? errors.join(', ') : errors
      fieldErrors.push(`${field}: ${errorList}`)
    }

    // Show first few errors in the notification
    const maxErrors = 3
    const errorMessages = fieldErrors.slice(0, maxErrors)
    const remaining = fieldErrors.length - maxErrors

    displayMessage = `${message}\n${errorMessages.join('\n')}`
    if (remaining > 0) {
      displayMessage += `\n...and ${remaining} more error${remaining > 1 ? 's' : ''}`
    }
  }

  Notify.create({
    type,
    message: displayMessage,
    position: 'top',
    timeout: fields ? 5000 : 3000, // Longer timeout for validation errors
    html: true, // Allow line breaks
    multiLine: true,
  })
})

// 2. Multi-tenant — tell the API layer how to get the current companyId
setCompanyIdGetter(() => currentCompany.value?.id)

// 3. Auth events — redirect on session expiry (but not if already on an auth page)
eventBus.on('auth:session-expired', () => {
  disconnectSocket()
  const path = window.location.pathname
  console.warn(path)
  if (isPublicRoute(path)) return
  window.location.href = '/signin'
})

// 5. Socket.io — connect after app mounts (session must be hydrated first)
//    The socket auto-authenticates via the same httpOnly session cookie.
connectSocket()

// 4. Global unhandled rejection handler — silently catch ApiError rejections
//    that bubble up from calls without try/catch (notification was already
//    shown by request.js).
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof ApiError) {
    event.preventDefault()
  }
})
