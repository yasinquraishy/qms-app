import { get, post } from '@/api'

const symbol = Symbol('useAuth')

function AuthState() {
  const loading = ref(false)
  const error = ref(null)

  // Request password reset email
  async function requestPasswordReset(email) {
    const data = await post(
      '/v1/auth/password/forgot',
      { email },
      {
        showError: true,
        loader: loading,
      },
    )
    return data
  }

  // Confirm password reset with token
  async function confirmPasswordReset(token, password) {
    const data = await post(
      '/v1/auth/password/reset',
      { token, password },
      {
        showError: true,
        loader: loading,
      },
    )
    return data
  }

  // Validate invitation token (returns user info for welcome message)
  async function validateInvitation(token) {
    const data = await get(`/v1/auth/invitation/validate?token=${encodeURIComponent(token)}`, {
      showError: true,
      loader: loading,
    })
    return data
  }

  // Accept invitation with token and new password
  async function acceptInvitation(token, password) {
    const data = await post(
      '/v1/auth/invitation/accept',
      { token, password },
      {
        showError: true,
        loader: loading,
      },
    )
    return data
  }

  return {
    loading,
    error,
    requestPasswordReset,
    confirmPasswordReset,
    validateInvitation,
    acceptInvitation,
  }
}

/**
 * @returns {ReturnType<typeof AuthState>}
 */
export function useAuth() {
  const state = inject(symbol, null)
  if (!state) {
    return AuthState()
  }
  return state
}

export function provideAuth() {
  const state = AuthState()
  provide(symbol, state)
  return state
}
