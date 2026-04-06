<script setup>
import { get } from '@/api/request.js'
import { currentSession } from '@/utils/currentSession.js'

const emit = defineEmits(['verified'])

const show = defineModel({ type: Boolean, default: false })

// ── State ──────────────────────────────────────────────────────────────────────
const loading = ref(false)
const checking = ref(false)
const password = ref('')
const hasPassword = ref(null) // null = unknown, true/false after check
const errorMessage = ref('')
const googleClientId = ref(null)
const microsoftClientId = ref(null)

const userEmail = computed(() => currentSession.value?.email || '')
const userName = computed(() => {
  const s = currentSession.value
  if (!s) return ''
  return [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email
})

// ── Fetch auth methods when dialog opens ───────────────────────────────────────
watch(show, async (val) => {
  if (val) {
    password.value = ''
    errorMessage.value = ''
    hasPassword.value = null
    await fetchIdentityMethods()
  }
})

async function fetchIdentityMethods() {
  checking.value = true
  try {
    const data = await get('/v1/services/verify-identity', { showError: false })
    hasPassword.value = data.hasPassword
    googleClientId.value = data.googleClientId
    microsoftClientId.value = data.microsoftClientId
  } catch {
    hasPassword.value = false
  } finally {
    checking.value = false
  }
}

// ── Password — emit credentials, no API call ──────────────────────────────────
function verifyWithPassword() {
  if (!password.value) {
    errorMessage.value = 'Please enter your password'
    return
  }

  emit('verified', { strategy: 'password', password: password.value })
}

// ── OAuth verification via redirect ────────────────────────────────────────────
function verifyWithOAuth(strategy) {
  const returnUrl = window.location.pathname + window.location.search
  window.location.href = `/api/v1/services/verify-identity/federated/${strategy}?returnUrl=${encodeURIComponent(returnUrl)}`
}
</script>

<template>
  <WDialog v-model="show" title="Verify Your Identity" minWidth="460px" persistent>
    <!-- Loading state while fetching auth methods -->
    <div v-if="checking" class="tw:flex tw:justify-center tw:py-8">
      <QSpinner color="primary" size="2em" />
    </div>

    <template v-else>
      <!-- Header info -->
      <div class="tw:mb-5">
        <div class="tw:flex tw:items-center tw:gap-3 tw:mb-3">
          <QAvatar size="40px" color="primary" textColor="white">
            <WIcon name="verified_user" />
          </QAvatar>
          <div>
            <div class="tw:text-sm tw:font-semibold tw:text-on-main">{{ userName }}</div>
            <div class="tw:text-xs tw:text-secondary">{{ userEmail }}</div>
          </div>
        </div>
        <p class="tw:text-xs tw:text-secondary tw:mt-2">
          To proceed with this action, please confirm your identity by re-authenticating below. This
          is required for e-signature compliance.
        </p>
      </div>

      <!-- Error message -->
      <QBanner
        v-if="errorMessage"
        class="tw:bg-red-50 tw:text-red-700 tw:rounded-lg tw:mb-4 tw:text-xs"
        dense
      >
        <template #avatar>
          <WIcon name="error" class="tw:text-red-500" />
        </template>
        {{ errorMessage }}
      </QBanner>

      <!-- OAuth buttons (shown when configured) -->
      <div class="tw:flex tw:flex-col tw:gap-3">
        <WBtn
          v-if="googleClientId"
          unelevated
          noCaps
          class="esign-auth-btn"
          :loading="loading"
          @click="verifyWithOAuth('google')"
        >
          <div class="tw:flex tw:items-center tw:justify-center tw:w-full tw:gap-2">
            <svg class="tw:w-5 tw:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <span class="tw:font-medium">Verify with Google</span>
          </div>
        </WBtn>

        <WBtn
          v-if="microsoftClientId"
          unelevated
          noCaps
          class="esign-auth-btn"
          :loading="loading"
          @click="verifyWithOAuth('microsoft')"
        >
          <div class="tw:flex tw:items-center tw:justify-center tw:w-full tw:gap-2">
            <svg class="tw:w-5 tw:h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
            <span class="tw:font-medium">Verify with Microsoft</span>
          </div>
        </WBtn>

        <!-- Password section (only if user has a password) -->
        <template v-if="hasPassword">
          <div class="tw:flex tw:items-center tw:gap-4 tw:my-1">
            <QSeparator class="tw:flex-1" />
            <span class="tw:text-xs tw:text-secondary">or enter your password</span>
            <QSeparator class="tw:flex-1" />
          </div>

          <WInput
            v-model="password"
            type="password"
            placeholder="Enter your password"
            outlined
            dense
            @keyup.enter="verifyWithPassword"
          >
            <template #prepend>
              <WIcon name="lock" />
            </template>
          </WInput>

          <WBtn
            unelevated
            noCaps
            color="primary"
            class="tw:w-full"
            :loading="loading"
            :disable="!password"
            @click="verifyWithPassword"
          >
            Verify with Password
          </WBtn>
        </template>
      </div>
    </template>

    <template #actions>
      <WBtn flat label="Cancel" :disable="loading" @click="show = false" />
    </template>
  </WDialog>
</template>

<style lang="scss" scoped>
.esign-auth-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: $slate-100;
  color: $text-primary;
  border: 1px solid $slate-300;

  &:hover {
    background-color: $slate-200;
  }
}
</style>
