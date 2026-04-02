<script setup>
import { useQuasar } from 'quasar'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { validateInvitation, acceptInvitation, loading } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const token = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const tokenValid = ref(false)
const validating = ref(true)

onMounted(async () => {
  token.value = route.query.token || ''
  if (!token.value) {
    $q.notify({
      type: 'negative',
      message: 'Invalid or missing invitation token',
      position: 'top',
    })
    router.push('/signin')
    return
  }

  // Validate the token and get user info for the welcome message
  const data = await validateInvitation(token.value)
  if (data) {
    firstName.value = data.firstName
    lastName.value = data.lastName
    email.value = data.email
    tokenValid.value = true
  } else {
    tokenValid.value = false
  }
  validating.value = false
})

function validatePasswordValue(passwordValue) {
  if (!passwordValue) {
    return 'Password is required'
  }
  if (passwordValue.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  return null
}

function validateConfirmPassword(confirmPasswordValue) {
  if (!confirmPasswordValue) {
    return 'Please confirm your password'
  }
  if (confirmPasswordValue !== password.value) {
    return 'Passwords do not match'
  }
  return null
}

async function handleSubmit() {
  const passwordError = validatePasswordValue(password.value)
  if (passwordError) {
    $q.notify({ type: 'negative', message: passwordError, position: 'top' })
    return
  }

  const confirmPasswordError = validateConfirmPassword(confirmPassword.value)
  if (confirmPasswordError) {
    $q.notify({ type: 'negative', message: confirmPasswordError, position: 'top' })
    return
  }

  const result = await acceptInvitation(token.value, password.value)
  if (result) {
    $q.notify({
      type: 'positive',
      message: 'Welcome! Your account is now active.',
      position: 'top',
    })

    setTimeout(() => {
      router.push('/signin')
    }, 1000)
  }
}

function goToLogin() {
  router.push('/signin')
}
</script>

<template>
  <WCard class="tw:w-full tw:max-w-sm tw:bg-main" flat>
    <!-- Loading state -->
    <QCardSection v-if="validating" class="tw:text-center tw:py-12">
      <QSpinner size="40px" color="primary" />
      <div class="tw:text-secondary tw:mt-4">Validating invitation...</div>
    </QCardSection>

    <!-- Invalid token state -->
    <QCardSection v-else-if="!tokenValid" class="tw:text-center tw:py-8">
      <WIcon name="error_outline" size="48px" color="negative" />
      <div class="tw:text-xl tw:font-bold tw:text-on-main tw:mt-4">Invitation Expired</div>
      <div class="tw:text-sm tw:text-secondary tw:mt-2">
        This invitation link is invalid or has expired. Please contact your administrator to receive
        a new invitation.
      </div>
      <WBtn unelevated noCaps color="primary" class="tw:w-full tw:mt-6" @click="goToLogin">
        Go to Sign In
      </WBtn>
    </QCardSection>

    <!-- Valid invitation form -->
    <template v-else>
      <QCardSection class="tw:pb-1">
        <div class="tw:text-center tw:mb-2">
          <WIcon name="celebration" size="40px" color="primary" />
        </div>
        <div class="tw:text-2xl tw:font-bold tw:text-on-main tw:text-center">
          Welcome, {{ firstName }}!
        </div>
        <div class="tw:text-sm tw:text-secondary tw:mt-2 tw:text-center">
          Set your password to activate your account and get started.
        </div>
      </QCardSection>

      <QCardSection class="tw:pt-4">
        <div class="tw:flex tw:flex-col tw:gap-4">
          <div class="tw:text-sm tw:text-secondary">
            <span class="tw:font-medium tw:text-on-main">Email:</span> {{ email }}
          </div>

          <WInput
            v-model="password"
            type="password"
            placeholder="Set new password"
            outlined
            dense
            autocomplete="new-password"
            :disable="loading"
            @keyup.enter="handleSubmit"
          >
            <template #prepend>
              <WIcon name="lock" />
            </template>
          </WInput>

          <WInput
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            outlined
            dense
            autocomplete="new-password"
            :disable="loading"
            @keyup.enter="handleSubmit"
          >
            <template #prepend>
              <WIcon name="lock" />
            </template>
          </WInput>

          <div class="tw:text-xs tw:text-secondary">
            Password must be at least 8 characters long
          </div>

          <WBtn
            unelevated
            noCaps
            color="primary"
            class="tw:w-full"
            :loading="loading"
            :disable="loading || !password || !confirmPassword"
            @click="handleSubmit"
          >
            Accept Invitation
          </WBtn>

          <div class="tw:text-center">
            <a
              href="#"
              class="tw:text-sm tw:text-primary tw:no-underline hover:tw:underline"
              @click.prevent="goToLogin"
            >
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </QCardSection>
    </template>
  </WCard>
</template>
