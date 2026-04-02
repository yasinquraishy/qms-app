<script setup>
import { useQuasar } from 'quasar'

const props = defineProps({
  mode: {
    type: String,
    default: 'signin',
    validator: (value) => ['signin', 'signup'].includes(value),
  },
})

const emit = defineEmits(['authenticated'])

const $q = useQuasar()

const loadingGoogle = ref(false)
const loadingMicrosoft = ref(false)
const loadingLogin = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')

const isSignup = computed(() => props.mode === 'signup')

const isFormValid = computed(() => {
  if (!email.value || !password.value) return false
  if (isSignup.value) {
    return (
      firstName.value &&
      lastName.value &&
      confirmPassword.value &&
      password.value === confirmPassword.value &&
      password.value.length >= 8
    )
  }
  return true
})

function loginWithGoogle() {
  loadingGoogle.value = true
  window.location.href = '/api/v1/auth/login/federated/google'
}

function loginWithMicrosoft() {
  loadingMicrosoft.value = true
  window.location.href = '/api/v1/auth/login/federated/microsoft'
}

async function submitForm() {
  if (!isFormValid.value) {
    $q.notify({
      type: 'negative',
      message: isSignup.value
        ? 'Please fill in all fields correctly'
        : 'Please enter both email and password',
      position: 'top',
    })
    return
  }

  if (isSignup.value && password.value !== confirmPassword.value) {
    $q.notify({
      type: 'negative',
      message: 'Passwords do not match',
      position: 'top',
    })
    return
  }

  loadingLogin.value = true

  try {
    const url = isSignup.value ? '/api/v1/auth/register' : '/api/v1/auth/login'
    const body = isSignup.value
      ? {
          email: email.value,
          password: password.value,
          firstName: firstName.value,
          lastName: lastName.value,
        }
      : {
          email: email.value,
          password: password.value,
        }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      if (isSignup.value) {
        emit('authenticated')
        return
      }
      if (response.redirected) {
        window.location.href = response.url
      }
      return
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      const errorMessage =
        data?.error?.message ||
        (isSignup.value
          ? 'Registration failed. Please try again.'
          : 'Login failed. Please try again.')

      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: isSignup.value
          ? 'Registration failed. Please try again.'
          : 'Login failed. Please try again.',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Auth error:', error)
    $q.notify({
      type: 'negative',
      message: 'Network error. Please check your connection and try again.',
      position: 'top',
    })
  } finally {
    loadingLogin.value = false
  }
}
</script>

<template>
  <WCard class="login-card" flat>
    <QCardSection class="tw:pb-1">
      <div class="tw:text-2xl tw:font-bold tw:text-on-main">
        {{ mode === 'signup' ? 'Sign up to continue' : 'Welcome back' }}
      </div>
      <div class="tw:text-sm tw:text-secondary tw:mt-1">
        {{
          mode === 'signup'
            ? 'Authenticate to create your organization'
            : 'Sign in to access your dashboard'
        }}
      </div>
    </QCardSection>

    <QCardSection class="tw:pt-4">
      <div class="tw:flex tw:flex-col tw:gap-3">
        <WBtn
          unelevated
          noCaps
          class="login-btn"
          :loading="loadingGoogle"
          :disable="loadingMicrosoft"
          @click="loginWithGoogle"
        >
          <div class="tw:flex tw:items-center tw:justify-center tw:w-full tw:gap-2">
            <svg class="login-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span class="tw:font-medium">Continue with Google</span>
          </div>
        </WBtn>

        <WBtn
          unelevated
          noCaps
          class="login-btn"
          :loading="loadingMicrosoft"
          :disable="loadingGoogle"
          @click="loginWithMicrosoft"
        >
          <div class="tw:flex tw:items-center tw:justify-center tw:w-full tw:gap-2">
            <svg class="login-icon" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <span class="tw:font-medium">Continue with Microsoft</span>
          </div>
        </WBtn>

        <div class="separator tw:mt-3 tw:mb-3">
          <QSeparator />
          <span class="separator-text">or</span>
          <QSeparator />
        </div>

        <!-- email/password login form -->
        <div class="tw:flex tw:flex-col tw:gap-3">
          <template v-if="isSignup">
            <WInput
              v-model="firstName"
              placeholder="First Name"
              outlined
              dense
              @keyup.enter="submitForm"
            >
              <template #prepend>
                <WIcon name="person" />
              </template>
            </WInput>

            <WInput
              v-model="lastName"
              placeholder="Last Name"
              outlined
              dense
              @keyup.enter="submitForm"
            >
              <template #prepend>
                <WIcon name="person" />
              </template>
            </WInput>
          </template>

          <WInput
            v-model="email"
            type="email"
            placeholder="Email"
            outlined
            dense
            autocomplete
            @keyup.enter="submitForm"
          >
            <template #prepend>
              <WIcon name="email" />
            </template>
          </WInput>

          <WInput
            v-model="password"
            type="password"
            placeholder="Password"
            outlined
            dense
            autocomplete
            :hint="isSignup ? 'At least 8 characters' : ''"
            @keyup.enter="submitForm"
          >
            <template #prepend>
              <WIcon name="lock" />
            </template>
          </WInput>

          <WInput
            v-if="isSignup"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            outlined
            dense
            :error="confirmPassword.length > 0 && password !== confirmPassword"
            errorMessage="Passwords do not match"
            @keyup.enter="submitForm"
          >
            <template #prepend>
              <WIcon name="lock" />
            </template>
          </WInput>

          <div v-if="mode === 'signin'" class="tw:text-right tw:mb-2">
            <RouterLink to="/forgot-password" class="tw:text-sm tw:text-primary">
              Forgot password?
            </RouterLink>
          </div>

          <WBtn
            unelevated
            noCaps
            color="primary"
            class="tw:w-full"
            :loading="loadingLogin"
            :disable="loadingLogin || !isFormValid"
            @click="submitForm"
          >
            {{ isSignup ? 'Sign up with email' : 'Sign in' }}
          </WBtn>
        </div>
      </div>
    </QCardSection>

    <QCardSection class="tw:pt-6">
      <QSeparator />
      <div class="tw:text-xs tw:text-secondary tw:text-center tw:mt-3">
        <template v-if="isSignup">
          Already have an account?
          <a href="/login" class="tw:text-primary">Sign in</a>
        </template>
        <template v-else>
          Don't have an account?
          <a href="/signup" class="tw:text-primary">Sign up</a>
        </template>
      </div>
      <div class="tw:text-xs tw:text-secondary tw:text-center tw:mt-2">
        By continuing, you agree to our
        <a href="#" class="tw:text-primary">Terms of Service</a>
        and
        <a href="#" class="tw:text-primary">Privacy Policy</a>
      </div>
    </QCardSection>
  </WCard>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 420px;
  background-color: $content-bg;
}

.login-btn {
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: $slate-100;
  color: $text-primary;
  border: 1px solid $slate-300;

  &:hover {
    background-color: $slate-200;
  }
}

.login-icon {
  width: 20px;
  height: 20px;
}

.separator {
  display: flex;
  align-items: center;
  gap: 16px;
}

.separator-text {
  color: $text-secondary;
  font-size: 0.8rem;
  padding: 0 8px;
  white-space: nowrap;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

a {
  color: $primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
